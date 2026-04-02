import axios from "axios";
import mongoose from "mongoose";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { createPaper } from "@/usecases/paper";
import Notification from "@/models/Notification";
import { processResearchPaper } from "@/utils/pdfProcessor";
import { fallbackPartialExtraction } from "@/utils/pdfProcessor";
import { getTokenFromCookies, requireAuth } from "@/lib/server/auth";
import { badRequest, serverError } from "@/lib/server/http";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request: Request) {
  try {
    logger.info("Processing PDF file...");
    await connectDB();

    let userId = null;
    const token = await getTokenFromCookies();
    if (token) {
      try {
        const authUser = await requireAuth();
        userId = authUser.id;
      } catch {
        userId = null;
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return badRequest("No PDF file provided");
    }

    if (file.type !== "application/pdf") {
      return badRequest("Only PDF files are supported");
    }

    if (file.size > 10 * 1024 * 1024) {
      return badRequest("File size exceeds 10MB limit");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!);

    logger.info("Uploading to cloudinary...");
    const cloudinaryRequest = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      form
    );
    const fileUrl = cloudinaryRequest?.data.secure_url;
    logger.info("Uploaded successfully!");

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const result = await processResearchPaper(buffer);
      logger.info("File processed successfully!");

      const paper = await createPaper(result, fileUrl, userId || null);

      if (userId) {
        await Notification.createPaperAnalysisNotification(
          new mongoose.Types.ObjectId(userId),
          result.metadata.title,
          paper._id
        );

        logger.info("Notification created successfully!");
      }

      return NextResponse.json({
        success: true,
        data: paper._id,
      });
    } catch (processingError) {
      console.error("PDF processing failed:", processingError);
      return NextResponse.json(
        {
          error: "PDF processing failed",
          details:
            "We could not fully analyze the PDF. Basic information was extracted.",
          partialData: await fallbackPartialExtraction(buffer.toString()),
        },
        { status: 206 }
      );
    }
  } catch (error) {
    console.error("PDF processing error:", error);
    return serverError(
      "Failed to process PDF",
      error instanceof Error ? error.message : String(error)
    );
  }
}
