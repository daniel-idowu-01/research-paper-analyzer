import jwt from "jsonwebtoken";
import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { getUserById } from "@/services/user-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logger.info("Fetching paper details...");
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

    const paper = await Paper.findById(id);

    if (!paper) {
      return NextResponse.json({ error: "Paper not found!" }, { status: 400 });
    }

    logger.info("Paper fetched successfully!");

    return NextResponse.json({
      success: true,
      message: "Paper details fetched successfully",
      paper,
    });
  } catch (error) {
    console.log("Fetching paper details error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch paper details",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logger.info("Deleting paper...");
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

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

      const paper = await Paper.findOne({ _id: id, uploaderId: user.id });

      if (!paper) {
        return NextResponse.json({ error: "Paper not found" }, { status: 404 });
      }

      await Paper.findByIdAndDelete(id);

      return NextResponse.json(
        { success: true, message: "Paper deleted successfully" },
        { status: 200 }
      );
    } catch (error: any) {
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
    logger.error("Error deleting paper: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
