import jwt from "jsonwebtoken";
import User from "@/models/User";
import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";

// update user settings
export async function PUT(request: Request) {
  try {
    logger.info("Updating user settings...");
    await connectDB();
    // const user = getUser(request);

    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
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
          return NextResponse.json(
            { error: "Invalid settings type" },
            { status: 400 }
          );
      }

      const updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        { $set: updateQuery },
        { new: true }
      ).select("settings");

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "Settings updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      logger.error("JWT Error: " + error);
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 }
        );
      }

      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { error: "Token expired. Please login again." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
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

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };

      const user = await User.findById(decoded.id);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      logger.error("JWT Error: " + error);
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 }
        );
      }
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { error: "Token expired. Please login again." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Settings fetch error: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
