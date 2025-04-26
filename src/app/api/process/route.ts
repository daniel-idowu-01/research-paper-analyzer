import logger from "@/lib/logger";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request: Request) {
  logger.info("Processing PDF file...");
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF
    const data = await pdf(buffer);

    return NextResponse.json({
      text: data.text,
      // numPages: data.numpages,
      // metadata: data.info
    });
  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
