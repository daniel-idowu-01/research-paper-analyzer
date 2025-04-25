import mongoose from "mongoose";

const PaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authors: {
      type: [String],
      trim: true,
    },
    abstract: {
      type: String,
      default: "",
      trim: true,
    },
    publicationDate: {
      type: Date,
    },
    topics: {
      type: [String],
      required: true,
    },
    summary: {
      keyInsights: {
        type: String,
        required: true,
      },
      methodology: {
        type: String,
        required: true,
      },
      performanceComparison: {
        type: mongoose.Schema.Types.Mixed, // Stores tables/objects flexibly
        required: false,
      },
      practicalApplications: {
        type: String,
        required: false,
      },
    },
    aiAnalysis: {
      generatedSummary: {
        type: String,
        required: false,
      },
      researchImpact: {
        type: String,
        enum: ["Low", "Medium", "High", "Very High"],
        required: false,
      },
      noveltyAssessment: {
        type: String,
        enum: ["Low", "Medium", "Medium-High", "High"],
        required: false,
      },
    },
    relatedResearchAreas: {
      type: [String],
      required: false,
    },
    suggestedFollowUpPapers: {
      type: [String],
      required: false,
    },
    journalOrConference: {
      type: String,
      trim: true,
    },
    fieldOfStudy: {
      type: String, // "AI", "Cybersecurity", "Physics"
      trim: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    fileUrl: {
      type: String, // URL to the uploaded PDF or storage location
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    namedEntities: [
      {
        type: {
          entity: String,
          type: String, // "Person", "Organization", "Location"
        },
      },
    ],
    citations: [
      {
        type: {
          title: String,
          authors: [String],
          publicationYear: Number,
        },
      },
    ],
    topicClassification: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Paper || mongoose.model("Paper", PaperSchema);
