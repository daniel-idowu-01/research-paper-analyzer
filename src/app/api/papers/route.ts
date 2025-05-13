import jwt from "jsonwebtoken";
import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { getUserById } from "@/services/user-service";

export async function GET(request: Request) {
  try {
    logger.info("Fetching user papers...");
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

      const user = await getUserById(decoded.id);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const papers = await Paper.find({ uploaderId: user.id });

      if (!papers) {
        return NextResponse.json({
          success: true,
          message: "No papers found",
          papers: [],
        });
      }

      logger.info("Papers fetched successfully!");

      return NextResponse.json({
        success: true,
        message: "Paper details fetched successfully",
        papers,
      });
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
    console.log("Fetching papers error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch papers",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
