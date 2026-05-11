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
    <div className="min-h-screen text-slate-950">
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-10 bg-slate-50">
        <section className="relative flex flex-1 flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 top-0 h-[360px]" />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
              AI-powered paper analysis
            </span>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Turn research papers into clear insights.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Upload a PDF and get summaries, findings, related topics, and structured analysis.
            </p>
          </div>

          <div className="relative z-10 w-full max-w-3xl">
            <Card className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_80px_-50px_rgba(15,23,42,0.2)] transition-all duration-200">
              <div className="px-8 py-8 sm:px-10 sm:py-10">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                      Upload a PDF
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      Analyze papers instantly.
                    </h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    PDF only · up to 10MB
                  </div>
                </div>

                <div className="mt-10">
                  <div
                    className={`group relative flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border p-10 text-center transition-all duration-200 ${
                      isDragging
                        ? "border-blue-300 bg-blue-50 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)]"
                        : file
                        ? "border-slate-300 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <>
                        <FileText className="mb-4 h-14 w-14 text-slate-700" />
                        <p className="mb-1 text-base font-semibold text-slate-950">{file.name}</p>
                        <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <FileUp className="mb-4 h-14 w-14 text-slate-500" />
                        <p className="mb-2 text-base font-semibold text-slate-950">Drop your PDF here or click to browse.</p>
                        <p className="max-w-sm text-sm leading-7 text-slate-500">
                          The upload experience is the product — no clutter, no distractions.
                        </p>
                      </>
                    )}

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                      <Button
                        onClick={handleButtonClick}
                        disabled={isUploading}
                        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {file ? "Choose another PDF" : "Select PDF"}
                      </Button>
                      {file && !autoAnalyze && (
                        <Button
                          onClick={handleAnalyzeClick}
                          disabled={isUploading}
                          variant="outline"
                          className="rounded-full border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          {isUploading ? "Analyzing…" : "Analyze now"}
                        </Button>
                      )}
                    </div>

                    {isUploading && (
                      <div className="mt-8 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left">
                        <p className="mb-2 text-sm text-slate-600">Uploading and analyzing your paper…</p>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full w-full animate-pulse rounded-full bg-blue-500/70" />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-8 inline-flex items-center rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto flex max-w-4xl justify-center">
            <div className="absolute inset-x-4 top-0 -z-10 h-24 rounded-[32px] bg-slate-100/80" />
            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              <Card className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm gap-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-950">Smart summaries</CardTitle>
                <CardContent className="px-0">
                  <p className="mt-2 text-sm leading-6 text-slate-600">Focus on the paper’s core contributions fast.</p>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm gap-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-blue-600">
                  <Search className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-950">Fast triage</CardTitle>
                <CardContent className="px-0">
                  <p className="mt-2 text-sm leading-6 text-slate-600">Decide whether a paper deserves deeper reading.</p>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm gap-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-950">Organized insights</CardTitle>
                <CardContent className="px-0">
                  <p className="mt-2 text-sm leading-6 text-slate-600">Build a clean library of analyzed papers.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
