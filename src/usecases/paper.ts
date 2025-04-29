import mongoose from "mongoose";
import Paper from "@/models/Paper";

export async function createPaper(
  result: any,
  fileUrl: string,
  userId: string | null
) {
  const uploaderId = userId ? new mongoose.Types.ObjectId(userId) : undefined;

  const paper = new Paper({
    file_url: fileUrl,
    uploaderId,
    metadata: {
      title: result.metadata.title,
      authors: result.metadata.authors,
      published_date: result.metadata.published_date,
      topics: result.metadata.topics,
    },
    summary: result.summary,
    key_findings: {
      primary: result.key_findings.primary,
      methodology_innovation: result.key_findings.methodology_innovation,
      practical_applications: result.key_findings.practical_applications,
    },
    research_impact: {
      significance: result.research_impact.significance,
      level: result.research_impact.level,
      limitations: result.research_impact.limitations,
    },
    novelty_assessment: {
      level: result.novelty_assessment.level,
      comparison_to_prior_work:
        result.novelty_assessment.comparison_to_prior_work,
    },
    related_areas: result.related_areas,
    performance_metrics: {
      proposed_method: {
        accuracy:
          result.performance_metrics.proposed_method.accuracy || "unknown",
        parameters:
          result.performance_metrics.proposed_method.parameters || "unknown",
        training_time:
          result.performance_metrics.proposed_method.training_time || "unknown",
      },
      previous_sota: {
        accuracy:
          result.performance_metrics.previous_sota.accuracy || "unknown",
        parameters:
          result.performance_metrics.previous_sota.parameters || "unknown",
        training_time:
          result.performance_metrics.previous_sota.training_time || "unknown",
      },
      baseline: {
        accuracy: result.performance_metrics.baseline.accuracy || "unknown",
        parameters: result.performance_metrics.baseline.parameters || "unknown",
        training_time:
          result.performance_metrics.baseline.training_time || "unknown",
      },
    },
    // references: result.references.map((ref: any) => ({
    //   authors: ref.authors,
    //   title: ref.title,
    //   venue: ref.venue,
    //   year: ref.year,
    //   doi: ref.doi || null,
    // })),
    status: "completed",
  });

  await paper.save();
  return paper;
}
