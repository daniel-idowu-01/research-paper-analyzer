import mongoose from "mongoose";

const NotificationSettingsSchema = new mongoose.Schema({
  paperAnalysis: { type: Boolean, default: true },
  similarPapers: { type: Boolean, default: true },
  newFeatures: { type: Boolean, default: false },
  marketing: { type: Boolean, default: false },
  email: { type: Boolean, default: true },
  browser: { type: Boolean, default: true },
});

const PreferencesSchema = new mongoose.Schema({
  autoAnalyze: { type: Boolean, default: true },
  findSimilar: { type: Boolean, default: true },
  citationFormat: {
    type: String,
    default: "apa",
    enum: ["apa", "mla", "chicago", "harvard", "ieee"],
  },
  dataCollection: { type: Boolean, default: true },
  storeHistory: { type: Boolean, default: true },
});

const AppearanceSettingsSchema = new mongoose.Schema({
  theme: { type: String, default: "system", enum: ["light", "dark", "system"] },
  language: {
    type: String,
    default: "en",
    enum: ["en", "es", "fr", "de", "zh"],
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastVerificationEmailSent: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    institution: {
      type: String,
    },
    position: {
      type: String,
    },
    website: {
      type: String,
    },
    researchInterests: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    settings: {
      notifications: { type: NotificationSettingsSchema, default: () => ({}) },
      preferences: { type: PreferencesSchema, default: () => ({}) },
      appearance: { type: AppearanceSettingsSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

UserSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && !doc.settings) {
    doc.settings = {
      notifications: {},
      preferences: {
        autoAnalyze: doc.autoAnalyzePaper,
      },
      appearance: {},
    };
    await doc.save();
  }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
