import mongoose from "mongoose";

const AnonymousDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    networkFingerprint: {
      type: String,
      unique: true,
      sparse: true,
    },
    browserId: {
      type: String,
      unique: true,
      sparse: true,
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

const AnonymousDevice =
  mongoose.models.AnonymousDevice ||
  mongoose.model("AnonymousDevice", AnonymousDeviceSchema);

// Next.js can retain a compiled model during hot reload. Add newly introduced
// paths to that cached schema so Mongoose does not strip them from writes.
if (!AnonymousDevice.schema.path("networkFingerprint")) {
  AnonymousDevice.schema.add({
    networkFingerprint: { type: String, unique: true, sparse: true },
  });
}
if (!AnonymousDevice.schema.path("browserId")) {
  AnonymousDevice.schema.add({
    browserId: { type: String, unique: true, sparse: true },
  });
}

export default AnonymousDevice;
