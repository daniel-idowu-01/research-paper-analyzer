"use client";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FileText, Sun, Moon } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { sendRequest } = useApi();
  const { user, setUser, clearUser } = useUserStore();
  const { theme, setTheme } = useTheme();
  const isAuthenticated = Boolean(user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await sendRequest("/api/auth/me", "GET");
        if (response.authenticated) {
          setUser(response.user);
        } else {
          clearUser();
        }
      } catch (error) {
        clearUser();
      }
    };

    checkAuth();
  }, [clearUser, sendRequest, setUser]);

  const handleLogout = async () => {
    await sendRequest("/api/auth/logout", "GET");
    clearUser();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl shadow-[0_20px_80px_-42px_rgba(0,0,0,0.45)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-base font-semibold text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          <span>Research Analyzer</span>
        </Link>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <Link href="/my-papers">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm">
                  My Papers
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="px-3 py-2 text-sm">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary/90">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
