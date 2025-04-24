import mongoose from "mongoose";

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

export default mongoose.models.User || mongoose.model("User", UserSchema);
