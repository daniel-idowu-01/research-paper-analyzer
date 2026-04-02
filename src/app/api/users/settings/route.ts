import User from "@/models/User";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/server/auth";
import { badRequest, notFound } from "@/lib/server/http";

// update user settings
export async function PUT(request: Request) {
  try {
    logger.info("Updating user settings...");
    await connectDB();
    const authUser = await requireAuth();
    const { settingsType, data } = await request.json();

    let updateQuery = {};
    switch (settingsType) {
      case "notifications":
        updateQuery = { "settings.notifications": data };
        break;
      case "preferences":
        updateQuery = { "settings.preferences": data };
        break;
      case "appearance":
        updateQuery = {
          "settings.appearance.theme": data.theme,
          "settings.appearance.language": data.language,
        };
        break;
      default:
        return badRequest("Invalid settings type");
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser.id,
      { $set: updateQuery },
      { new: true }
    ).select("settings");

    if (!updatedUser) {
      return notFound("User not found");
    }

    return NextResponse.json(
      { message: "Settings updated successfully", settings: updatedUser.settings },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
      return authErrorResponse(error);
    }

    logger.error("Settings update error: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// get user settings
export async function GET(request: Request) {
  try {
    logger.info("Fetching user settings...");
    await connectDB();
    const authUser = await requireAuth();
    const user = await User.findById(authUser.id);

    if (!user) {
      return notFound("User not found");
    }

    return NextResponse.json(
      {
        settings: user.settings,
        user: {
          email: user.email,
          accountType: user.accountType,
          createdAt: user.createdAt.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
      return authErrorResponse(error);
    }

    logger.error("Settings fetch error: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
