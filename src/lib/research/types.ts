export type RetrievalStrategy =
  | "dense"
  | "bm25"
  | "hybrid"
  | "hybrid_rerank"
  | "graph_rag";

export type ChunkingStrategyName =
  | "fixed"
  | "sliding_window"
  | "semantic"
  | "section_aware";

export interface ParsedDocument {
  id: string;
  title: string;
  source: string;
  text: string;
  pages?: Array<{ pageNumber: number; text: string }>;
  sections?: Array<{ title: string; text: string; pageNumber?: number }>;
}

export interface Chunk {
  id: string;
  text: string;
  pageNumber?: number;
  sectionTitle?: string;
  tokenCount: number;
  sourceDocument: string;
  metadata?: Record<string, unknown>;
}

export interface ChunkingStrategy {
  chunk(document: ParsedDocument): Chunk[];
}

export interface RetrievalOptions {
  paperId?: string;
  topK?: number;
  chunks?: Chunk[];
  strategy?: RetrievalStrategy;
  denseWeight?: number;
  bm25Weight?: number;
}

export interface RetrievedChunk extends Chunk {
  score: number;
  retrievalStrategy: RetrievalStrategy;
  denseScore?: number;
  bm25Score?: number;
  rerankScore?: number;
}

export interface Retriever {
  retrieve(query: string, options?: RetrievalOptions): Promise<RetrievedChunk[]>;
}

export interface RetrievalMetrics {
  precisionAtK: number;
  recallAtK: number;
  meanReciprocalRank: number;
}

export interface GenerationMetrics {
  contextRelevance: number;
  answerRelevance: number;
  faithfulness: number;
  citationAccuracy: number;
}

export interface PerformanceMetrics {
  latencyMs: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface EvaluationResult {
  retrievalMetrics: RetrievalMetrics;
  generationMetrics: GenerationMetrics;
  performanceMetrics: PerformanceMetrics;
}

export interface Citation {
  chunkId: string;
  pageNumber?: number;
  sectionTitle?: string;
}

export interface CitationVerification {
  confidence: number;
  unsupportedClaims: string[];
  missingCitations: string[];
  hallucinatedCitations: string[];
}

export interface ExperimentConfig {
  name: string;
  documentIds: string[];
  retrievalStrategies: RetrievalStrategy[];
  chunkingStrategies: ChunkingStrategyName[];
  model?: string;
  topK?: number;
}
