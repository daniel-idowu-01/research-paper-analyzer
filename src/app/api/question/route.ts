import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import HuggingFaceService from "@/services/huggingface-service";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { question, paperId } = await request.json();

    if (!question || !paperId) {
      return NextResponse.json(
        { error: "Question and paper ID are required" },
        { status: 400 }
      );
    }

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    // Use paper content as context
    const context = `
      Title: ${paper.title}
      Abstract: ${paper.abstract}
      Content: ${paper.content}
    `;

    const answer = await HuggingFaceService.answerQuestion(context, question);

    return NextResponse.json({
      success: true,
      question,
      answer: answer.answer,
      confidence: answer.confidence,
    });
  } catch (error) {
    console.error("Question answering error:", error);
    return NextResponse.json(
      { error: "Failed to answer question" },
      { status: 500 }
    );
  }
}
