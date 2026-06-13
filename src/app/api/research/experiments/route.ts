import { NextResponse } from "next/server";
import ExperimentRun from "@/models/ExperimentRun";
import { connectDB } from "@/lib/mongo";
import { normalizeExperimentConfig, runExperiment } from "@/lib/research/experiments";

export const maxDuration = 120;

export async function GET() {
  await connectDB();
  const runs = await ExperimentRun.find({})
    .sort({ createdAt: -1 })
    .limit(30)
    .select("name status config outputs startedAt completedAt createdAt error");
  return NextResponse.json({ success: true, runs });
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const config = normalizeExperimentConfig(await request.json());
    if (!config.documentIds.length) {
      return NextResponse.json({ error: "documentIds is required" }, { status: 400 });
    }
    const run = await runExperiment(config);
    return NextResponse.json({ success: true, run }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Experiment failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
