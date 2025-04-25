"use client";
import { useApi } from "@/hooks/use-api";
import Spinner from "@/components/spinner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Lock,
  Mail,
  Save,
  Upload,
  User,
  AlertCircle,
  Github,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const { error, sendRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordSuccess, setIsPasswordSuccess] = useState("");
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    institution: "",
    position: "",
    website: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await sendRequest("/api/profile", "GET");
        if (response) {
          setProfileData({
            name: response.name,
            email: response.email,
            bio: response.bio || "",
            institution: response.institution || "",
            position: response.position || "",
            website: response.website || "",
          });
        }
      } catch (error) {
        return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [sendRequest]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await sendRequest("/api/profile", "PUT", profileData);

      const response = await sendRequest("/api/profile", "GET");
      if (response) {
        setProfileData({
          name: response.name,
          email: response.email,
          bio: response.bio || "",
          institution: response.institution || "",
          position: response.position || "",
          website: response.website || "",
        });
      }
    } catch (error) {
      return;
    } finally {
      setIsEditing(false);
    }
  };

  const handlePasswordSave = async () => {
    setIsPasswordSaving(true);
    try {
      const response = await sendRequest(
        "/api/auth/update-password",
        "PUT",
        passwordData
      );

      setIsPasswordSuccess(response.message);

      setTimeout(() => {
        setIsPasswordSuccess("");
      }, 2000);
    } catch (error) {
      return;
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src="/placeholder.svg?height=128&width=128"
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl">
                    {profileData?.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profileData.email}
                  </p>
                </div>

                {/* <Button variant="outline" size="sm" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </Button> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Papers Uploaded
                </span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Papers Analyzed
                </span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Saved Searches
                </span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Member Since
                </span>
                <span className="text-sm">Jan 2023</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="activity">
                <FileText className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() =>
                        isEditing ? handleSave() : setIsEditing(true)
                      }
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        "Edit Profile"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleChange}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        name="institution"
                        value={profileData.institution}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        name="position"
                        value={profileData.position}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={profileData.website}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research Interests</CardTitle>
                  <CardDescription>Topics you're interested in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Machine Learning</Badge>
                    <Badge>Neural Networks</Badge>
                    <Badge>Deep Learning</Badge>
                    <Badge>Computer Vision</Badge>
                    <Badge>Natural Language Processing</Badge>
                    {isEditing && (
                      <Button variant="outline" size="sm" className="h-6">
                        + Add Interest
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      onChange={handlePasswordChange}
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      onChange={handlePasswordChange}
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      onChange={handlePasswordChange}
                      type="password"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isPasswordSuccess && (
                    <Alert variant="success" className="mb-4">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{isPasswordSuccess}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    disabled={isPasswordSaving}
                    onClick={handlePasswordSave}
                  >
                    {isPasswordSaving
                      ? "Updating Password..."
                      : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app to generate one-time codes
                      </p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Recovery</p>
                      <p className="text-sm text-muted-foreground">
                        Use your phone number as a backup
                      </p>
                    </div>
                    <Button variant="outline">Add Phone</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and uploads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 pb-4 border-b last:border-0"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              Uploaded "Advances in Neural Networks"
                            </p>
                            <span className="text-xs text-muted-foreground">
                              2 days ago
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You uploaded a new research paper and received AI
                            analysis.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
