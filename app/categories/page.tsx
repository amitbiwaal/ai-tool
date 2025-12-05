"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  TrendingUp, 
  Sparkles, 
  Grid3x3, 
  LayoutGrid, 
  List,
  ArrowUpRight,
  Filter,
  Star,
  Zap,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock categories removed - using database instead
const _mockCategories_removed = [
  {
    id: "1",
    name: "AI Writing",
    slug: "ai-writing",
    description: "Transform your writing with AI-powered tools for content creation, copywriting, and editing",
    icon: "✍️",
    color: "#3b82f6",
    tools_count: 45,
    is_trending: true,
    is_popular: true,
  },
  {
    id: "2",
    name: "Image Generation",
    slug: "image-generation",
    description: "Create stunning visuals and artwork using cutting-edge AI image generators",
    icon: "🎨",
    color: "#ec4899",
    tools_count: 38,
    is_trending: true,
    is_popular: true,
  },
  {
    id: "3",
    name: "Code Assistant",
    slug: "code-assistant",
    description: "Accelerate development with AI coding assistants and programming tools",
    icon: "💻",
    color: "#8b5cf6",
    tools_count: 32,
    is_trending: false,
    is_popular: true,
  },
  {
    id: "4",
    name: "Video Editing",
    slug: "video-editing",
    description: "Edit and enhance videos effortlessly with AI-powered video tools",
    icon: "🎬",
    color: "#f59e0b",
    tools_count: 28,
    is_trending: true,
    is_popular: false,
  },
  {
    id: "5",
    name: "Music & Audio",
    slug: "music-audio",
    description: "Create, edit, and enhance audio with AI music and sound tools",
    icon: "🎵",
    color: "#10b981",
    tools_count: 24,
    is_trending: false,
    is_popular: false,
  },
  {
    id: "6",
    name: "Chatbots",
    slug: "chatbots",
    description: "Build intelligent conversational AI and customer service bots",
    icon: "💬",
    color: "#06b6d4",
    tools_count: 35,
    is_trending: true,
    is_popular: true,
  },
  {
    id: "7",
    name: "SEO & Marketing",
    slug: "seo-marketing",
    description: "Optimize your online presence with AI-driven SEO and marketing tools",
    icon: "📈",
    color: "#f97316",
    tools_count: 29,
    is_trending: false,
    is_popular: true,
  },
  {
    id: "8",
    name: "Voice & Speech",
    slug: "voice-speech",
    description: "Convert speech to text and text to speech with advanced AI technology",
    icon: "🎤",
    color: "#14b8a6",
    tools_count: 21,
    is_trending: false,
    is_popular: false,
  },
  {
    id: "9",
    name: "Research",
    slug: "research",
    description: "Streamline research and data analysis with intelligent AI assistants",
    icon: "🔬",
    color: "#6366f1",
    tools_count: 19,
    is_trending: false,
    is_popular: false,
  },
  {
    id: "10",
    name: "Business",
    slug: "business",
    description: "Enhance productivity and automate workflows with business AI tools",
    icon: "💼",
    color: "#84cc16",
    tools_count: 26,
    is_trending: false,
    is_popular: false,
  },
  {
    id: "11",
    name: "Education",
    slug: "education",
    description: "Revolutionize learning with AI-powered educational tools and platforms",
    icon: "📚",
    color: "#a855f7",
    tools_count: 22,
    is_trending: false,
    is_popular: false,
  },
  {
    id: "12",
    name: "Gaming",
    slug: "gaming",
    description: "Create and enhance gaming experiences with AI game development tools",
    icon: "🎮",
    color: "#ef4444",
    tools_count: 15,
    is_trending: false,
    is_popular: false,
  },
];

type ViewMode = "grid" | "compact" | "list";
type SortOption = "popular" | "name" | "tools";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  
  // Content from database
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const totalTools = categories.reduce((sum, cat) => sum + (cat.tools_count || 0), 0);

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
    fetchPageContent();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const response = await fetch("/api/admin/content?page=categories");
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
  };

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (showTrendingOnly) {
      filtered = filtered.filter((cat) => cat.is_trending);
    }

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "tools":
          return (b.tools_count || 0) - (a.tools_count || 0);
        case "popular":
        default:
          if (a.is_popular && !b.is_popular) return -1;
          if (!a.is_popular && b.is_popular) return 1;
          return (b.tools_count || 0) - (a.tools_count || 0);
      }
    });

    return filtered;
  }, [categories, searchQuery, sortBy, showTrendingOnly]);

  const popularCategories = categories.filter((cat) => cat.is_popular).slice(0, 4);
  const trendingCategories = categories.filter((cat) => cat.is_trending).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-background" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8 lg:py-24">
      {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex-shrink-0">
                <Grid3x3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {pageContent.heroTitle || "Browse Categories"}
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {(pageContent.heroDescription || `Discover ${totalTools.toLocaleString()}+ AI tools organized by their primary use cases. Find the perfect solution for your needs.`).replace("{totalTools}", totalTools.toLocaleString())}
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{categories.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{pageContent.statsCategoriesLabel || "Categories"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{totalTools}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{pageContent.statsToolsLabel || "AI Tools"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                <div className="p-1.5 sm:p-2 rounded-lg bg-pink-500/10">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{trendingCategories.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{pageContent.statsTrendingLabel || "Trending"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        {/* Popular Categories Highlight */}
        {popularCategories.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pageContent.mostPopularTitle || "Most Popular"}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularCategories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="h-full group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm font-semibold text-primary flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {category.tools_count} tools
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={pageContent.searchPlaceholder || "Search categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex gap-2 w-full sm:w-auto min-w-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 sm:px-4 h-10 sm:h-12 rounded-lg border bg-background hover:bg-accent transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto min-w-0 max-w-full truncate"
              >
                <option value="popular">{pageContent.sortPopular || "Most Popular"}</option>
                <option value="tools">{pageContent.sortTools || "Most Tools"}</option>
                <option value="name">{pageContent.sortName || "A-Z"}</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg border bg-background">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("compact")}
                  className="h-10 w-10"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showTrendingOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTrendingOnly(!showTrendingOnly)}
              className="rounded-full"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {pageContent.trendingOnlyButton || "Trending Only"}
            </Button>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-full"
              >
                {pageContent.clearSearchButton || "Clear Search"}
              </Button>
            )}
        </div>
      </div>

        {/* Categories Grid/List */}
        {filteredCategories.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const count = filteredCategories.length;
                  const text = pageContent.showingText || "Showing {count} {count === 1 ? 'category' : 'categories'}";
                  return text
                    .replace("{count}", count.toString())
                    .replace("{count === 1 ? 'category' : 'categories'}", count === 1 ? 'category' : 'categories');
                })()}
              </p>
            </div>

            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                viewMode === "compact" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
                viewMode === "list" && "grid-cols-1"
              )}
            >
              {filteredCategories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card
                    className={cn(
                      "h-full group relative overflow-hidden transition-all duration-300 cursor-pointer border-2 hover:border-primary/50",
                      viewMode === "list" ? "hover:shadow-md" : "hover:shadow-xl hover:-translate-y-1"
                    )}
                  >
                    {/* Gradient Overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${category.color}10, transparent 70%)`
                      }}
                    />

                    {/* Trending Badge */}
                    {category.is_trending && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold">
                          <Zap className="w-3 h-3" />
                          Trending
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "relative",
                      viewMode === "list" ? "flex items-center gap-4 p-4" : ""
                    )}>
                      {viewMode !== "list" ? (
                        <>
                <CardHeader>
                            <CardTitle className={cn(
                              "group-hover:text-primary transition-colors",
                              viewMode === "compact" ? "text-base" : "text-xl"
                            )}>
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                            {viewMode !== "compact" && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                                {category.description}
                  </p>
                            )}
                  <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold" style={{ color: category.color }}>
                                {category.tools_count} {category.tools_count === 1 ? "tool" : "tools"}
                    </p>
                              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {category.description}
                            </p>
                            <p className="text-xs font-semibold" style={{ color: category.color }}>
                              {category.tools_count} {category.tools_count === 1 ? "tool" : "tools"}
                            </p>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </>
                      )}
                    </div>
              </Card>
            </Link>
          ))}
        </div>
          </>
      ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
          </div>
            <h3 className="text-xl font-semibold mb-2">{pageContent.emptyStateTitle || "No categories found"}</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? (pageContent.emptyStateMessageSearch || `No categories match "{query}". Try a different search term.`).replace("{query}", searchQuery)
                : (pageContent.emptyStateMessageDefault || "Categories will appear here once they are added.")}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            )}
        </div>
      )}

      {/* Additional Info Section */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl" />
          <div className="relative p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pageContent.infoSectionTitle || "Find Your Perfect AI Tool"}</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                {pageContent.infoSectionDescription || "Our categories are meticulously organized to help you discover AI tools that perfectly match your needs. From content creation to development, marketing to research—find everything in one place."}
        </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{pageContent.infoCard1Title || "Use Case Focused"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pageContent.infoCard1Description || "Every category is designed around real workflows and specific needs"}
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{pageContent.infoCard2Title || "Quality Curated"}</h3>
            <p className="text-sm text-muted-foreground">
                    {pageContent.infoCard2Description || "Each tool is thoroughly reviewed and verified by our team"}
            </p>
          </div>
                <div className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{pageContent.infoCard3Title || "Always Fresh"}</h3>
            <p className="text-sm text-muted-foreground">
                    {pageContent.infoCard3Description || "New tools and categories added daily to keep you updated"}
            </p>
          </div>
                <div className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{pageContent.infoCard4Title || "Easy Discovery"}</h3>
            <p className="text-sm text-muted-foreground">
                    {pageContent.infoCard4Description || "Find exactly what you need with powerful search and filters"}
            </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

