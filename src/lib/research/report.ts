import type { ExperimentConfig } from "./types";

export function generateResearchReport(run: {
  name: string;
  config: ExperimentConfig;
  outputs: Array<{
    retrievalStrategy?: string;
    chunkingStrategy?: string;
    metrics: Record<string, number>;
    query: string;
    retrievedChunkIds: string[];
  }>;
  createdAt?: Date;
}): string {
  const outputs = run.outputs || [];
  const avg = (key: string) =>
    outputs.length
      ? outputs.reduce((sum, item) => sum + Number(item.metrics?.[key] || 0), 0) /
        outputs.length
      : 0;
  const groupedRows = (key: "retrievalStrategy" | "chunkingStrategy") =>
    Array.from(new Set(outputs.map((output) => output[key]).filter(Boolean))).map((name) => {
      const group = outputs.filter((output) => output[key] === name);
      const groupAvg = (metric: string) =>
        group.length
          ? group.reduce((sum, item) => sum + Number(item.metrics?.[metric] || 0), 0) /
            group.length
          : 0;
      return `| ${name} | ${groupAvg("precisionAtK").toFixed(3)} | ${groupAvg("recallAtK").toFixed(3)} | ${groupAvg("faithfulness").toFixed(3)} | ${groupAvg("citationAccuracy").toFixed(3)} | ${Math.round(groupAvg("latencyMs"))} |`;
    });
  const retrievalRows = groupedRows("retrievalStrategy");
  const chunkingRows = groupedRows("chunkingStrategy");

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
    "| Retrieval Strategy | Precision@K | Recall@K | Faithfulness | Citation Accuracy | Latency ms |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...(retrievalRows.length ? retrievalRows : ["| No retrieval rows | 0.000 | 0.000 | 0.000 | 0.000 | 0 |"]),
    "",
    "## 5. Chunking Results",
    "| Chunking Strategy | Precision@K | Recall@K | Faithfulness | Citation Accuracy | Latency ms |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...(chunkingRows.length ? chunkingRows : ["| No chunking rows | 0.000 | 0.000 | 0.000 | 0.000 | 0 |"]),
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
