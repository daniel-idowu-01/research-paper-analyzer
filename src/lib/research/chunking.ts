import type { Chunk, ChunkingStrategy, ParsedDocument } from "./types";
import { countTokens, normalizeWhitespace, splitSentences, tokenize } from "./text";

type ChunkerConfig = {
  chunkSize?: number;
  overlap?: number;
};

function makeChunk(
  document: ParsedDocument,
  text: string,
  index: number,
  metadata: Partial<Chunk> = {}
): Chunk {
  return {
    id: `${document.id}:chunk:${index}`,
    text: normalizeWhitespace(text),
    pageNumber: metadata.pageNumber,
    sectionTitle: metadata.sectionTitle,
    tokenCount: countTokens(text),
    sourceDocument: document.id,
    metadata: {
      source: document.source,
      title: document.title,
      ...(metadata.metadata || {}),
    },
  };
}

export class FixedSizeChunkingStrategy implements ChunkingStrategy {
  constructor(private readonly config: ChunkerConfig = {}) {}

  chunk(document: ParsedDocument): Chunk[] {
    const words = normalizeWhitespace(document.text).split(/\s+/);
    const size = this.config.chunkSize || 220;
    const chunks: Chunk[] = [];
    for (let i = 0; i < words.length; i += size) {
      chunks.push(makeChunk(document, words.slice(i, i + size).join(" "), chunks.length));
    }
    return chunks;
  }
}

export class SlidingWindowChunkingStrategy implements ChunkingStrategy {
  constructor(private readonly config: ChunkerConfig = {}) {}

  chunk(document: ParsedDocument): Chunk[] {
    const words = normalizeWhitespace(document.text).split(/\s+/);
    const size = this.config.chunkSize || 260;
    const overlap = Math.min(this.config.overlap || 60, size - 1);
    const step = size - overlap;
    const chunks: Chunk[] = [];
    for (let i = 0; i < words.length; i += step) {
      chunks.push(makeChunk(document, words.slice(i, i + size).join(" "), chunks.length));
      if (i + size >= words.length) break;
    }
    return chunks;
  }
}

export class SemanticChunkingStrategy implements ChunkingStrategy {
  constructor(private readonly config: ChunkerConfig = {}) {}

  chunk(document: ParsedDocument): Chunk[] {
    const target = this.config.chunkSize || 240;
    const chunks: Chunk[] = [];
    let buffer: string[] = [];
    let tokenTotal = 0;

    for (const sentence of splitSentences(document.text)) {
      const sentenceTokens = tokenize(sentence).length;
      const shouldBreak =
        tokenTotal >= target ||
        (buffer.length > 0 && sentenceTokens > 0 && tokenTotal + sentenceTokens > target * 1.35);
      if (shouldBreak) {
        chunks.push(makeChunk(document, buffer.join(" "), chunks.length));
        buffer = [];
        tokenTotal = 0;
      }
      buffer.push(sentence);
      tokenTotal += sentenceTokens;
    }

    if (buffer.length) {
      chunks.push(makeChunk(document, buffer.join(" "), chunks.length));
    }

    return chunks;
  }
}

export class SectionAwareChunkingStrategy implements ChunkingStrategy {
  constructor(private readonly config: ChunkerConfig = {}) {}

  chunk(document: ParsedDocument): Chunk[] {
    const sections = document.sections?.length
      ? document.sections
      : [{ title: "Full text", text: document.text }];
    const fixed = new FixedSizeChunkingStrategy({
      chunkSize: this.config.chunkSize || 260,
    });
    const chunks: Chunk[] = [];

    for (const section of sections) {
      const sectionDoc: ParsedDocument = {
        ...document,
        text: section.text,
      };
      for (const chunk of fixed.chunk(sectionDoc)) {
        chunks.push({
          ...chunk,
          id: `${document.id}:chunk:${chunks.length}`,
          sectionTitle: section.title,
          pageNumber: section.pageNumber,
        });
      }
    }

    return chunks;
  }
}

export function createChunkingStrategy(
  name: string,
  config?: ChunkerConfig
): ChunkingStrategy {
  switch (name) {
    case "sliding_window":
      return new SlidingWindowChunkingStrategy(config);
    case "semantic":
      return new SemanticChunkingStrategy(config);
    case "section_aware":
      return new SectionAwareChunkingStrategy(config);
    case "fixed":
    default:
      return new FixedSizeChunkingStrategy(config);
  }
}

export function parseDocumentFromPaper(paper: {
  _id?: unknown;
  id?: string;
  extracted_text?: string;
  file_url?: string;
  metadata?: { title?: string };
  analysis_quality?: { source_sections?: string[] };
}): ParsedDocument {
  const id = String(paper._id || paper.id || "paper");
  const text = paper.extracted_text || "";
  const sections = inferSections(text);
  return {
    id,
    title: paper.metadata?.title || "Untitled Research Paper",
    source: paper.file_url || id,
    text,
    sections,
  };
}

export function inferSections(text: string): ParsedDocument["sections"] {
  const lines = text.split(/\n/);
  const sections: NonNullable<ParsedDocument["sections"]> = [];
  let current = { title: "Header", text: "" };
  const heading = /^(abstract|introduction|background|related work|methods?|methodology|results?|discussion|conclusions?|references)\b/i;

  for (const line of lines) {
    const clean = line.trim();
    if (clean.length <= 80 && heading.test(clean)) {
      if (current.text.trim()) sections.push(current);
      current = { title: clean.replace(/\s+/g, " "), text: "" };
    } else {
      current.text += `${line}\n`;
    }
  }

  if (current.text.trim()) sections.push(current);
  return sections;
}
