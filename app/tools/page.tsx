"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { Filters } from "@/components/filters";
import { ToolCard } from "@/components/tool-card";
import { Pagination } from "@/components/pagination";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tool, Category, Tag } from "@/lib/types";
import { 
  Sparkles, 
  Filter, 
  X, 
  LayoutGrid, 
  List,
  TrendingUp,
  Star,
  Zap,
  Package,
  ChevronDown,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for tools
// Mock tools removed - using database instead
const _mockTools_removed = [
  {
    id: "1",
    name: "ChatGPT",
    slug: "chatgpt",
    tagline: "Conversational AI that answers questions and helps with tasks",
    description: "Advanced AI language model for conversations, writing, coding, and more",
    logo_url: "https://via.placeholder.com/100x100/3b82f6/ffffff?text=GPT",
    website_url: "https://chat.openai.com",
    pricing_type: "freemium",
    rating_avg: 4.8,
    rating_count: 2500,
    views_count: 50000,
    is_featured: true,
    is_trending: true,
    status: "approved",
    created_at: "2024-01-15",
    updated_at: "2024-01-15",
    categories: [{ id: "1", name: "AI Writing", slug: "ai-writing", description: "", color: "#3b82f6", icon: "✍️", tools_count: 45, created_at: "", updated_at: "" }],
    tags: [{ id: "1", name: "GPT", slug: "gpt", tools_count: 20, created_at: "", updated_at: "" }],
  },
  {
    id: "2",
    name: "Midjourney",
    slug: "midjourney",
    tagline: "AI art generator creating stunning images from text",
    description: "Create beautiful, unique artwork using advanced AI image generation",
    logo_url: "https://via.placeholder.com/100x100/ec4899/ffffff?text=MJ",
    website_url: "https://midjourney.com",
    pricing_type: "subscription",
    rating_avg: 4.7,
    rating_count: 1800,
    views_count: 45000,
    is_featured: true,
    is_trending: true,
    status: "approved",
    created_at: "2024-01-14",
    updated_at: "2024-01-14",
    categories: [{ id: "2", name: "Image Generation", slug: "image-generation", description: "", color: "#ec4899", icon: "🎨", tools_count: 38, created_at: "", updated_at: "" }],
    tags: [{ id: "2", name: "Art", slug: "art", tools_count: 15, created_at: "", updated_at: "" }],
  },
  {
    id: "3",
    name: "GitHub Copilot",
    slug: "github-copilot",
    tagline: "AI pair programmer that helps you write code faster",
    description: "Your AI coding assistant that suggests code and entire functions in real-time",
    logo_url: "https://via.placeholder.com/100x100/8b5cf6/ffffff?text=GH",
    website_url: "https://github.com/features/copilot",
    pricing_type: "subscription",
    rating_avg: 4.6,
    rating_count: 1500,
    views_count: 40000,
    is_featured: true,
    is_trending: false,
    status: "approved",
    created_at: "2024-01-13",
    updated_at: "2024-01-13",
    categories: [{ id: "3", name: "Code Assistant", slug: "code-assistant", description: "", color: "#8b5cf6", icon: "💻", tools_count: 32, created_at: "", updated_at: "" }],
    tags: [{ id: "3", name: "Coding", slug: "coding", tools_count: 25, created_at: "", updated_at: "" }],
  },
  {
    id: "4",
    name: "Jasper AI",
    slug: "jasper-ai",
    tagline: "AI content platform for marketing teams",
    description: "Create high-quality marketing content, blog posts, and social media copy",
    logo_url: "https://via.placeholder.com/100x100/f59e0b/ffffff?text=JA",
    website_url: "https://jasper.ai",
    pricing_type: "subscription",
    rating_avg: 4.5,
    rating_count: 1200,
    views_count: 35000,
    is_featured: false,
    is_trending: true,
    status: "approved",
    created_at: "2024-01-12",
    updated_at: "2024-01-12",
    categories: [{ id: "1", name: "AI Writing", slug: "ai-writing", description: "", color: "#3b82f6", icon: "✍️", tools_count: 45, created_at: "", updated_at: "" }],
    tags: [{ id: "4", name: "Marketing", slug: "marketing", tools_count: 18, created_at: "", updated_at: "" }],
  },
  {
    id: "5",
    name: "DALL-E 3",
    slug: "dall-e-3",
    tagline: "Create realistic images and art from text descriptions",
    description: "OpenAI's most advanced image generation model for creating detailed images",
    logo_url: "https://via.placeholder.com/100x100/10b981/ffffff?text=DE",
    website_url: "https://openai.com/dall-e-3",
    pricing_type: "freemium",
    rating_avg: 4.7,
    rating_count: 1600,
    views_count: 38000,
    is_featured: true,
    is_trending: true,
    status: "approved",
    created_at: "2024-01-11",
    updated_at: "2024-01-11",
    categories: [{ id: "2", name: "Image Generation", slug: "image-generation", description: "", color: "#ec4899", icon: "🎨", tools_count: 38, created_at: "", updated_at: "" }],
    tags: [{ id: "2", name: "Art", slug: "art", tools_count: 15, created_at: "", updated_at: "" }],
  },
  {
    id: "6",
    name: "Runway ML",
    slug: "runway-ml",
    tagline: "AI-powered video editing and generation tool",
    description: "Create and edit videos using cutting-edge AI technology",
    logo_url: "https://via.placeholder.com/100x100/06b6d4/ffffff?text=RW",
    website_url: "https://runwayml.com",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 900,
    views_count: 28000,
    is_featured: false,
    is_trending: true,
    status: "approved",
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
    categories: [{ id: "4", name: "Video Editing", slug: "video-editing", description: "", color: "#f59e0b", icon: "🎬", tools_count: 28, created_at: "", updated_at: "" }],
    tags: [{ id: "5", name: "Video", slug: "video", tools_count: 12, created_at: "", updated_at: "" }],
  },
  {
    id: "7",
    name: "Copy.ai",
    slug: "copy-ai",
    tagline: "AI-powered copywriting tool for marketing content",
    description: "Generate high-quality marketing copy in seconds with AI",
    logo_url: "https://via.placeholder.com/100x100/ef4444/ffffff?text=CA",
    website_url: "https://copy.ai",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 1100,
    views_count: 32000,
    is_featured: false,
    is_trending: false,
    status: "approved",
    created_at: "2024-01-09",
    updated_at: "2024-01-09",
    categories: [{ id: "1", name: "AI Writing", slug: "ai-writing", description: "", color: "#3b82f6", icon: "✍️", tools_count: 45, created_at: "", updated_at: "" }],
    tags: [{ id: "4", name: "Marketing", slug: "marketing", tools_count: 18, created_at: "", updated_at: "" }],
  },
  {
    id: "8",
    name: "Notion AI",
    slug: "notion-ai",
    tagline: "AI-powered workspace for notes and collaboration",
    description: "Write, brainstorm, and organize with AI assistance in Notion",
    logo_url: "https://via.placeholder.com/100x100/a855f7/ffffff?text=NA",
    website_url: "https://notion.so/product/ai",
    pricing_type: "freemium",
    rating_avg: 4.5,
    rating_count: 1400,
    views_count: 36000,
    is_featured: false,
    is_trending: false,
    status: "approved",
    created_at: "2024-01-08",
    updated_at: "2024-01-08",
    categories: [{ id: "10", name: "Business", slug: "business", description: "", color: "#84cc16", icon: "💼", tools_count: 26, created_at: "", updated_at: "" }],
    tags: [{ id: "6", name: "Productivity", slug: "productivity", tools_count: 22, created_at: "", updated_at: "" }],
  },
  {
    id: "9",
    name: "Stable Diffusion",
    slug: "stable-diffusion",
    tagline: "Open-source AI image generation model",
    description: "Free and open-source text-to-image diffusion model",
    logo_url: "https://via.placeholder.com/100x100/14b8a6/ffffff?text=SD",
    website_url: "https://stability.ai",
    pricing_type: "free",
    rating_avg: 4.3,
    rating_count: 800,
    views_count: 25000,
    is_featured: false,
    is_trending: false,
    status: "approved",
    created_at: "2024-01-07",
    updated_at: "2024-01-07",
    categories: [{ id: "2", name: "Image Generation", slug: "image-generation", description: "", color: "#ec4899", icon: "🎨", tools_count: 38, created_at: "", updated_at: "" }],
    tags: [{ id: "7", name: "Open Source", slug: "open-source", tools_count: 10, created_at: "", updated_at: "" }],
  },
];

// Mock categories removed - using database instead
const _mockCategories_removed = [
  { id: "1", name: "AI Writing", slug: "ai-writing", description: "", color: "#3b82f6", icon: "✍️", tools_count: 45, created_at: "", updated_at: "" },
  { id: "2", name: "Image Generation", slug: "image-generation", description: "", color: "#ec4899", icon: "🎨", tools_count: 38, created_at: "", updated_at: "" },
  { id: "3", name: "Code Assistant", slug: "code-assistant", description: "", color: "#8b5cf6", icon: "💻", tools_count: 32, created_at: "", updated_at: "" },
  { id: "4", name: "Video Editing", slug: "video-editing", description: "", color: "#f59e0b", icon: "🎬", tools_count: 28, created_at: "", updated_at: "" },
];

// Mock tags removed - using database instead
const _mockTags_removed = [
  { id: "1", name: "GPT", slug: "gpt", tools_count: 20, created_at: "", updated_at: "" },
  { id: "2", name: "Art", slug: "art", tools_count: 15, created_at: "", updated_at: "" },
  { id: "3", name: "Coding", slug: "coding", tools_count: 25, created_at: "", updated_at: "" },
  { id: "4", name: "Marketing", slug: "marketing", tools_count: 18, created_at: "", updated_at: "" },
];

interface ToolsContent {
  heroTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  statsToolsLabel: string;
  statsCategoriesLabel: string;
  statsRatingLabel: string;
  statsRatingValue: string;
  emptyStateTitle: string;
  emptyStateMessageSearch: string;
  emptyStateMessageFilters: string;
  sortNewest: string;
  sortPopular: string;
  sortRating: string;
  sortName: string;
  loadMoreButton: string;
  endMessage: string;
  showingText: string;
  toolsFoundText: string;
}

const defaultToolsContent: ToolsContent = {
  heroTitle: "All AI Tools",
  heroDescription: "Discover, compare, and find the perfect AI tools for your needs. Browse our comprehensive collection of cutting-edge AI solutions.",
  searchPlaceholder: "Search for AI tools...",
  statsToolsLabel: "Tools Available",
  statsCategoriesLabel: "Categories",
  statsRatingLabel: "Avg Rating",
  statsRatingValue: "4.7+",
  emptyStateTitle: "No tools found",
  emptyStateMessageSearch: "No tools match \"{query}\". Try adjusting your filters or search term.",
  emptyStateMessageFilters: "No tools match your current filters. Try adjusting your criteria.",
  sortNewest: "⚡ Newest",
  sortPopular: "🔥 Most Popular",
  sortRating: "⭐ Top Rated",
  sortName: "🔤 A-Z",
  loadMoreButton: "Load More Tools",
  endMessage: "You've reached the end! All tools loaded.",
  showingText: "Showing {count} of {total} tools",
  toolsFoundText: "{count} tools found",
};

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayedTools, setDisplayedTools] = useState<Tool[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [toolsContent, setToolsContent] = useState<ToolsContent>(defaultToolsContent);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  const fetchCategoriesAndTags = useCallback(async () => {
    try {
      const promises = [];

      if (categories.length === 0) {
        promises.push(
          fetch(`/api/categories?t=${Date.now()}`, {
            cache: 'no-store',
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              setCategories(data.categories || []);
            }
          }).catch((error) => {
            console.error("Error fetching categories:", error);
          })
        );
      }

      if (tags.length === 0) {
        promises.push(
          fetch(`/api/tags?t=${Date.now()}`, {
            cache: 'no-store',
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              setTags(data.tags || []);
            }
          }).catch((error) => {
            console.error("Error fetching tags:", error);
          })
        );
      }

      // Load both in parallel
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    } catch (error) {
      console.error("Error in fetchCategoriesAndTags:", error);
    }
  }, [categories.length, tags.length]);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sort: sortBy }),
        ...(selectedCategories.length > 0 && { categories: selectedCategories.join(",") }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(",") }),
        ...(selectedPricing.length > 0 && { pricing: selectedPricing.join(",") }),
        ...(minRating > 0 && { rating: minRating.toString() }),
        t: Date.now().toString(), // Cache busting
      });

      const response = await fetch(`/api/tools?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const fetchedTools = data.tools || [];
      setTools(fetchedTools);
      setDisplayedTools(fetchedTools.slice(0, 6));
      setTotalPages(data.totalPages || 1);
      setHasMore(fetchedTools.length > 6);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error("Error fetching tools:", error);

      if (!isRetry && retryCount < 2) {
        // Retry up to 2 times with exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData(true);
        }, Math.pow(2, retryCount) * 1000);
        return;
      }

      setError(error.message || "Failed to load tools. Please try again.");
      setTools([]);
      setDisplayedTools([]);
      setTotalPages(1);
      setHasMore(false);
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [currentPage, searchQuery, sortBy, selectedCategories, selectedTags, selectedPricing, minRating, retryCount]);

  // Load categories and tags on mount
  useEffect(() => {
    fetchCategoriesAndTags();
  }, [fetchCategoriesAndTags]);

  // Load tools when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/tools?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/tools?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedPricing([]);
    setMinRating(0);
    router.push("/tools");
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    try {
      const currentLength = displayedTools.length;
      const moreTools = tools.slice(currentLength, currentLength + 6);
      
      if (moreTools.length > 0) {
        setDisplayedTools([...displayedTools, ...moreTools]);
      }
      
      // Check if there are more tools to load
      if (currentLength + moreTools.length >= tools.length) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more tools:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || selectedPricing.length > 0 || minRating > 0;

  return (
    <div className="min-h-screen">
      {/* Centered Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-background" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8 lg:py-12">
          {/* Centered Header */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Title Section */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Package className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {toolsContent.heroTitle || "All AI Tools"}
              </h1>
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              {toolsContent.heroDescription || "Discover, compare, and find the perfect AI tools for your needs. Browse our comprehensive collection of cutting-edge AI solutions."}
            </p>

            {/* Centered Stats */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{loading ? "..." : displayedTools.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{toolsContent.statsToolsLabel || "Tools Available"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{categories.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{toolsContent.statsCategoriesLabel || "Categories"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-1.5 sm:p-2 rounded-lg bg-pink-500/10">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{toolsContent.statsRatingValue || "4.7+"}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{toolsContent.statsRatingLabel || "Avg Rating"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <SearchBar placeholder={toolsContent.searchPlaceholder || "Search for AI tools..."} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className={cn(
            "w-full lg:w-72 flex-shrink-0 transition-all duration-300",
            !showFilters && "lg:w-0 lg:overflow-hidden"
          )}>
            <div className="sticky top-20 sm:top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <Filters
                categories={categories}
                tags={tags}
                selectedCategories={selectedCategories}
                selectedTags={selectedTags}
                selectedPricing={selectedPricing}
                minRating={minRating}
                onCategoryChange={setSelectedCategories}
                onTagChange={setSelectedTags}
                onPricingChange={setSelectedPricing}
                onRatingChange={setMinRating}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
                <p className="text-sm font-medium">
                  {loading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : toolsContent.toolsFoundText ? (
                    <span className="text-muted-foreground">
                      {toolsContent.toolsFoundText.replace("{count}", tools.length.toString())}
                    </span>
                  ) : (
                    <>
                      <span className="text-primary">{tools.length}</span>
                      <span className="text-muted-foreground"> tools found</span>
                    </>
                  )}
                </p>
                {hasActiveFilters && (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Filters active</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg border bg-background">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 h-8 text-sm rounded-lg border bg-background hover:bg-accent transition-colors cursor-pointer min-w-0 max-w-full truncate"
                >
                  <option value="newest">{toolsContent.sortNewest || "⚡ Newest"}</option>
                  <option value="popular">{toolsContent.sortPopular || "🔥 Most Popular"}</option>
                  <option value="rating">{toolsContent.sortRating || "⭐ Top Rated"}</option>
                  <option value="name">{toolsContent.sortName || "🔤 A-Z"}</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c.id === catId);
                  return category ? (
                    <div
                      key={catId}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {category.name}
                      <button
                        onClick={() =>
                          setSelectedCategories(selectedCategories.filter((id) => id !== catId))
                        }
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null;
                })}
                {selectedPricing.map((pricing) => (
                  <div
                    key={pricing}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium"
                  >
                    {pricing}
                    <button
                      onClick={() =>
                        setSelectedPricing(selectedPricing.filter((p) => p !== pricing))
                      }
                      className="ml-1 hover:bg-purple-500/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {minRating > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                    ⭐ {minRating}+ rating
                    <button
                      onClick={() => setMinRating(0)}
                      className="ml-1 hover:bg-yellow-500/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">Failed to Load Tools</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => fetchData()} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="default">
                    Refresh Page
                  </Button>
                </div>
              </div>
            )}

            {/* Tools Grid/List */}
            {!error && loading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 bg-muted animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : displayedTools.length > 0 ? (
              <>
                <div className={cn(
                  "grid gap-6",
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {displayedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>

                {/* Load More Section */}
                <div className="mt-12 space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium">
                      {toolsContent.showingText?.replace("{count}", displayedTools.length.toString()).replace("{total}", tools.length.toString()) || `Showing ${displayedTools.length} of ${tools.length} tools`}
                    </span>
                    <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${tools.length > 0 ? (displayedTools.length / tools.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Load More Button */}
                  {hasMore ? (
                    <div className="flex justify-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        size="lg"
                        className="relative overflow-hidden group min-w-[200px]"
                      >
                        {loadingMore ? (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Loading...
                            </div>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                            {toolsContent.loadMoreButton || "Load More Tools"}
                            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 border">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {toolsContent.endMessage || "You've reached the end! All tools loaded."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{toolsContent.emptyStateTitle || "No tools found"}</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? (toolsContent.emptyStateMessageSearch?.replace("{query}", searchQuery) || `No tools match "${searchQuery}". Try adjusting your filters or search term.`)
                    : (toolsContent.emptyStateMessageFilters || "No tools match your current filters. Try adjusting your criteria.")}
                </p>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        {/* Centered Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-background" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8 lg:py-12">
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="h-8 sm:h-10 bg-white/20 rounded animate-pulse w-48 sm:w-64" />
              </div>

              <div className="h-4 sm:h-6 bg-white/20 rounded animate-pulse w-96 mx-auto mb-6 sm:mb-8" />

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/30 rounded animate-pulse" />
                    </div>
                    <div>
                      <div className="w-8 h-4 bg-white/30 rounded animate-pulse mb-1" />
                      <div className="w-12 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
          <div className="h-12 bg-muted/50 rounded-xl animate-pulse mb-6 sm:mb-8" />

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
            </aside>
            <div className="flex-1">
              <div className="h-16 bg-muted/50 rounded-xl animate-pulse mb-4 sm:mb-6" />
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted/50 animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}

