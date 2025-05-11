"use client";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, FileText, Loader2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email) {
      toast({
        title: "Empty Fields",
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you would make an API call to send a reset email
      // For this demo, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful submission
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center mb-8">
        <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Research Analyzer
        </h1>
      </div>

      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            {isSubmitted
              ? "Check your email for a reset link"
              : "Enter your email address and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmitted ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {email}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If you don't see the email, check your spam folder or try
                  again with a different email address.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/login"
            className="flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
