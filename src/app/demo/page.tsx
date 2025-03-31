"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
//import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Search,
  Share2,
} from "lucide-react";
import Link from "next/link";

interface Paper {
  title: string;
  authors: string[];
  publishedDate: string;
  topics: string[];
  summary: string;
  keyFindings: {
    primary: string;
    methodology: string;
    applications: string;
  };
  performanceMetrics: {
    model: string;
    accuracy: string;
    parameters: string;
    trainingTime: string;
  }[];
  references: {
    id: number;
    citation: string;
    citedBy: number;
    impactFactor: number;
  }[];
}

const paperData: Paper = {
  title: "Advances in Neural Information Processing Systems",
  authors: ["J. Smith", "A. Johnson", "M. Williams"],
  publishedDate: "June 2023",
  topics: ["Machine Learning", "Neural Networks", "Deep Learning"],
  summary:
    "This paper introduces a novel approach to neural network architecture...",
  keyFindings: {
    primary: "The proposed attention mechanism achieves 93.7% accuracy...",
    methodology:
      "Novel sparse attention patterns reduce quadratic complexity...",
    applications:
      "The method enables deployment on resource-constrained devices...",
  },
  performanceMetrics: [
    {
      model: "Proposed Method",
      accuracy: "93.7%",
      parameters: "45M",
      trainingTime: "18 hours",
    },
    {
      model: "Previous SOTA",
      accuracy: "92.3%",
      parameters: "62M",
      trainingTime: "28 hours",
    },
    {
      model: "Baseline",
      accuracy: "89.1%",
      parameters: "38M",
      trainingTime: "15 hours",
    },
  ],
  references: [
    {
      id: 1,
      citation:
        'Smith, J., Johnson, A., et al. (2022). "Advances in Attention Mechanisms for Computer Vision."',
      citedBy: 128,
      impactFactor: 9.2,
    },
    // ... other references
  ],
};

const PaperDetailsCard = ({ paper }: { paper: Paper }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle>Paper Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-medium">Title</h3>
        <p className="text-sm text-gray-500">{paper.title}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium">Authors</h3>
        <p className="text-sm text-gray-500">{paper.authors.join(", ")}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium">Published</h3>
        <p className="text-sm text-gray-500">{paper.publishedDate}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {paper.topics.map((topic) => (
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

export default function DemoPage() {
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
    () => <PaperDetailsCard paper={paperData} />,
    []
  );

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

        {/* Main Content - Rest of your tabs content remains similar but would also benefit from component extraction */}
        {/* ... */}
        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="preview">Paper Preview</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
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
                  <p>
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
                  </p>
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
                    <p className="text-sm">
                      The proposed attention mechanism achieves 93.7% accuracy
                      on ImageNet while using 28% fewer parameters than previous
                      state-of-the-art models.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 font-medium">
                        Methodology Innovation
                      </h3>
                      <p className="text-sm">
                        Novel sparse attention patterns reduce quadratic
                        complexity to linear while preserving long-range
                        dependencies.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="mb-2 font-medium">
                        Practical Applications
                      </h3>
                      <p className="text-sm">
                        The method enables deployment on resource-constrained
                        devices like mobile phones and edge devices.
                      </p>
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
                          <td className="px-6 py-4">93.7%</td>
                          <td className="px-6 py-4">45M</td>
                          <td className="px-6 py-4">18 hours</td>
                        </tr>
                        <tr className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 font-medium">
                            Previous SOTA
                          </td>
                          <td className="px-6 py-4">92.3%</td>
                          <td className="px-6 py-4">62M</td>
                          <td className="px-6 py-4">28 hours</td>
                        </tr>
                        <tr className="bg-white dark:bg-gray-900">
                          <td className="px-6 py-4 font-medium">Baseline</td>
                          <td className="px-6 py-4">89.1%</td>
                          <td className="px-6 py-4">38M</td>
                          <td className="px-6 py-4">15 hours</td>
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
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-800">
                    <FileText className="w-12 h-12 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm font-medium">PDF Preview</p>
                    <p className="mb-4 text-xs text-center text-gray-500">
                      This is where the PDF preview would be displayed. The
                      actual implementation would render the first few pages of
                      the document.
                    </p>
                    <Button>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Open Full Paper
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="references" className="mt-4">
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
            </TabsContent>
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
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">High</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This paper is likely to have significant impact based on
                    methodology innovation and performance improvements.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="mb-2 font-medium">Novelty Assessment</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">Medium-High</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Builds on existing attention mechanisms but introduces
                    significant innovations in architecture.
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="mb-2 font-medium">Related Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Computer Vision</Badge>
                  <Badge>Attention Mechanisms</Badge>
                  <Badge>Neural Networks</Badge>
                  <Badge>Model Optimization</Badge>
                  <Badge>Deep Learning</Badge>
                  <Badge>Efficient Computing</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
