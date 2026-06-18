import { semanticSearchPaper } from "@/lib/semantic";
import type {
  Chunk,
  RetrievedChunk,
  RetrievalOptions,
  RetrievalStrategy,
  Retriever,
} from "./types";
import { GraphRagRetriever } from "./graph";
import { lexicalOverlap, tokenize } from "./text";

function asRetrieved(
  chunk: Chunk,
  score: number,
  strategy: RetrievalStrategy,
  extras: Partial<RetrievedChunk> = {}
): RetrievedChunk {
  return {
    ...chunk,
    score,
    retrievalStrategy: strategy,
    ...extras,
  };
}

function normalizeScores<T extends { score: number }>(items: T[]): T[] {
  const max = Math.max(...items.map((item) => item.score), 0);
  if (max <= 0) return items;
  return items.map((item) => ({ ...item, score: item.score / max }));
}

function bm25Score(query: string, chunk: Chunk, corpus: Chunk[]): number {
  const queryTerms = tokenize(query);
  const docTerms = tokenize(chunk.text);
  if (!queryTerms.length || !docTerms.length) return 0;

  const termCounts = new Map<string, number>();
  docTerms.forEach((term) => termCounts.set(term, (termCounts.get(term) || 0) + 1));
  const avgDocLength =
    corpus.reduce((sum, item) => sum + Math.max(1, tokenize(item.text).length), 0) /
    Math.max(1, corpus.length);
  const k1 = 1.5;
  const b = 0.75;

  return queryTerms.reduce((score, term) => {
    const tf = termCounts.get(term) || 0;
    if (!tf) return score;
    const docsWithTerm = corpus.filter((item) => tokenize(item.text).includes(term)).length;
    const idf = Math.log(1 + (corpus.length - docsWithTerm + 0.5) / (docsWithTerm + 0.5));
    const denom = tf + k1 * (1 - b + b * (docTerms.length / avgDocLength));
    return score + idf * ((tf * (k1 + 1)) / denom);
  }, 0);
}

export class DenseVectorRetriever implements Retriever {
  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievedChunk[]> {
    const topK = options.topK || 6;

    if (options.paperId) {
      const semantic = await semanticSearchPaper(options.paperId, query, topK);
      if (semantic.length) {
        return semantic.map((match) =>
          asRetrieved(
            {
              id: `${options.paperId}:pinecone:${match.index}`,
              text: match.snippet,
              tokenCount: tokenize(match.snippet).length,
              sourceDocument: options.paperId!,
            },
            match.score,
            "dense",
            { denseScore: match.score }
          )
        );
      }
    }

    const chunks = options.chunks || [];
    return chunks
      .map((chunk) =>
        asRetrieved(chunk, lexicalOverlap(query, chunk.text), "dense", {
          denseScore: lexicalOverlap(query, chunk.text),
        })
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export class BM25Retriever implements Retriever {
  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievedChunk[]> {
    const chunks = options.chunks || [];
    return chunks
      .map((chunk) => {
        const score = bm25Score(query, chunk, chunks);
        return asRetrieved(chunk, score, "bm25", { bm25Score: score });
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, options.topK || 6);
  }
}

export class HybridRetriever implements Retriever {
  constructor(
    private readonly dense = new DenseVectorRetriever(),
    private readonly bm25 = new BM25Retriever()
  ) {}

  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievedChunk[]> {
    const topK = options.topK || 6;
    const denseWeight = options.denseWeight ?? 0.6;
    const bm25Weight = options.bm25Weight ?? 0.4;
    const [denseResults, bm25Results] = await Promise.all([
      this.dense.retrieve(query, { ...options, topK: Math.max(topK * 2, 10) }),
      this.bm25.retrieve(query, { ...options, topK: Math.max(topK * 2, 10) }),
    ]);
    const denseNorm = normalizeScores(denseResults);
    const bm25Norm = normalizeScores(bm25Results);
    const byId = new Map<string, RetrievedChunk>();

    for (const result of [...denseNorm, ...bm25Norm]) {
      const existing = byId.get(result.id);
      const denseScore = result.denseScore ?? existing?.denseScore ?? 0;
      const keywordScore = result.bm25Score ?? existing?.bm25Score ?? 0;
      byId.set(result.id, {
        ...(existing || result),
        denseScore,
        bm25Score: keywordScore,
        score: denseScore * denseWeight + keywordScore * bm25Weight,
        retrievalStrategy: "hybrid",
      });
    }

    return Array.from(byId.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export class HybridRerankRetriever implements Retriever {
  constructor(private readonly hybrid = new HybridRetriever()) {}

  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievedChunk[]> {
    const candidates = await this.hybrid.retrieve(query, {
      ...options,
      topK: Math.max((options.topK || 6) * 2, 10),
    });

    return candidates
      .map((chunk) => {
        const rerankScore = 0.7 * chunk.score + 0.3 * lexicalOverlap(query, chunk.text);
        return {
          ...chunk,
          score: rerankScore,
          rerankScore,
          retrievalStrategy: "hybrid_rerank" as const,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, options.topK || 6);
  }
}

export function createRetriever(strategy?: RetrievalStrategy): Retriever {
  switch (strategy || process.env.RETRIEVAL_STRATEGY || "hybrid") {
    case "dense":
      return new DenseVectorRetriever();
    case "bm25":
      return new BM25Retriever();
    case "hybrid_rerank":
      return new HybridRerankRetriever();
    case "graph_rag":
      return new GraphRagRetriever(new HybridRetriever());
    case "hybrid":
    default:
      return new HybridRetriever();
  }
}
