import { IPaper } from "../../types";
import { processResearchPaper } from "./pdfProcessor";
import HuggingFaceService from "@/services/huggingface-service";

interface BasicResult {
  metadata: {
    title: string;
  };
  content: {
    // introduction: string;
    methodology: string;
    results: string;
    conclusion: string;
  };
}

interface AIAnalysis {
  summary: string | null;
  topics: string[];
  // embeddings: number[] | null;
  keyPhrases: string[];
  sentiment: string | null;
  processedAt: string;
}

interface EnhancedResult extends BasicResult {
  aiAnalysis: AIAnalysis;
}

export async function enhancedProcessResearchPaper(
  buffer: Buffer
): Promise<EnhancedResult> {
  try {
    // First, use existing PDF processing
    const result = await processResearchPaper(buffer);
    const basicResult: BasicResult = {
      metadata: {
        title: result.metadata.title || "Untitled Paper",
      },
      content: {
        // introduction: result.introduction || "",
        methodology: result.key_findings.methodology_innovation || "",
        results: result.key_findings.primary || "",
        conclusion: result.summary || "",
      },
    };

    const fullText = `
            ${basicResult.metadata.title}
            ${basicResult.content.methodology}
            ${basicResult.content.results}
            ${basicResult.content.conclusion}
        `.trim(); // ${basicResult.content.introduction} ${basicResult.metadata.abstract}

    // Enhance with Hugging Face analysis
    const [summary, topics, keyPhrases, sentiment] /*embeddings*/ =
      await Promise.allSettled([
        HuggingFaceService.generateSummary(fullText),
        HuggingFaceService.classifyResearchTopics(fullText),
        // HuggingFaceService.generateEmbeddings(
        //   basicResult.metadata.abstract || fullText.substring(0, 500)
        // ),
        HuggingFaceService.extractKeyPhrases(fullText),
        HuggingFaceService.analyzeSentiment(
          basicResult.content.conclusion || fullText.substring(0, 500)
        ),
      ]);

    return {
      ...basicResult,
      aiAnalysis: {
        summary: summary.status === "fulfilled" ? summary.value : null,
        topics:
          topics.status === "fulfilled" ? topics.value.map((t) => t.topic) : [],
        // embeddings:
        //   embeddings.status === "fulfilled"
        //     ? Array.isArray(embeddings.value)
        //       ? embeddings.value.flatMap(Number)
        //       : null
        //     : null,
        keyPhrases:
          keyPhrases.status === "fulfilled"
            ? keyPhrases.value.map((kp) => kp.text)
            : [],
        sentiment:
          sentiment.status === "fulfilled" && sentiment.value
            ? sentiment.value.label
            : null,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Enhanced processing error:", error);
    throw error;
  }
}
