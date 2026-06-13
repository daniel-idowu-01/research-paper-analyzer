import type {
  Chunk,
  EvaluationResult,
  GenerationMetrics,
  PerformanceMetrics,
  RetrievedChunk,
  RetrievalMetrics,
} from "./types";
import { lexicalOverlap, splitSentences } from "./text";

export function evaluateRetrieval(
  retrieved: RetrievedChunk[],
  relevantChunkIds: string[],
  k = retrieved.length
): RetrievalMetrics {
  const top = retrieved.slice(0, k);
  const relevant = new Set(relevantChunkIds);
  const hits = top.filter((chunk) => relevant.has(chunk.id)).length;
  const firstRelevant = top.findIndex((chunk) => relevant.has(chunk.id));

  return {
    precisionAtK: top.length ? hits / top.length : 0,
    recallAtK: relevant.size ? hits / relevant.size : 0,
    meanReciprocalRank: firstRelevant >= 0 ? 1 / (firstRelevant + 1) : 0,
  };
}

export function evaluateGeneration(args: {
  query: string;
  answer: string;
  contexts: Chunk[];
  expectedAnswer?: string;
  citationAccuracy?: number;
}): GenerationMetrics {
  const contextText = args.contexts.map((chunk) => chunk.text).join(" ");
  const answerSentences = splitSentences(args.answer);
  const supported = answerSentences.filter(
    (sentence) => lexicalOverlap(contextText, sentence) >= 0.35
  ).length;

  return {
    contextRelevance: lexicalOverlap(args.query, contextText),
    answerRelevance: args.expectedAnswer
      ? lexicalOverlap(args.expectedAnswer, args.answer)
      : lexicalOverlap(args.query, args.answer),
    faithfulness: answerSentences.length ? supported / answerSentences.length : 0,
    citationAccuracy: args.citationAccuracy ?? 0,
  };
}

export function createEvaluationResult(args: {
  retrieved: RetrievedChunk[];
  relevantChunkIds: string[];
  query: string;
  answer: string;
  expectedAnswer?: string;
  latencyMs: number;
  tokenUsage?: PerformanceMetrics["tokenUsage"];
  citationAccuracy?: number;
}): EvaluationResult {
  return {
    retrievalMetrics: evaluateRetrieval(args.retrieved, args.relevantChunkIds),
    generationMetrics: evaluateGeneration({
      query: args.query,
      answer: args.answer,
      contexts: args.retrieved,
      expectedAnswer: args.expectedAnswer,
      citationAccuracy: args.citationAccuracy,
    }),
    performanceMetrics: {
      latencyMs: args.latencyMs,
      tokenUsage: args.tokenUsage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    },
  };
}
