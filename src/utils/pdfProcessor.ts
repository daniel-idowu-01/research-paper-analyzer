import pdf from "pdf-parse";
import { hf, geminiPro } from "../lib/aiClients";
import { cleanGeminiJsonResponse } from "@/lib/helpers";

interface PaperMetadata {
  title: string;
  authors: string[];
  published_date: string;
  keywords: string[];
}

interface PaperInsights {
  contributions: string[];
  methodology: string;
  performance_metrics: Record<string, string>;
}

export async function extractPDFData(buffer: Buffer): Promise<{
  metadata: PaperMetadata;
  insights: PaperInsights;
  sections: Record<string, string>;
}> {
  // Step 1: Extract raw text
  const { text } = await pdf(buffer);

  // Step 2: Identify document sections
  const sections = await identifySections(text);

  // Step 3: Parallel extraction
  const [metadata, insights] = await Promise.all([
    extractMetadata(text),
    extractInsights(sections["ABSTRACT"] || text.substring(0, 2000)),
  ]);

  return { metadata, insights, sections };
}

async function identifySections(text: string): Promise<Record<string, string>> {
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

    // Check for section headers
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

async function extractMetadata(text: string): Promise<PaperMetadata> {
  try {
    const prompt = `
      Extract the following from research paper text in JSON format:
      {
        "title": "string",
        "authors": ["string"],
        "published_date": "Month Year",
        "keywords": ["string"]
      }
      
      Text: ${text.substring(0, 3000)}
    `;

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;

    return JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
  } catch (error) {
    console.error("Metadata extraction failed:", error);
    return fallbackMetadataExtraction(text);
  }
}

async function extractInsights(text: string): Promise<PaperInsights> {
  try {
    const prompt = `
      Analyze this research text and return JSON with:
      {
        "contributions": ["bullet points"],
        "methodology": "string",
        "performance_metrics": {"metric": "value"}
      }
      
      Text: ${text.substring(0, 3000)}
    `;

    const result = await geminiPro.generateContent(prompt);
    const resultText = result.response.candidates?.[0]?.content.parts[0].text;

    return JSON.parse(cleanGeminiJsonResponse(resultText || "{}"));
  } catch (error) {
    console.error("Insight extraction failed, falling back to HF:", error);
    return fallbackHuggingFaceInsights(text);
  }
}

// Fallback implementations
async function fallbackMetadataExtraction(
  text: string
): Promise<PaperMetadata> {
  // Use HF NER model for authors
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

async function fallbackHuggingFaceInsights(
  text: string
): Promise<PaperInsights> {
  const summary = await hf.summarization({
    model: "facebook/bart-large-cnn",
    inputs: text.substring(0, 1024),
    parameters: { max_length: 150 },
  });

  return {
    contributions: [summary.summary_text],
    methodology: "Not extracted",
    performance_metrics: {},
  };
}

// Helper functions
function extractYear(text: string): string {
  const match = text.match(/(20\d{2}|19\d{2})/);
  return match ? match[0] : "Unknown";
}

async function extractKeywords(text: string): Promise<string[]> {
  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text.substring(0, 512),
  });
  // Simple keyword extraction - would need proper clustering in production
  return ["machine learning", "neural networks"];
}
