"use client";
import Link from "next/link";
import { IPaper } from "../../../types";
import { useApi } from "@/hooks/use-api";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function MyPapersPage() {
  const router = useRouter();
  const { sendRequest } = useApi();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<IPaper[]>([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await sendRequest("/api/papers", "GET");
        if (response.success) {
          setPapers(response.papers);
        } else {
          setError(response.error);
        }
      } catch (error: any) {
        setError(
          error.message || "Failed to fetch papers. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [sendRequest]);

  // Filter papers based on search query
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.metadata.authors.map((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      paper.summary.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // handle download
  const handleDownload = (paper: IPaper) => {
    if (!paper.file_url) return;

    const link = document.createElement("a");
    link.href = paper.file_url;
    link.download = `${paper.metadata.title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container px-4 py-10">
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
          {filteredPapers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPapers.map((paper) => (
                <Card key={paper.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <section></section>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <BookOpen className="w-4 h-4 mr-2" />
                            <Link href={`/paper/${paper._id}`}>
                              View Analysis
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(paper)}
                          >
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
                    <CardTitle className="line-clamp-2">
                      {paper.metadata.title}
                    </CardTitle>
                    {paper.metadata.authors.length > 0 && (
                      <CardDescription className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {paper.metadata.authors.join(", ")}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {paper.metadata.published_date}
                    </div>
                    <p className="mt-2 text-sm line-clamp-3">{paper.summary}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {paper.metadata.topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/paper/${paper._id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        <Sparkles className="w-4 h-4 mr-2" />
                        View Analysis
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground mt-20">
                No papers analyzed
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {filteredPapers.length > 0 ? (
            <div className="space-y-4">
              {filteredPapers.map((paper) => (
                <Card key={paper.id}>
                  <div className="flex flex-col p-6 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          {paper.metadata.published_date}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">
                        {paper.metadata.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {paper.metadata.authors.join(", ")}
                      </p>
                      {/* <p className="mb-2 text-sm text-muted-foreground">
                      {paper.authors}
                    </p> */}
                      <p className="mb-3 text-sm">{paper.summary}</p>
                      <div className="flex flex-wrap gap-1">
                        {paper.metadata.topics.map((topic) => (
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
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analysis
                          </>
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
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
          ) : (
            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground mt-20">
                No papers analyzed
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
