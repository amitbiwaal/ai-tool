"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  Settings, 
  Upload, 
  Star, 
  TrendingUp,
  Eye,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Calendar,
  User,
  Bell,
  Sparkles,
  ArrowRight,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tool-card";
import { Tool, Favorite, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface UserStats {
  totalViews: number;
  totalFavorites: number;
  totalSubmissions: number;
  reviewsWritten: number;
  monthlyGrowth: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalViews: 0,
    totalFavorites: 0,
    totalSubmissions: 0,
    reviewsWritten: 0,
    monthlyGrowth: 0,
  });
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [submissions, setSubmissions] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "favorites">("overview");
  const [notifications, setNotifications] = useState(0);

  // Handler functions for tab switching
  const handleTabChange = useCallback((tab: "overview" | "submissions" | "favorites") => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [checkAuthAndFetchData]);

  // Additional effect to ensure user is set if session exists
  useEffect(() => {
    const ensureUserFromSession = async () => {
      if (!user && !loading && supabase) {
        try {
          const { data: { user: sessionUser } } = await supabase.auth.getUser();
          if (sessionUser) {
            setUser({
              id: sessionUser.id,
              email: sessionUser.email || "",
              full_name: sessionUser.user_metadata?.full_name || null,
              avatar_url: sessionUser.user_metadata?.avatar_url || null,
              role: "user",
              bio: null,
              website: null,
              created_at: sessionUser.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error ensuring user from session:", error);
        }
      }
    };
    
    // Only run if user is not set and not loading
    if (!user && !loading) {
      ensureUserFromSession();
    }
  }, [user, loading]);

  const checkAuthAndFetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check authentication for real users
      if (!supabase) {
        toast.error("Database connection not available");
        router.push("/");
        return;
      }

      // Wait a moment for session to be available (in case just verified OTP)
      let session = null;
      let sessionError = null;
      let attempts = 0;
      
      // Try to get session, with retries (for OTP verification flow)
      while (attempts < 5 && !session) {
        const result = await supabase.auth.getSession();
        session = result.data.session;
        sessionError = result.error;
        
        if (!session && attempts < 4) {
          // Wait 500ms before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        attempts++;
      }

      if (sessionError || !session) {
        toast.error("Please login to access dashboard");
        router.push("/auth/login");
        return;
      }

      // Get user from session (we already have session)
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      
      // Fetch user profile first (required for dashboard to show)
      await fetchUserProfile();
      
      // Ensure user is set - use session user as fallback if profile fetch didn't work
      // We need to check if user state was set, but since state updates are async,
      // we'll set it from session user directly as a guarantee
      if (sessionUser) {
        // Wait a bit for fetchUserProfile to potentially set user
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // If user still not set (check via a flag), set from session
        // We'll use a ref or just set it anyway as fallback
        const fallbackUser: Profile = {
          id: sessionUser.id,
          email: sessionUser.email || "",
          full_name: sessionUser.user_metadata?.full_name || session?.user?.user_metadata?.full_name || null,
          avatar_url: sessionUser.user_metadata?.avatar_url || session?.user?.user_metadata?.avatar_url || null,
          role: "user",
          bio: null,
          website: null,
          created_at: sessionUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Always set user from session as fallback (setUser is idempotent)
        setUser(fallbackUser);
      }
      
      // Then fetch other data in parallel
      await Promise.all([
        fetchUserStats(),
        fetchFavorites(),
        fetchSubmissions(),
      ]);
    } catch (error: any) {
      console.error("Error initializing dashboard:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
        setUser(data.profile);
        }
      } else {
        // If API fails, try to get user from session as fallback
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email || "",
            full_name: sessionUser.user_metadata?.full_name || null,
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            role: "user",
            bio: null,
            website: null,
            created_at: sessionUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback: use session user data
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email || "",
            full_name: sessionUser.user_metadata?.full_name || null,
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            role: "user",
            bio: null,
            website: null,
            created_at: sessionUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (sessionError) {
        console.error("Error getting session user:", sessionError);
      }
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/user/submissions?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched submissions:", data.submissions?.length || 0);
        setSubmissions(data.submissions || []);
      } else {
        const error = await response.json();
        console.error("❌ Failed to fetch submissions:", error);
        toast.error(error.error || "Failed to load submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getUserAvatar = () => {
    if (user?.avatar_url && user.avatar_url.trim() !== "") {
      return user.avatar_url;
    }
    if (user?.email && user.email.trim() !== "") {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
    }
    // Always return a valid URL, never empty string
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
  };

  const getUserName = () => {
    return user?.full_name || user?.email?.split("@")[0] || "User";
  };

  const isPro = user?.role === "admin" || user?.role === "moderator";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleNotifications = () => {
    toast.success(`You have ${notifications} new notifications!`);
    setNotifications(0);
  };

  const handleDelete = async (toolSlug: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tools/${toolSlug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tool deleted successfully!");
        setSubmissions(submissions.filter(tool => tool.slug !== toolSlug));
        // Refresh stats
        fetchUserStats();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tool");
    }
  };

  const handleEdit = (toolSlug: string) => {
    router.push(`/dashboard/edit/${toolSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show loading state
  // User should be set by fetchUserProfile, but if not, we'll show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-4">Setting up your dashboard...</p>
          <p className="text-sm text-muted-foreground">If this takes too long, please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <Image
                    src={getUserAvatar()}
                    alt={getUserName()}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                {isPro && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 flex-wrap">
                  <span className="truncate">{getUserName()}</span>
                  {isPro && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs sm:text-sm flex-shrink-0">
                      PRO
                    </Badge>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 sm:gap-2 relative flex-1 sm:flex-initial"
                onClick={handleNotifications}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <Link href="/submit" className="flex-1 sm:flex-initial">
                <Button size="sm" className="gap-1 sm:gap-2 w-full sm:w-auto">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Submit Tool</span>
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="flex-1 sm:flex-initial">
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2 w-full sm:w-auto">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                {stats.monthlyGrowth > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                  <TrendingUp className="w-3 h-3" />
                    +{stats.monthlyGrowth}%
                </Badge>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{formatNumber(stats.totalViews)}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{stats.totalFavorites}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Favorite Tools</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{stats.totalSubmissions}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Your Submissions</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{stats.reviewsWritten}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Reviews Written</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max sm:min-w-0 pb-2">
            <button
              key="overview-tab"
              type="button"
              onClick={() => handleTabChange("overview")}
              className={
                activeTab === "overview"
                  ? "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
              style={activeTab !== "overview" ? { background: "transparent" } : undefined}
              aria-pressed={activeTab === "overview"}
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Overview</span>
            </button>
            <button
              key="submissions-tab"
              type="button"
              onClick={() => handleTabChange("submissions")}
              className={
                activeTab === "submissions"
                  ? "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
              style={activeTab !== "submissions" ? { background: "transparent" } : undefined}
              aria-pressed={activeTab === "submissions"}
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Submissions ({submissions.length})</span>
            </button>
            <button
              key="favorites-tab"
              type="button"
              onClick={() => handleTabChange("favorites")}
              className={
                activeTab === "favorites"
                  ? "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
              style={activeTab !== "favorites" ? { background: "transparent" } : undefined}
              aria-pressed={activeTab === "favorites"}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Favorites ({stats.totalFavorites})</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Link href="/submit">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                      <CardContent className="pt-4 sm:pt-6 text-center p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Submit New Tool</h3>
                        <p className="text-xs text-muted-foreground">Add your AI tool to directory</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/tools">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                      <CardContent className="pt-4 sm:pt-6 text-center p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Browse Tools</h3>
                        <p className="text-xs text-muted-foreground">Discover new AI tools</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/dashboard/settings">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                      <CardContent className="pt-4 sm:pt-6 text-center p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Edit Profile</h3>
                        <p className="text-xs text-muted-foreground">Update your information</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {submissions.slice(0, 3).map((tool) => (
                    <div key={tool.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                          {tool.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{tool.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {formatDate(tool.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("gap-1 text-xs sm:text-sm flex-shrink-0", getStatusColor(tool.status))}>
                        {getStatusIcon(tool.status)}
                        <span className="hidden sm:inline">{tool.status}</span>
                        <span className="sm:hidden capitalize">{tool.status.charAt(0)}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div>
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((tool) => (
                  <Card key={tool.id} className="border-2 hover:shadow-lg transition-all">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-2xl flex-shrink-0">
                            {tool.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-bold text-base sm:text-lg truncate">{tool.name}</h3>
                              <Badge className={cn("gap-1 text-xs sm:text-sm w-fit", getStatusColor(tool.status))}>
                                {getStatusIcon(tool.status)}
                                {tool.status}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{tool.tagline || tool.description || "No description"}</p>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span>{tool.views_count || 0} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span>{tool.favorites_count || 0} favorites</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{formatDate(tool.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch w-full lg:w-auto">
                          {tool.status === "approved" && (
                            <Link href={`/tools/${tool.slug}`} className="flex-1 lg:flex-initial">
                              <Button variant="outline" size="sm" className="w-full gap-1 sm:gap-2 text-xs sm:text-sm">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">View</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                            </Link>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 lg:flex-initial gap-1 sm:gap-2 text-xs sm:text-sm"
                            onClick={() => handleEdit(tool.slug)}
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 lg:flex-initial gap-1 sm:gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 text-xs sm:text-sm"
                            onClick={() => handleDelete(tool.slug)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Delete</span>
                            <span className="sm:hidden">Del</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Package className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">No Submissions Yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Start by submitting your first AI tool to the directory
                  </p>
                  <Link href="/submit">
                    <Button className="gap-2 text-sm sm:text-base">
                      <Upload className="w-4 h-4" />
                      Submit Your First Tool
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {favorites.map((favorite) =>
                  favorite.tool ? (
                    <ToolCard key={favorite.id} tool={favorite.tool} />
                  ) : null
                )}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">No Favorites Yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Start exploring and save your favorite AI tools
                  </p>
                  <Link href="/tools">
                    <Button className="gap-2 text-sm sm:text-base">
                      <Package className="w-4 h-4" />
                      Browse All Tools
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
