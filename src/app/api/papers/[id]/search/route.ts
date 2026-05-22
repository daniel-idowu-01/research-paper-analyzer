import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { buildAnalysisCorpus, findMatchesInText } from "@/lib/paperSearch";
import { isPineconeConfigured, semanticSearchPaper } from "@/lib/semantic";
import { badRequest, notFound } from "@/lib/server/http";

export const maxDuration = 45;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();

    if (!id || !mongoose.isValidObjectId(id)) {
      return badRequest("Invalid paper id");
    }

    if (q.length > 200) {
      return badRequest("Search query is too long (max 200 characters)");
    }

    if (q.length < 2) {
      return NextResponse.json({
        success: true,
        query: q,
        matchCount: 0,
        matches: [],
        source: "none" as const,
      });
    }

    const paper = await Paper.findById(id).select(
      "extracted_text summary metadata key_findings research_impact novelty_assessment related_areas"
    );

    if (!paper) {
      return notFound("Paper not found");
    }

    const plain = paper.toObject();
    const full =
      typeof plain.extracted_text === "string" && plain.extracted_text.length > 80
        ? plain.extracted_text
        : "";

    const corpus = full || buildAnalysisCorpus(plain);
    let matches = findMatchesInText(corpus, q, {
      contextChars: parseInt(process.env.PAPER_SEARCH_CONTEXT_CHARS || "160", 10),
      maxMatches: parseInt(process.env.PAPER_SEARCH_MAX_MATCHES || "25", 10),
    });
    let source: "full_text" | "analysis_only" | "semantic" = full
      ? "full_text"
      : "analysis_only";

    if (isPineconeConfigured()) {
      try {
        const semanticMatches = await semanticSearchPaper(id, q, 10);
        if (semanticMatches.length > 0) {
          matches = semanticMatches;
          source = "semantic" as const;
        }
      } catch (searchError) {
        logger.warn("Semantic search failed, falling back to local text search", {
          error: searchError instanceof Error ? searchError.message : String(searchError),
          id,
          query: q,
        });
      }
    }

    logger.info("Paper text search", {
      id,
      source,
      matchCount: matches.length,
      queryLen: q.length,
    });

    return NextResponse.json({
      success: true,
      query: q,
      matchCount: matches.length,
      matches,
      source,
    });
  } catch (error) {
    console.error("Paper search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
