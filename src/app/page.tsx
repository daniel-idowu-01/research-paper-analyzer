"use client";
import Link from "next/link";
import type React from "react";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";
import { FileUp, Search, Sparkles, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { sendRequest } = useApi();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

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
    // Check file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return false;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        handleFileUpload(droppedFile);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        handleFileUpload(selectedFile);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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

      // After successful "upload", redirect to the demo page
      // router.push("/demo");
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12 mx-auto">
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Research Paper Analyzer
          </h1>
          <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Upload your research papers and get AI-powered insights, summaries,
            and topic classification.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-3xl mt-12">
        <CardHeader>
          <CardTitle>Upload Research Paper</CardTitle>
          <CardDescription>Supported formats: PDF (max 10MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : file
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-200 dark:border-gray-800"
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <>
                <FileText className="w-12 h-12 mb-4 text-green-500" />
                <p className="mb-2 text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <FileUp className="w-12 h-12 mb-4 text-gray-500" />
                <p className="mb-2 text-sm font-medium">
                  Drag and drop your file here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Your document will be processed securely
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

            <Button
              className="mt-4"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              {isUploading
                ? "Uploading..."
                : file
                ? "Change File"
                : "Select PDF"}
            </Button>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Recent papers will appear in your history
          </p>
          <Link href="/demo">
            <Button variant="outline">View Demo</Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 gap-6 mt-16 md:grid-cols-3 max-w-3xl w-full">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Summaries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Get concise summaries of key findings, methodology, and
              conclusions.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary/10">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Smart Search</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Search across all your papers with semantic understanding of
              concepts.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-primary"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 13v-1h6v1" />
                <path d="M11 18.5a1.5 1.5 0 0 0 2 0V17H11v1.5Z" />
                <path d="M12 12v5" />
              </svg>
            </div>
            <CardTitle className="text-lg">Topic Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Automatically categorize papers by research field and key topics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
