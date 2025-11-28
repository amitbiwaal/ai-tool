"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function useAdminAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Only check once on mount
    if (!hasCheckedRef.current && !isCheckingRef.current && mounted) {
      checkAdminAuth().then(() => {
        if (mounted) {
          hasCheckedRef.current = true;
        }
      });
    }

    // Listen for auth state changes (only for sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      // Only handle sign out to prevent loops
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        hasCheckedRef.current = false;
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          router.push("/admin/login");
        }
      } else if (event === "SIGNED_IN" && !hasCheckedRef.current && !isCheckingRef.current) {
        // Only check on initial sign in if not already checked
        checkAdminAuth().then(() => {
          if (mounted) {
            hasCheckedRef.current = true;
          }
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  const checkAdminAuth = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;

    try {
      setIsLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Auth check timeout")), 10000); // 10 second timeout
      });

      // First check if user is authenticated using getUser (more reliable)
      const authCheck = supabase.auth.getUser();
      const {
        data: { user },
        error: userError,
      } = await Promise.race([authCheck, timeoutPromise]) as any;

      if (userError || !user) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        isCheckingRef.current = false;
        // Only redirect if we're not already on login page
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          router.push("/admin/login?redirect=" + encodeURIComponent(window.location.pathname));
        }
        return;
      }

      setIsAuthenticated(true);

      // Check if user is admin by fetching profile
      // Use direct Supabase query instead of API call for faster response
      const profileCheck = supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const { data: profile, error: profileError } = await Promise.race([
        profileCheck,
        timeoutPromise
      ]) as any;

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // If profile doesn't exist, user is not admin
        setIsAdmin(false);
        setIsLoading(false);
        isCheckingRef.current = false;
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          router.push("/");
        }
        return;
      }

      const role = profile?.role;
      if (role === "admin" || role === "moderator") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // Only redirect if user is definitely not admin
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Error checking admin auth:", error);
      setIsAdmin(false);
      setIsAuthenticated(false);
      // On timeout or error, still set loading to false
      if (error?.message?.includes("timeout")) {
        console.warn("Auth check timed out, user may not be authenticated");
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          router.push("/admin/login");
        }
      }
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  };

  return { isLoading, isAdmin, isAuthenticated };
}

