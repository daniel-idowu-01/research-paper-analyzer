import axios from "axios";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import logger from "@/lib/logger";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { createPaper } from "@/usecases/paper";
import Notification from "@/models/Notification";
import { fallbackPartialExtraction } from "@/utils/pdfProcessor";
import { enhancedProcessResearchPaper } from "@/utils/enhancedProcessor";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request: Request) {
  try {
    logger.info("Processing PDF file with AI enhancement...");
    await connectDB();

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    let userId = null;
    if (token) {
      if (!process.env.JWT_SECRET) {
        return NextResponse.json(
          { error: "JWT Secret is not configured" },
          { status: 500 }
        );
      }
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as jwt.JwtPayload;
      userId = decodedToken.id;

      if (!decodedToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (!process.env.CLOUDINARY_UPLOAD_PRESET) {
      return NextResponse.json(
        { error: "Cloudinary Upload Preset is not configured" },
        { status: 500 }
      );
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

    logger.info("Uploading to cloudinary...");
    const cloudinaryRequest = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      form
    );
    const fileUrl = cloudinaryRequest?.data.secure_url;
    logger.info("Uploaded successfully!");

    const buffer = Buffer.from(await (file as Blob).arrayBuffer());

    try {
      // Use enhanced processing with Hugging Face
      const result = await enhancedProcessResearchPaper(buffer);
      logger.info("File processed successfully with AI enhancement!");

      const paper = await createPaper(result, fileUrl, userId || null);

      await Notification.createPaperAnalysisNotification(
        new mongoose.Types.ObjectId(userId),
        result.metadata.title,
        paper._id
      );

      logger.info("Notification created successfully!");

      return NextResponse.json({
        success: true,
        data: paper._id,
        aiEnhanced: true,
      });
    } catch (processingError) {
      console.error("Enhanced PDF processing failed:", processingError);
      return NextResponse.json(
        {
          error: "PDF processing failed",
          details: "AI enhancement failed, falling back to basic processing.",
          partialData: await fallbackPartialExtraction(buffer.toString()),
        },
        { status: 206 }
      );
    }
  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
