"use client";
import { useTheme } from "next-themes";
import Spinner from "@/components/spinner";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useUserStore } from "@/stores/user-store";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, Moon, Sun, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const { updateSettings, isUpdating, fetchSettings, settings, user } =
    useSettings();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchSettings();
      } catch (error) {
        console.log("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Notification change handler
  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = {
      ...settings.notifications,
      [key]: value,
    };
    await updateSettings("notifications", updatedNotifications);
  };

  // Preference change handler
  const handlePreferenceChange = async (key: string, value: any) => {
    const updatedPreferences = {
      ...settings.preferences,
      [key]: value,
    };
    await updateSettings("preferences", updatedPreferences);
  };

  // Theme change handler
  const handleThemeChange = async (newTheme: string) => {
    await updateSettings("appearance", {
      ...settings.appearance,
      theme: newTheme,
    });
    setTheme(newTheme);
  };

  // Language change handler
  const handleLanguageChange = async (language: string) => {
    await updateSettings("appearance", { ...settings.appearance, language });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container px-4 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-700"
          >
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-700"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-700"
          >
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Appearance
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Theme
                </Label>
                <div className="flex gap-4">
                  <Button
                    variant={
                      settings.appearance.theme === "light"
                        ? "default"
                        : "outline"
                    }
                    className={`flex-1 justify-start ${
                      settings.appearance.theme === "light"
                        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        : "border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleThemeChange("light")}
                    disabled={isUpdating}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    <span className="text-white">Light</span>
                  </Button>
                  <Button
                    variant={
                      settings.appearance.theme === "dark"
                        ? "default"
                        : "outline"
                    }
                    className={`flex-1 justify-start ${
                      settings.appearance.theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                        : "border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleThemeChange("dark")}
                    disabled={isUpdating}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    <span className="text-gray-900 dark:text-white">Dark</span>
                  </Button>
                  <Button
                    variant={
                      settings.appearance.theme === "system"
                        ? "default"
                        : "outline"
                    }
                    className={`flex-1 justify-start ${
                      settings.appearance.theme === "system"
                        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                        : "border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleThemeChange("system")}
                    disabled={isUpdating}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mr-2"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    <span className="text-gray-900 dark:text-white">
                      System
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Language
                </Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={handleLanguageChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem
                      value="en"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      English
                    </SelectItem>
                    <SelectItem
                      value="es"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Spanish
                    </SelectItem>
                    <SelectItem
                      value="fr"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      French
                    </SelectItem>
                    <SelectItem
                      value="de"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      German
                    </SelectItem>
                    <SelectItem
                      value="zh"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Chinese
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Paper Analysis
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configure how papers are analyzed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="auto-analyze"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Auto-analyze uploaded papers
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically analyze papers when they are uploaded
                  </p>
                </div>
                <Switch
                  id="auto-analyze"
                  checked={settings.preferences.autoAnalyze}
                  onCheckedChange={(val) =>
                    handlePreferenceChange("autoAnalyze", val)
                  }
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="similar-papers"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Find similar papers
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Suggest similar papers based on content analysis
                  </p>
                </div>
                <Switch
                  id="similar-papers"
                  checked={settings.preferences.findSimilar}
                  onCheckedChange={(val) =>
                    handlePreferenceChange("findSimilar", val)
                  }
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="citation-format"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Default citation format
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose your preferred citation style
                  </p>
                </div>
                <Select
                  value={settings.preferences.citationFormat}
                  onValueChange={(val) =>
                    handlePreferenceChange("citationFormat", val)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem
                      value="apa"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      APA
                    </SelectItem>
                    <SelectItem
                      value="mla"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      MLA
                    </SelectItem>
                    <SelectItem
                      value="chicago"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Chicago
                    </SelectItem>
                    <SelectItem
                      value="harvard"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Harvard
                    </SelectItem>
                    <SelectItem
                      value="ieee"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      IEEE
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Choose what you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Content Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Paper Analysis Complete
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when your paper analysis is complete
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.paperAnalysis}
                      onCheckedChange={(val) =>
                        handleNotificationChange("paperAnalysis", val)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Similar Papers Found
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when we find papers similar to yours
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.similarPapers}
                      onCheckedChange={(val) =>
                        handleNotificationChange("similarPapers", val)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  System Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 dark:text-gray-300">
                        New Features
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified about new features and improvements
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.newFeatures}
                      onCheckedChange={(val) =>
                        handleNotificationChange("newFeatures", val)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Marketing
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive marketing emails and promotions
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketing}
                      onCheckedChange={(val) =>
                        handleNotificationChange("marketing", val)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notification Channels
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(val) =>
                        handleNotificationChange("email", val)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Browser
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive browser notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.browser}
                      onCheckedChange={(val) =>
                        handleNotificationChange("browser", val)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Account Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Account Type
                  </Label>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {user?.accountType}
                    </p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Member Since
                </Label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.createdAt}
                </p>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Change Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Data & Privacy
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Data Collection
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow us to collect usage data to improve the service
                  </p>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Store Paper History
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep a history of your uploaded and analyzed papers
                  </p>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
                />
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
