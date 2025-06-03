import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import HuggingFaceService from "@/services/huggingface-service";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { query, userId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Generate embeddings for the search query
    const queryEmbeddings = await HuggingFaceService.generateEmbeddings(query);

    // Find papers with embeddings (you'll need to add embeddings field to your Paper model)
    const papers = await Paper.find(userId ? { userId } : {}, {
      title: 1,
      abstract: 1,
      "aiAnalysis.embeddings": 1,
      "aiAnalysis.topics": 1,
      "aiAnalysis.summary": 1,
    });

    // Calculate similarity scores (simplified dot product)
    const results = papers
      .filter((paper) => paper.aiAnalysis?.embeddings)
      .map((paper) => {
        const similarity = calculateCosineSimilarity(
          queryEmbeddings,
          paper.aiAnalysis.embeddings
        );

        return {
          ...paper.toObject(),
          similarity,
        };
      })
      .filter((result) => result.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      results,
      query,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

function calculateCosineSimilarity(vecA: any, vecB: any) {
  const dotProduct = vecA.reduce(
    (acc: any, val: any, i: any) => acc + val * vecB[i],
    0
  );
  const magnitudeA = Math.sqrt(
    vecA.reduce((acc: any, val: any) => acc + val * val, 0)
  );
  const magnitudeB = Math.sqrt(
    vecB.reduce((acc: any, val: any) => acc + val * val, 0)
  );
  return dotProduct / (magnitudeA * magnitudeB);
}
