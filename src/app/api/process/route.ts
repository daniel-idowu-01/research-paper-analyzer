import axios from "axios";
import mongoose from "mongoose";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { createPaper } from "@/usecases/paper";
import Notification from "@/models/Notification";
import {
  extractPlainTextFromPdfBuffer,
  fallbackPartialExtraction,
  processResearchPaper,
} from "@/utils/pdfProcessor";
import { indexPaperToPinecone, isPineconeConfigured } from "@/lib/semantic";
import { getTokenFromCookies, requireAuth } from "@/lib/server/auth";
import { badRequest, serverError } from "@/lib/server/http";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function isPdfBuffer(buf: Buffer): boolean {
  if (buf.length < 5) return false;
  return buf.subarray(0, 5).toString("ascii") === "%PDF-";
}

export const maxDuration = 120;

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

    if (file.size > MAX_UPLOAD_BYTES) {
      return badRequest("File size exceeds 10MB limit");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
    if (!cloudName || !uploadPreset) {
      logger.error("Cloudinary env missing");
      return serverError("File storage is not configured");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isPdfBuffer(buffer)) {
      return badRequest("Invalid PDF file (missing PDF header)");
    }

    const form = new FormData();
    form.append(
      "file",
      new File([buffer], file.name || "document.pdf", { type: "application/pdf" })
    );
    form.append("upload_preset", uploadPreset);

    logger.info("Uploading to cloudinary...");
    const cloudinaryRequest = await axios.post<{ secure_url?: string }>(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      form,
      { timeout: 120_000, maxBodyLength: MAX_UPLOAD_BYTES + 256 * 1024 }
    );
    const fileUrl = cloudinaryRequest.data?.secure_url;
    if (!fileUrl) {
      logger.error("Cloudinary response missing secure_url", {
        status: cloudinaryRequest.status,
      });
      return serverError("Upload did not return a file URL");
    }
    logger.info("Uploaded successfully!");

    try {
      const result = await processResearchPaper(buffer);
      logger.info("File processed successfully!");

      const paper = await createPaper(result, fileUrl, userId || null);

      if (isPineconeConfigured()) {
        try {
          await indexPaperToPinecone(
            paper._id.toString(),
            result.metadata.title,
            result.extracted_text
          );
        } catch (semanticError) {
          logger.error("Semantic indexing failed", {
            error:
              semanticError instanceof Error
                ? semanticError.message
                : String(semanticError),
            paperId: paper._id.toString(),
          });
        }
      }

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
      let partialText = "";
      try {
        partialText = await extractPlainTextFromPdfBuffer(buffer);
      } catch {
        partialText = "";
      }
      return NextResponse.json(
        {
          error: "PDF processing failed",
          details:
            "We could not fully analyze the PDF. Basic information was extracted.",
          partialData: await fallbackPartialExtraction(partialText),
        },
        { status: 206 }
      );
    }
  } catch (error) {
    console.error("PDF processing error:", error);
    const exposeDetails = process.env.NODE_ENV === "development";
    return serverError(
      "Failed to process PDF",
      exposeDetails && error instanceof Error ? error.message : undefined
    );
  }
}
