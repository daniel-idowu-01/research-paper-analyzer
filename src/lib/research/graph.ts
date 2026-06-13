import type { Chunk, RetrievedChunk, RetrievalOptions, Retriever } from "./types";
import { createRetriever } from "./retrieval";
import { lexicalOverlap } from "./text";

export type GraphEntity = {
  id: string;
  label: string;
  type: "method" | "metric" | "dataset" | "concept";
};

export type GraphRelationship = {
  source: string;
  target: string;
  label: string;
  chunkId: string;
};

export type KnowledgeGraph = {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
};

export function buildKnowledgeGraph(chunks: Chunk[]): KnowledgeGraph {
  const entities = new Map<string, GraphEntity>();
  const relationships: GraphRelationship[] = [];

  chunks.forEach((chunk) => {
    const candidates = Array.from(
      chunk.text.matchAll(/\b([A-Z][A-Za-z0-9-]*(?:\s+[A-Z][A-Za-z0-9-]*){0,3})\b/g)
    )
      .map((match) => match[1].trim())
      .filter((value) => value.length > 3)
      .slice(0, 8);

    candidates.forEach((label) => {
      const id = label.toLowerCase().replace(/\s+/g, "-");
      if (!entities.has(id)) {
        entities.set(id, { id, label, type: inferEntityType(label) });
      }
    });

    for (let i = 0; i < candidates.length - 1; i++) {
      relationships.push({
        source: candidates[i].toLowerCase().replace(/\s+/g, "-"),
        target: candidates[i + 1].toLowerCase().replace(/\s+/g, "-"),
        label: "co_occurs_with",
        chunkId: chunk.id,
      });
    }
  });

  return { entities: Array.from(entities.values()), relationships };
}

function inferEntityType(label: string): GraphEntity["type"] {
  if (/accuracy|precision|recall|f1|auc|latency/i.test(label)) return "metric";
  if (/dataset|corpus|benchmark/i.test(label)) return "dataset";
  if (/model|network|algorithm|method/i.test(label)) return "method";
  return "concept";
}

export class GraphRagRetriever implements Retriever {
  constructor(private readonly vectorRetriever = createRetriever("hybrid")) {}

  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievedChunk[]> {
    const chunks = options.chunks || [];
    const graph = buildKnowledgeGraph(chunks);
    const matchingEntityIds = graph.entities
      .filter((entity) => lexicalOverlap(query, entity.label) > 0)
      .map((entity) => entity.id);
    const graphChunkIds = new Set(
      graph.relationships
        .filter(
          (edge) =>
            matchingEntityIds.includes(edge.source) || matchingEntityIds.includes(edge.target)
        )
        .map((edge) => edge.chunkId)
    );
    const vector = await this.vectorRetriever.retrieve(query, options);

    return vector
      .map((chunk) => ({
        ...chunk,
        score: chunk.score + (graphChunkIds.has(chunk.id) ? 0.2 : 0),
        retrievalStrategy: "graph_rag" as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, options.topK || 6);
  }
}
