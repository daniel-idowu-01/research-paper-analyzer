import mongoose, { Schema } from "mongoose";

const MetricSchema = new Schema(
  {
    precisionAtK: { type: Number, default: 0 },
    recallAtK: { type: Number, default: 0 },
    meanReciprocalRank: { type: Number, default: 0 },
    contextRelevance: { type: Number, default: 0 },
    answerRelevance: { type: Number, default: 0 },
    faithfulness: { type: Number, default: 0 },
    citationAccuracy: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  { _id: false }
);

const ExperimentOutputSchema = new Schema(
  {
    documentId: { type: String, required: true },
    retrievalStrategy: { type: String, default: "unknown" },
    chunkingStrategy: { type: String, default: "unknown" },
    query: { type: String, required: true },
    answer: { type: String, default: "" },
    retrievedChunkIds: { type: [String], default: [] },
    citationVerification: {
      confidence: { type: Number, default: 0 },
      unsupportedClaims: { type: [String], default: [] },
      missingCitations: { type: [String], default: [] },
      hallucinatedCitations: { type: [String], default: [] },
    },
    metrics: { type: MetricSchema, required: true },
  },
  { _id: false }
);

const ExperimentRunSchema = new Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    config: { type: Schema.Types.Mixed, required: true },
    outputs: { type: [ExperimentOutputSchema], default: [] },
    startedAt: { type: Date },
    completedAt: { type: Date },
    error: { type: String },
  },
  { timestamps: true }
);

ExperimentRunSchema.index({ createdAt: -1 });
ExperimentRunSchema.index({ "config.retrievalStrategies": 1 });
ExperimentRunSchema.index({ "config.chunkingStrategies": 1 });

export default mongoose.models.ExperimentRun ||
  mongoose.model("ExperimentRun", ExperimentRunSchema);
