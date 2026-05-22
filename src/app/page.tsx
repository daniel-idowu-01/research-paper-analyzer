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
    <div className="min-h-screen overflow-hidden text-slate-100">
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative flex flex-1 flex-col items-center justify-center gap-12 pt-8 pb-16 text-center">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-amber-400/12 blur-3xl" />
          <div className="absolute inset-x-0 top-20 -z-10 h-[420px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),transparent_60%)]" />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6">
            <span className="inline-flex rounded-full border border-cyan-400/25 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 shadow-[0_10px_30px_-20px_rgba(96,228,215,0.7)]">
              AI-powered research synthesis
            </span>
            <h1 className="text-5xl font-semibold leading-tight tracking-[-0.04em] text-slate-50 sm:text-6xl">
              Transform papers into lucid, actionable insight.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Upload a PDF and unlock concise summaries, evidence maps, and topic-driven analysis without the usual overwhelm.
            </p>
          </div>

          <div className="relative z-10 w-full max-w-3xl">
            <Card className="glass-panel glass-highlight overflow-hidden rounded-[32px] border border-white/10 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden px-8 py-8 sm:px-10 sm:py-10">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div className=" text-start">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                      Upload a PDF
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                      Analyze papers instantly.
                    </h2>
                  </div>
                  <div className="self-start rounded-full bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 ring-1 ring-cyan-500/15">
                    PDF only · up to 10MB
                  </div>
                </div>

                <div className="mt-10">
                  <div
                    className={`group relative flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/95 p-10 text-center shadow-[0_40px_120px_-64px_rgba(0,0,0,0.65)] transition-all duration-200 ${
                      isDragging
                        ? "border-cyan-300/40 bg-slate-900/95 shadow-[0_25px_90px_-45px_rgba(96,228,215,0.35)]"
                        : file
                        ? "border-slate-700 bg-slate-950"
                        : "border-white/10 bg-slate-950/85 hover:border-cyan-300/30 hover:bg-slate-900"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <>
                        <FileText className="mb-4 h-14 w-14 text-cyan-300" />
                        <p className="mb-1 text-base font-semibold text-slate-50">{file.name}</p>
                        <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <FileUp className="mb-4 h-14 w-14 text-slate-400" />
                        <p className="mb-2 text-base font-semibold text-slate-50">Drop your PDF here or click to browse.</p>
                        <p className="max-w-sm text-sm leading-7 text-slate-400">
                          The upload experience is the product — minimal, confident, and polished.
                        </p>
                      </>
                    )}

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                      <Button
                        onClick={handleButtonClick}
                        disabled={isUploading}
                        className="rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-amber-200"
                      >
                        {file ? "Choose another PDF" : "Select PDF"}
                      </Button>
                      {file && !autoAnalyze && (
                        <Button
                          onClick={handleAnalyzeClick}
                          disabled={isUploading}
                          variant="outline"
                          className="rounded-full border border-white/10 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-800"
                        >
                          {isUploading ? "Analyzing…" : "Analyze now"}
                        </Button>
                      )}
                    </div>

                    {isUploading && (
                      <div className="mt-8 w-full rounded-3xl border border-white/10 bg-slate-900/90 p-4 text-left">
                        <p className="mb-2 text-sm text-slate-400">Uploading and analyzing your paper…</p>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400" />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-8 inline-flex items-center rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto flex max-w-4xl justify-center">
            <div className="absolute inset-x-4 top-0 -z-10 h-24 rounded-[32px] bg-slate-900/70 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.6)]" />
            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_25px_80px_-55px_rgba(0,0,0,0.45)] gap-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-50">Smart summaries</CardTitle>
                <CardContent className="px-0">
                  <p className="mt-2 text-sm leading-6 text-slate-400">Focus on the paper’s core contributions fast.</p>
                </CardContent>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_25px_80px_-55px_rgba(0,0,0,0.45)] gap-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                  <Search className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-50">Fast triage</CardTitle>
                <CardContent className="px-0">
                  <p className="mt-2 text-sm leading-6 text-slate-400">Decide whether a paper deserves deeper reading.</p>
                </CardContent>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_25px_80px_-55px_rgba(0,0,0,0.45)] gap-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-50">Organized insights</CardTitle>
                <CardContent className="px-0">
                  <p className="mt-2 text-sm leading-6 text-slate-400">Build a clean library of analyzed papers.</p>
                </CardContent>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
