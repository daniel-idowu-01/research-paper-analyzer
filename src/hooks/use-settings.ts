import { useState } from "react";
import { useApi } from "./use-api";

export function useSettings() {
  const { sendRequest } = useApi();
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      paperAnalysis: true,
      similarPapers: true,
      newFeatures: false,
      marketing: false,
      email: true,
      browser: true,
    },
    preferences: {
      autoAnalyze: true,
      findSimilar: true,
      citationFormat: "apa",
      dataCollection: true,
      storeHistory: true,
    },
    appearance: {
      theme: "system",
      language: "en",
    },
  });

  const updateSettings = async (settingsType: string, data: any) => {
    setIsUpdating(true);
    try {
      const response = await sendRequest("/api/users/settings", "PUT", {
        settingsType,
        data,
      });

      if (!response.message) {
        throw new Error("Failed to update settings");
      }

      setSettings((prev) => ({ ...prev, [settingsType]: data }));
    } catch (error) {
      console.log("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await sendRequest("/api/users/settings");

      if (!response.settings) {
        throw new Error("Failed to fetch settings");
      }

      setSettings(response.settings || settings);

      return response.settings
    } catch (error) {
      console.log("Fetch error:", error);
      throw error;
    }
  };

  return { updateSettings, isUpdating, fetchSettings, settings };
}
