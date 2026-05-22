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

interface ITopicCluster {
  label: string;
  topics: string[];
}

interface IAnalysisQuality {
  mode: "grounded_ai" | "fallback_extraction";
  confidence: "high" | "medium" | "low";
  extracted_characters: number;
  source_sections: string[];
  warnings: string[];
}

export interface IPaper extends Document {
  file_url: string;
  /** Populated on new uploads; used server-side for search. */
  extracted_text?: string;
  metadata: IMetadata;
  summary: string;
  key_findings: IKeyFindings;
  research_impact: IResearchImpact;
  novelty_assessment: INoveltyAssessment;
  related_areas: string[];
  topic_clusters?: ITopicCluster[];
  performance_metrics: IPerformanceMetrics;
  references: IReference[];
  analysis_quality?: IAnalysisQuality;
  status: "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  uploaderId?: mongoose.Types.ObjectId;
}
