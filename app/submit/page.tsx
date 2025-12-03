"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, Tag } from "@/lib/types";
import { Sparkles, ArrowRight, FileText, Search, CheckCircle2, TrendingUp, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function SubmitToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Content from database
  const [pageContent, setPageContent] = useState<Record<string, string>>({});

  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverUploading, setCoverUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    long_description: "",
    logo_url: "",
    cover_image_url: "",
    website_url: "",
    listing_type: "free",
    pricing_type: "free",
    features: [""],
    pros: [""],
    cons: [""],
    screenshots: [""],
    video_url: "",
    selectedCategories: [] as string[],
    selectedTags: [] as string[],
  });

  const checkAuth = useCallback(async () => {
    try {
      console.log("Checking authentication...");
      console.log("Environment check:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "..."
      });

      // Create fresh Supabase client each time
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error("Supabase client is null - check environment variables");
        toast.error("Authentication is not configured. Please check Supabase environment variables.");
        setCheckingAuth(false);
        return;
      }

      console.log("Supabase client available, checking session first...");

      // First check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("Session check result:", {
        hasSession: !!sessionData.session,
        sessionError: sessionError?.message
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error(`Session error: ${sessionError.message}`);
        router.push("/auth/login?redirect=/submit");
        setCheckingAuth(false);
        return;
      }

      if (!sessionData.session) {
        console.log("No session found, redirecting to login");
        router.push("/auth/login?redirect=/submit");
        setCheckingAuth(false);
        return;
      }

      console.log("Session found, checking user...");

      // Add timeout to prevent hanging
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Authentication check timed out")), 10000)
      );

      const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      console.log("Auth result:", { user: !!user, error, userId: user?.id });

      if (error) {
        console.error("Auth error:", error);
        toast.error(`Authentication error: ${error.message}`);
        router.push("/auth/login?redirect=/submit");
        setCheckingAuth(false);
        return;
      }

      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/auth/login?redirect=/submit");
        setCheckingAuth(false);
        return;
      }

      console.log("User authenticated:", user.email);
      // Fast auth check - immediately hide loading once verified
      setCheckingAuth(false);
    } catch (error: any) {
      console.error("Auth check error:", error);
      const errorMessage = error.message?.includes("timed out")
        ? "Authentication check timed out. Please try refreshing the page."
        : `Authentication failed: ${error.message || 'Unknown error'}`;
      toast.error(errorMessage);
      router.push("/auth/login?redirect=/submit");
      setCheckingAuth(false);
    }
  }, [router]);

  // Fetch page content from database
  const fetchPageContent = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/content?page=submit&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      const content: Record<string, string> = {};

      if (response.ok) {
        const data = await response.json();
        data.content?.forEach((item: any) => {
          const value = typeof item.value === 'object' ? JSON.stringify(item.value) : item.value;
          content[item.key] = value;
        });
      }

      setPageContent(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
    }
  }, []);

  // Ultra-fast auth check - redirect immediately if not logged in
  useEffect(() => {
    // Most aggressive approach: redirect immediately unless we can prove user is logged in
    const checkAndRedirect = async () => {
      try {
        // Check environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.log("Supabase not configured");
          router.push("/auth/login?redirect=/submit");
          return;
        }

        // Try to get Supabase client
        const supabase = getSupabaseClient();
        if (!supabase) {
          console.log("Supabase client creation failed");
          router.push("/auth/login?redirect=/submit");
          return;
        }

        // Check session (this will be fast if user is logged in)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.log("Session check error:", error.message);
          router.push("/auth/login?redirect=/submit");
          return;
        }

        if (!session) {
          console.log("No session found");
          router.push("/auth/login?redirect=/submit");
          return;
        }

        // User is authenticated - show the page
        console.log("User authenticated, showing page");
        setAuthChecked(true);
        setCheckingAuth(true);

      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login?redirect=/submit");
      }
    };

    checkAndRedirect();
  }, [router]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch categories and tags on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [logoPreview, coverPreview]);

  const fetchData = async () => {
    try {
      // Fetch categories from database
      const categoriesRes = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      } else {
        setCategories([]);
      }

      // Fetch tags from database
      const tagsRes = await fetch(`/api/tags?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags || []);
      } else {
        setTags([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Upload file function
  const uploadFile = async (file: File, type: "logo" | "cover"): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      return null;
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setLogoFile(file);
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    setLogoUploading(true);

    const url = await uploadFile(file, "logo");
    setLogoUploading(false);

    if (url) {
      setFormData({ ...formData, logo_url: url });
      toast.success("Logo uploaded successfully!");
    } else {
      setLogoFile(null);
      setLogoPreview("");
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setCoverFile(file);
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);
    setCoverUploading(true);

    const url = await uploadFile(file, "cover");
    setCoverUploading(false);

    if (url) {
      setFormData({ ...formData, cover_image_url: url });
      toast.success("Cover image uploaded successfully!");
    } else {
      setCoverFile(null);
      setCoverPreview("");
    }
  };

  // Remove logo
  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview("");
    setFormData({ ...formData, logo_url: "" });
  };

  // Remove cover image
  const removeCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview("");
    setFormData({ ...formData, cover_image_url: "" });
  };

  const handleArrayInput = (
    field: "features",
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: "features") => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const removeArrayField = (
    field: "features",
    index: number
  ) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Both free and paid listings submit directly (paid listings get premium features for 1 month)
    await submitTool();
  };

  // Actual submission function
  const submitTool = async (paymentId?: string) => {
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.logo_url) {
        toast.error("Please upload a logo for your tool");
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        features: formData.features.filter((f) => f.trim()),
        categories: formData.selectedCategories,
        tags: formData.selectedTags,
        payment_id: paymentId || null,
        payment_status: paymentId ? 'completed' : null,
      };

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit tool");
      }

      toast.success(
        "Tool submitted successfully! It will be reviewed by our team."
      );
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit tool");
    } finally {
      setLoading(false);
    }
  };


  // Show loading state while checking authentication
  if (!authChecked || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-4">Checking authentication...</p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-sm"
            >
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login?redirect=/submit")}
              className="text-sm"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 lg:mb-6 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Submit Your Tool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-2 sm:px-4">
            {pageContent.heroTitle || "Share Your AI Tool with the World"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-4">
            {pageContent.heroDescription || "Join thousands of AI tools in our directory. All submissions are carefully reviewed by our team before publishing to ensure quality."}
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm px-2 sm:px-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-muted-foreground whitespace-nowrap">{pageContent.quickStat1 || "Fast approval process"}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
              <span className="text-muted-foreground whitespace-nowrap">{pageContent.quickStat2 || "Free & paid listings"}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
              <span className="text-muted-foreground whitespace-nowrap">{pageContent.quickStat3 || "Reach thousands of users"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-[120px] animate-pulse dark:bg-blue-500/15" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/8 rounded-full blur-[100px] animate-pulse delay-700 dark:bg-purple-500/15" />
        
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-3 sm:mb-4 lg:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                HOW IT WORKS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                {pageContent.howItWorksTitle || "Submit Your Tool in 4 Simple Steps"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-2 sm:px-4">
              {pageContent.howItWorksDescription || "Get your AI tool listed in our directory and reach thousands of potential users."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 px-2 sm:px-4 lg:px-0">
            {/* Step 1: Fill Form */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm">
                      1
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-3 text-slate-900 dark:text-white">
                    {pageContent.step1Title || "Fill Form"}
                  </h3>
                  <p className="text-sm sm:text-base text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pageContent.step1Description || "Complete the submission form with your tool's details, features, pricing, and media."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 2: Review */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-3 text-slate-900 dark:text-white">
                    {pageContent.step2Title || "Review"}
                  </h3>
                  <p className="text-sm sm:text-base text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pageContent.step2Description || "Our expert team carefully reviews your submission to ensure quality and accuracy."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Approval */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/20 dark:from-pink-500/20 dark:to-pink-600/30 mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-3 text-slate-900 dark:text-white">
                    {pageContent.step3Title || "Approval"}
                  </h3>
                  <p className="text-sm sm:text-base text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pageContent.step3Description || "Once approved, your tool gets published and appears in our directory for users to discover."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 4: Grow */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-500/20 dark:to-orange-600/30 mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-orange-600 to-blue-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm">
                      4
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-3 text-slate-900 dark:text-white">
                    {pageContent.step4Title || "Grow"}
                  </h3>
                  <p className="text-sm sm:text-base text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pageContent.step4Description || "Get discovered by thousands of users, receive reviews, and grow your user base."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Connecting arrows (desktop only) */}
          <div className="hidden lg:flex items-center justify-between px-8 mt-12 mb-8">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"></div>
            <ArrowRight className="w-6 h-6 text-blue-500/50 mx-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30"></div>
            <ArrowRight className="w-6 h-6 text-purple-500/50 mx-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500 opacity-30"></div>
            <ArrowRight className="w-6 h-6 text-pink-500/50 mx-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 opacity-30"></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 w-full overflow-x-hidden">
        {(pageContent.formTitle || pageContent.formDescription) && (
          <div className="mb-6 sm:mb-8 text-center">
            {pageContent.formTitle && (
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{pageContent.formTitle}</h2>
            )}
            {pageContent.formDescription && (
              <p className="text-muted-foreground">{pageContent.formDescription}</p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full min-w-0">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full min-w-0">
          {/* Basic Information */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Tool Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., ChatGPT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  placeholder="Short one-liner description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief overview of the tool (1-2 sentences)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="long_description">Full Description</Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      long_description: e.target.value,
                    })
                  }
                  placeholder="Detailed description of the tool"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL *</Label>
                <Input
                  id="website_url"
                  type="url"
                  required
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 pt-0">
              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo" className="text-sm sm:text-base font-semibold mb-2 block">
                  Tool Logo <span className="text-red-500">*</span>
                </Label>
                {(logoPreview && logoPreview.trim() !== "") || (formData.logo_url && formData.logo_url.trim() !== "") ? (
                  <div className="relative inline-block">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-border">
                      <Image
                        src={(logoPreview && logoPreview.trim() !== "") ? logoPreview : (formData.logo_url || "")}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    {logoUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={logoUploading}
                    />
                    <label
                      htmlFor="logo"
                      className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-4 sm:pb-6 px-4">
                        {logoUploading ? (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2 sm:mb-3" />
                        ) : (
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-muted-foreground" />
                        )}
                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground text-center">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          PNG, JPG, WEBP (MAX. 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                {formData.logo_url && (
                  <p className="text-xs text-green-600 mt-2">✓ Logo uploaded successfully</p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div>
                <Label htmlFor="cover_image" className="text-sm sm:text-base font-semibold mb-2 block">
                  Cover Image (Optional)
                </Label>
                {(coverPreview && coverPreview.trim() !== "") || (formData.cover_image_url && formData.cover_image_url.trim() !== "") ? (
                  <div className="relative inline-block w-full">
                    <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border-2 border-border">
                      <Image
                        src={(coverPreview && coverPreview.trim() !== "") ? coverPreview : (formData.cover_image_url || "")}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    {coverUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={coverUploading}
                    />
                    <label
                      htmlFor="cover_image"
                      className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-4 sm:pb-6 px-4">
                        {coverUploading ? (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2 sm:mb-3" />
                        ) : (
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-muted-foreground" />
                        )}
                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground text-center">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          PNG, JPG, WEBP (MAX. 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                {formData.cover_image_url && (
                  <p className="text-xs text-green-600 mt-2">✓ Cover image uploaded successfully</p>
                )}
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL (Optional - YouTube, Vimeo)</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Add a video demo or tutorial of your tool
                </p>
              </div>

              {/* Screenshots */}
              <div className="space-y-2">
                <Label htmlFor="screenshots">Screenshots (Optional)</Label>
                <Input
                  id="screenshots"
                  type="file"
                  multiple
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      // Handle file upload here
                      console.log("Files selected:", files);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Upload images showing your tool in action (PNG, JPG, WEBP)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 w-full min-w-0 overflow-hidden">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 w-full min-w-0">
              <div className="w-full min-w-0 max-w-full space-y-2">
                <Label htmlFor="pricing_type" className="text-sm sm:text-base">Pricing Type *</Label>
                <div className="w-full min-w-0 max-w-full relative">
                  <Select
                    id="pricing_type"
                    required
                    value={formData.pricing_type}
                    onChange={(e) =>
                      setFormData({ ...formData, pricing_type: e.target.value })
                    }
                    className="w-full min-w-0 max-w-full h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="subscription">Subscription</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6 pt-0">
              <div>
                <Label className="text-sm sm:text-base">Key Features</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        handleArrayInput("features", index, e.target.value)
                      }
                      placeholder="Feature description"
                      className="flex-1"
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayField("features", index)}
                        className="w-full sm:w-auto text-sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField("features")}
                  className="mt-2 w-full sm:w-auto text-sm"
                >
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 w-full min-w-0 overflow-hidden">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 pt-0 w-full min-w-0">
              {/* Categories */}
              <div className="w-full min-w-0 max-w-full">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="categories" className="text-sm sm:text-base font-semibold">
                  Categories <span className="text-red-500">*</span>
                </Label>
                  <button
                    type="button"
                    onClick={fetchData}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Refresh categories
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                  Select the primary category for your tool
                </p>
                <div className="w-full min-w-0 max-w-full relative">
                  <Select
                    id="categories"
                    required
                    value={formData.selectedCategories[0] || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, selectedCategories: e.target.value ? [e.target.value] : [] });
                    }}
                    className="h-10 sm:h-12 text-sm sm:text-base w-full min-w-0 max-w-full"
                  >
                    <option value="" disabled>
                      Choose a category...
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name.length > 30 ? `${category.name.substring(0, 30)}...` : category.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {categories.length} categories available
                </p>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                  Tags (Optional)
                </Label>
                <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                  Add relevant tags to help users discover your tool
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all text-xs sm:text-sm"
                      style={{
                        borderColor: formData.selectedTags.includes(tag.id)
                          ? "rgb(147, 51, 234)"
                          : "rgb(226, 232, 240)",
                        backgroundColor: formData.selectedTags.includes(tag.id)
                          ? "rgb(250, 245, 255)"
                          : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          const selected = e.target.checked
                            ? [...formData.selectedTags, tag.id]
                            : formData.selectedTags.filter((id) => id !== tag.id);
                          setFormData({ ...formData, selectedTags: selected });
                        }}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-medium flex-1 truncate">{tag.name}</span>
                    </label>
                  ))}
                </div>
                {formData.selectedTags.length > 0 && (
                  <p className="text-xs text-purple-600 mt-2">
                    {formData.selectedTags.length} {formData.selectedTags.length === 1 ? "tag" : "tags"} selected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listing Type */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 w-full min-w-0 overflow-hidden">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <span className="text-xl sm:text-2xl">💎</span>
                <span>Choose Your Listing Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 w-full min-w-0">
              <div className="w-full min-w-0 max-w-full">
                <div className="p-4 rounded-lg border-2 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-blue-900 dark:text-blue-100">Free Tool Listing</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Submit your AI tool to our directory completely free of charge.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✓</span>
                      <span>Instant publication after review</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✓</span>
                      <span>SEO-optimized listing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✓</span>
                      <span>Community visibility</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={loading} className="w-full text-sm sm:text-base h-11 sm:h-12">
            {loading ? "Submitting..." : "Submit Tool for Review"}
          </Button>
        </div>
      </form>

      </div>
    </div>
  );
}

