import axios from "axios";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import logger from "@/lib/logger";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { createPaper } from "@/usecases/paper";
import Notification from "@/models/Notification";
import { processResearchPaper } from "@/utils/pdfProcessor";
import { fallbackPartialExtraction } from "@/utils/pdfProcessor";

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

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    let userId = null;
    if (token) {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string };

      userId = decodedToken.id;

      if (!decodedToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
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

      await Notification.createPaperAnalysisNotification(
        new mongoose.Types.ObjectId(userId as string),
        result.metadata.title,
        paper._id
      );

      logger.info("Notification created successfully!");

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
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
