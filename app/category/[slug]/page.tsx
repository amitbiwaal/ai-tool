import { notFound } from "next/navigation";
import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateMetadata as generateMeta } from "@/lib/utils";
import { Star, TrendingUp, Clock, DollarSign, ArrowUpDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

// Mock categories removed - using database only
const _mockCategories_removed: Record<string, any> = {
  "ai-writing": {
    id: "cat1",
    name: "AI Writing",
    slug: "ai-writing",
    description: "Transform your writing with AI-powered tools for content creation, copywriting, and editing",
    icon: "✍️",
    color: "#3b82f6",
    tools_count: 25,
  },
  "ai-art": {
    id: "cat2",
    name: "AI Art",
    slug: "ai-art",
    description: "Create stunning visuals and artwork using cutting-edge AI image generators",
    icon: "🎨",
    color: "#8b5cf6",
    tools_count: 18,
  },
  "ai-coding": {
    id: "cat3",
    name: "AI Coding",
    slug: "ai-coding",
    description: "Accelerate development with AI coding assistants and programming tools",
    icon: "💻",
    color: "#10b981",
    tools_count: 12,
  },
  "ai-video": {
    id: "cat4",
    name: "AI Video",
    slug: "ai-video",
    description: "Edit and enhance videos effortlessly with AI-powered video tools",
    icon: "🎬",
    color: "#ec4899",
    tools_count: 8,
  },
  "ai-music": {
    id: "cat5",
    name: "AI Music",
    slug: "ai-music",
    description: "Create, edit, and enhance audio with AI music and sound tools",
    icon: "🎵",
    color: "#f59e0b",
    tools_count: 15,
  },
  "ai-business": {
    id: "cat6",
    name: "AI Business",
    slug: "ai-business",
    description: "AI tools for business operations, analytics, and productivity",
    icon: "📊",
    color: "#6366f1",
    tools_count: 22,
  },
  "ai-chat": {
    id: "cat7",
    name: "AI Chat",
    slug: "ai-chat",
    description: "Intelligent chatbots and conversational AI assistants",
    icon: "💬",
    color: "#14b8a6",
    tools_count: 19,
  },
  "ai-image": {
    id: "cat8",
    name: "AI Image",
    slug: "ai-image",
    description: "AI-powered image editing and enhancement tools",
    icon: "🖼️",
    color: "#f43f5e",
    tools_count: 16,
  },
  "ai-voice": {
    id: "cat9",
    name: "AI Voice",
    slug: "ai-voice",
    description: "Voice synthesis, recognition, and audio processing with AI",
    icon: "🎤",
    color: "#06b6d4",
    tools_count: 11,
  },
  "ai-seo": {
    id: "cat10",
    name: "AI SEO",
    slug: "ai-seo",
    description: "AI tools for search engine optimization and content marketing",
    icon: "🔍",
    color: "#84cc16",
    tools_count: 14,
  },
  "ai-marketing": {
    id: "cat11",
    name: "AI Marketing",
    slug: "ai-marketing",
    description: "AI-powered marketing automation and campaign tools",
    icon: "📱",
    color: "#a855f7",
    tools_count: 20,
  },
  "ai-research": {
    id: "cat12",
    name: "AI Research",
    slug: "ai-research",
    description: "AI tools for research, data analysis, and scientific discovery",
    icon: "🔬",
    color: "#0ea5e9",
    tools_count: 9,
  },
  "ai-finance": {
    id: "cat13",
    name: "AI Finance",
    slug: "ai-finance",
    description: "AI tools for financial analysis, trading, and management",
    icon: "💰",
    color: "#22c55e",
    tools_count: 13,
  },
  "ai-education": {
    id: "cat14",
    name: "AI Education",
    slug: "ai-education",
    description: "AI-powered learning platforms and educational tools",
    icon: "📚",
    color: "#eab308",
    tools_count: 17,
  },
  "ai-analytics": {
    id: "cat15",
    name: "AI Analytics",
    slug: "ai-analytics",
    description: "Advanced analytics and data insights with AI",
    icon: "📈",
    color: "#3b82f6",
    tools_count: 10,
  },
  "ai-gaming": {
    id: "cat16",
    name: "AI Gaming",
    slug: "ai-gaming",
    description: "AI tools for game development and gaming experiences",
    icon: "🎮",
    color: "#8b5cf6",
    tools_count: 7,
  },
  "ai-social": {
    id: "cat17",
    name: "AI Social",
    slug: "ai-social",
    description: "AI tools for social media management and engagement",
    icon: "👥",
    color: "#ec4899",
    tools_count: 12,
  },
  "ai-health": {
    id: "cat18",
    name: "AI Health",
    slug: "ai-health",
    description: "AI-powered healthcare and wellness tools",
    icon: "❤️",
    color: "#10b981",
    tools_count: 8,
  },
};

async function getCategory(slug: string) {
  // Try database first
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) {
      return data;
    }
  }

  // No fallback - return null if not found
  return null;
}

// Mock tools removed - using database only

async function getCategoryTools(
  categoryId: string,
  sortBy: string = "rating"
) {
  // Try database first
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    let query = supabase
      .from("tools")
      .select(
        `
        *,
        categories:tool_categories!inner(category:categories(*)),
        tags:tool_tags(tag:tags(*))
      `
      )
      .eq("tool_categories.category_id", categoryId)
      .eq("status", "approved");

    // Apply sorting
    switch (sortBy) {
      case "rating":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "popular":
        query = query.order("views_count", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "name":
        query = query.order("name", { ascending: true });
        break;
      default:
        query = query.order("rating_avg", { ascending: false });
    }

    const { data } = await query;

    if (data && data.length > 0) {
      return data.map((tool: any) => ({
        ...tool,
        categories: tool.categories?.map((c: any) => c.category) || [],
        tags: tool.tags?.map((t: any) => t.tag) || [],
      }));
    }
  }

  // No fallback - return empty array if not found
  return [];
}

async function getRelatedCategories(categoryId: string) {
  // Try database first
  const supabase = await createServerSupabaseClient();
  
  if (supabase) {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .neq("id", categoryId)
      .order("tools_count", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      return data;
    }
  }
  
  // No fallback - return empty array if not found
  return [];
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const { slug } = await Promise.resolve(params);
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return generateMeta({
    title: `${category.name} AI Tools`,
    description:
      category.description ||
      `Discover the best ${category.name} AI tools. Find and compare AI-powered ${category.name} solutions.`,
    url: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: { sort?: string; pricing?: string };
}) {
  const { slug } = await Promise.resolve(params);
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const sortBy = searchParams?.sort || "rating";
  const pricingFilter = searchParams?.pricing;

  let tools = await getCategoryTools(category.id, sortBy);
  
  // Apply pricing filter if provided
  if (pricingFilter && pricingFilter !== "all") {
    tools = tools.filter((tool) => tool.pricing_type === pricingFilter);
  }

  const relatedCategories = await getRelatedCategories(category.id);

  // Get unique pricing types from tools
  const pricingTypes = Array.from(
    new Set(tools.map((tool) => tool.pricing_type))
  );

  // Calculate stats
  const avgRating = tools.length > 0
    ? (tools.reduce((sum, tool) => sum + tool.rating_avg, 0) / tools.length).toFixed(1)
    : "0";
  const freeToolsCount = tools.filter((t) => t.pricing_type === "free").length;
  const featuredCount = tools.filter((t) => t.is_featured).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background - Matching Categories Page */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-background" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8 lg:py-24">
          {/* Header - Matching Categories Page Style */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-2">
                {category.name} AI Tools
              </h1>
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              {category.description ||
                `Discover and compare the best ${category.name} AI tools. Find the perfect solution for your needs.`}
            </p>

            {/* Stats Cards - Matching Categories Page Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                  <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{tools.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Tools</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{avgRating}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
              
              {freeToolsCount > 0 ? (
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-pink-500/10">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{freeToolsCount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Free Tools</p>
                  </div>
                </div>
              ) : featuredCount > 0 ? (
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-pink-500/10">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{featuredCount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Featured</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur border shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-pink-500/10">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{category.tools_count || 0}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

      {/* Filters and Sorting - Enhanced Design */}
      <div className="mb-8 p-6 rounded-2xl border-2 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              <Link href={`/category/${category.slug}?sort=rating${pricingFilter ? `&pricing=${pricingFilter}` : ''}`}>
                <Button 
                  variant={sortBy === "rating" ? "default" : "outline"} 
                  size="sm"
                  className="text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Top Rated
                </Button>
              </Link>
              <Link href={`/category/${category.slug}?sort=popular${pricingFilter ? `&pricing=${pricingFilter}` : ''}`}>
                <Button 
                  variant={sortBy === "popular" ? "default" : "outline"} 
                  size="sm"
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Button>
              </Link>
              <Link href={`/category/${category.slug}?sort=newest${pricingFilter ? `&pricing=${pricingFilter}` : ''}`}>
                <Button 
                  variant={sortBy === "newest" ? "default" : "outline"} 
                  size="sm"
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Newest
                </Button>
              </Link>
            </div>
          </div>

          {/* Pricing Filter */}
          {pricingTypes.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Pricing:</span>
              <div className="flex gap-2">
                <Link href={`/category/${category.slug}?sort=${sortBy}`}>
                  <Button 
                    variant={!pricingFilter || pricingFilter === "all" ? "default" : "outline"} 
                    size="sm"
                    className="text-xs"
                  >
                    All
                  </Button>
                </Link>
                {pricingTypes.includes("free") && (
                  <Link href={`/category/${category.slug}?sort=${sortBy}&pricing=free`}>
                    <Button 
                      variant={pricingFilter === "free" ? "default" : "outline"} 
                      size="sm"
                      className="text-xs"
                    >
                      Free
                    </Button>
                  </Link>
                )}
                {pricingTypes.includes("freemium") && (
                  <Link href={`/category/${category.slug}?sort=${sortBy}&pricing=freemium`}>
                    <Button 
                      variant={pricingFilter === "freemium" ? "default" : "outline"} 
                      size="sm"
                      className="text-xs"
                    >
                      Freemium
                    </Button>
                  </Link>
                )}
                {pricingTypes.includes("paid") && (
                  <Link href={`/category/${category.slug}?sort=${sortBy}&pricing=paid`}>
                    <Button 
                      variant={pricingFilter === "paid" ? "default" : "outline"} 
                      size="sm"
                      className="text-xs"
                    >
                      Paid
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mx-auto mb-6 flex items-center justify-center">
            <ArrowUpDown className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No tools found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {pricingFilter 
              ? `No ${pricingFilter} tools found in this category. Try adjusting your filters.`
              : "No tools found in this category yet. Check back soon for new additions!"}
          </p>
          {pricingFilter && (
            <Link href={`/category/${category.slug}?sort=${sortBy}`}>
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Clear Filters
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Related Categories - Enhanced Design */}
      {relatedCategories.length > 0 && (
        <div className="mt-20 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Explore Related Categories</h2>
            <p className="text-muted-foreground">Discover more AI tools in similar categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedCategories.map((relatedCat) => (
              <Link 
                key={relatedCat.id} 
                href={`/category/${relatedCat.slug}`}
                className="group relative p-5 rounded-xl border-2 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${relatedCat.color}10, transparent 70%)`
                  }}
                />
                
                <div className="relative">
                  <p className="text-sm font-semibold text-center line-clamp-2 group-hover:text-primary transition-colors">
                    {relatedCat.name}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {relatedCat.tools_count} tools
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section - Enhanced Design */}
      <div className="mt-20 mb-12 relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
        
        <div className="relative p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Can't find what you're looking for?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Submit your favorite AI tool or explore other categories to discover more amazing solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                  <TrendingUp className="w-5 h-5" />
                  Submit a Tool
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" size="lg" className="gap-2 border-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Browse All Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

