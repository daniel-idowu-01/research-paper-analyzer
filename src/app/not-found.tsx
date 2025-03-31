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
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-primary/10">
          <FileQuestion className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404</h1>
        <h2 className="mt-2 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-4 max-w-[500px] text-muted-foreground">
          We couldn't find the page you're looking for. The page might have been
          moved, deleted, or perhaps the URL was mistyped.
        </p>
      </div>

      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Looking for something?</CardTitle>
          <CardDescription>
            Search our site to find what you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              type="search"
              placeholder="Search papers, topics, or features..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/my-papers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              My Papers
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 max-w-3xl w-full">
        <Link href="/" className="group">
          <div className="p-4 border rounded-lg transition-all hover:bg-muted/50 hover:border-primary/20">
            <h3 className="mb-2 text-lg font-medium">Upload Paper</h3>
            <p className="text-sm text-muted-foreground">
              Upload a new research paper for AI analysis
            </p>
          </div>
        </Link>
        <Link href="/demo" className="group">
          <div className="p-4 border rounded-lg transition-all hover:bg-muted/50 hover:border-primary/20">
            <h3 className="mb-2 text-lg font-medium">Demo Paper</h3>
            <p className="text-sm text-muted-foreground">
              See how our AI analyzes research papers
            </p>
          </div>
        </Link>
        <Link href="/settings" className="group">
          <div className="p-4 border rounded-lg transition-all hover:bg-muted/50 hover:border-primary/20">
            <h3 className="mb-2 text-lg font-medium">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure your account and preferences
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
