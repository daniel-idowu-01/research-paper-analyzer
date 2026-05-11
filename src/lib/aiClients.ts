import { InferenceClient } from "@huggingface/inference";

/**
 * Builds an HF Inference client using the current process env.
 * Returns null when no token is configured (callers should degrade gracefully).
 */
export function createHfInferenceClient(): InferenceClient | null {
  const token = process.env.HUGGINGFACE_TOKEN?.trim();
  if (!token) return null;
  return new InferenceClient(token);
}
