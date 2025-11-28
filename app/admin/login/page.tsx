"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authStateChanged"));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check if supabase is available
    if (!supabase) {
      toast.error("Database connection not available");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Wait for session to be established and verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Check if user is admin
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // If profile doesn't exist (error code PGRST116 means no rows returned), try to create it
      if (profileError) {
        // Check if it's a "no rows" error
        const isNoRowsError = profileError.code === "PGRST116" || 
                              profileError.message?.includes("No rows") ||
                              profileError.message?.includes("not found");

        if (isNoRowsError) {
          // Profile doesn't exist, create it with default role
          console.log("Profile not found, creating new profile for user:", user.id);
          
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              role: "user", // Default role
            })
            .select("role")
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
            // If it's a duplicate key error, try fetching again
            if (createError.code === "23505" || createError.message?.includes("duplicate")) {
              // Profile was created by another process, fetch it again
              const { data: retryProfile, error: retryError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();
              
              if (retryError || !retryProfile) {
                throw new Error("Failed to access user profile. Please try again.");
              }
              profile = retryProfile;
            } else {
              throw new Error(`Failed to create profile: ${createError.message}. Please contact support.`);
            }
          } else {
            profile = newProfile;
          }
        } else {
          // Other database error
          console.error("Error fetching profile:", profileError);
          throw new Error(`Database error: ${profileError.message || "Unknown error"}. Please try again.`);
        }
      }

      if (!profile) {
        throw new Error("User profile not found. Please contact support.");
      }

      // Check admin role
      if (profile.role !== "admin" && profile.role !== "moderator") {
        if (supabase) {
          await supabase.auth.signOut();
        }
        throw new Error("You don't have admin access. Please contact an administrator to grant you admin privileges.");
      }

      toast.success("Logged in successfully!");
      
      // Dispatch auth state change event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("authStateChanged"));
      }

      // Use window.location.href for full page reload to ensure cookies are set
      // This ensures middleware can properly read the session
      const redirectTo = searchParams.get("redirect") || "/admin";
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="p-4 sm:p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">
            Admin Login
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to access the admin panel
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

