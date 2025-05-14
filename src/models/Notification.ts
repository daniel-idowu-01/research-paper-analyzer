import { INotification } from "../../types/notification";
import mongoose, { Document, Model, Schema, Types, model } from "mongoose";

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "paper_analysis_complete",
        "similar_papers_found",
        "new_feature",
        "system_alert",
        "paper_recommendation",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },
    relatedPaperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Indexes for better query performance
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });

// Static methods
interface NotificationModelStatics {
  markAsRead(notificationIds: Types.ObjectId[]): Promise<number>;
  getUserNotifications(
    userId: Types.ObjectId,
    limit?: number,
    skip?: number
  ): Promise<INotification[]>;
  createPaperAnalysisNotification(
    userId: Types.ObjectId,
    paperTitle: string,
    paperId: Types.ObjectId
  ): Promise<INotification>;
}

// Mark notifications as read
NotificationSchema.statics.markAsRead = async function (
  notificationIds: Types.ObjectId[]
) {
  const result = await this.updateMany(
    { _id: { $in: notificationIds }, status: "unread" },
    {
      $set: {
        status: "read",
        readAt: new Date(),
      },
    }
  );
  return result.modifiedCount;
};

// Get user notifications with pagination
NotificationSchema.statics.getUserNotifications = async function (
  userId: Types.ObjectId,
  limit: number = 10,
  skip: number = 0
) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

// Create standardized notifications
NotificationSchema.statics.createPaperAnalysisNotification = async function (
  userId: Types.ObjectId,
  paperTitle: string,
  paperId: Types.ObjectId
) {
  return this.create({
    userId,
    type: "paper_analysis_complete",
    title: "Analysis Complete",
    message: `Your paper "${paperTitle}" has been analyzed`,
    relatedPaperId: paperId,
  });
};

// Pre-save hook for setting default values
NotificationSchema.pre<INotification>("save", function (next) {
  if (this.isNew && this.status === "unread") {
    this.readAt = undefined;
  }
  next();
});

type NotificationModel = Model<INotification> & NotificationModelStatics;

const Notification: NotificationModel =
  (mongoose.models.Notification as NotificationModel) ||
  mongoose.model<INotification, NotificationModel>(
    "Notification",
    NotificationSchema
  );

export default Notification;
