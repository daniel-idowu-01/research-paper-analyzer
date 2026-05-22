import { Pinecone } from "@pinecone-database/pinecone";
import logger from "@/lib/logger";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY?.trim();
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT?.trim();
const PINECONE_CONTROLLER_HOST = process.env.PINECONE_CONTROLLER_HOST?.trim();
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME?.trim();
const EMBEDDING_MODEL =
  process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2";
const CHUNK_SIZE = parseInt(process.env.PINECONE_CHUNK_SIZE || "900", 10);
const CHUNK_OVERLAP = parseInt(process.env.PINECONE_CHUNK_OVERLAP || "150", 10);
const TOPIC_CLUSTER_COUNT = parseInt(process.env.TOPIC_CLUSTER_COUNT || "3", 10);

let pineconeClient: Pinecone | null = null;
let pineconeIndex: any = null;

export type TopicCluster = {
  label: string;
  topics: string[];
};

export function isPineconeConfigured(): boolean {
  return Boolean(PINECONE_API_KEY && PINECONE_ENVIRONMENT && PINECONE_INDEX_NAME);
}

async function getPineconeIndex(): Promise<any | null> {
  if (!isPineconeConfigured()) return null;
  if (pineconeIndex) return pineconeIndex;
  if (!pineconeClient) {
    const config: { apiKey: string; controllerHostUrl?: string } = {
      apiKey: PINECONE_API_KEY!,
    };

    if (PINECONE_CONTROLLER_HOST) {
      config.controllerHostUrl = PINECONE_CONTROLLER_HOST;
    } else if (PINECONE_ENVIRONMENT) {
      config.controllerHostUrl = `https://controller.${PINECONE_ENVIRONMENT}.pinecone.io`;
    }

    pineconeClient = new Pinecone(config);
  }
  pineconeIndex = pineconeClient.index({ name: PINECONE_INDEX_NAME! });
  return pineconeIndex;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function createEmbedding(text: string): Promise<number[]> {
  const token = process.env.HUGGINGFACE_TOKEN?.trim();
  if (!token) {
    throw new Error("Missing HUGGINGFACE_TOKEN for embedding generation");
  }

  const content = normalizeText(text);
  if (!content) {
    throw new Error("Cannot embed empty text");
  }

  const response = await fetch("https://api-inference.huggingface.co/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: content }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding API returned ${response.status}: ${body}`);
  }

  const json = await response.json();
  const data = (json as any)?.data || json;
  if (!data) {
    throw new Error("Embedding API returned no data");
  }

  if (Array.isArray(data)) {
    const first = data[0];
    if (Array.isArray(first?.embedding)) {
      return first.embedding;
    }
    if (Array.isArray(first)) {
      return first as number[];
    }
  }

  if (Array.isArray(json as any)) {
    return json as any;
  }

  throw new Error("Unexpected embedding response format");
}

export function chunkText(text: string, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const normalized = normalizeText(text);
  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + size, normalized.length);
    const chunk = normalized.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    if (end === normalized.length) break;
    start += size - overlap;
  }

  return chunks;
}

export async function indexPaperToPinecone(
  paperId: string,
  title: string,
  rawText: string
): Promise<void> {
  const index = await getPineconeIndex();
  if (!index) {
    logger.warn("Pinecone is not configured, skipping semantic indexing");
    return;
  }

  const chunks = chunkText(rawText, CHUNK_SIZE, CHUNK_OVERLAP).slice(0, 18);
  if (!chunks.length) {
    logger.warn("No text chunks created for Pinecone indexing", { paperId });
    return;
  }

  const vectors = await Promise.all(
    chunks.map(async (chunk, chunkIndex) => ({
      id: `${paperId}-${chunkIndex}`,
      values: await createEmbedding(chunk),
      metadata: {
        paperId,
        title,
        chunkIndex,
        excerpt: chunk.slice(0, 512),
      },
    }))
  );

  try {
    await index.upsert({ upsertRequest: { vectors } });
    logger.info("Indexed paper chunks in Pinecone", {
      paperId,
      chunkCount: chunks.length,
    });
  } catch (error: unknown) {
    logger.error("Pinecone upsert failed", {
      paperId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export type SemanticMatch = {
  snippet: string;
  score: number;
  index: number;
};

export async function semanticSearchPaper(
  paperId: string,
  query: string,
  topK: number = 6
): Promise<SemanticMatch[]> {
  const index = await getPineconeIndex();
  if (!index) {
    return [];
  }

  const queryEmbedding = await createEmbedding(query);
  const response = await index.query({
    queryRequest: {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: { paperId },
    },
  });

  const matches = (response as any)?.matches || (response as any)?.results || [];
  if (!Array.isArray(matches)) {
    return [];
  }

  return matches
    .map((match: any, idx: number) => {
      const metadata = match.metadata || {};
      const snippet = String(metadata.excerpt || metadata.text || "").slice(0, 460);
      return {
        snippet,
        score: typeof match.score === "number" ? match.score : Number(match?.score || 0),
        index: Number(metadata.chunkIndex ?? idx),
      };
    })
    .filter((match: SemanticMatch) => match.snippet.length > 0);
}

const STOPWORDS = new Set([
  "about",
  "above",
  "after",
  "again",
  "against",
  "among",
  "around",
  "because",
  "before",
  "being",
  "below",
  "between",
  "both",
  "could",
  "doing",
  "during",
  "each",
  "few",
  "from",
  "further",
  "have",
  "having",
  "hers",
  "him",
  "himself",
  "his",
  "into",
  "its",
  "itself",
  "more",
  "most",
  "other",
  "over",
  "such",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "under",
  "until",
  "very",
  "what",
  "when",
  "where",
  "which",
  "while",
  "would",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

function extractTopicCandidates(text: string): string[] {
  const cleaned = normalizeText(text.toLowerCase()).replace(/[^a-z0-9\s]/g, " ");
  const words = cleaned.split(/\s+/).filter(
    (token) => token.length > 4 && !STOPWORDS.has(token)
  );

  const frequency = new Map<string, number>();
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    frequency.set(word, (frequency.get(word) || 0) + 1);
    if (i + 1 < words.length) {
      const bigram = `${word} ${words[i + 1]}`;
      frequency.set(bigram, (frequency.get(bigram) || 0) + 1);
    }
  }

  const sorted = Array.from(frequency.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .filter((token, index, array) => {
      return !array.some((other, oi) => oi < index && other.includes(token) && other !== token);
    })
    .slice(0, 14);

  return sorted;
}

function computeCentroid(vectors: number[][]): number[] {
  const length = vectors[0].length;
  const centroid = new Array<number>(length).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < length; i++) {
      centroid[i] += vector[i];
    }
  }
  for (let i = 0; i < length; i++) {
    centroid[i] /= vectors.length;
  }
  return centroid;
}

function assignClusters(
  candidateEmbeddings: number[][],
  centroids: number[][]
): number[] {
  return candidateEmbeddings.map((embedding) => {
    let best = 0;
    let bestScore = -Infinity;
    centroids.forEach((centroid, index) => {
      const score = cosineSimilarity(embedding, centroid);
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    });
    return best;
  });
}

function kMeansCluster(
  candidateEmbeddings: number[][],
  candidateTopics: string[],
  k: number
): number[] {
  const centroids = candidateEmbeddings.slice(0, k).map((value) => [...value]);
  let assignments = new Array(candidateEmbeddings.length).fill(0);

  for (let iteration = 0; iteration < 8; iteration++) {
    assignments = assignClusters(candidateEmbeddings, centroids);
    const nextCentroids = Array.from({ length: k }, () => [] as number[][]);
    assignments.forEach((clusterIndex, idx) => {
      nextCentroids[clusterIndex].push(candidateEmbeddings[idx]);
    });
    let changed = false;
    for (let clusterIndex = 0; clusterIndex < k; clusterIndex++) {
      if (nextCentroids[clusterIndex].length === 0) continue;
      const centroid = computeCentroid(nextCentroids[clusterIndex]);
      if (cosineSimilarity(centroid, centroids[clusterIndex]) < 0.9999) {
        centroids[clusterIndex] = centroid;
        changed = true;
      }
    }
    if (!changed) break;
  }

  return assignments;
}

export async function generateTopicClusters(
  text: string,
  fallbackTopics: string[] = []
): Promise<TopicCluster[]> {
  const candidates = fallbackTopics.length
    ? [...new Set(fallbackTopics)]
    : extractTopicCandidates(text);

  if (candidates.length === 0) {
    return [];
  }

  const topics = candidates.slice(0, 12);

  try {
    const embeddings = await Promise.all(
      topics.map(async (topic) => ({
        topic,
        embedding: await createEmbedding(topic),
      }))
    );

    const clusterCount = Math.min(TOPIC_CLUSTER_COUNT, topics.length);
    const assignment = kMeansCluster(
      embeddings.map((item) => item.embedding),
      topics,
      clusterCount
    );

    const buckets: Record<number, string[]> = {};
    assignment.forEach((clusterIndex, idx) => {
      buckets[clusterIndex] = buckets[clusterIndex] || [];
      buckets[clusterIndex].push(topics[idx]);
    });

    return Object.values(buckets).map((group, idx) => ({
      label: group[0] || `Cluster ${idx + 1}`,
      topics: group,
    }));
  } catch (error: unknown) {
    logger.warn("Topic clustering degraded to lexical grouping", {
      error: error instanceof Error ? error.message : String(error),
    });
    return topics.slice(0, 3).map((topic) => ({ label: topic, topics: [topic] }));
  }
}
