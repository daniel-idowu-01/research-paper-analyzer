"use client";
import Link from "next/link";
import type React from "react";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { FileUp, Search, Sparkles, FileText, ShieldCheck } from "lucide-react";
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
  const [autoAnalyze, setAutoAnalyze] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await sendRequest("/api/profile", "GET");
      if (response?.autoAnalyze !== undefined) {
        setAutoAnalyze(response.autoAnalyze);
      }
    } catch (error) {
      console.log("Failed to fetch profile:", error);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_45%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_50%,_#020617_100%)]">
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/60 dark:bg-slate-900/60 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              AI research companion for fast paper digestion
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
                Turn dense PDFs into usable research insight.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                Upload a research paper and get a structured summary, key findings,
                novelty assessment, related topics, and a clean analysis page you
                can return to later.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
                PDF upload up to 10MB
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
                Metadata + summary extraction
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
                Personal paper history
              </div>
            </div>
          </div>

          <Card className="w-full border-slate-200 bg-white/90 shadow-xl shadow-blue-100/40 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-950 dark:text-white">
                Upload Research Paper
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Drag a PDF here or choose one from your computer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : file
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <>
                    <FileText className="mb-4 h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                    <p className="mb-1 text-base font-medium text-slate-950 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <FileUp className="mb-4 h-12 w-12 text-slate-500 dark:text-slate-400" />
                    <p className="mb-2 text-base font-medium text-slate-950 dark:text-white">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                      We extract structure and generate an analysis page for the paper.
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

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handleButtonClick}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {file ? "Choose Another File" : "Select PDF"}
                  </Button>
                  {file && !autoAnalyze && (
                    <Button
                      onClick={handleAnalyzeClick}
                      disabled={isUploading}
                      variant="outline"
                      className="border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      {isUploading ? "Analyzing..." : "Analyze Now"}
                    </Button>
                  )}
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Auto-analysis follows your saved preference.</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Secure upload flow
              </div>
            </CardFooter>
          </Card>
        </section>

        <div className="mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70">
            <CardHeader className="space-y-1">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/40">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg text-slate-950 dark:text-white">
                AI Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Distill the paper into a readable overview of purpose, method,
                findings, and implications.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70">
            <CardHeader className="space-y-1">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40">
                <Search className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg text-slate-950 dark:text-white">
                Fast Triage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Quickly judge whether a paper is worth deeper reading with novelty
                and impact signals.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70">
            <CardHeader className="space-y-1">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg text-slate-950 dark:text-white">
                Reusable Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Keep analyzed papers in one place so you can revisit them from your
                profile and history views.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
