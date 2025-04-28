import pdf from "pdf-parse";
import { hf, geminiPro } from "../lib/aiClients";
import { cleanGeminiJsonResponse, isBoilerplate } from "@/lib/helpers";

interface PaperMetadata {
  title: string;
  authors: string[];
  published_date: string;
  keywords: string[];
}

interface KeyFindings {
  primary: string;
  methodology_innovation: string;
  practical_applications: string[];
}

interface ResearchImpact {
  novelty_assessment: "Low" | "Medium" | "High" | "Very High";
  significance: string;
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
  related_areas: string[];
  performance_comparison: PerformanceComparison;
}

/**
 * Main function to process a PDF buffer and extract research paper data
 */
export async function processResearchPaper(
  pdfBuffer: Buffer
): Promise<ResearchPaper> {
  const { text } = await pdf(pdfBuffer);

  try {
    return await extractFullPaperData(text);
  } catch (error) {
    console.error("Full extraction failed, falling back to partial:", error);
    return fallbackPartialExtraction(text);
  }
}

/**
 * Extracts all paper data using parallel processing
 */
async function extractFullPaperData(text: string): Promise<ResearchPaper> {
  const sections = identifySections(text);
  const abstract = sections["ABSTRACT"] || text.substring(0, 2000);

  const [
    metadata,
    summary,
    keyFindings,
    researchImpact,
    relatedAreas,
    performanceData,
  ] = await Promise.all([
    extractMetadata(text),
    extractSummary(abstract),
    extractKeyFindings(abstract),
    extractResearchImpact(abstract),
    extractRelatedAreas(abstract),
    extractPerformanceData(text), // Use full text for performance data
  ]);

  return {
    metadata,
    summary,
    key_findings: keyFindings,
    research_impact: researchImpact,
    related_areas: relatedAreas,
    performance_comparison: performanceData,
  };
}

/**
 * Fallback extraction when full extraction fails
 */
async function fallbackPartialExtraction(text: string): Promise<ResearchPaper> {
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
      novelty_assessment: "Medium",
      significance: "",
    },
    related_areas: [],
    performance_comparison: {
      proposed_method: { accuracy: "", parameters: "", training_time: "" },
      previous_sota: { accuracy: "", parameters: "", training_time: "" },
      baseline: { accuracy: "", parameters: "", training_time: "" },
    },
  };
}

/**
 * Extracts document sections from text
 */
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

/**
 * Extracts content from specific sections with cleaning
 */
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

/**
 * Core extraction functions
 */
async function extractMetadata(text: string): Promise<PaperMetadata> {
  try {
    const prompt = `Extract research paper metadata as JSON:
    {
      "title": "string",
      "authors": ["string"],
      "published_date": "Month Year",
      "keywords": ["string"]
    }
    Text: ${text.substring(0, 3000)}`;

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;
    return JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
  } catch (error) {
    console.error("Metadata extraction failed:", error);
    return fallbackMetadataExtraction(text);
  }
}

async function extractSummary(text: string): Promise<string> {
  try {
    const prompt = `Generate a 3-4 sentence summary of this research text:
    ${text.substring(0, 3000)}`;

    const result = await geminiPro.generateContent(prompt);
    return cleanGeminiJsonResponse(
      result.response.candidates?.[0]?.content.parts[0].text || ""
    );
  } catch {
    const hfSummary = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: text.substring(0, 1024),
      parameters: { max_length: 150 },
    });
    return hfSummary.summary_text;
  }
}

async function extractKeyFindings(text: string): Promise<KeyFindings> {
  try {
    const prompt = `Extract key findings as JSON:
    {
      "primary": "main finding",
      "methodology_innovation": "methodological advance",
      "practical_applications": ["application1", "application2"]
    }
    Text: ${text.substring(0, 3000)}`;

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;
    return JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
  } catch {
    return {
      primary: "",
      methodology_innovation: "",
      practical_applications: [],
    };
  }
}

async function extractResearchImpact(text: string): Promise<ResearchImpact> {
  try {
    const prompt = `Assess research impact as JSON:
    {
      "novelty_assessment": "Low/Medium/High/Very High",
      "significance": "description"
    }
    Text: ${text.substring(0, 3000)}`;

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;
    return JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
  } catch {
    return {
      novelty_assessment: "Medium",
      significance: "",
    };
  }
}

async function extractRelatedAreas(text: string): Promise<string[]> {
  try {
    const prompt = `List 3-5 related research areas as JSON array:
    ["area1", "area2", "area3"]
    Text: ${text.substring(0, 2000)}`;

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;
    return JSON.parse(cleanGeminiJsonResponse(resultText || "[]"));
  } catch {
    return [];
  }
}

async function extractPerformanceData(
  text: string
): Promise<PerformanceComparison> {
  try {
    // First try to find explicit performance data
    const tableData = extractPerformanceFromTables(text);
    if (tableData) return tableData;

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

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;
    return JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
  } catch {
    return {
      proposed_method: { accuracy: "", parameters: "", training_time: "" },
      previous_sota: { accuracy: "", parameters: "", training_time: "" },
      baseline: { accuracy: "", parameters: "", training_time: "" },
    };
  }
}

/**
 * Helper functions
 */
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
  const authorResponse = await hf.tokenClassification({
    model: "dbmdz/bert-large-cased-finetuned-conll03-english",
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
    title: text.split("\n")[0]?.trim() || "Untitled",
    authors,
    published_date: extractYear(text),
    keywords: await extractKeywords(text),
  };
}

function extractYear(text: string): string {
  const match = text.match(/(20\d{2}|19\d{2})/);
  return match ? match[0] : "Unknown";
}

async function extractKeywords(text: string): Promise<string[]> {
  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text.substring(0, 512),
  });
  return ["machine learning", "neural networks"]; // Simplified for example
}
