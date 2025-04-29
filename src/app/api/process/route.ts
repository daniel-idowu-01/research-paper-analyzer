import axios from "axios";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { createPaper } from "@/usecases/paper";
import { processResearchPaper } from "@/utils/pdfProcessor";

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
    const fileUrl =  cloudinaryRequest?.data.secure_url
    logger.info("Uploaded successfully!");

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processResearchPaper(buffer);
    logger.info("File processed successfully!");

    const paper = await createPaper(result, fileUrl);

    return NextResponse.json({
      success: true,
      data: paper._id,
    });
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
