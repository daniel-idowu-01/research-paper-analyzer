import { Document, Model, Schema, Types } from "mongoose";

interface INotificationSettings {
  paperAnalysis: boolean;
  similarPapers: boolean;
  newFeatures: boolean;
  marketing: boolean;
  email: boolean;
  browser: boolean;
}

type CitationFormat = "apa" | "mla" | "chicago" | "harvard" | "ieee";

interface IPreferences {
  autoAnalyze: boolean;
  findSimilar: boolean;
  citationFormat: CitationFormat;
  dataCollection: boolean;
  storeHistory: boolean;
}

type Theme = "light" | "dark" | "system";
type Language = "en" | "es" | "fr" | "de" | "zh";

interface IAppearanceSettings {
  theme: Theme;
  language: Language;
}

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: boolean;
  lastVerificationEmailSent: Date | null;
  bio: string | null;
  institution?: string;
  position?: string;
  website?: string;
  researchInterests: string[];
  role: "user" | "admin";
  password: string;
  settings: {
    notifications: INotificationSettings;
    preferences: IPreferences;
    appearance: IAppearanceSettings;
  };
  accountType: "Regular" | "Premuim";
  createdAt: string;
  updatedAt: string;
  id: string;
}
