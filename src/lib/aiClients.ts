import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize clients
export const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const geminiPro = gemini.getGenerativeModel({ model: "gemini-2.0-flash-001" });
