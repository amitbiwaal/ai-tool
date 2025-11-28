"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const typeParam = searchParams.get("type");
    
    if (emailParam) {
      setEmail(emailParam);
      setEmailSent(true);
      // Auto-focus first input when email is already set
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [searchParams]);

  // Get signup type
  const isSignupFlow = searchParams.get("type") === "signup";

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus next input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    
    // Focus last filled input or next empty
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Check if it's signup flow and we have stored data
      const isSignup = searchParams.get("type") === "signup";
      let shouldCreateUser = true;

      if (isSignup && typeof window !== "undefined") {
        const pendingSignup = sessionStorage.getItem("pending_signup");
        if (pendingSignup) {
          // For signup, we want to create user with OTP flow
          shouldCreateUser = true;
        } else {
          // If no stored signup data, treat as login
          shouldCreateUser = false;
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: shouldCreateUser,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // If user already exists error, still try to send OTP for login
        if (error.message?.includes("already registered") && !isSignup) {
          // For login, if user exists, resend with shouldCreateUser: false
          const { error: retryError } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
              shouldCreateUser: false,
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      setEmailSent(true);
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(60); // 60 seconds cooldown
      toast.success("OTP sent to your email!");
      
      // Auto-focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      toast.error("OTP must contain only numbers");
      return;
    }

    setLoading(true);
    try {
      // Check if it's signup flow
      const isSignup = searchParams.get("type") === "signup";
      let pendingSignupData = null;

      if (isSignup && typeof window !== "undefined") {
        const stored = sessionStorage.getItem("pending_signup");
        if (stored) {
          pendingSignupData = JSON.parse(stored);
        }
      }

      // Verify OTP first
      // Use proper type based on flow
      const otpType = isSignup ? "signup" : "email";
      
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: otpType as "email" | "signup",
      });

      if (verifyError) throw verifyError;

      // If it's signup flow and we have stored data, create the account with password
      if (isSignup && pendingSignupData && verifyData.user) {
        try {
          // Update user metadata and set password
          const { error: updateError } = await supabase.auth.updateUser({
            password: pendingSignupData.password,
            data: {
              full_name: pendingSignupData.full_name,
            },
          });

          if (updateError) {
            console.error("Error updating user:", updateError);
            // Continue anyway as OTP is verified
          }

          // Clean up sessionStorage
          sessionStorage.removeItem("pending_signup");
          
          toast.success("Account created and verified successfully!");
        } catch (updateError: any) {
          console.error("Error creating account:", updateError);
          toast.success("Email verified! Setting up your account...");
          // Clean up anyway
          sessionStorage.removeItem("pending_signup");
        }
      } else {
        // Regular login flow
        toast.success("Email verified successfully!");
      }

      setVerified(true);
      
      // Wait for session to be established before redirecting
      // Sometimes session takes a moment after OTP verification
      let attempts = 0;
      const checkSession = setInterval(async () => {
        attempts++;
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session || attempts >= 10) {
          clearInterval(checkSession);
          if (session) {
            // Session is available, redirect to intended page or dashboard
            const redirectTo = searchParams.get("redirect") || "/dashboard";
            router.push(redirectTo);
            router.refresh();
          } else {
            // Session not available after 5 seconds, redirect anyway
            // Dashboard will handle auth check
            const redirectTo = searchParams.get("redirect") || "/dashboard";
            router.push(redirectTo);
            router.refresh();
          }
        }
      }, 500); // Check every 500ms, max 5 seconds
    } catch (error: any) {
      let errorMessage = "Invalid OTP. Please try again.";
      
      // More specific error messages
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        errorMessage = "OTP has expired or is invalid. Please request a new OTP.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    await sendOtp();
  };

  if (verified) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Email with OTP</CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? `Enter the 6-digit code sent to ${email}`
              : "Enter your email to receive an OTP"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!emailSent ? (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendOtp();
                      }
                    }}
                    placeholder="you@example.com"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="button" 
                className="w-full" 
                onClick={sendOtp}
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-center block">Enter 6-digit OTP</Label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold"
                      disabled={loading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Check your email inbox for the code
                </p>
              </div>

              <Button 
                type="button" 
                className="w-full" 
                onClick={verifyOtp}
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setOtp(["", "", "", "", "", ""]);
                    setEmail("");
                  }}
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  Change Email
                </button>
                <div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-muted-foreground hover:text-primary disabled:text-muted-foreground/50 disabled:cursor-not-allowed"
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 
                      ? `Resend OTP in ${resendCooldown}s` 
                      : "Resend OTP"}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

