import type { Citation, CitationVerification, Chunk } from "./types";
import { lexicalOverlap, splitSentences } from "./text";

const CITATION_PATTERN = /\[(?<chunkId>[^\]\s]+)(?:\s+p\.\s*(?<page>\d+))?\]/g;

export function extractCitations(answer: string): Citation[] {
  return Array.from(answer.matchAll(CITATION_PATTERN)).map((match) => ({
    chunkId: match.groups?.chunkId || "",
    pageNumber: match.groups?.page ? Number(match.groups.page) : undefined,
  }));
}

export function verifyCitations(answer: string, chunks: Chunk[]): CitationVerification {
  const citations = extractCitations(answer);
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const hallucinatedCitations = citations
    .filter((citation) => !chunkMap.has(citation.chunkId))
    .map((citation) => citation.chunkId);
  const unsupportedClaims: string[] = [];
  const missingCitations: string[] = [];

  for (const sentence of splitSentences(answer)) {
    const sentenceCitations = extractCitations(sentence);
    if (!sentenceCitations.length && sentence.length > 40) {
      missingCitations.push(sentence);
      continue;
    }
    const evidence = sentenceCitations
      .map((citation) => chunkMap.get(citation.chunkId)?.text || "")
      .join(" ");
    if (sentenceCitations.length && lexicalOverlap(evidence, sentence) < 0.25) {
      unsupportedClaims.push(sentence);
    }
  }

  const totalIssues =
    unsupportedClaims.length + missingCitations.length + hallucinatedCitations.length;
  const confidence = Math.max(0, 1 - totalIssues / Math.max(1, splitSentences(answer).length));

  return {
    confidence,
    unsupportedClaims,
    missingCitations,
    hallucinatedCitations,
  };
}

export function formatChunkCitation(chunk: Chunk): string {
  const page = chunk.pageNumber ? ` p. ${chunk.pageNumber}` : "";
  return `[${chunk.id}${page}]`;
}
