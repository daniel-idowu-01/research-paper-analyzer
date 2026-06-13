import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { badRequest, notFound } from "@/lib/server/http";
import { createChunkingStrategy, parseDocumentFromPaper } from "@/lib/research/chunking";
import { GraphRagRetriever } from "@/lib/research/graph";
import { createRetriever } from "@/lib/research/retrieval";
import type { RetrievalStrategy } from "@/lib/research/types";

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const paperId = String(body?.paperId || "");
    const query = String(body?.query || "").trim();
    const retrievalStrategy = String(body?.retrievalStrategy || "hybrid") as RetrievalStrategy;
    const chunkingStrategy = String(body?.chunkingStrategy || "section_aware");

    if (!mongoose.isValidObjectId(paperId)) return badRequest("Invalid paper id");
    if (query.length < 2) return badRequest("Query must contain at least 2 characters");

    const paper = await Paper.findById(paperId).select("extracted_text file_url metadata");
    if (!paper) return notFound("Paper not found");

    const document = parseDocumentFromPaper(paper.toObject());
    const chunks = createChunkingStrategy(chunkingStrategy).chunk(document);
    const retriever =
      retrievalStrategy === "graph_rag" ? new GraphRagRetriever() : createRetriever(retrievalStrategy);
    const retrieved = await retriever.retrieve(query, {
      paperId,
      chunks,
      topK: Number(body?.topK || 6),
      strategy: retrievalStrategy,
    });

    return NextResponse.json({
      success: true,
      query,
      retrievalStrategy,
      chunkingStrategy,
      chunks: retrieved,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Retrieval failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
