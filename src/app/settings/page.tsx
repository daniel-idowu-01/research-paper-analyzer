"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
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
  const { updateSettings, isUpdating, fetchSettings, settings, user } =
    useSettings();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchSettings();
      } catch (error) {
        console.log("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Modified handler that saves to DB
  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = {
      ...settings.notifications,
      [key]: value,
    };
    await updateSettings("notifications", updatedNotifications);
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    const updatedPreferences = {
      ...settings.preferences,
      [key]: value,
    };
    await updateSettings("preferences", updatedPreferences);
  };

  // Theme change handler
  const handleThemeChange = async (newTheme: string) => {
    await updateSettings("appearances", {
      ...settings.appearance,
      theme: newTheme,
    });
    setTheme(newTheme);
  };

  // Language change handler
  const handleLanguageChange = async (language: string) => {
    await updateSettings("appearance", { ...settings.appearance, language });
  };

  return (
    <div className="container px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  <Button
                    variant={
                      settings.appearance.theme === "light"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1 justify-start"
                    onClick={() => handleThemeChange("light")}
                    disabled={isUpdating}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={
                      settings.appearance.theme === "dark"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1 justify-start"
                    onClick={() => handleThemeChange("dark")}
                    disabled={isUpdating}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={
                      settings.appearance.theme === "system"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1 justify-start"
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
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={handleLanguageChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label>Default Paper View</Label>
                <Select defaultValue="summary">
                  <SelectTrigger>
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="insights">Key Insights</SelectItem>
                    <SelectItem value="preview">Paper Preview</SelectItem>
                    <SelectItem value="references">References</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paper Analysis</CardTitle>
              <CardDescription>
                Configure how papers are analyzed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-analyze">
                    Auto-analyze uploaded papers
                  </Label>
                  <p className="text-sm text-muted-foreground">
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
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="similar-papers">Find similar papers</Label>
                  <p className="text-sm text-muted-foreground">
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
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="citation-format">
                    Default citation format
                  </Label>
                  <p className="text-sm text-muted-foreground">
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="harvard">Harvard</SelectItem>
                    <SelectItem value="ieee">IEEE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Paper Analysis Complete</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your paper analysis is complete
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.paperAnalysis}
                      onCheckedChange={(val) =>
                        handleNotificationChange("paperAnalysis", val)
                      }
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Similar Papers Found</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when we find papers similar to yours
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.similarPapers}
                      onCheckedChange={(val) =>
                        handleNotificationChange("similarPapers", val)
                      }
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new features and improvements
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.newFeatures}
                      onCheckedChange={(val) =>
                        handleNotificationChange("newFeatures", val)
                      }
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive marketing emails and promotions
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketing}
                      onCheckedChange={(val) =>
                        handleNotificationChange("marketing", val)
                      }
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(val) =>
                        handleNotificationChange("email", val)
                      }
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Browser</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.browser}
                      onCheckedChange={(val) =>
                        handleNotificationChange("browser", val)
                      }
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">Premium</p>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label>Member Since</Label>
                <p className="text-sm font-medium">{user?.createdAt}</p>
              </div>

              <div className="pt-4">
                <Button variant="outline">Change Email</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to collect usage data to improve the service
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Store Paper History</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep a history of your uploaded and analyzed papers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 space-y-4">
                {/* <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button> */}

                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      $15.00 per month
                    </p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="grid gap-4 mt-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Next billing date</p>
                    <p className="text-sm text-muted-foreground">
                      June 15, 2023
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <p className="text-sm text-muted-foreground">•••• 4242</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Plan Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
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
                      className="w-4 h-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited paper uploads
                  </li>
                  <li className="flex items-center gap-2 text-sm">
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
                      className="w-4 h-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced AI analysis
                  </li>
                  <li className="flex items-center gap-2 text-sm">
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
                      className="w-4 h-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Priority processing
                  </li>
                  <li className="flex items-center gap-2 text-sm">
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
                      className="w-4 h-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Email support
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button variant="outline" className="w-full sm:w-auto">
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Billing History
              </Button>
              <Button variant="destructive" className="w-full sm:w-auto">
                Cancel Subscription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
