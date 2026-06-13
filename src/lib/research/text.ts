const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "are",
  "was",
  "were",
  "into",
  "paper",
  "research",
]);

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function tokenize(text: string): string[] {
  return normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

export function countTokens(text: string): number {
  return tokenize(text).length;
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

export function lexicalOverlap(a: string, b: string): number {
  const left = new Set(tokenize(a));
  const right = tokenize(b);
  if (!left.size || !right.length) return 0;
  const hits = right.filter((token) => left.has(token)).length;
  return hits / Math.max(1, right.length);
}
