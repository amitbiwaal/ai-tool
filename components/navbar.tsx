"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sparkles, User, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { getAvatarUrl, isDicebearUrl } from "@/lib/utils/images";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/tools" },
  { name: "Categories", href: "/categories" },
  { name: "Compare", href: "/compare" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAvatar, setUserAvatar] = useState(getAvatarUrl(null, undefined, "User"));

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Listen for auth state changes (e.g., after password reset)
    const handleAuthStateChanged = () => {
      checkAuth();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkAuth);
    window.addEventListener("authStateChanged", handleAuthStateChanged);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuth);
      window.removeEventListener("authStateChanged", handleAuthStateChanged);
    };
  }, [pathname]); // Re-check when route changes

  const checkAuth = async () => {
    // Check real authentication
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        // Fetch user profile to get avatar and admin status
        try {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              const avatarUrl = getAvatarUrl(data.profile.avatar_url, data.profile.email, data.profile.full_name);
              setUserAvatar(avatarUrl);
              setIsAdmin(data.profile.role === "admin" || data.profile.role === "moderator");
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setIsAuthenticated(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error);
          throw error;
        }
      }
      
      // Clear local state
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserAvatar(getAvatarUrl(null, undefined, "User"));
      
      // Clear any cached data
      if (typeof window !== "undefined") {
        // Clear localStorage if needed
        localStorage.removeItem("supabase.auth.token");
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("authStateChanged"));
      }
      
      toast.success("Logged out successfully!");
      
      // Redirect to home page
      router.push("/");
      
      // Force a hard refresh to clear all state
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-2xl shadow-sm transition-colors dark:bg-[#050817]/70 dark:border-white/5">
      <div className="hidden md:block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="uppercase tracking-[0.2em] text-xs font-semibold">
            AI Tools Directory
          </span>
          <span className="text-white/80 text-xs sm:text-sm text-center sm:text-left">
            <span className="hidden lg:inline">Curated tools • Premium insights • </span>Business inquiries: partner@aitoolsdirectory.com
          </span>
        </div>
      </div>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 rounded-full border border-slate-200 bg-white px-2 sm:px-4 py-1.5 sm:py-2 shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-white/5"
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300 flex-shrink-0" />
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                  AI Tools Directory
                </p>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                  EST. 2025
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  pathname === item.href
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow dark:from-blue-500 dark:to-purple-500"
                    : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/submit">
                  <Button
                    variant="outline"
                    size="sm"
                className="rounded-full border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
                  >
                <Sparkles className="h-4 w-4 mr-2" />
                Submit Tool
                  </Button>
                </Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200 dark:border-white/20"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="group relative">
                    <Link href="/dashboard">
                      <div className="relative w-9 h-9 rounded-full border-2 border-blue-500/50 group-hover:border-blue-500 transition-all duration-300 group-hover:scale-110 shadow-md cursor-pointer overflow-hidden">
                        <Image 
                          src={userAvatar} 
                          alt="User Avatar"
                          width={36}
                          height={36}
                          className="object-cover w-full h-full"
                          unoptimized={isDicebearUrl(userAvatar)}
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full z-10"></div>
                      </div>
                    </Link>
                    
                    {/* Dropdown on hover */}
                    <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                          <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <div className="border-t border-slate-200 dark:border-slate-700">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all dark:from-blue-500 dark:to-purple-500">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#080d1b]">
          <div className="space-y-2 sm:space-y-3 px-4 sm:px-6 py-4 sm:py-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow dark:from-blue-500 dark:to-purple-500"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Submit Tool Button for Mobile */}
            <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/10 mt-3 sm:mt-4">
                <Sparkles className="h-4 w-4 mr-2" />
                Submit Tool
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10 mt-3 sm:mt-4">
              <ThemeToggle />
              <span className="text-sm text-slate-500 dark:text-slate-300">Theme</span>
            </div>
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 mt-3 sm:mt-4">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full dark:border-white/20 dark:text-white">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline" 
                  className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/20 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-3 sm:mt-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full rounded-full dark:border-white/20 dark:text-white">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}