import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { getUserById } from "@/services/user-service";
import { authErrorResponse, requireAuth } from "@/lib/server/auth";

export async function GET(request: Request) {
  try {
    logger.info("Fetching user papers...");
    await connectDB();
    const authUser = await requireAuth();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    const user = await getUserById(authUser.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const query: Record<string, unknown> = { uploaderId: user.id };

    if (search) {
      query.$or = [
        { "metadata.title": { $regex: search, $options: "i" } },
        { "metadata.authors": { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Paper.countDocuments(query);
    const papers = await Paper.find(query)
      .select("-extracted_text")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    logger.info("Papers fetched successfully!");

    return NextResponse.json({
      success: true,
      message: "Paper details fetched successfully",
      papers,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
      return authErrorResponse(error);
    }

    logger.error("Fetching papers error: " + error);
    return NextResponse.json(
      {
        error: "Failed to fetch papers",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
