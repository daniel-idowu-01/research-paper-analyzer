export type PaperSearchMatch = {
  snippet: string;
  index: number;
};

const DEFAULT_CONTEXT = 140;
const DEFAULT_MAX = 25;

/**
 * Case-insensitive substring search with non-overlapping windows and ellipsis context.
 */
export function findMatchesInText(
  haystack: string,
  query: string,
  options?: { contextChars?: number; maxMatches?: number }
): PaperSearchMatch[] {
  const q = query.trim();
  if (q.length < 2 || !haystack) return [];

  const contextChars = options?.contextChars ?? DEFAULT_CONTEXT;
  const maxMatches = options?.maxMatches ?? DEFAULT_MAX;
  const lowerHay = haystack.toLowerCase();
  const lowerQ = q.toLowerCase();
  const matches: PaperSearchMatch[] = [];
  let pos = 0;

  while (matches.length < maxMatches) {
    const idx = lowerHay.indexOf(lowerQ, pos);
    if (idx === -1) break;

    const start = Math.max(0, idx - contextChars);
    const end = Math.min(haystack.length, idx + q.length + contextChars);
    const raw = haystack.slice(start, end).replace(/\s+/g, " ").trim();
    const snippet =
      (start > 0 ? "…" : "") + raw + (end < haystack.length ? "…" : "");

    matches.push({ snippet, index: idx });
    pos = idx + Math.max(1, q.length);
  }

  return matches;
}

export function buildAnalysisCorpus(paper: {
  metadata?: { title?: string; authors?: string[] };
  summary?: string;
  key_findings?: {
    primary?: string;
    methodology_innovation?: string;
    practical_applications?: string[];
  };
  research_impact?: { significance?: string; limitations?: string };
  novelty_assessment?: { comparison_to_prior_work?: string };
  related_areas?: string[];
}): string {
  const parts: string[] = [];
  if (paper.metadata?.title) parts.push(paper.metadata.title);
  if (Array.isArray(paper.metadata?.authors)) {
    parts.push(paper.metadata.authors.join(", "));
  }
  if (paper.summary) parts.push(paper.summary);
  if (paper.key_findings?.primary) parts.push(paper.key_findings.primary);
  if (paper.key_findings?.methodology_innovation) {
    parts.push(paper.key_findings.methodology_innovation);
  }
  if (Array.isArray(paper.key_findings?.practical_applications)) {
    parts.push(...paper.key_findings.practical_applications);
  }
  if (paper.research_impact?.significance) {
    parts.push(paper.research_impact.significance);
  }
  if (paper.research_impact?.limitations) {
    parts.push(paper.research_impact.limitations);
  }
  if (paper.novelty_assessment?.comparison_to_prior_work) {
    parts.push(paper.novelty_assessment.comparison_to_prior_work);
  }
  if (Array.isArray(paper.related_areas)) {
    parts.push(...paper.related_areas);
  }
  return parts.filter(Boolean).join("\n\n");
}
