import type { ExperimentConfig } from "./types";

export function generateResearchReport(run: {
  name: string;
  config: ExperimentConfig;
  outputs: Array<{ metrics: Record<string, number>; query: string; retrievedChunkIds: string[] }>;
  createdAt?: Date;
}): string {
  const outputs = run.outputs || [];
  const avg = (key: string) =>
    outputs.length
      ? outputs.reduce((sum, item) => sum + Number(item.metrics?.[key] || 0), 0) /
        outputs.length
      : 0;

  return [
    `# ${run.name}`,
    "",
    "## 1. Problem Statement",
    "This report evaluates retrieval, chunking, grounding, and performance tradeoffs for research-paper RAG workflows.",
    "",
    "## 2. Experimental Setup",
    `- Documents: ${run.config.documentIds.length}`,
    `- Retrieval strategies: ${run.config.retrievalStrategies.join(", ")}`,
    `- Chunking strategies: ${run.config.chunkingStrategies.join(", ")}`,
    `- Model: ${run.config.model || "not specified"}`,
    "",
    "## 3. Methodology",
    "Each configured chunking strategy is paired with each retrieval strategy. Runs store configuration, retrieved chunk ids, generated context outputs, metrics, and timestamps in MongoDB.",
    "",
    "## 4. Retrieval Results",
    `- Precision@K: ${avg("precisionAtK").toFixed(3)}`,
    `- Recall@K: ${avg("recallAtK").toFixed(3)}`,
    `- MRR: ${avg("meanReciprocalRank").toFixed(3)}`,
    "",
    "## 5. Chunking Results",
    "Compare chunking strategies by filtering experiment outputs in the dashboard or exported run JSON.",
    "",
    "## 6. GraphRAG Results",
    "GraphRAG is optional and can be compared as a retrieval strategy when entity and relationship extraction are enabled.",
    "",
    "## 7. Discussion",
    `Average faithfulness was ${avg("faithfulness").toFixed(3)} and average citation accuracy was ${avg("citationAccuracy").toFixed(3)}.`,
    "",
    "## 8. Limitations",
    "Ground-truth labels are required for rigorous precision and recall. Local relevance metrics are lexical proxies until evaluator-model judging is configured.",
  ].join("\n");
}
