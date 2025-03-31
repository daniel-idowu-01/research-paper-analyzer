"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample paper data
const papers = [
  {
    id: 1,
    title: "Advances in Neural Information Processing Systems",
    authors: "J. Smith, A. Johnson, M. Williams",
    date: "June 2023",
    topics: ["Machine Learning", "Neural Networks", "Deep Learning"],
    status: "Analyzed",
    summary:
      "This paper introduces a novel approach to neural network architecture that significantly improves performance on image recognition tasks.",
  },
  {
    id: 2,
    title: "Efficient Transformers: A Survey",
    authors: "L. Chen, R. Garcia",
    date: "May 2023",
    topics: ["Transformers", "Efficiency", "NLP"],
    status: "Analyzed",
    summary:
      "A comprehensive survey of methods to improve the efficiency of transformer models for various applications.",
  },
  {
    id: 3,
    title: "Memory-Efficient Training of Deep Networks",
    authors: "K. Zhang, T. Wilson",
    date: "April 2023",
    topics: ["Deep Learning", "Memory Optimization"],
    status: "Uploaded",
    summary:
      "This paper proposes novel techniques for reducing memory usage during the training of deep neural networks.",
  },
  {
    id: 4,
    title: "Scaling Vision Transformers to Gigapixel Images",
    authors: "M. Brown, S. Davis",
    date: "March 2023",
    topics: ["Vision Transformers", "Image Processing"],
    status: "Analyzed",
    summary:
      "A method for applying transformer models to extremely high-resolution images without quadratic complexity.",
  },
  {
    id: 5,
    title: "Reinforcement Learning for Robotic Control",
    authors: "A. Martinez, J. Lee",
    date: "February 2023",
    topics: ["Reinforcement Learning", "Robotics"],
    status: "Uploaded",
    summary:
      "This research explores the application of reinforcement learning algorithms to robotic control systems.",
  },
];

export default function MyPapersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const router = useRouter();

  // Filter papers based on search query, status, and topic
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus
      ? paper.status === selectedStatus
      : true;

    const matchesTopic = selectedTopic
      ? paper.topics.some(
          (topic) => topic.toLowerCase() === selectedTopic.toLowerCase()
        )
      : true;

    return matchesSearch && matchesStatus && matchesTopic;
  });

  // Get all unique topics from papers
  const allTopics = Array.from(
    new Set(papers.flatMap((paper) => paper.topics))
  );

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Papers</h1>
        <Button onClick={() => router.push("/")}>
          <Upload className="w-4 h-4 mr-2" />
          Upload New Paper
        </Button>
      </div>

      <div className="flex flex-col gap-4 mt-6 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            className="pl-8"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Status
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedStatus(null)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Analyzed")}>
              Analyzed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Uploaded")}>
              Uploaded
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Topic
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedTopic(null)}>
              All Topics
            </DropdownMenuItem>
            {allTopics.map((topic) => (
              <DropdownMenuItem
                key={topic}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="grid" className="mt-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground">
            Showing {filteredPapers.length} of {papers.length} papers
          </p>
        </div>

        <TabsContent value="grid" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper) => (
              <Card key={paper.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <Badge
                      variant={
                        paper.status === "Analyzed" ? "default" : "secondary"
                      }
                    >
                      {paper.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Analysis
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="line-clamp-2">{paper.title}</CardTitle>
                  <CardDescription>{paper.authors}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {paper.date}
                  </div>
                  <p className="mt-2 text-sm line-clamp-3">{paper.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {paper.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/demo" className="w-full">
                    <Button variant="outline" className="w-full">
                      {paper.status === "Analyzed" ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          View Analysis
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          View Paper
                        </>
                      )}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <Card key={paper.id}>
                <div className="flex flex-col p-6 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          paper.status === "Analyzed" ? "default" : "secondary"
                        }
                      >
                        {paper.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {paper.date}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">
                      {paper.title}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {paper.authors}
                    </p>
                    <p className="mb-3 text-sm">{paper.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {paper.topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 mt-4 sm:flex-col sm:mt-0">
                    <Link href="/demo">
                      <Button variant="default" size="sm" className="w-full">
                        {paper.status === "Analyzed" ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analysis
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </>
                        )}
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
