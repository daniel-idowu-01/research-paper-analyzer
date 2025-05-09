"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Google } from "@/components/ui/google";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculatePasswordStrength } from "@/lib/helpers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Github, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [data, setData] = useState("");
  const [error, setError] = useState("");
  const { loading, sendRequest } = useApi();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password");
      return;
    }

    try {
      await sendRequest("/api/auth/signup", "POST", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setData("Account created successfully!");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      setError(error?.message || "Server error");
      return;
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

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

  const isFormIncomplete =
    Object.values(formData).some((value) => !value?.trim()) ||
    loading ||
    !agreedToTerms;

  return (
    <div className="container flex flex-col items-center justify-center px-4 py-18">
      <div className="flex items-center mb-5">
        <FileText className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold">Research Analyzer</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && (
            <Alert variant="success" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{data}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {formData.password && (
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

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-tight"
              >
                I agree to the
                <Link href="/terms-of-service" className=" hover:underline">
                  Terms of Service
                </Link>
                and
                <Link href="/privacy-policy" className=" hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isFormIncomplete}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Google />
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div> */}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
