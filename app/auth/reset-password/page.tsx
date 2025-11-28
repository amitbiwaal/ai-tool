"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage({
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    // Check if user has a valid session (password reset flow creates a session)
    const checkSession = async () => {
      if (!supabase) {
        toast.error("Database connection not available");
        router.push("/auth/forgot-password");
        return;
      }

      // Check if we have a code in URL - if so, the callback route should handle it
      // If we're here without a code, check if we have a session
      const code = searchParams.get("code");
      
      if (code) {
        // If code is present, redirect to callback route to exchange it
        // The callback route will then redirect back here with a session
        router.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/auth/reset-password")}&type=recovery`);
        return;
      }

      // Check if we have a valid session (should exist after callback route exchange)
      let attempts = 0;
      let session = null;
      
      // Wait a moment for session to be established after callback redirect
      while (attempts < 5 && !session) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        session = currentSession;
        
        if (!session && attempts < 4) {
          // Wait 300ms before retrying
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        attempts++;
      }
      
      if (!session) {
        // No session means invalid or expired link
        toast.error("Invalid or expired reset link. Please request a new one.");
        setTimeout(() => {
          router.push("/auth/forgot-password");
        }, 2000);
        return;
      }
    };

    checkSession();
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        toast.error("Database connection not available");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setPasswordReset(true);
      toast.success("Password reset successfully!");
      
      // Sign out the recovery session before redirecting to login
      // Password reset creates a recovery session that should be cleared
      await supabase.auth.signOut();
      
      // Refresh the page state and redirect to login
      router.refresh();
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been reset successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  minLength={6}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

