"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, CheckCircle, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  // Simulate logout process
  useEffect(() => {
    // In a real app, you would clear auth tokens, cookies, etc. here

    // Countdown to redirect
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to home after countdown
      router.push("/");
    }
  }, [countdown, router]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            You've Been Logged Out
          </CardTitle>
          <CardDescription className="text-center">
            Your session has ended successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  What happens when you log out?
                </p>
                <p className="text-sm text-muted-foreground">
                  Your session data is cleared from this device. Any unsaved
                  work may be lost. Your uploaded papers and analysis results
                  remain safe in your account.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/30">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Redirecting you shortly</p>
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to the home page in {countdown}{" "}
                  {countdown === 1 ? "second" : "seconds"}.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Log Back In
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="#" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
