import pdf from "pdf-parse";
import crypto from "crypto";
import logger from "@/lib/logger";
import { createHfInferenceClient } from "@/lib/aiClients";

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

const apiSemaphore = new Semaphore(parseInt(process.env.MAX_CONCURRENT_API_CALLS || "2", 10));

/** Models with working hf-inference summarization routing (smaller / faster first). */
const DEFAULT_SUMMARIZATION_MODELS = [
  "sshleifer/distilbart-cnn-12-6",
  "facebook/bart-large-cnn",
];

/**
 * Comma-separated list → full control over model order. Use this for summarization-only IDs.
 * If unset, we try proven defaults first, then HF_DEFAULT_MODEL / HF_FALLBACK_MODELS (legacy
 * names like google/flan-t5-* often have no summarization provider mapping — they run last).
 */
function resolveSummarizationModelIds(): string[] {
  const explicit = process.env.HF_SUMMARIZATION_MODELS?.trim();
  if (explicit) {
    return [...new Set(explicit.split(",").map((m) => m.trim()).filter(Boolean))];
  }
  const fromEnvPrimary = process.env.HF_DEFAULT_MODEL?.trim();
  const fromEnvList = (process.env.HF_FALLBACK_MODELS || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const ordered = [
    ...DEFAULT_SUMMARIZATION_MODELS,
    ...(fromEnvPrimary ? [fromEnvPrimary] : []),
    ...fromEnvList,
  ];
  return [...new Set(ordered)];
}

function loggableError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL_MS || "3600000", 10);
const MAX_CACHE_ENTRIES = parseInt(process.env.PDF_CACHE_MAX_ENTRIES || "200", 10);

function getCacheKey(text: string, type: string): string {
  return crypto.createHash("md5").update(`${type}:${text}`).digest("hex");
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() >= entry.expiry) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/**
 * Uses Hugging Face Inference Providers (router), not the decommissioned api-inference host.
 * Task must be summarization so the hub can route to a compatible backend.
 */
async function summarizeWithHfRouter(text: string): Promise<string> {
  const client = createHfInferenceClient();
  if (!client) {
    throw new Error("Missing HUGGINGFACE_TOKEN for summarization");
  }

  const maxChars = parseInt(process.env.HF_SUMMARY_INPUT_MAX_CHARS || "3500", 10);
  const input = text.length > maxChars ? text.slice(0, maxChars) : text;
  const models = resolveSummarizationModelIds();
  let lastError: unknown = null;

  for (const model of models) {
    try {
      logger.info("Trying HF summarization model", { model });
      const result = await client.summarization(
        {
          model,
          inputs: input,
          provider: "hf-inference",
        },
        {
          retry_on_error: true,
          signal: AbortSignal.timeout(
            parseInt(process.env.HF_SUMMARY_TIMEOUT_MS || "45000", 10)
          ),
        }
      );
      const summary =
        result && typeof result.summary_text === "string" ? result.summary_text.trim() : "";
      if (summary) {
        logger.info("HF summarization succeeded", { model, length: summary.length });
        return summary;
      }
      logger.warn("Empty summarization output", { model });
    } catch (error: unknown) {
      lastError = error;
      const detail = loggableError(error);
      const message = detail.toLowerCase();
      logger.warn("HF summarization model failed", { model, error: detail });
      if (message.includes("rate limit") || message.includes("quota") || message.includes("402")) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Hugging Face summarization models failed");
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

/** Plain text from a PDF buffer (used for safe fallbacks when structured processing fails). */
export async function extractPlainTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  const { text } = await pdf(pdfBuffer);
  return text;
}

export async function processResearchPaper(pdfBuffer: Buffer): Promise<ResearchPaper> {
  const startTime = Date.now();
  logger.info("Starting PDF processing", { bufferSize: pdfBuffer.length });

  const text = await extractPlainTextFromPdfBuffer(pdfBuffer);
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

  // Summary timeouts are handled inside summarizeWithHfRouter (per-model AbortSignal).
  // Do not wrap in a shorter Promise.race — that aborted BART before HF_SUMMARY_TIMEOUT_MS.
  let summary = "";
  try {
    logger.info("Attempting AI summary");
    summary = await extractSummarySimple(abstract);
  } catch (error) {
    logger.warn("AI summary failed, using text extraction", { error: loggableError(error) });
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
    const result = await withRateLimit(() =>
      retryWithBackoff(() => summarizeWithHfRouter(text), 1)
    );
    
    const summary = result.trim() || text.substring(0, 400) + "...";
    setCached(cacheKey, summary);
    return summary;
  } catch (error) {
    logger.warn("Summary generation failed completely", { error: loggableError(error) });
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