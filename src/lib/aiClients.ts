import { InferenceClient } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function createHfInferenceClient(): InferenceClient | null {
  const token = process.env.HUGGINGFACE_TOKEN?.trim();
  if (!token) return null;
  return new InferenceClient(token);
}

export function createGeminiClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}
