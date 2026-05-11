import pdf from "pdf-parse";
import crypto from "crypto";
import { cleanGeminiJsonResponse, isBoilerplate } from "@/lib/helpers";
import logger from "@/lib/logger";

class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}

const apiSemaphore = new Semaphore(parseInt(process.env.MAX_CONCURRENT_API_CALLS || "2"));

const WORKING_FREE_MODELS = [
  "facebook/bart-large-cnn",        // Best for summarization
  "google/flan-t5-base",            // Smaller, faster, more available
  "t5-small",                        // Very small, very fast
  "google/flan-t5-small",           // Fallback
];

const DEFAULT_HF_MODEL = process.env.HF_DEFAULT_MODEL || "facebook/bart-large-cnn";
const HF_FALLBACK_MODELS = (process.env.HF_FALLBACK_MODELS || WORKING_FREE_MODELS.slice(1).join(","))
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL_MS || "3600000");

function getCacheKey(text: string, type: string): string {
  return crypto.createHash("md5").update(`${type}:${text}`).digest("hex");
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// Fetch with timeout to prevent hanging
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Direct HTTP API call to Hugging Face with proper timeout
async function runHfTextGeneration(prompt: string, maxNewTokens: number = 512): Promise<string> {
  if (!process.env.HUGGINGFACE_TOKEN) {
    throw new Error("Missing HUGGINGFACE_TOKEN for text generation");
  }

  const models = [DEFAULT_HF_MODEL, ...HF_FALLBACK_MODELS];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      logger.info("Trying HF model", { model });
      const API_URL = `https://api-inference.huggingface.co/models/${model}`;
      
      const response = await fetchWithTimeout(
        API_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: maxNewTokens,
              temperature: 0.1,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
              use_cache: false, // Disable cache to avoid stale models
            },
          }),
        },
        30000 // 30 second timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn("HF API error", { model, status: response.status, error: errorText });
        
        // Check if it's a model loading issue
        if (response.status === 503 || errorText.includes("loading") || errorText.includes("unavailable")) {
          logger.warn("Model loading or unavailable, trying next", { model });
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      logger.info("HF response received", { model, hasData: !!data });
      
      let result = "";
      if (Array.isArray(data)) {
        result = data[0]?.generated_text || data[0]?.summary_text || "";
      } else if (data.generated_text) {
        result = data.generated_text;
      } else if (data.summary_text) {
        result = data.summary_text;
      } else if (data[0]?.generated_text) {
        result = data[0].generated_text;
      }

      if (result) {
        logger.info("Successfully generated text", { model, length: result.length });
        return result;
      }

      logger.warn("Empty response from model", { model, data });
      continue;
      
    } catch (error: any) {
      const message = String(error?.message || error).toLowerCase();
      lastError = error;

      logger.warn("Model failed", { model, error: message });

      // Check if it's a timeout or loading issue - try next model
      if (
        message.includes("timeout") ||
        message.includes("loading") ||
        message.includes("503") ||
        message.includes("unavailable") ||
        message.includes("aborted")
      ) {
        logger.warn("Timeout or loading issue, trying next model", { model });
        continue;
      }

      // If it's a rate limit, throw immediately
      if (message.includes("rate limit") || message.includes("quota")) {
        throw error;
      }

      // Try next model for other errors too
      continue;
    }
  }

  throw lastError || new Error("All Hugging Face models failed or timed out");
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const message = String(error?.message || error).toLowerCase();
      
      if (message.includes("quota") || message.includes("rate limit")) {
        logger.error("Quota exhausted", { attempt, error: error.message });
        throw error;
      }

      if (attempt === maxRetries) {
        logger.error("Max retries exceeded", { attempt, error: error.message });
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn("Retrying after delay", { attempt: attempt + 1, delay });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  await apiSemaphore.acquire();
  try {
    return await fn();
  } finally {
    apiSemaphore.release();
  }
}

interface PaperMetadata {
  title: string;
  authors: string[];
  published_date: string;
  topics: string[];
}

interface KeyFindings {
  primary: string;
  methodology_innovation: string;
  practical_applications: string[];
}

interface ResearchImpact {
  significance: string;
  level: "Low" | "Medium" | "High" | "Very High";
  limitations: string;
}

interface NoveltyAssessment {
  level: "Low" | "Medium" | "High" | "Very High";
  comparison_to_prior_work: string;
}

interface PerformanceMetrics {
  accuracy: string;
  parameters: string;
  training_time: string;
}

interface PerformanceComparison {
  proposed_method: PerformanceMetrics;
  previous_sota: PerformanceMetrics;
  baseline: PerformanceMetrics;
}

interface ResearchPaper {
  metadata: PaperMetadata;
  summary: string;
  key_findings: KeyFindings;
  research_impact: ResearchImpact;
  novelty_assessment: NoveltyAssessment;
  related_areas: string[];
  performance_metrics: PerformanceComparison;
}

export async function processResearchPaper(pdfBuffer: Buffer): Promise<ResearchPaper> {
  const startTime = Date.now();
  logger.info("Starting PDF processing", { bufferSize: pdfBuffer.length });

  const { text } = await pdf(pdfBuffer);
  logger.info("PDF text extracted", { textLength: text.length });

  const cacheKey = getCacheKey(text, "full_paper");
  const cached = getCached<ResearchPaper>(cacheKey);
  if (cached) {
    logger.info("Cache hit for full paper");
    return cached;
  }

  logger.info("Using fallback extraction (regex-based)");
  const result = await fallbackPartialExtraction(text);
  setCached(cacheKey, result);
  logger.info("Processing completed", { duration: Date.now() - startTime });
  return result;
}

// Fallback that uses minimal AI and mostly regex
export async function fallbackPartialExtraction(text: string): Promise<ResearchPaper> {
  const sections = identifySections(text);
  const abstract = sections["ABSTRACT"] || text.substring(0, 1000);

  logger.info("Extracting metadata with regex");
  const metadata = await fallbackMetadataExtraction(text);

  // Try to get summary with timeout protection
  let summary = "";
  try {
    logger.info("Attempting AI summary");
    summary = await Promise.race([
      extractSummarySimple(abstract),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Summary timeout")), 15000)
      ),
    ]);
  } catch (error) {
    logger.warn("AI summary failed, using text extraction", { error });
    summary = abstract.substring(0, 500) + "...";
  }

  return {
    metadata,
    summary,
    key_findings: {
      primary: extractFromSection(sections, ["RESULTS", "CONCLUSION"]),
      methodology_innovation: extractFromSection(sections, ["METHODS"]),
      practical_applications: [],
    },
    research_impact: {
      significance: "Impact analysis not available",
      level: "Medium",
      limitations: "Limitations not extracted",
    },
    novelty_assessment: {
      level: "Medium",
      comparison_to_prior_work: "Comparison not available",
    },
    related_areas: extractKeywordsFromText(text),
    performance_metrics: {
      proposed_method: { accuracy: "", parameters: "", training_time: "" },
      previous_sota: { accuracy: "", parameters: "", training_time: "" },
      baseline: { accuracy: "", parameters: "", training_time: "" },
    },
  };
}

// Simple summary with aggressive timeout
async function extractSummarySimple(text: string): Promise<string> {
  const cacheKey = getCacheKey(text, "summary");
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Summarize in 2 sentences:\n\n${text.substring(0, 1000)}`;
    
    const result = await withRateLimit(() =>
      retryWithBackoff(() => runHfTextGeneration(prompt, 150), 1) // Only 1 retry
    );
    
    const summary = result.trim() || text.substring(0, 400) + "...";
    setCached(cacheKey, summary);
    return summary;
  } catch (error) {
    logger.warn("Summary generation failed completely", { error });
    return text.substring(0, 400) + "...";
  }
}

// Extract keywords using simple text analysis (no AI)
function extractKeywordsFromText(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const frequency = new Map<string, number>();
  
  // Common research words
  const researchTerms = [
    "machine learning", "deep learning", "neural network", "algorithm",
    "optimization", "performance", "accuracy", "training", "model",
    "classification", "regression", "clustering", "data", "analysis"
  ];
  
  const found = researchTerms.filter(term => 
    text.toLowerCase().includes(term)
  );
  
  return found.slice(0, 5);
}

function identifySections(text: string): Record<string, string> {
  const sectionTitles = ["ABSTRACT", "INTRODUCTION", "METHODS", "RESULTS", "CONCLUSION"];
  const sections: Record<string, string> = {};
  let currentSection = "HEADER";

  text.split("\n").forEach((line) => {
    const cleanLine = line.trim();
    const isSection = sectionTitles.some((title) =>
      cleanLine.toUpperCase().startsWith(title)
    );

    if (isSection) {
      currentSection = cleanLine.toUpperCase();
      sections[currentSection] = "";
    } else {
      sections[currentSection] = (sections[currentSection] || "") + line + "\n";
    }
  });

  return sections;
}

function extractFromSection(
  sections: Record<string, string>,
  targetSections: string[],
  options: { maxLength?: number } = {}
): string {
  const maxLength = options.maxLength || 1000;
  
  let content = "";
  for (const section of targetSections) {
    if (sections[section.toUpperCase()]) {
      content = sections[section.toUpperCase()];
      break;
    }
  }

  if (!content) return "";

  content = content.replace(/\[\d+(?:-\d+)?\]/g, "");
  
  const sentences = content.split(".").filter(s => s.trim().length > 20);
  let extracted = "";
  let charCount = 0;

  for (const sentence of sentences.slice(0, 5)) {
    const trimmed = sentence.trim();
    if (charCount + trimmed.length > maxLength) break;
    extracted += trimmed + ". ";
    charCount += trimmed.length;
  }

  return extracted.trim() || "Not extracted";
}

async function fallbackMetadataExtraction(text: string): Promise<PaperMetadata> {
  return {
    title: extractTitleFromText(text),
    authors: extractAuthorsWithRegex(text),
    published_date: extractYear(text),
    topics: extractKeywordsFromText(text),
  };
}

function extractTitleFromText(text: string): string {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const potentialTitles = lines
    .slice(0, 10)
    .filter((line) => 
      line.length > 10 && 
      line.length < 150 &&
      !line.match(/abstract|introduction|keywords|arxiv|author|email|university|department/i)
    );

  return potentialTitles[0]?.trim() || "Untitled Research Paper";
}

function extractAuthorsWithRegex(text: string): string[] {
  const firstKb = text.substring(0, 2000);
  const lines = firstKb.split("\n");
  
  const authors = new Set<string>();
  
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    // Look for patterns like "John Smith" or "John Smith, Jane Doe"
    const matches = line.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g);
    if (matches && matches.length > 0 && matches.length <= 10) {
      matches.forEach(name => {
        if (!name.match(/abstract|university|department|introduction/i)) {
          authors.add(name);
        }
      });
    }
  }

  return Array.from(authors).slice(0, 8);
}

function extractYear(text: string): string {
  const match = text.match(/(202[0-6]|201[0-9])/);
  return match ? match[0] : "Unknown";
}