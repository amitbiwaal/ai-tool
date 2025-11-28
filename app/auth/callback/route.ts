import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const type = requestUrl.searchParams.get("type"); // Can be "recovery" for password reset
    const next = requestUrl.searchParams.get("next");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");

    // Handle errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
      );
    }

    // Exchange code for session
    if (code) {
      const supabase = await createServerSupabaseClient();
      
      if (!supabase) {
        console.error("Supabase client not available");
        return NextResponse.redirect(
          new URL("/auth/login?error=configuration_error", requestUrl.origin)
        );
      }

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message || "Invalid or expired link")}`, requestUrl.origin)
        );
      }

      if (data?.session) {
        // Successfully authenticated
        // If it's a password recovery link, redirect to reset password page
        if (type === "recovery") {
          return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin));
        }
        
        // Otherwise redirect to next URL or dashboard
        const redirectUrl = next ? decodeURIComponent(next) : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      } else {
        // No session after exchange
        return NextResponse.redirect(
          new URL("/auth/login?error=session_creation_failed", requestUrl.origin)
        );
      }
    }

    // No code provided
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_code", requestUrl.origin)
    );
  } catch (error: any) {
    console.error("Callback route error:", error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error?.message || "An error occurred")}`, requestUrl.origin)
    );
  }
}

