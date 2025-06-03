"use client";
import Link from "next/link";
import type React from "react";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { SemanticSearch } from "@/components/semantic-search";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  FileUp,
  Search,
  Sparkles,
  FileText,
  Brain,
  Zap,
  Target,
  MessageSquare,
  TrendingUp,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const router = useRouter();
  const { sendRequest } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("upload");

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await sendRequest("/api/profile", "GET");
      if (response?.autoAnalyze !== undefined) {
        setAutoAnalyze(response.autoAnalyze);
      }
    } catch (error) {
      console.log("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sendRequest]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        if (validateFile(droppedFile)) {
          setFile(droppedFile);
          if (autoAnalyze) {
            handleFileUpload(droppedFile);
          }
        }
      }
    },
    [autoAnalyze]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        if (autoAnalyze) {
          handleFileUpload(selectedFile);
        }
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyzeClick = async () => {
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await sendRequest("/api/process", "POST", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push(`/paper/${response.data}`);
    } catch (error) {
      console.log("Upload failed:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const aiFeatures = [
    {
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      title: "AI-Powered Summaries",
      description:
        "Get intelligent abstracts using state-of-the-art language models",
      detail:
        "Powered by BART and transformer models for precise research summarization",
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      title: "Question Answering",
      description: "Ask specific questions about any research paper",
      detail: "Advanced Q&A system using RoBERTa for contextual understanding",
    },
    {
      icon: <Search className="w-6 h-6 text-green-600" />,
      title: "Semantic Search",
      description: "Find papers by meaning, not just keywords",
      detail: "Vector embeddings for intelligent content discovery",
    },
    {
      icon: <Tag className="w-6 h-6 text-orange-600" />,
      title: "Smart Classification",
      description: "Automatic research field and topic identification",
      detail: "Multi-label classification with confidence scoring",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-red-600" />,
      title: "Sentiment Analysis",
      description: "Analyze research tone and conclusions",
      detail: "RoBERTa-based sentiment analysis for research insights",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Key Entity Extraction",
      description: "Identify important terms and concepts automatically",
      detail: "Named entity recognition for research terminology",
    },
  ];

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12 mx-auto bg-gray-50 dark:bg-gray-900">
      <div className="space-y-6 text-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            AI Research Paper Analyzer
          </h1>
          <p className="max-w-[700px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Advanced AI-powered research analysis using Hugging Face
            transformers for intelligent paper processing
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Powered by Hugging Face
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-4xl"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
          <TabsTrigger value="search">Semantic Search</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <FileUp className="w-5 h-5" />
                Upload Research Paper
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Supported formats: PDF (max 10MB) • Enhanced with AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                    : file
                    ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                    : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/30"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <>
                    <FileText className="w-12 h-12 mb-4 text-green-600 dark:text-green-400" />
                    <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <Sparkles className="w-3 h-3" />
                      <span>Ready for AI analysis</span>
                    </div>
                  </>
                ) : (
                  <>
                    <FileUp className="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Drag and drop your file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      AI-enhanced processing with advanced insights
                    </p>
                  </>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf"
                  className="hidden"
                />

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleButtonClick}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
                  >
                    {file ? "Change File" : "Select PDF"}
                  </Button>
                  {file && !autoAnalyze && (
                    <Button
                      onClick={handleAnalyzeClick}
                      disabled={isUploading}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
                    >
                      {isUploading ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          AI Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enhanced with Hugging Face AI models
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <SemanticSearch />
        </TabsContent>
      </Tabs>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 gap-6 mt-16 md:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {aiFeatures.map((feature, index) => (
          <Card
            key={index}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-gray-100 dark:bg-gray-700">
                {feature.icon}
              </div>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {feature.description}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {feature.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technology Showcase */}
      <div className="mt-16 text-center max-w-4xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Powered by State-of-the-Art AI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="font-semibold text-blue-600">BART</div>
            <div className="text-gray-600 dark:text-gray-400">
              Summarization
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="font-semibold text-purple-600">RoBERTa</div>
            <div className="text-gray-600 dark:text-gray-400">
              Q&A & Sentiment
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="font-semibold text-green-600">Sentence-BERT</div>
            <div className="text-gray-600 dark:text-gray-400">Embeddings</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="font-semibold text-orange-600">BERT-NER</div>
            <div className="text-gray-600 dark:text-gray-400">
              Entity Extraction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
