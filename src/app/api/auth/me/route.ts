import jwt from "jsonwebtoken";
import User from "@/models/User";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { formatTime } from "@/utils/formatTime";

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const { id } = decoded;

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
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
