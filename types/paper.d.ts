interface ResearchPaper {
  metadata: {
    title: string;
    authors: string[];
    published_date: string;
    keywords: string[];
  };
  summary: string;
  key_findings: {
    primary: string;
    methodology_innovation: string;
    practical_applications: string[];
  };
  research_impact: {
    novelty_assessment: "Low" | "Medium" | "High" | "Very High";
    significance: string;
  };
  related_areas: string[];
  performance_comparison: {
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
  };
}
