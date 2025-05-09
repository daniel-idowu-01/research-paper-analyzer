"use client";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { usePathname, useRouter } from "next/navigation";
import { INotification } from "../../types/notification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BookOpen,
  FileText,
  History,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sendRequest } = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, clearUser } = useUserStore();
  const [notifications, setNotifications] = useState<INotification[] | null>(
    []
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await sendRequest("/api/auth/me", "GET");
        if (response.authenticated) {
          setUser(response.user);
          setNotifications(response.notifications || []);
        } else {
          clearUser();
        }
      } catch (error) {
        clearUser();
      }
    };

    checkAuth();
  }, []);

  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await sendRequest("/api/auth/logout", "GET");
    clearUser();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-gray-200 dark:border-gray-700">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[240px] sm:w-[300px] bg-white dark:bg-gray-800"
            >
              <nav className="flex flex-col gap-4 mt-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Research Analyzer</span>
                </Link>
                <Link
                  href="/demo"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Demo Paper</span>
                </Link>
                <Link
                  href="/my-papers"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  <History className="w-4 h-4" />
                  <span>My Papers</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <FileText className="hidden w-5 h-5 text-blue-600 dark:text-blue-400 sm:inline-block" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Research Analyzer
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 dark:bg-blue-700 text-white">
                      {notifications?.length}
                    </Badge>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[300px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuLabel className="text-gray-900 dark:text-white">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      notifications?.map((notification, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.createdAt.toString()}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 p-2">
                        No new notifications
                      </p>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuLabel className="text-gray-900 dark:text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      onClick={() => router.push("/profile")}
                    >
                      <User className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      onClick={() => router.push("/my-papers")}
                    >
                      <FileText className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>My Papers</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 focus:text-red-600 dark:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
