import mongoose from "mongoose";

const AnonymousDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScanAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AnonymousDevice ||
  mongoose.model("AnonymousDevice", AnonymousDeviceSchema);
