"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { calculatePasswordStrength } from "@/lib/helpers";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenChecking, setIsTokenChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  // Simulate token validation
  useEffect(() => {
    const validateToken = async () => {
      // In a real app, you would make an API call to validate the token
      // For this demo, we'll simulate token validation
      setIsTokenChecking(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For demo purposes, consider the token valid if it exists and has some length
        if (token && token.length > 10) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setError(
            "Invalid or expired password reset link. Please request a new one."
          );
        }
      } catch (err) {
        setIsTokenValid(false);
        setError(
          "An error occurred while validating your reset link. Please try again."
        );
      } finally {
        setIsTokenChecking(false);
      }
    };

    validateToken();
  }, [token]);

  const passwordStrength = calculatePasswordStrength(password);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For this demo, we'll simulate a password reset process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (err) {
      // Handle reset error
      setError(
        "An error occurred while resetting your password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (isTokenChecking) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="flex items-center mb-8">
          <FileText className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold">Research Analyzer</h1>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Verifying your link
            </CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              This will only take a moment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if token is invalid
  if (isTokenValid === false) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="flex items-center mb-8">
          <FileText className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold">Research Analyzer</h1>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center text-sm text-muted-foreground">
              <p>Please request a new password reset link.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth/forgot-password">Request New Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show success state after password reset
  if (isSuccess) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="flex items-center mb-8">
          <FileText className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold">Research Analyzer</h1>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              You can now log in with your new password.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show the password reset form
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="flex items-center mb-8">
        <FileText className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold">Research Analyzer</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <LockKeyhole className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Progress
                      value={passwordStrength}
                      className={getPasswordStrengthColor()}
                    />
                    <span className="ml-2 text-xs">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with a mix of uppercase, lowercase, and
                    numbers
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
