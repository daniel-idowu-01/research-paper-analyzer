import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ExperimentRun from "@/models/ExperimentRun";
import { connectDB } from "@/lib/mongo";
import { badRequest, notFound } from "@/lib/server/http";
import { generateResearchReport } from "@/lib/research/report";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badRequest("Invalid experiment id");
  const run = await ExperimentRun.findById(id);
  if (!run) return notFound("Experiment not found");

  return new NextResponse(generateResearchReport(run.toObject()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${run.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.md"`,
    },
  });
}
