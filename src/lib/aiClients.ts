import { InferenceClient } from "@huggingface/inference";

// Initialize Hugging Face inference client
export const hf = new InferenceClient(process.env.HUGGINGFACE_TOKEN || "");