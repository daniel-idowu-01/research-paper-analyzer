import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";

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
