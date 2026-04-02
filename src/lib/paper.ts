export const EMPTY_PERFORMANCE_METRICS = {
  proposed_method: {
    accuracy: "unknown",
    parameters: "unknown",
    training_time: "unknown",
  },
  previous_sota: {
    accuracy: "unknown",
    parameters: "unknown",
    training_time: "unknown",
  },
  baseline: {
    accuracy: "unknown",
    parameters: "unknown",
    training_time: "unknown",
  },
} as const;

export function normalizeList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

export function normalizeText(
  value: unknown,
  fallback = "Not available"
) {
  const text = String(value || "").trim();
  return text || fallback;
}
