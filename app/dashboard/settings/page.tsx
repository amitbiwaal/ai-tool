"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { toast } from "sonner";
import { ArrowLeft, User, Save, Loader2, Upload, Mail } from "lucide-react";

export default function SettingsPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    bio: "",
    website: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setUser(data.profile);
          setFormData({
            full_name: data.profile.full_name || "",
            email: data.profile.email || "",
            bio: data.profile.bio || "",
            website: data.profile.website || "",
            avatar_url: data.profile.avatar_url || "",
          });
        }
      } else {
        // Fallback: get from session
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          const profileData: Profile = {
            id: sessionUser.id,
            email: sessionUser.email || "",
            full_name: sessionUser.user_metadata?.full_name || null,
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            role: "user",
            bio: null,
            website: null,
            created_at: sessionUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(profileData);
          setFormData({
            full_name: profileData.full_name || "",
            email: profileData.email || "",
            bio: profileData.bio || "",
            website: profileData.website || "",
            avatar_url: profileData.avatar_url || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          website: formData.website || null,
          avatar_url: formData.avatar_url || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const data = await response.json();
      
      // Update user metadata in auth as well
      if (supabase) {
        await supabase.auth.updateUser({
          data: {
            full_name: formData.full_name || null,
            avatar_url: formData.avatar_url || null,
          },
        });
      }

      toast.success("Profile updated successfully!");
      
      // Update local state
      if (user) {
        setUser({
          ...user,
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          website: formData.website || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        });
      }

      // Refresh navbar by dispatching event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdated"));
      }

      // Navigate back to dashboard after a moment
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getUserAvatar = () => {
    if (formData.avatar_url && formData.avatar_url.trim() !== "") {
      return formData.avatar_url;
    }
    if (formData.email && formData.email.trim() !== "") {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.email)}`;
    }
    // Always return a valid URL, never empty string
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-sm text-muted-foreground">Update your information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile information. Changes will be visible to other users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
                    <Image
                      src={getUserAvatar()}
                      alt={formData.full_name || "User"}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter an image URL to update your profile picture
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar_url}
                      onChange={(e) =>
                        setFormData({ ...formData, avatar_url: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const email = formData.email || user?.email || "";
                        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
                        setFormData({ ...formData, avatar_url: avatarUrl });
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-muted cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setFormData({ ...formData, bio: value });
                      }
                    }}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

