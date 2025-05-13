"use client";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { IPaper } from "../../../../types";
import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Search,
  Share2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PaperDetailsCard = ({ paper }: { paper: IPaper }) => (
  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
    <CardHeader className="pb-3">
      <CardTitle className="text-gray-900 dark:text-white">
        Paper Details
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
          Title
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {paper.metadata.title}
        </p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
          Authors
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {paper.metadata.authors.join(", ")}
        </p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
          Published
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {paper.metadata.published_date}
        </p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
          Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {paper.metadata.topics.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-700"
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActionButtons = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/api/download-paper";
    link.setAttribute("download", "research-paper.pdf");
    link.click();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Research Paper",
          text: "Check out this interesting research paper",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        //toast({ title: "Link copied to clipboard!" });
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      //toast({ title: "Failed to share", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Button
        size="sm"
        variant="outline"
        className="w-full text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        onClick={handleDownload}
      >
        <Download className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
        Download
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
        Share
      </Button>
    </div>
  );
};

export default function PaperPage() {
  const params = useParams();
  const paperId = params.id;
  const { sendRequest } = useApi();
  const [paper, setPaper] = useState<IPaper | null>(null);
  const [isPaperLoading, setIsPaperLoading] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      setIsPaperLoading(true);
      try {
        const response = await sendRequest(`/api/papers/${paperId}`, "GET");
        setPaper(response.paper || null);
      } catch (error) {
        console.log("Failed to fetch paper:", error);
        setPaper(null);
      } finally {
        setIsPaperLoading(false);
      }
    };

    getProducts();
  }, [paperId]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      //toast({ title: "Link copied to clipboard!" });
    } catch (err) {
      console.error("Could not copy text: ", err);
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      //toast({ title: "Link copied to clipboard!" });
    }
  }, []);

  const memoizedPaperDetails = useMemo(
    () => (paper ? <PaperDetailsCard paper={paper} /> : null),
    [paper]
  );

  if (isPaperLoading) {
    return <Spinner />;
  }

  const getWidth = (type: string) => {
    switch (
      type === "research"
        ? paper?.research_impact.level
        : paper?.novelty_assessment.level
    ) {
      case "Very High":
        return "100%";
      case "High":
        return "80%";
      case "Medium":
        return "50%";
      case "Low":
        return "20%";
      default:
        return "0%";
    }
  };

  return (
    <div className="container flex flex-col min-h-screen px-4 py-6 mx-auto bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center mb-6">
        <Link href="/" aria-label="Go back">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Research Paper Analysis
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          {memoizedPaperDetails}

          <ActionButtons />

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 dark:text-white">
                Search Within Paper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="pl-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  type="search"
                  placeholder="Search terms..."
                  aria-label="Search within paper"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                Key Insights
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                Paper Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    AI-Generated Summary
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Generated using advanced natural language processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
                  {paper?.summary}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="insights" className="mt-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Key Insights & Findings
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Important discoveries and implications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                      Primary Finding
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {paper?.key_findings.primary}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                        Methodology Innovation
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {paper?.key_findings.methodology_innovation}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                        Practical Applications
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {paper?.key_findings.practical_applications.map(
                          (app, index) => (
                            <li key={index}>{app}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Performance Comparison
                  </h3>
                  <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                      <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-gray-900 dark:text-white"
                          >
                            Model
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-gray-900 dark:text-white"
                          >
                            Accuracy
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-gray-900 dark:text-white"
                          >
                            Parameters
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-gray-900 dark:text-white"
                          >
                            Training Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            Proposed Method
                          </td>
                          <td className="px-6 py-4">
                            {
                              paper?.performance_metrics.proposed_method
                                .accuracy
                            }
                          </td>
                          <td className="px-6 py-4">
                            {
                              paper?.performance_metrics.proposed_method
                                .parameters
                            }
                          </td>
                          <td className="px-6 py-4">
                            {
                              paper?.performance_metrics.proposed_method
                                .training_time
                            }{" "}
                            hours
                          </td>
                        </tr>
                        <tr className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            Previous SOTA
                          </td>
                          <td className="px-6 py-4">
                            {paper?.performance_metrics.previous_sota.accuracy}
                          </td>
                          <td className="px-6 py-4">
                            {
                              paper?.performance_metrics.previous_sota
                                .parameters
                            }
                          </td>
                          <td className="px-6 py-4">
                            {
                              paper?.performance_metrics.previous_sota
                                .training_time
                            }{" "}
                            hours
                          </td>
                        </tr>
                        <tr className="bg-white dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            Baseline
                          </td>
                          <td className="px-6 py-4">
                            {paper?.performance_metrics.baseline.accuracy}
                          </td>
                          <td className="px-6 py-4">
                            {paper?.performance_metrics.baseline.parameters}
                          </td>
                          <td className="px-6 py-4">
                            {paper?.performance_metrics.baseline.training_time}{" "}
                            hours
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Paper Preview
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    First few pages of the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paper?.file_url ? (
                    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(
                          paper.file_url
                        )}&embedded=true`}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        title="PDF Preview"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <a
                          href={paper.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          <BookOpen className="inline w-4 h-4 mr-2" />
                          Open Full PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-700">
                      <FileText className="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        No PDF Available
                      </p>
                      <p className="mb-4 text-xs text-center text-gray-500 dark:text-gray-400">
                        This paper doesn't have a PDF file attached
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                AI Analysis
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Automated insights about this research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Research Impact
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: getWidth("research") }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {paper?.research_impact.level}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {paper?.research_impact.significance}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Novelty Assessment
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: getWidth("novelty") }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {paper?.novelty_assessment.level}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {paper?.novelty_assessment.comparison_to_prior_work}
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Related Research Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paper?.related_areas.map((area) => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-700"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
