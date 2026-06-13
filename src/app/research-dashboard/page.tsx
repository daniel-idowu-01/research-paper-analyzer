"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3, Clock, FileText, Filter, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Run = {
  _id: string;
  name: string;
  status: string;
  config: {
    retrievalStrategies?: string[];
    chunkingStrategies?: string[];
    model?: string;
  };
  outputs: Array<{
    documentId: string;
    metrics: Record<string, number>;
  }>;
  createdAt: string;
};

function average(outputs: Run["outputs"], key: string): number {
  return outputs.length
    ? outputs.reduce((sum, output) => sum + Number(output.metrics?.[key] || 0), 0) /
        outputs.length
    : 0;
}

export default function ResearchDashboardPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [retrieval, setRetrieval] = useState("all");
  const [chunking, setChunking] = useState("all");
  const [model, setModel] = useState("all");

  useEffect(() => {
    fetch("/api/research/experiments")
      .then((response) => response.json())
      .then((data) => setRuns(data.runs || []))
      .catch(() => setRuns([]));
  }, []);

  const filtered = useMemo(
    () =>
      runs.filter((run) => {
        const retrievalOk =
          retrieval === "all" || run.config.retrievalStrategies?.includes(retrieval);
        const chunkingOk =
          chunking === "all" || run.config.chunkingStrategies?.includes(chunking);
        const modelOk = model === "all" || run.config.model === model;
        return retrievalOk && chunkingOk && modelOk;
      }),
    [runs, retrieval, chunking, model]
  );

  const outputs = filtered.flatMap((run) => run.outputs || []);
  const retrievalOptions = Array.from(
    new Set(runs.flatMap((run) => run.config.retrievalStrategies || []))
  );
  const chunkingOptions = Array.from(
    new Set(runs.flatMap((run) => run.config.chunkingStrategies || []))
  );
  const modelOptions = Array.from(new Set(runs.map((run) => run.config.model).filter(Boolean)));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Research Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Retrieval, chunking, grounding, and latency comparisons
            </p>
          </div>
          <Badge variant="secondary">{filtered.length} experiment runs</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Select value={retrieval} onValueChange={setRetrieval}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Retrieval strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All retrieval</SelectItem>
              {retrievalOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={chunking} onValueChange={setChunking}>
            <SelectTrigger>
              <FileText className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Chunking strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chunking</SelectItem>
              {chunkingOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <Activity className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {modelOptions.map((item) => (
                <SelectItem key={item} value={item || ""}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric title="Precision@K" value={average(outputs, "precisionAtK")} icon={Target} />
          <Metric title="Recall@K" value={average(outputs, "recallAtK")} icon={BarChart3} />
          <Metric title="Faithfulness" value={average(outputs, "faithfulness")} icon={Activity} />
          <Metric title="Latency" value={average(outputs, "latencyMs")} icon={Clock} suffix="ms" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Experiment Results</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-3">Run</th>
                  <th>Retrieval</th>
                  <th>Chunking</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>Faithfulness</th>
                  <th>Citation</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((run) => (
                  <tr key={run._id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{run.name}</td>
                    <td>{run.config.retrievalStrategies?.join(", ")}</td>
                    <td>{run.config.chunkingStrategies?.join(", ")}</td>
                    <td>{average(run.outputs, "precisionAtK").toFixed(3)}</td>
                    <td>{average(run.outputs, "recallAtK").toFixed(3)}</td>
                    <td>{average(run.outputs, "faithfulness").toFixed(3)}</td>
                    <td>{average(run.outputs, "citationAccuracy").toFixed(3)}</td>
                    <td>
                      <Link
                        className="text-blue-600 hover:underline dark:text-blue-300"
                        href={`/api/research/experiments/${run._id}/report`}
                      >
                        Markdown
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
  suffix = "",
  icon: Icon,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: typeof Target;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold">
            {suffix ? Math.round(value) : value.toFixed(3)}
            {suffix}
          </p>
        </div>
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
      </CardContent>
    </Card>
  );
}
