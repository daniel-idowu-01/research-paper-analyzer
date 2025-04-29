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
  <Card>
    <CardHeader className="pb-3">
      <CardTitle>Paper Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-medium">Title</h3>
        <p className="text-sm text-gray-500">{paper.metadata.title}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium">Authors</h3>
        <p className="text-sm text-gray-500">
          {paper.metadata.authors.join(", ")}
        </p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium">Published</h3>
        <p className="text-sm text-gray-500">{paper.metadata.published_date}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {paper.metadata.topics.map((topic) => (
            <Badge key={topic} variant="secondary">
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
        className="w-full"
        onClick={handleDownload}
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4 mr-2" />
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
    <div className="container flex flex-col min-h-screen px-4 py-6 mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/" aria-label="Go back">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Research Paper Analysis</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          {memoizedPaperDetails}

          <ActionButtons />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Search Within Paper</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-8"
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="preview">Paper Preview</TabsTrigger>
              {/* <TabsTrigger value="references">References</TabsTrigger> */}
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Summary</CardTitle>
                  <CardDescription>
                    Generated using advanced natural language processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <p>
                    This paper introduces a novel approach to neural network
                    architecture that significantly improves performance on
                    image recognition tasks. The authors propose a modified
                    attention mechanism that reduces computational complexity
                    while maintaining accuracy.
                  </p>
                  <p>Key contributions include:</p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li>
                      A new attention-based architecture that reduces training
                      time by 35%
                    </li>
                    <li>
                      Comprehensive benchmarks across multiple datasets showing
                      consistent improvements
                    </li>
                    <li>
                      Analysis of computational efficiency and memory usage
                      compared to existing methods
                    </li>
                    <li>
                      Open-source implementation with pre-trained models for
                      various applications
                    </li>
                  </ul>
                  <p>
                    The experimental results demonstrate that the proposed
                    method outperforms state-of-the-art approaches on standard
                    benchmarks while requiring fewer parameters and less
                    training time.
                  </p> */}
                  {paper?.summary}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="insights" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights & Findings</CardTitle>
                  <CardDescription>
                    Important discoveries and implications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h3 className="mb-2 font-medium">Primary Finding</h3>
                    <p className="text-sm">{paper?.key_findings.primary}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 font-medium">
                        Methodology Innovation
                      </h3>
                      <p className="text-sm">
                        {paper?.key_findings.methodology_innovation}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 font-medium">
                        Practical Applications
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {paper?.key_findings.practical_applications.map(
                          (app, index) => (
                            <li key={index} className="text-sm">
                              {app}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <h3 className="font-medium">Performance Comparison</h3>
                  <div className="relative overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Model
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Accuracy
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Parameters
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Training Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                          <td className="px-6 py-4 font-medium">
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
                        <tr className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 font-medium">
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
                        <tr className="bg-white dark:bg-gray-900">
                          <td className="px-6 py-4 font-medium">Baseline</td>
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
              <Card>
                <CardHeader>
                  <CardTitle>Paper Preview</CardTitle>
                  <CardDescription>
                    First few pages of the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paper?.file_url ? (
                    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
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
                          className="px-4 py-2 text-sm bg-white rounded-md shadow-sm hover:bg-gray-50"
                        >
                          <BookOpen className="inline w-4 h-4 mr-2" />
                          Open Full PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-800">
                      <FileText className="w-12 h-12 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm font-medium">
                        No PDF Available
                      </p>
                      <p className="mb-4 text-xs text-center text-gray-500">
                        This paper doesn't have a PDF file attached
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* <TabsContent value="references" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>References & Citations</CardTitle>
                  <CardDescription>
                    Key papers cited in this research
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">[{i}]</span> Smith, J.,
                          Johnson, A., et al. (2022). "Advances in Attention
                          Mechanisms for Computer Vision."{" "}
                          <span className="italic">
                            Conference on Computer Vision and Pattern
                            Recognition (CVPR)
                          </span>
                          , pp. 1234-1242.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">Cited by 128</Badge>
                          <Badge variant="outline">Impact Factor: 9.2</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Automated insights about this research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="mb-2 font-medium">Research Impact</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: getWidth("research") }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {paper?.research_impact.level}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {paper?.research_impact.significance}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="mb-2 font-medium">Novelty Assessment</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: getWidth("novelty") }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {paper?.novelty_assessment.level}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {paper?.novelty_assessment.comparison_to_prior_work}
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="mb-2 font-medium">Related Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {paper?.related_areas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* <div className="p-4 border rounded-lg">
                <h3 className="mb-2 font-medium">Suggested Follow-up Papers</h3>
                <ul className="space-y-2">
                  <li className="text-sm">
                    <Link href="#" className="text-primary hover:underline">
                      "Efficient Transformers: A Survey" (2023)
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="#" className="text-primary hover:underline">
                      "Memory-Efficient Training of Deep Networks" (2022)
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="#" className="text-primary hover:underline">
                      "Scaling Vision Transformers to Gigapixel Images" (2023)
                    </Link>
                  </li>
                </ul>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
