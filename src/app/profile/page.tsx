"use client";
import { useApi } from "@/hooks/use-api";
import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
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
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfileData = {
  name: string;
  email: string;
  bio: string;
  institution: string;
  position: string;
  website: string;
  papersCount: string;
  createdAt: string;
  researchInterests: string[];
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const DEFAULT_PROFILE_DATA: ProfileData = {
  name: "",
  email: "",
  bio: "",
  institution: "",
  position: "",
  website: "",
  papersCount: "0",
  createdAt: "",
  researchInterests: [],
};

const DEFAULT_PASSWORD_DATA: PasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export default function ProfilePage() {
  const { error, sendRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordSuccess, setIsPasswordSuccess] = useState("");
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>(
    DEFAULT_PASSWORD_DATA
  );
  const [profileData, setProfileData] =
    useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const [newInterest, setNewInterest] = useState("");

  const fetchUserProfile = useCallback(async () => {
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
          papersCount: response.papersCount || "0",
          createdAt: response.createdAt || "",
          researchInterests: response.researchInterests || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sendRequest]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    try {
      await sendRequest("/api/profile", "PUT", profileData);
      await fetchUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  }, [profileData, sendRequest, fetchUserProfile]);

  const handlePasswordSave = useCallback(async () => {
    setIsPasswordSaving(true);
    try {
      const response = await sendRequest(
        "/api/auth/update-password",
        "PUT",
        passwordData
      );
      setIsPasswordSuccess(response.message);
      setPasswordData(DEFAULT_PASSWORD_DATA);

      setTimeout(() => {
        setIsPasswordSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setIsPasswordSaving(false);
    }
  }, [passwordData, sendRequest]);

  const handleAddInterest = useCallback(() => {
    if (!newInterest.trim()) return;
    setProfileData((prev) => ({
      ...prev,
      researchInterests: [...prev.researchInterests, newInterest.trim()],
    }));
    setNewInterest("");
  }, [newInterest]);

  const handleRemoveInterest = useCallback((interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((i) => i !== interest),
    }));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleAddInterest();
      }
    },
    [handleAddInterest]
  );

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <ProfileSidebar profileData={profileData} />

        <div className="space-y-6">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabTrigger value="personal" icon={User} label="Personal Info" />
              <TabTrigger value="security" icon={Lock} label="Security" />
            </TabsList>

            <TabsContent value="personal" className="mt-6 space-y-6">
              <PersonalInfoTab
                profileData={profileData}
                isEditing={isEditing}
                onEditToggle={() =>
                  isEditing ? handleSave() : setIsEditing(true)
                }
                onChange={handleChange}
              />

              <ResearchInterestsCard
                isEditing={isEditing}
                interests={profileData.researchInterests}
                newInterest={newInterest}
                onNewInterestChange={(e) => setNewInterest(e.target.value)}
                onAddInterest={handleAddInterest}
                onRemoveInterest={handleRemoveInterest}
                onKeyDown={handleKeyDown}
                isLoading={isEditing && isLoading}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-6 space-y-6">
              <PasswordChangeCard
                passwordData={passwordData}
                onChange={handlePasswordChange}
                onSave={handlePasswordSave}
                isSaving={isPasswordSaving}
                error={error ?? undefined}
                successMessage={isPasswordSuccess}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const TabTrigger = ({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <TabsTrigger value={value}>
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </TabsTrigger>
);

const ProfileSidebar = ({ profileData }: { profileData: ProfileData }) => (
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
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Account Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatItem label="Papers Analyzed" value={profileData.papersCount} />
        <StatItem label="Member Since" value={profileData.createdAt} />
      </CardContent>
    </Card>
  </div>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <Badge variant="secondary">{value}</Badge>
  </div>
);

const PersonalInfoTab = ({
  profileData,
  isEditing,
  onEditToggle,
  onChange,
}: {
  profileData: ProfileData;
  isEditing: boolean;
  onEditToggle: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={onEditToggle}
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
        <FormField
          id="name"
          label="Full Name"
          name="name"
          value={profileData.name}
          onChange={onChange}
          disabled={!isEditing}
        />
        <FormField
          id="email"
          label="Email"
          name="email"
          type="email"
          value={profileData.email}
          onChange={onChange}
          disabled={true}
        />
      </div>

      <FormTextarea
        id="bio"
        label="Bio"
        name="bio"
        value={profileData.bio}
        onChange={onChange}
        disabled={!isEditing}
        rows={4}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          id="institution"
          label="Institution"
          name="institution"
          value={profileData.institution}
          onChange={onChange}
          disabled={!isEditing}
        />
        <FormField
          id="position"
          label="Position"
          name="position"
          value={profileData.position}
          onChange={onChange}
          disabled={!isEditing}
        />
      </div>

      <FormField
        id="website"
        label="Website"
        name="website"
        type="url"
        value={profileData.website}
        onChange={onChange}
        disabled={!isEditing}
      />
    </CardContent>
  </Card>
);

const FormField = ({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);

const FormTextarea = ({
  id,
  label,
  name,
  value,
  onChange,
  disabled,
  rows,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
  rows?: number;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
    />
  </div>
);

const ResearchInterestsCard = ({
  isEditing,
  interests,
  newInterest,
  onNewInterestChange,
  onAddInterest,
  onRemoveInterest,
  onKeyDown,
  isLoading,
}: {
  isEditing: boolean;
  interests: string[];
  newInterest: string;
  onNewInterestChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddInterest: () => void;
  onRemoveInterest: (interest: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Research Interests</CardTitle>
      <CardDescription>Topics you're interested in</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2 mb-4">
        {interests.length > 0 ? (
          interests.map((interest) => (
            <Badge key={interest} className="flex items-center gap-1">
              {interest}
              {isEditing && (
                <button
                  onClick={() => onRemoveInterest(interest)}
                  className="rounded-full hover:bg-accent"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No interests added</p>
        )}
      </div>
      {isEditing && (
        <div className="flex gap-2">
          <Input
            placeholder="Add new interest"
            value={newInterest}
            onChange={onNewInterestChange}
            onKeyDown={onKeyDown}
            disabled={isLoading}
          />
          <Button
            onClick={onAddInterest}
            disabled={!newInterest.trim() || isLoading}
            size="sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

const PasswordChangeCard = ({
  passwordData,
  onChange,
  onSave,
  isSaving,
  error,
  successMessage,
}: {
  passwordData: PasswordData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void;
  isSaving: boolean;
  error?: string;
  successMessage?: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Change Password</CardTitle>
      <CardDescription>Update your password</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        id="currentPassword"
        label="Current Password"
        name="currentPassword"
        type="password"
        value={passwordData.currentPassword}
        onChange={onChange}
      />
      <FormField
        id="newPassword"
        label="New Password"
        name="newPassword"
        type="password"
        value={passwordData.newPassword}
        onChange={onChange}
      />
      <FormField
        id="confirmNewPassword"
        label="Confirm New Password"
        name="confirmNewPassword"
        type="password"
        value={passwordData.confirmNewPassword}
        onChange={onChange}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </CardContent>

    <CardFooter>
      <Button disabled={isSaving} onClick={onSave}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating Password...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </CardFooter>
  </Card>
);

const ActivityCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Your recent actions and uploads</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <ActivityItem key={i} />
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="w-full">
        View All Activity
      </Button>
    </CardFooter>
  </Card>
);

const ActivityItem = () => (
  <div className="flex items-start gap-4 pb-4 border-b last:border-0">
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
      <FileText className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center justify-between">
        <p className="font-medium">Uploaded "Advances in Neural Networks"</p>
        <span className="text-xs text-muted-foreground">2 days ago</span>
      </div>
      <p className="text-sm text-muted-foreground">
        You uploaded a new research paper and received AI analysis.
      </p>
    </div>
  </div>
);
