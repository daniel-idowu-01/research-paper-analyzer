import mongoose from "mongoose";
import Paper from "@/models/Paper";
import {
  EMPTY_PERFORMANCE_METRICS,
  normalizeList,
  normalizeText,
} from "@/lib/paper";

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
      title: normalizeText(result?.metadata?.title, "Untitled Research Paper"),
      authors: normalizeList(result?.metadata?.authors),
      published_date: normalizeText(result?.metadata?.published_date, "Unknown"),
      topics: normalizeList(result?.metadata?.topics),
    },
    summary: normalizeText(result?.summary),
    key_findings: {
      primary: normalizeText(result?.key_findings?.primary),
      methodology_innovation: normalizeText(
        result?.key_findings?.methodology_innovation
      ),
      practical_applications: normalizeList(
        result?.key_findings?.practical_applications
      ),
    },
    research_impact: {
      significance: normalizeText(result?.research_impact?.significance),
      level: result?.research_impact?.level || "Medium",
      limitations: normalizeText(result?.research_impact?.limitations),
    },
    novelty_assessment: {
      level: result?.novelty_assessment?.level || "Medium",
      comparison_to_prior_work: normalizeText(
        result?.novelty_assessment?.comparison_to_prior_work
      ),
    },
    related_areas: normalizeList(result?.related_areas),
    performance_metrics: {
      proposed_method: {
        accuracy:
          result?.performance_metrics?.proposed_method?.accuracy ||
          EMPTY_PERFORMANCE_METRICS.proposed_method.accuracy,
        parameters:
          result?.performance_metrics?.proposed_method?.parameters ||
          EMPTY_PERFORMANCE_METRICS.proposed_method.parameters,
        training_time:
          result?.performance_metrics?.proposed_method?.training_time ||
          EMPTY_PERFORMANCE_METRICS.proposed_method.training_time,
      },
      previous_sota: {
        accuracy:
          result?.performance_metrics?.previous_sota?.accuracy ||
          EMPTY_PERFORMANCE_METRICS.previous_sota.accuracy,
        parameters:
          result?.performance_metrics?.previous_sota?.parameters ||
          EMPTY_PERFORMANCE_METRICS.previous_sota.parameters,
        training_time:
          result?.performance_metrics?.previous_sota?.training_time ||
          EMPTY_PERFORMANCE_METRICS.previous_sota.training_time,
      },
      baseline: {
        accuracy:
          result?.performance_metrics?.baseline?.accuracy ||
          EMPTY_PERFORMANCE_METRICS.baseline.accuracy,
        parameters:
          result?.performance_metrics?.baseline?.parameters ||
          EMPTY_PERFORMANCE_METRICS.baseline.parameters,
        training_time:
          result?.performance_metrics?.baseline?.training_time ||
          EMPTY_PERFORMANCE_METRICS.baseline.training_time,
      },
    },
    references: Array.isArray(result?.references) ? result.references : [],
    status: "completed",
  });

  await paper.save();
  return paper;
}
