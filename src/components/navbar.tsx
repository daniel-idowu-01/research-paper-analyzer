"use client";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { sendRequest } = useApi();
  const { user, setUser, clearUser } = useUserStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await sendRequest("/api/auth/me", "GET");
        if (response.authenticated) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          clearUser();
          setIsAuthenticated(false);
        }
      } catch (error) {
        clearUser();
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [clearUser, sendRequest, setUser]);

  const handleLogout = async () => {
    await sendRequest("/api/auth/logout", "GET");
    clearUser();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <FileText className="h-5 w-5 text-blue-600" />
          Research Analyzer
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/my-papers">
                <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 px-3 py-2 text-sm">
                  My Papers
                </Button>
              </Link>
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-2 text-sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 px-3 py-2 text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
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
