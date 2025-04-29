import { IPaper } from "../../types";
import mongoose, { Schema, Document } from "mongoose";

const PerformanceMetricSchema = new Schema(
  {
    proposed_method: {
      accuracy: { type: String, default: "unknown" },
      parameters: { type: String, default: "unknown" },
      training_time: { type: String, default: "unknown" },
    },
    previous_sota: {
      accuracy: { type: String, default: "unknown" },
      parameters: { type: String, default: "unknown" },
      training_time: { type: String, default: "unknown" },
    },
    baseline: {
      accuracy: { type: String, default: "unknown" },
      parameters: { type: String, default: "unknown" },
      training_time: { type: String, default: "unknown" },
    },
  },
  { _id: false }
);

const ReferenceSchema = new Schema(
  {
    authors: { type: String, required: true },
    title: { type: String, required: true },
    venue: { type: String },
    year: { type: String },
    doi: { type: String },
  },
  { _id: false }
);

const NoveltyAssessmentSchema = new Schema(
  {
    level: {
      type: String,
      enum: ["Low", "Medium", "High", "Very High"],
      required: true,
    },
    comparison_to_prior_work: { type: String, required: true },
  },
  { _id: false }
);

const ResearchImpactSchema = new Schema(
  {
    significance: { type: String, required: true },
    potential_applications: { type: [String], required: true },
    limitations: { type: String, required: true },
  },
  { _id: false }
);

const KeyFindingsSchema = new Schema(
  {
    primary: { type: String, required: true },
    methodology_innovation: { type: String, required: true },
    practical_applications: { type: [String], required: true },
  },
  { _id: false }
);

const MetadataSchema = new Schema(
  {
    title: { type: String, required: true },
    authors: { type: [String], required: true },
    published_date: { type: String, required: true },
    topics: { type: [String], required: true },
  },
  { _id: false }
);

const PaperSchema = new Schema<IPaper>(
  {
    metadata: { type: MetadataSchema, required: true },
    summary: { type: String, required: true },
    key_findings: { type: KeyFindingsSchema, required: true },
    research_impact: { type: ResearchImpactSchema, required: true },
    novelty_assessment: { type: NoveltyAssessmentSchema, required: true },
    related_areas: { type: [String], required: true },
    performance_metrics: {
      type: PerformanceMetricSchema,
      required: true,
    },
    references: { type: [ReferenceSchema], required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PaperSchema.index({
  "metadata.title": "text",
  "metadata.topics": "text",
  related_areas: "text",
});

PaperSchema.index({ "metadata.published_date": 1 });
PaperSchema.index({ "performance_metrics.proposed_method.accuracy": 1 });


export default mongoose.models.Paper || mongoose.model("Paper", PaperSchema);
