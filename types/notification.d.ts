import mongoose, { Document, Model, Schema, Types, model } from "mongoose";

export type NotificationType =
  | "paper_analysis_complete"
  | "similar_papers_found"
  | "new_feature"
  | "system_alert"
  | "paper_recommendation";

export type NotificationStatus = "unread" | "read" | "archived";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  relatedPaperId?: Types.ObjectId;
  metadata?: Record<string, any>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
