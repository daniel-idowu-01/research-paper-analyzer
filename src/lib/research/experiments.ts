import Paper from "@/models/Paper";
import ExperimentRun from "@/models/ExperimentRun";
import { createChunkingStrategy, parseDocumentFromPaper } from "./chunking";
import { createEvaluationResult } from "./evaluation";
import { createRetriever } from "./retrieval";
import type {
  ChunkingStrategyName,
  EvaluationResult,
  ExperimentConfig,
  RetrievalStrategy,
} from "./types";

type ExperimentOutput = {
  documentId: string;
  query: string;
  answer: string;
  retrievedChunkIds: string[];
  metrics: {
    precisionAtK: number;
    recallAtK: number;
    meanReciprocalRank: number;
    contextRelevance: number;
    answerRelevance: number;
    faithfulness: number;
    citationAccuracy: number;
    latencyMs: number;
    totalTokens: number;
  };
};

function flattenMetrics(result: EvaluationResult): ExperimentOutput["metrics"] {
  return {
    precisionAtK: result.retrievalMetrics.precisionAtK,
    recallAtK: result.retrievalMetrics.recallAtK,
    meanReciprocalRank: result.retrievalMetrics.meanReciprocalRank,
    contextRelevance: result.generationMetrics.contextRelevance,
    answerRelevance: result.generationMetrics.answerRelevance,
    faithfulness: result.generationMetrics.faithfulness,
    citationAccuracy: result.generationMetrics.citationAccuracy,
    latencyMs: result.performanceMetrics.latencyMs,
    totalTokens: result.performanceMetrics.tokenUsage.totalTokens,
  };
}

function defaultQueries(title: string): string[] {
  return [
    `What is the main contribution of ${title}?`,
    "What methodology does the paper use?",
    "What are the main limitations?",
  ];
}

export async function runExperiment(config: ExperimentConfig) {
  const run = await ExperimentRun.create({
    name: config.name,
    status: "running",
    config,
    startedAt: new Date(),
  });

  try {
    const outputs: ExperimentOutput[] = [];
    const papers = await Paper.find({ _id: { $in: config.documentIds } }).select(
      "extracted_text file_url metadata summary"
    );

    for (const paper of papers) {
      const plain = paper.toObject();
      const document = parseDocumentFromPaper(plain);
      if (!document.text) continue;

      for (const chunking of config.chunkingStrategies) {
        const chunks = createChunkingStrategy(chunking).chunk(document);
        for (const retrieval of config.retrievalStrategies) {
          for (const query of defaultQueries(document.title)) {
            const start = Date.now();
            const retrieved = await createRetriever(retrieval).retrieve(query, {
              paperId: String(plain._id),
              chunks,
              topK: config.topK || 5,
            });
            const answer = retrieved.map((chunk) => chunk.text).join("\n\n").slice(0, 1200);
            const relevantChunkIds = chunks
              .filter((chunk) => chunk.text.toLowerCase().includes(query.toLowerCase()))
              .map((chunk) => chunk.id);
            const result = createEvaluationResult({
              retrieved,
              relevantChunkIds,
              query,
              answer,
              expectedAnswer: plain.summary,
              latencyMs: Date.now() - start,
            });

            outputs.push({
              documentId: document.id,
              query,
              answer,
              retrievedChunkIds: retrieved.map((chunk) => chunk.id),
              metrics: flattenMetrics(result),
            });
          }
        }
      }
    }

    run.outputs = outputs;
    run.status = "completed";
    run.completedAt = new Date();
    await run.save();
    return run;
  } catch (error) {
    run.status = "failed";
    run.error = error instanceof Error ? error.message : String(error);
    run.completedAt = new Date();
    await run.save();
    throw error;
  }
}

export function normalizeExperimentConfig(value: any): ExperimentConfig {
  const retrievalStrategies = Array.isArray(value?.retrievalStrategies)
    ? value.retrievalStrategies
    : ["dense", "bm25", "hybrid", "hybrid_rerank"];
  const chunkingStrategies = Array.isArray(value?.chunkingStrategies)
    ? value.chunkingStrategies
    : ["fixed", "sliding_window", "semantic", "section_aware"];

  return {
    name: String(value?.name || `RAG experiment ${new Date().toISOString()}`),
    documentIds: Array.isArray(value?.documentIds) ? value.documentIds.map(String) : [],
    retrievalStrategies: retrievalStrategies as RetrievalStrategy[],
    chunkingStrategies: chunkingStrategies as ChunkingStrategyName[],
    model: value?.model ? String(value.model) : undefined,
    topK: Number.isFinite(Number(value?.topK)) ? Number(value.topK) : 5,
  };
}
