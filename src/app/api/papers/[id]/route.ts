import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { getUserById } from "@/services/user-service";
import { authErrorResponse, requireAuth } from "@/lib/server/auth";
import { badRequest, notFound } from "@/lib/server/http";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logger.info("Fetching paper details...");
    await connectDB();

    const { id } = await params;

    if (!id) {
      return badRequest("Paper ID is required");
    }

    const paper = await Paper.findById(id);

    if (!paper) {
      return notFound("Paper not found");
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
      return badRequest("Paper ID is required");
    }
    try {
      const authUser = await requireAuth();
      const user = await getUserById(authUser.id);

      if (!user) {
        return notFound("User not found");
      }

      const paper = await Paper.findOne({ _id: id, uploaderId: user.id });

      if (!paper) {
        return notFound("Paper not found");
      }

      await Paper.findByIdAndDelete(id);

      return NextResponse.json(
        { success: true, message: "Paper deleted successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
        return authErrorResponse(error);
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (error) {
    logger.error("Error deleting paper: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
