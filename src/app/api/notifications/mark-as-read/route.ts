import mongoose from "mongoose";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import Notification from "@/models/Notification";

export async function POST(request: Request) {
  try {
    logger.info("Marking notifications as read...");
    await connectDB();

    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    const objectIds = notificationIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const updatedCount = await Notification.markAsRead(objectIds);
    logger.info("Marked notifications as read successfully!");

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
