import { useState, useCallback } from "react";
import { useApi } from "./use-api";

export function useHuggingFace() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendRequest } = useApi();

  const semanticSearch = useCallback(
    async (query: string) => {
      setIsProcessing(true);
      try {
        const response = await sendRequest("/api/search/semantic", "POST", {
          query,
        });
        return response.results;
      } catch (error) {
        console.error("Semantic search failed:", error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [sendRequest]
  );

  const askQuestion = useCallback(
    async (paperId: string, question: string) => {
      setIsProcessing(true);
      try {
        const response = await sendRequest("/api/question", "POST", {
          paperId,
          question,
        });
        return response;
      } catch (error) {
        console.error("Question answering failed:", error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [sendRequest]
  );

  return {
    semanticSearch,
    askQuestion,
    isProcessing,
  };
}
