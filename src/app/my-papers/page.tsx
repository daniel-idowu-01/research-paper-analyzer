"use client";
import Link from "next/link";
import { IPaper } from "../../../types";
import { useApi } from "@/hooks/use-api";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [papersPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPapers, setTotalPapers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<IPaper[]>([]);

  const fetchPapers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      let url = `/api/papers?page=${page}&limit=${papersPerPage}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await sendRequest(url, "GET");
      if (response.success) {
        setPapers(response.papers);
        setTotalPapers(response.total);
        setCurrentPage(page);
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

  useEffect(() => {
    fetchPapers(1);
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

  // handle paper sharing
  const handleShare = async (paper: IPaper) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: paper.metadata.title,
          text: `Check out this paper: ${paper.metadata.title}`,
          url: `${window.location.origin}/papers/${paper.id}`,
        });
        return;
      } catch (err) {
        console.log("Share canceled:", err);
      }
    }
  };

  // handle delete paper
  const handleDelete = async (paper: IPaper) => {
    try {
      const response = await sendRequest(`/api/papers/${paper._id}`, "DELETE");
      if (response.success) {
        setPapers((prevPapers) =>
          prevPapers.filter((p) => p._id !== paper._id)
        );
      } else {
        setError(response.error);
      }
    } catch (error: any) {
      setError(
        error.message || "Failed to delete paper. Please try again later."
      );
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container px-4 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Papers
        </h1>
        <Button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New Paper
        </Button>
      </div>

      <div className="flex flex-col gap-4 mt-6 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            className="pl-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchPapers(1, e.target.value);
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="grid" className="mt-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
            >
              Grid View
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
            >
              List View
            </TabsTrigger>
          </TabsList>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * papersPerPage + 1} to{" "}
            {Math.min(currentPage * papersPerPage, totalPapers)} of{" "}
            {totalPapers} papers
          </p>
        </div>

        <TabsContent value="grid" className="mt-6">
          {filteredPapers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPapers.map((paper) => (
                <Card
                  key={paper.id}
                  className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <section></section>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="-mr-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                          <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <BookOpen className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <Link
                              href={`/paper/${paper._id}`}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              View Analysis
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(paper)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Download
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare(paper)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share2 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Share
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(paper)}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="line-clamp-2 text-gray-900 dark:text-white">
                      {paper.metadata.title}
                    </CardTitle>
                    {paper.metadata.authors.length > 0 && (
                      <CardDescription className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {paper.metadata.authors.join(", ")}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {paper.metadata.published_date}
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {paper.summary}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {paper.metadata.topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="text-xs bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/paper/${paper._id}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                        View Analysis
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-20">
                No papers analyzed
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {filteredPapers.length > 0 ? (
            <div className="space-y-4">
              {filteredPapers.map((paper) => (
                <Card
                  key={paper.id}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col p-6 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          {paper.metadata.published_date}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {paper.metadata.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {paper.metadata.authors.join(", ")}
                      </p>
                      <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                        {paper.summary}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {paper.metadata.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="text-xs bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 mt-4 sm:flex-col sm:mt-0">
                      <Link href={`/paper/${paper._id}`}>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analysis
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => handleDownload(paper)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Download
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare(paper)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share2 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Share
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-20">
                No papers analyzed
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* pagination */}
      {filteredPapers.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div></div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => fetchPapers(currentPage - 1)}
              className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage * papersPerPage >= totalPapers}
              onClick={() => fetchPapers(currentPage + 1)}
              className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
