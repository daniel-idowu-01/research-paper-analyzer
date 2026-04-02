import User from "@/models/User";
import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { formatTime } from "@/utils/formatTime";
import { connectDB } from "@/lib/mongo";
import { authErrorResponse, requireAuth } from "@/lib/server/auth";

export async function GET() {
  try {
    await connectDB();
    const { id } = await requireAuth();

    const [user, notifications] = await Promise.all([
      User.findById(id).select("name email role").lean(),
      Notification.find({
        userId: id,
        status: "unread",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title message createdAt type status")
        .lean(),
    ]);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const formattedNotifications = notifications.map((notification) => ({
      ...notification,
      createdAt: formatTime(notification.createdAt),
    }));

    return NextResponse.json(
      { authenticated: true, user, notifications: formattedNotifications },
      { status: 200 }
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
