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
  const isAuthenticated = Boolean(user);

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
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl shadow-[0_20px_80px_-42px_rgba(0,0,0,0.45)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-base font-semibold text-slate-100">
          <FileText className="h-5 w-5 text-cyan-300" />
          <span className="text-slate-100">Research Analyzer</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/my-papers">
                <Button variant="ghost" className="text-cyan-100 hover:bg-cyan-300/15 px-3 py-2 text-sm">
                  My Papers
                </Button>
              </Link>
              <Button variant="outline" className="border-cyan-300/50 text-cyan-100 hover:bg-cyan-300/15 px-3 py-2 text-sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-cyan-100 hover:bg-cyan-300/15 px-3 py-2 text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/15 hover:bg-cyan-200">
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
