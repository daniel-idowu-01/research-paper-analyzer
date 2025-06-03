import { Document } from "mongoose";

interface IPerformanceMetrics {
  proposed_method: {
    accuracy: string;
    parameters: string;
    training_time: string;
  };
  previous_sota: {
    accuracy: string;
    parameters: string;
    training_time: string;
  };
  baseline: {
    accuracy: string;
    parameters: string;
    training_time: string;
  };
}

interface IReference {
  authors: string;
  title: string;
  venue?: string;
  year?: string;
  doi?: string | null;
}

interface IKeyFindings {
  primary: string;
  methodology: string;
  applications: string;
}

interface INoveltyAssessment {
  level: "Low" | "Medium" | "High" | "Very High";
  comparison_to_prior_work: string;
}

interface IResearchImpact {
  significance: string;
  level: "Low" | "Medium" | "High" | "Very High";
  limitations: string;
}

interface IKeyFindings {
  primary: string;
  methodology_innovation: string;
  practical_applications: string[];
}

interface IMetadata {
  title: string;
  authors: string[];
  published_date: string;
  topics: string[];
}

interface IAIAnalysis {
  summary?: string | null;
  topics?: Array<{ topic: string }>;
  embeddings?: number[] | null;
  keyPhrases?: string[];
  sentiment?: string | null;
  processedAt?: string;
}

export interface IPaper extends Document {
  file_url: string;
  metadata: IMetadata;
  summary: string;
  key_findings: IKeyFindings;
  research_impact: IResearchImpact;
  novelty_assessment: INoveltyAssessment;
  related_areas: string[];
  performance_metrics: IPerformanceMetrics;
  references: IReference[];
  status: "processing" | "completed" | "failed";
  aiAnalysis?: IAIAnalysis;
  createdAt: Date;
  updatedAt: Date;
  uploaderId?: mongoose.Types.ObjectId;
}
