"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Wrench, 
  FolderTree, 
  FileText, 
  Users, 
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  MessageSquare,
  Mail,
  CreditCard,
  Edit,
  MessageCircle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Tools", href: "/admin/tools", icon: Wrench },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Tags", href: "/admin/tags", icon: Tag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Blog Categories", href: "/admin/blog-categories", icon: BookOpen },
  { name: "Comments", href: "/admin/comments", icon: MessageCircle },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Content", href: "/admin/content", icon: Edit },
  { name: "Contact", href: "/admin/contact", icon: Mail },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error);
          throw error;
        }
      }
      
      // Clear any cached data
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token");
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
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-56 sm:w-64 bg-gradient-to-b from-slate-900 to-slate-800 transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-700">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <LayoutDashboard className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Admin Panel</h2>
              <p className="text-[10px] sm:text-xs text-slate-400">AI Tools Directory</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4 scrollbar-hide">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-700 p-3 sm:p-4 space-y-2">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 text-xs sm:text-sm h-8 sm:h-10"
              >
                <Home className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Back to Website
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-red-600/20 hover:text-red-300 text-xs sm:text-sm h-8 sm:h-10"
              onClick={handleLogout}
            >
              <LogOut className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

