import pdf from "pdf-parse";
import crypto from "crypto";
import { hf } from "../lib/aiClients";
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

// Global semaphore: limit to concurrent HF inference calls
const apiSemaphore = new Semaphore(parseInt(process.env.MAX_CONCURRENT_API_CALLS || "2"));
const DEFAULT_HF_MODEL = process.env.HF_DEFAULT_MODEL || "openai/gpt-oss-120b:together";
const HF_FALLBACK_MODELS = (process.env.HF_FALLBACK_MODELS || "").split(",").map((model) => model.trim()).filter(Boolean);

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL_MS || "3600000"); // 1 hour default

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

// Retry helper with exponential backoff
function isQuotaExhaustionError(error: any): boolean {
  const message = String(error?.message || error).toLowerCase();
  if (message.includes("quota exceeded") || message.includes("free_tier") || message.includes("limit: 0")) {
    return true;
  }

  if (Array.isArray(error?.errorDetails)) {
    return error.errorDetails.some((detail: any) =>
      detail?.violations?.some((violation: any) =>
        String(violation.quotaMetric || "").toLowerCase().includes("generate_content_free_tier")
      )
    );
  }

  return false;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (isQuotaExhaustionError(error)) {
        logger.error("Permanent quota exhaustion detected", { attempt, error: error.message });
        throw error;
      }

      if (attempt === maxRetries || !error?.status || error.status !== 429) {
        logger.error("API call failed permanently", { attempt, error: error.message });
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      logger.warn("API call failed, retrying", { attempt: attempt + 1, delay, error: error.message });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

async function runHfTextGeneration(prompt: string, maxNewTokens: number = 512): Promise<string> {
  if (!process.env.HUGGINGFACE_TOKEN) {
    throw new Error("Missing HUGGINGFACE_TOKEN for text generation");
  }

  const models = [DEFAULT_HF_MODEL, ...HF_FALLBACK_MODELS];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response: any = await hf.chatCompletion({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxNewTokens,
        temperature: 0,
      });

      if (Array.isArray(response?.choices) && response.choices.length > 0) {
        return response.choices[0]?.message?.content || response.choices[0]?.text || "";
      }

      return "";
    } catch (error: any) {
      const message = String(error?.message || error).toLowerCase();
      lastError = error;

      if (message.includes("inference provider information") || message.includes("model not found") || message.includes("unknown model")) {
        logger.warn("Hugging Face model unsupported, trying fallback model", { model, error: error?.message });
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("Hugging Face text generation failed");
}

async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  await apiSemaphore.acquire();
  try {
    return await fn();
  } finally {
    apiSemaphore.release();
  }
}

// Chunk text into manageable pieces
function chunkText(text: string, maxChunkSize: number = 3000): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChunkSize;
    if (end < text.length) {
      // Try to break at sentence boundary
      const lastPeriod = text.lastIndexOf(".", end);
      if (lastPeriod > start + maxChunkSize * 0.7) {
        end = lastPeriod + 1;
      }
    }
    chunks.push(text.substring(start, end));
    start = end;
  }
  return chunks;
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

interface Reference {
  authors: string;
  title: string;
  venue?: string;
  year?: string;
}

interface ResearchPaper {
  metadata: PaperMetadata;
  summary: string;
  key_findings: KeyFindings;
  research_impact: ResearchImpact;
  novelty_assessment: NoveltyAssessment;
  related_areas: string[];
  performance_metrics: PerformanceComparison;
  // references: Reference[];
}

///////////////////////////////
// Main function to process a PDF buffer and extract research paper data
///////////////////////////////
export async function processResearchPaper(
  pdfBuffer: Buffer
): Promise<ResearchPaper> {
  const startTime = Date.now();
  logger.info("Starting PDF processing", { bufferSize: pdfBuffer.length });

  const { text } = await pdf(pdfBuffer);
  logger.info("PDF text extracted", { textLength: text.length });

  // Check cache first
  const cacheKey = getCacheKey(text, "full_paper");
  const cached = getCached<ResearchPaper>(cacheKey);
  if (cached) {
    logger.info("Cache hit for full paper");
    return cached;
  }

  try {
    const result = await extractFullPaperData(text);
    setCached(cacheKey, result);
    logger.info("PDF processing completed successfully", { duration: Date.now() - startTime });
    return result;
  } catch (error: any) {
    logger.error("Full extraction failed, falling back to partial", { error: error.message });
    const result = await fallbackPartialExtraction(text);
    setCached(cacheKey, result);
    logger.info("Fallback processing completed", { duration: Date.now() - startTime });
    return result;
  }
}

///////////////////////////////
// Extracts all paper data using optimized single API call
///////////////////////////////
async function extractFullPaperData(text: string): Promise<ResearchPaper> {
  const sections = identifySections(text);
  const abstract = sections["ABSTRACT"] || text.substring(0, 2000);

  // Try combined extraction first
  try {
    return await extractCombinedData(text, abstract);
  } catch (error: any) {
    logger.warn("Combined extraction failed, falling back to individual:", { error: error.message });
    // Fallback to parallel individual extractions
    return await extractParallelData(text, abstract);
  }
}

///////////////////////////////
// Combined extraction using single API call
///////////////////////////////
async function extractCombinedData(text: string, abstract: string): Promise<ResearchPaper> {
  const prompt = `Extract all research paper information as JSON from this text. Return ONLY valid JSON:

{
  "metadata": {
    "title": "string",
    "authors": ["string"],
    "published_date": "Month Year",
    "topics": ["string"]
  },
  "summary": "3-4 sentence summary",
  "key_findings": {
    "primary": "main finding",
    "methodology_innovation": "methodological advance",
    "practical_applications": ["application1", "application2"]
  },
  "research_impact": {
    "significance": "string",
    "level": "Low/Medium/High/Very High",
    "limitations": "string"
  },
  "novelty_assessment": {
    "level": "Low/Medium/High/Very High",
    "comparison_to_prior_work": "string"
  },
  "related_areas": ["area1", "area2", "area3"],
  "performance_metrics": {
    "proposed_method": {
      "accuracy": "value",
      "parameters": "value",
      "training_time": "value"
    },
    "previous_sota": {
      "accuracy": "value",
      "parameters": "value",
      "training_time": "value"
    },
    "baseline": {
      "accuracy": "value",
      "parameters": "value",
      "training_time": "value"
    }
  }
}

Text: ${text.substring(0, 8000)}`;

  const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 1024)));
  const parsed = JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));

  // Validate and sanitize
  return sanitizeExtractedData(parsed);
}

///////////////////////////////
// Fallback parallel extraction
///////////////////////////////
async function extractParallelData(text: string, abstract: string): Promise<ResearchPaper> {
  const [
    metadata,
    summary,
    keyFindings,
    researchImpact,
    noveltyAssessment,
    relatedAreas,
    performanceData,
  ] = await Promise.all([
    extractMetadata(text),
    extractSummary(abstract),
    extractKeyFindings(abstract),
    extractResearchImpact(abstract),
    extractNoveltyAssessment(abstract),
    extractRelatedAreas(abstract),
    extractPerformanceData(text),
  ]);

  return {
    metadata,
    summary,
    key_findings: keyFindings,
    research_impact: researchImpact,
    novelty_assessment: noveltyAssessment,
    related_areas: relatedAreas,
    performance_metrics: performanceData,
  };
}

///////////////////////////////
// Sanitize and validate extracted data
///////////////////////////////
function sanitizeExtractedData(data: any): ResearchPaper {
  const defaults = {
    metadata: {
      title: "Untitled Research Paper",
      authors: [],
      published_date: "Unknown",
      topics: ["research"],
    },
    summary: "",
    key_findings: {
      primary: "",
      methodology_innovation: "",
      practical_applications: [],
    },
    research_impact: {
      significance: "",
      level: "Medium" as const,
      limitations: "",
    },
    novelty_assessment: {
      level: "Medium" as const,
      comparison_to_prior_work: "",
    },
    related_areas: [],
    performance_metrics: {
      proposed_method: { accuracy: "", parameters: "", training_time: "" },
      previous_sota: { accuracy: "", parameters: "", training_time: "" },
      baseline: { accuracy: "", parameters: "", training_time: "" },
    },
  };

  // Merge and validate
  const result = { ...defaults, ...data };

  // Validate levels
  const validLevels = ["Low", "Medium", "High", "Very High"];
  if (!validLevels.includes(result.research_impact.level)) {
    result.research_impact.level = "Medium";
  }
  if (!validLevels.includes(result.novelty_assessment.level)) {
    result.novelty_assessment.level = "Medium";
  }

  return result;
}

///////////////////////////////
// Core extraction functions with caching and rate limiting
///////////////////////////////
async function extractMetadata(text: string): Promise<PaperMetadata> {
  const cacheKey = getCacheKey(text, "metadata");
  const cached = getCached<PaperMetadata>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Extract research paper metadata as JSON:
      {
        "title": "string",
        "authors": ["string"],
        "published_date": "Month Year",
        "topics": ["string"]
      }
      Text: ${text.substring(0, 3000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 1024)));
    const data = JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
    setCached(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Metadata extraction failed:", error);
    const fallback = await fallbackMetadataExtraction(text);
    setCached(cacheKey, fallback);
    return fallback;
  }
}

///////////////////////////////
// Provides a summary from paper text
///////////////////////////////
async function extractSummary(text: string): Promise<string> {
  const cacheKey = getCacheKey(text, "summary");
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Generate a 3-4 sentence summary of this research text:
      ${text.substring(0, 3000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 512)));
    const summary = cleanGeminiJsonResponse(resultText || "");
    setCached(cacheKey, summary);
    return summary;
  } catch {
    // Fallback to Hugging Face if available
    if (process.env.HUGGINGFACE_TOKEN) {
      try {
        const hfSummary = await hf.summarization({
          model: "facebook/bart-large-cnn",
          inputs: text.substring(0, 1024),
          parameters: { max_length: 150 },
        });
        const summary = hfSummary.summary_text;
        setCached(cacheKey, summary);
        return summary;
      } catch (hfError) {
        console.warn("Hugging Face summarization failed:", hfError);
      }
    }
    // Ultimate fallback: simple extract
    const summary = text.substring(0, 500) + "...";
    setCached(cacheKey, summary);
    return summary;
  }
}

///////////////////////////////
// Extracts key findings from paper text
///////////////////////////////
async function extractKeyFindings(text: string): Promise<KeyFindings> {
  const cacheKey = getCacheKey(text, "key_findings");
  const cached = getCached<KeyFindings>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Extract key findings as JSON:
      {
        "primary": "main finding",
        "methodology_innovation": "methodological advance",
        "practical_applications": ["application1", "application2"]
      }
      Text: ${text.substring(0, 3000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 1024)));

    const data = JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
    setCached(cacheKey, data);
    return data;
  } catch {
    const fallback = {
      primary: "",
      methodology_innovation: "",
      practical_applications: [],
    };
    setCached(cacheKey, fallback);
    return fallback;
  }
}

///////////////////////////////
// Enhanced research impact extraction
///////////////////////////////
async function extractResearchImpact(text: string): Promise<ResearchImpact> {
  const cacheKey = getCacheKey(text, "research_impact");
  const cached = getCached<ResearchImpact>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Extract research impact as JSON:
        {
          "significance": "string",
          "level": "Low/Medium/High/Very High",
          "limitations": "string"
        }
        Text: ${text.substring(0, 3000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 1024)));

    const parsed = JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));

    // Validate research impact level
    if (!["Low", "Medium", "High", "Very High"].includes(parsed.level)) {
      parsed.level = "Medium";
    }

    setCached(cacheKey, parsed);
    return parsed;
  } catch {
    const fallback = {
      significance: "",
      level: "Medium" as const,
      limitations: "",
    };
    setCached(cacheKey, fallback);
    return fallback;
  }
}

///////////////////////////////
// Enhanced novelty assessment
///////////////////////////////
async function extractNoveltyAssessment(text: string): Promise<NoveltyAssessment> {
  const cacheKey = getCacheKey(text, "novelty_assessment");
  const cached = getCached<NoveltyAssessment>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Assess novelty as JSON:
        {
          "level": "Low/Medium/High/Very High",
          "comparison_to_prior_work": "string"
        }
        Text: ${text.substring(0, 3000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 1024)));

    const parsed = JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));

    // Validate novelty level
    if (!["Low", "Medium", "High", "Very High"].includes(parsed.level)) {
      parsed.level = "Medium";
    }

    setCached(cacheKey, parsed);
    return parsed;
  } catch {
    const fallback = {
      level: "Medium" as const,
      comparison_to_prior_work: "",
    };
    setCached(cacheKey, fallback);
    return fallback;
  }
}

///////////////////////////////
// Extract related research areas from text
///////////////////////////////
async function extractRelatedAreas(text: string): Promise<string[]> {
  const cacheKey = getCacheKey(text, "related_areas");
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `List 3-5 related research areas as JSON array:
      ["area1", "area2", "area3"]
      Text: ${text.substring(0, 2000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 512)));
    const data = JSON.parse(cleanGeminiJsonResponse(resultText || "[]"));
    setCached(cacheKey, data);
    return data;
  } catch {
    setCached(cacheKey, []);
    return [];
  }
}

///////////////////////////////
// Extract performance data from text
///////////////////////////////
async function extractPerformanceData(text: string): Promise<PerformanceComparison> {
  const cacheKey = getCacheKey(text, "performance_metrics");
  const cached = getCached<PerformanceComparison>(cacheKey);
  if (cached) return cached;

  try {
    // First try to find explicit performance data
    const tableData = extractPerformanceFromTables(text);
    if (tableData) {
      setCached(cacheKey, tableData);
      return tableData;
    }

    // Fallback to Gemini extraction
    const prompt = `Extract performance metrics as JSON:
      {
        "proposed_method": {
          "accuracy": "value",
          "parameters": "value",
          "training_time": "value"
        },
        "previous_sota": {
          "accuracy": "value",
          "parameters": "value",
          "training_time": "value"
        },
        "baseline": {
          "accuracy": "value",
          "parameters": "value",
          "training_time": "value"
        }
      }
      Text: ${text.substring(0, 4000)}`;

    const resultText = await withRateLimit(() => retryWithBackoff(() => runHfTextGeneration(prompt, 1024)));

    const data = JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
    setCached(cacheKey, data);
    return data;
  } catch {
    const fallback = {
      proposed_method: { accuracy: "", parameters: "", training_time: "" },
      previous_sota: { accuracy: "", parameters: "", training_time: "" },
      baseline: { accuracy: "", parameters: "", training_time: "" },
    };
    setCached(cacheKey, fallback);
    return fallback;
  }
}

interface Reference {
  authors: string;
  title: string;
  venue?: string;
  year?: string;
  doi?: string;
}

///////////////////////////////
// Enhanced reference extraction with AI fallback
///////////////////////////////
async function extractReferences(text: string): Promise<Reference[]> {
  const regexReferences = tryRegexReferenceExtraction(text);
  if (regexReferences.length > 3) {
    return regexReferences;
  }

  return await extractReferencesWithAI(text);
}

///////////////////////////////
// Initial strict regex parsing
///////////////////////////////
function tryRegexReferenceExtraction(text: string): Reference[] {
  const references: Reference[] = [];
  const referenceSection = extractFromSection(
    { REFERENCES: text },
    ["REFERENCES"],
    {
      maxLength: 5000,
      removeReferences: false,
    }
  );

  if (!referenceSection) return [];

  // Improved regex patterns
  const patterns = [
    // Pattern 1: Numbered references (e.g., [1] Author. Title. Journal, Year)
    /\[\d+\]\s+([^\.]+)\.\s+([^\.]+)\.\s+([^\,]+),\s*(\d{4})/g,

    // Pattern 2: Author (Year) Title. Journal
    /([^\(]+)\s*\((\d{4})\)\s*([^\.]+)\.\s*([^\.]+)\.?/g,

    // Pattern 3: Author et al. "Title." Journal vol, pages (Year)
    /([A-Z][^\.]+)\.\s+"([^"]+)"\.\s+([^\,]+)\s+\d+\([^\)]+\),\s*(\d+)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(referenceSection)) !== null) {
      references.push({
        authors: match[1].trim(),
        title: match[2]?.trim() || "",
        venue: match[3]?.trim(),
        year: match[4]?.trim(),
      });
    }
    if (references.length > 0) break; // Use first successful pattern
  }

  return references.filter(
    (ref) =>
      ref.authors.length > 3 &&
      ref.title.length > 10 &&
      !ref.title.includes("http") &&
      !ref.authors.match(/[0-9]{4}/)
  );
}

///////////////////////////////
// AI-powered reference extraction
///////////////////////////////
async function extractReferencesWithAI(text: string): Promise<Reference[]> {
  try {
    const referenceSection = extractFromSection(
      { REFERENCES: text },
      ["REFERENCES"],
      {
        maxLength: 5000,
        removeReferences: false,
      }
    );

    if (!referenceSection) return [];

    try {
      const prompt = `Extract academic references from the "REFERENCES" section as JSON array from this text:
        [{
          "authors": "string",
          "title": "string",
          "venue": "string",
          "year": "string",
          "doi": "string"
        }]
        Return ONLY valid JSON without any other text.
        Text: ${referenceSection.substring(0, 3000)}`;

      const resultText = await runHfTextGeneration(prompt, 1024);
      return JSON.parse(cleanGeminiJsonResponse(resultText || "[]"));
    } catch (hfError) {
      const hfResult = await hf.summarization({
        model: "facebook/bart-large-cnn",
        inputs: referenceSection.substring(0, 1024),
        parameters: {
          max_length: 500,
          min_length: 200,
        },
      });

      return extractReferencesFromSummary(hfResult.summary_text);
    }
  } catch (error) {
    console.error("AI reference extraction failed:", error);
    return [];
  }
}

///////////////////////////////
// Helper to extract references from AI summary
///////////////////////////////
function extractReferencesFromSummary(summary: string): Reference[] {
  const references: Reference[] = [];
  const lines = summary.split("\n");

  for (const line of lines) {
    if (line.trim().length < 20) continue;

    // Simple pattern matching for common reference formats
    const authorMatch = line.match(/^([A-Z][a-z]+(?:,\s[A-Z][a-z]+)*)/);
    const yearMatch = line.match(/\((\d{4})\)/);
    const titleMatch = line.match(/\.\s+"?([^"]+)"?\./);

    if (authorMatch) {
      references.push({
        authors: authorMatch[1],
        title: titleMatch?.[1] || line.split(".")[1]?.trim() || "",
        year: yearMatch?.[1],
      });
    }
  }

  return references.slice(0, 20); // Limit to top 20
}

///////////////////////////////
// Fallback extraction when full extraction fails
///////////////////////////////
export async function fallbackPartialExtraction(text: string): Promise<ResearchPaper> {
  const sections = identifySections(text);
  const abstract = sections["ABSTRACT"] || text.substring(0, 1000);

  const [metadata, summary] = await Promise.all([
    fallbackMetadataExtraction(text),
    extractSummary(abstract),
  ]);

  return {
    metadata,
    summary,
    key_findings: {
      primary: extractFromSection(sections, ["RESULTS", "CONCLUSION"]),
      methodology_innovation: extractFromSection(sections, ["METHODS"]),
      practical_applications: [],
    },
    research_impact: {
      significance: "",
      level: "Medium",
      limitations: "",
    },
    novelty_assessment: {
      level: "Medium",
      comparison_to_prior_work: "",
    },
    related_areas: [],
    performance_metrics: {
      proposed_method: { accuracy: "", parameters: "", training_time: "" },
      previous_sota: { accuracy: "", parameters: "", training_time: "" },
      baseline: { accuracy: "", parameters: "", training_time: "" },
    },
    // references: await extractReferences(text),
  };
}

///////////////////////////////
// Extracts document sections from text
///////////////////////////////
function identifySections(text: string): Record<string, string> {
  const sectionTitles = [
    "ABSTRACT",
    "INTRODUCTION",
    "METHODS",
    "RESULTS",
    "CONCLUSION",
  ];
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

///////////////////////////////
// Extracts content from specific sections with cleaning
///////////////////////////////
function extractFromSection(
  sections: Record<string, string>,
  targetSections: string[],
  options: {
    maxLength?: number;
    removeReferences?: boolean;
    cleanTables?: boolean;
  } = {}
): string {
  // Default options
  const finalOptions = {
    maxLength: 1000,
    removeReferences: true,
    cleanTables: true,
    ...options,
  };

  let content = "";
  for (const section of targetSections) {
    if (sections[section.toUpperCase()]) {
      content = sections[section.toUpperCase()];
      break;
    }
  }

  if (!content) return "";

  // Clean content
  if (finalOptions.removeReferences) {
    content = content.replace(/\[\d+(?:-\d+)?\]/g, "");
  }

  if (finalOptions.cleanTables) {
    content = content.replace(
      /(?:\+\-+\+[\s\S]+?\+\-+\+)|(?:\|.+\|)/g,
      (match) =>
        match
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(" - ")
    );
  }

  // Extract relevant sentences
  const sentences = content.split(".");
  let extracted = "";
  let charCount = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed || isBoilerplate(trimmed)) continue;

    if (charCount + trimmed.length > finalOptions.maxLength) break;

    extracted += trimmed + ". ";
    charCount += trimmed.length;
  }

  return extracted.trim();
}

///////////////////////////////
// Helper functions
///////////////////////////////
function extractPerformanceFromTables(
  text: string
): PerformanceComparison | null {
  const tableRegex =
    /Model\s*\|\s*Accuracy\s*\|\s*Parameters\s*\|\s*Training Time[\s\S]+?\n-[\s\S]+?\n([^\n]*\n)+/i;
  const tableMatch = text.match(tableRegex);
  if (!tableMatch) return null;

  const tableText = tableMatch[0];
  const extractMetric = (model: string, metric: string) =>
    tableText
      .match(
        new RegExp(`${model}[^\\|]*\\|[^\\|]*${metric}[^\\|]*\\|([^\\|]+)\\|`)
      )?.[1]
      ?.trim() || "";

  return {
    proposed_method: {
      accuracy: extractMetric("Proposed", "Accuracy"),
      parameters: extractMetric("Proposed", "Parameters"),
      training_time: extractMetric("Proposed", "Training Time"),
    },
    previous_sota: {
      accuracy: extractMetric("SOTA", "Accuracy"),
      parameters: extractMetric("SOTA", "Parameters"),
      training_time: extractMetric("SOTA", "Training Time"),
    },
    baseline: {
      accuracy: extractMetric("Baseline", "Accuracy"),
      parameters: extractMetric("Baseline", "Parameters"),
      training_time: extractMetric("Baseline", "Training Time"),
    },
  };
}

async function fallbackMetadataExtraction(
  text: string
): Promise<PaperMetadata> {
  // If no Hugging Face token, skip to regex fallback
  if (!process.env.HUGGINGFACE_TOKEN) {
    console.warn("No Hugging Face token provided, using regex fallback");
    return {
      title: extractTitleFromText(text),
      authors: extractAuthorsWithRegex(text),
      published_date: extractYear(text),
      topics: ["research", "paper"],
    };
  }

  const modelAlternatives = [
    "dslim/bert-base-NER",
    "dbmdz/bert-large-cased-finetuned-conll03-english",
    "Babelscape/wikineural-multilingual-ner",
  ];

  // Try each model in sequence
  for (const model of modelAlternatives) {
    try {
      const authorResponse = await hf.tokenClassification({
        model,
        inputs: text.substring(0, 1000),
      });

      const authors = [
        ...new Set(
          authorResponse
            .filter((entity) => entity.entity_group === "PER")
            .map((entity) => entity.word)
        ),
      ].slice(0, 5);

      return {
        title: extractTitleFromText(text),
        authors,
        published_date: extractYear(text),
        topics: await extractKeywords(text),
      };
    } catch (error) {
      console.warn(`Failed with model ${model}:`, error);
      continue;
    }
  }

  // If all models fail, fallback to regex
  return {
    title: extractTitleFromText(text),
    authors: extractAuthorsWithRegex(text),
    published_date: extractYear(text),
    topics: ["research", "paper"],
  };
}

// 
function extractTitleFromText(text: string): string {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const potentialTitles = lines
    .slice(0, 5)
    .filter(
      (line) =>
        line.length > 10 &&
        line.length < 120 &&
        !line.match(/abstract|introduction|keywords/i)
    );

  return potentialTitles[0]?.trim() || "Untitled Research Paper";
}

// 
function extractAuthorsWithRegex(text: string): string[] {
  const patterns = [
    /(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*,\s*[A-Z][a-z]+)*/g,
    /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+and\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)*)/i,
    /(?:author|authors)\s*:\s*([^\n]+)/i,
  ];

  const authors = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const authorGroup = match[1];
      authorGroup
        .split(/\s+and\s+|,\s+/)
        .map((author) => author.trim())
        .filter((author) => author.length > 0)
        .forEach((author) => authors.add(author));
    }
  }

  return Array.from(authors).slice(0, 5);
}

// 
function extractYear(text: string): string {
  const match = text.match(/(20\d{2}|19\d{2})/);
  return match ? match[0] : "Unknown";
}

// 
async function extractKeywords(text: string): Promise<string[]> {
  if (!process.env.HUGGINGFACE_TOKEN) {
    return ["research", "paper"];
  }
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text.substring(0, 512),
    });
    return ["machine learning", "neural networks"]; // Simplified for example
  } catch {
    return ["research", "paper"];
  }
}
