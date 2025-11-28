"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Heart,
  Share2,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  Calendar,
  TrendingUp,
  MessageCircle,
  Play,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/rating";
import { CategoryBadge } from "@/components/category-badge";
import { ToolCard } from "@/components/tool-card";
import { Tool, Review } from "@/lib/types";
import { getPricingBadgeColor } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// Mock data removed - using database instead
const _getMockTool_removed = (slug: string): Tool | null => {
  const _mockTools_removed: Record<string, Tool> = {
    "chatgpt": {
      id: "1",
      name: "ChatGPT",
      slug: "chatgpt",
      tagline: "Conversational AI that answers questions and helps with tasks",
      description: "Advanced AI language model for conversations, writing, coding, and more",
      long_description: "ChatGPT is a powerful AI assistant developed by OpenAI that can engage in natural conversations, answer questions, help with writing tasks, assist with coding, and much more. It's built on GPT-4 technology and can understand context, generate creative content, solve problems, and provide detailed explanations on a wide range of topics.",
      logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=ChatGPT",
      cover_image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
      website_url: "https://chat.openai.com",
      pricing_type: "freemium",
      pricing_details: [
        {
          name: "Free",
          price: "$0/month",
          features: ["Basic GPT-3.5 access", "Standard response speed", "Limited usage"]
        },
        {
          name: "Plus",
          price: "$20/month",
          features: ["GPT-4 access", "Faster response times", "Priority access", "Advanced features"]
        }
      ],
      features: [
        "Natural language conversations",
        "Code generation and debugging",
        "Creative writing assistance",
        "Question answering",
        "Translation and summarization",
        "Multi-language support"
      ],
      pros: [
        "Highly accurate responses",
        "Easy to use interface",
        "Regular updates and improvements",
        "Strong community support"
      ],
      cons: [
        "Free tier has limitations",
        "Can sometimes hallucinate information",
        "Requires internet connection"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1682609909902-0a100eada5be?w=800&h=600&fit=crop"
      ],
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      rating_avg: 4.8,
      rating_count: 2500,
      views_count: 50000,
      favorites_count: 12000,
      is_featured: true,
      is_trending: true,
      status: "approved",
      submitted_by: null,
      approved_by: null,
      approved_at: null,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
      categories: [
        { id: "1", name: "AI Writing", slug: "ai-writing", description: "AI writing tools", color: "#3b82f6", icon: "✍️", tools_count: 45, created_at: "", updated_at: "", parent_id: null }
      ],
      tags: [
        { id: "1", name: "GPT", slug: "gpt", created_at: "" },
        { id: "2", name: "Chatbot", slug: "chatbot", created_at: "" }
      ]
    },
    "midjourney": {
      id: "2",
      name: "Midjourney",
      slug: "midjourney",
      tagline: "AI art generator creating stunning images from text",
      description: "Create beautiful, unique artwork using advanced AI image generation",
      long_description: "Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species. It's an AI art generator that creates stunning, unique images from text descriptions. With its advanced algorithms, you can generate photorealistic images, artistic illustrations, and creative designs in seconds.",
      logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=Midjourney",
      cover_image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop",
      website_url: "https://midjourney.com",
      pricing_type: "subscription",
      pricing_details: [
        {
          name: "Basic",
          price: "$10/month",
          features: ["200 images/month", "Standard generation speed", "Community gallery access"]
        },
        {
          name: "Standard",
          price: "$30/month",
          features: ["900 images/month", "Faster generation", "Private mode", "Priority support"]
        },
        {
          name: "Pro",
          price: "$60/month",
          features: ["Unlimited images", "Fastest generation", "Commercial license", "Dedicated support"]
        }
      ],
      features: [
        "Text-to-image generation",
        "High-quality artwork",
        "Multiple art styles",
        "Fast generation times",
        "Community features",
        "Commercial licensing options"
      ],
      pros: [
        "Exceptional image quality",
        "Unique artistic style",
        "Active community",
        "Regular model updates"
      ],
      cons: [
        "Requires Discord",
        "Subscription only",
        "Learning curve for prompts"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop"
      ],
      video_url: null,
      rating_avg: 4.7,
      rating_count: 1800,
      views_count: 45000,
      favorites_count: 9800,
      is_featured: true,
      is_trending: true,
      status: "approved",
      submitted_by: null,
      approved_by: null,
      approved_at: null,
      created_at: "2024-01-14T00:00:00Z",
      updated_at: "2024-01-14T00:00:00Z",
      categories: [
        { id: "2", name: "Image Generation", slug: "image-generation", description: "AI image generation", color: "#ec4899", icon: "🎨", tools_count: 38, created_at: "", updated_at: "", parent_id: null }
      ],
      tags: [
        { id: "3", name: "Art", slug: "art", created_at: "" },
        { id: "4", name: "Image Generation", slug: "image-generation", created_at: "" }
      ]
    },
    "github-copilot": {
      id: "3",
      name: "GitHub Copilot",
      slug: "github-copilot",
      tagline: "AI pair programmer that helps you write code faster",
      description: "Your AI coding assistant that suggests code and entire functions in real-time",
      long_description: "GitHub Copilot is an AI pair programmer that helps you write code faster and with less work. It draws context from comments and code to suggest individual lines and whole functions instantly. Copilot is powered by OpenAI Codex, a new AI system created by OpenAI. It's available as an extension for Visual Studio Code, Neovim, JetBrains IDEs, and more.",
      logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=GitHub",
      cover_image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop",
      website_url: "https://github.com/features/copilot",
      pricing_type: "subscription",
      pricing_details: [
        {
          name: "Individual",
          price: "$10/month",
          features: ["Code suggestions", "Multi-language support", "IDE integration", "Private code access"]
        },
        {
          name: "Business",
          price: "$19/user/month",
          features: ["Everything in Individual", "Organization management", "Audit logs", "Priority support"]
        }
      ],
      features: [
        "Real-time code suggestions",
        "Multi-language support",
        "IDE integration",
        "Context-aware completions",
        "Code explanation",
        "Test generation"
      ],
      pros: [
        "Significantly speeds up coding",
        "Learns from your codebase",
        "Supports many languages",
        "Seamless IDE integration"
      ],
      cons: [
        "Subscription required",
        "Can suggest incorrect code",
        "Privacy concerns with code"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop"
      ],
      video_url: null,
      rating_avg: 4.6,
      rating_count: 1500,
      views_count: 40000,
      favorites_count: 8500,
      is_featured: true,
      is_trending: false,
      status: "approved",
      submitted_by: null,
      approved_by: null,
      approved_at: null,
      created_at: "2024-01-13T00:00:00Z",
      updated_at: "2024-01-13T00:00:00Z",
      categories: [
        { id: "3", name: "Code Assistant", slug: "code-assistant", description: "AI coding assistants", color: "#8b5cf6", icon: "💻", tools_count: 32, created_at: "", updated_at: "", parent_id: null }
      ],
      tags: [
        { id: "5", name: "Coding", slug: "coding", created_at: "" },
        { id: "6", name: "Developer Tools", slug: "developer-tools", created_at: "" }
      ]
    }
  };

  return null;
};

// Mock reviews removed - using database instead
const _getMockReviews_removed = (toolId: string): Review[] => {
  const _mockReviews_removed: Record<string, Review[]> = {
    "1": [
      {
        id: "1",
        tool_id: "1",
        user_id: "user1",
        rating: 5,
        title: "Amazing AI Assistant",
        comment: "ChatGPT has completely transformed how I work. It's incredibly helpful for writing, coding, and research. The responses are usually accurate and well-thought-out.",
        pros: ["Accurate responses", "Easy to use"],
        cons: ["Sometimes slow"],
        helpful_count: 45,
        status: "approved",
        created_at: "2024-01-20T00:00:00Z",
        updated_at: "2024-01-20T00:00:00Z",
        user: {
          id: "user1",
          email: "john@example.com",
          full_name: "John Doe",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          role: "user",
          bio: null,
          website: null,
          created_at: "",
          updated_at: ""
        }
      },
      {
        id: "2",
        tool_id: "1",
        user_id: "user2",
        rating: 4,
        title: "Great but has limitations",
        comment: "Very useful tool for daily tasks. The free version is good but the paid version is worth it for serious users.",
        pros: ["Free tier available", "Regular updates"],
        cons: ["Free tier limited"],
        helpful_count: 32,
        status: "approved",
        created_at: "2024-01-18T00:00:00Z",
        updated_at: "2024-01-18T00:00:00Z",
        user: {
          id: "user2",
          email: "jane@example.com",
          full_name: "Jane Smith",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          role: "user",
          bio: null,
          website: null,
          created_at: "",
          updated_at: ""
        }
      }
    ],
    "2": [
      {
        id: "3",
        tool_id: "2",
        user_id: "user3",
        rating: 5,
        title: "Best AI Art Generator",
        comment: "The quality of images generated by Midjourney is absolutely stunning. Worth every penny!",
        pros: ["Amazing quality", "Unique style"],
        cons: ["Requires Discord"],
        helpful_count: 67,
        status: "approved",
        created_at: "2024-01-19T00:00:00Z",
        updated_at: "2024-01-19T00:00:00Z",
        user: {
          id: "user3",
          email: "alex@example.com",
          full_name: "Alex Johnson",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
          role: "user",
          bio: null,
          website: null,
          created_at: "",
          updated_at: ""
        }
      }
    ]
  };

  return [];
};

// Mock similar tools removed - using database instead
const _getMockSimilarTools_removed = (toolId: string): Tool[] => {
  return [];
};

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarTools, setSimilarTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  useEffect(() => {
    fetchToolData();
    checkAuth();
  }, [slug]);

  const checkAuth = async () => {
    // Check demo mode
    const isDemoMode = typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true";
    if (isDemoMode) {
      setIsAuthenticated(true);
      return;
    }

    // Check real auth
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session && tool) {
        checkFavorite(tool.id);
      }
    }
  };

  const checkFavorite = async (toolId: string) => {
    if (!supabase || !isAuthenticated) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("tool_id", toolId)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not favorited
      setIsFavorite(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!tool) {
      toast.error("Tool not found");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      router.push("/auth/login");
      setShowReviewForm(false);
      return;
    }

    if (reviewFormData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewFormData.comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool_id: tool.id,
          rating: reviewFormData.rating,
          title: reviewFormData.title.trim() || null,
          comment: reviewFormData.comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted successfully! It will be visible after approval.");
        setShowReviewForm(false);
        setReviewFormData({ rating: 0, title: "", comment: "" });
        // Refresh reviews
        if (tool) {
          const reviewsRes = await fetch(`/api/reviews?toolId=${tool.id}`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.reviews || []);
          }
        }
      } else {
        if (response.status === 401) {
          toast.error("Please login to submit a review");
          setShowReviewForm(false);
          router.push("/auth/login");
        } else {
          toast.error(data.error || "Failed to submit review");
        }
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchToolData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await fetch(`/api/tools/${slug}`);
        
        if (response.ok) {
          const data = await response.json();
          setTool(data.tool);

          // Fetch reviews
          const reviewsRes = await fetch(`/api/reviews?toolId=${data.tool.id}`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.reviews || []);
          }

          // Fetch similar tools
          if (data.tool.categories && data.tool.categories.length > 0) {
            const categoryIds = data.tool.categories.map((c: any) => c.id);
            const similarRes = await fetch(`/api/tools?categories=${categoryIds.join(",")}&limit=3&exclude=${data.tool.id}`);
            if (similarRes.ok) {
              const similarData = await similarRes.json();
              setSimilarTools(similarData.tools?.filter((t: Tool) => t.id !== data.tool.id).slice(0, 3) || []);
            }
          }

          // Check favorite status
          if (isAuthenticated) {
            checkFavorite(data.tool.id);
          }
          
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.error("API fetch failed:", apiError);
        throw new Error("Tool not found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load tool");
      router.push("/tools");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add favorites");
      router.push("/auth/login");
      return;
    }

    if (!tool) return;

    const isDemoMode = typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true";
    
    if (isDemoMode) {
      toast.success(isFavorite ? "Removed from favorites!" : "Added to favorites!");
      setIsFavorite(!isFavorite);
      return;
    }

    try {
      if (isFavorite) {
        // Remove favorite
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch(`/api/favorites?toolId=${tool.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsFavorite(false);
          toast.success("Removed from favorites!");
        }
      } else {
        // Add favorite
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool_id: tool.id }),
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success("Added to favorites!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorite");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/tools/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool?.name || "AI Tool",
          text: tool?.tagline || "",
          url: url,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
          <p className="text-muted-foreground mb-4">The tool you're looking for doesn't exist.</p>
          <Link href="/tools">
            <Button>Browse All Tools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        {/* Cover Image */}
        {tool.cover_image_url && (
          <div className="relative w-full h-48 sm:h-64 md:h-96 mb-6 sm:mb-8 rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
            <Image
              src={tool.cover_image_url}
              alt={tool.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 shadow-lg">
            {tool.logo_url ? (
              <Image
                src={tool.logo_url}
                alt={tool.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {tool.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 break-words">{tool.name}</h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground break-words">{tool.tagline}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  variant={isFavorite ? "default" : "outline"} 
                  size="icon"
                  onClick={handleFavorite}
                  className={isFavorite ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
              <Rating rating={tool.rating_avg} size="lg" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {tool.rating_count} reviews
              </span>
              <Badge className={`${getPricingBadgeColor(tool.pricing_type)} text-xs`}>
                {tool.pricing_type}
              </Badge>
              {tool.is_featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                  Featured
                </Badge>
              )}
              {tool.is_trending && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  {tool.views_count?.toLocaleString() || 0} views
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  {tool.favorites_count || 0} favorites
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  {new Date(tool.created_at).toLocaleDateString()}
                </div>
              </div>

              {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto text-sm sm:text-base">
                    Visit Website
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {tool.categories?.map((category: any) => (
                <CategoryBadge key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">About {tool.name}</h2>
              <div className="prose max-w-none dark:prose-invert">
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                  {tool.long_description || tool.description || "No description available."}
                </p>
              </div>
            </section>

            {/* Video */}
            {tool.video_url && (
              <section>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Video</h2>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={tool.video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <section>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {tool.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}


            {/* Screenshots */}
            {tool.screenshots && tool.screenshots.length > 0 && (
              <section>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Screenshots</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {tool.screenshots.map((screenshot: string, index: number) => (
                    <div
                      key={index}
                      className="relative h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Image
                        src={screenshot}
                        alt={`${tool.name} screenshot ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  User Reviews ({reviews.length})
                </h2>
                {isAuthenticated ? (
                  <Button onClick={() => {
                    if (!isAuthenticated) {
                      toast.error("Please login to write a review");
                      router.push("/auth/login");
                      return;
                    }
                    setShowReviewForm(true);
                  }} className="w-full sm:w-auto text-sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                ) : (
                  <Link href="/auth/login" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto text-sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Login to Review
                    </Button>
                  </Link>
                )}
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">
                              {review.title || "Review"}
                            </CardTitle>
                            <div className="flex items-center gap-3">
                              <Rating
                                rating={review.rating}
                                size="sm"
                                showNumber={false}
                              />
                              <span className="text-sm text-muted-foreground">
                                by {review.user?.full_name || "Anonymous"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">{review.comment}</p>
                        {review.helpful_count > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {review.helpful_count} people found this helpful
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No reviews yet. Be the first to review this tool!
                    </p>
                    {isAuthenticated ? (
                      <Button onClick={() => setShowReviewForm(true)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    ) : (
                      <Link href="/auth/login">
                        <Button>Login to Review</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 mt-8 lg:mt-0">
            {/* Pricing */}
            {tool.pricing_details && tool.pricing_details.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Pricing Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {tool.pricing_details.map((plan: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4 hover:border-primary transition-colors">
                      <h4 className="font-semibold mb-1 text-sm sm:text-base">{plan.name}</h4>
                      <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{plan.price}</p>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        {plan.features?.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag: any) => (
                      <Link key={tag.id} href={`/tools?tags=${tag.slug}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Similar Tools */}
            {similarTools.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Similar Tools</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-4 sm:space-y-6">
                    {similarTools.map((similarTool: Tool) => (
                      <div key={similarTool.id} className="w-full">
                        <ToolCard tool={similarTool} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal - Only show if authenticated */}
      {showReviewForm && isAuthenticated && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full mx-4 shadow-2xl border-2 max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-muted/30 sticky top-0 z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl sm:text-2xl">Write a Review</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewFormData({ rating: 0, title: "", comment: "" });
                  }}
                  className="h-8 w-8 p-0"
                  disabled={submittingReview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div>
                <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                  Rating *
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                      disabled={submittingReview}
                      className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-10 sm:w-10 ${
                          star <= reviewFormData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {reviewFormData.rating > 0 && (
                    <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                      ({reviewFormData.rating} out of 5)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="review-title" className="text-sm sm:text-base">Review Title (Optional)</Label>
                <Input
                  id="review-title"
                  value={reviewFormData.title}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                  placeholder="Give your review a title"
                  disabled={submittingReview}
                  className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>

              <div>
                <Label htmlFor="review-comment" className="text-sm sm:text-base">Your Review *</Label>
                <Textarea
                  id="review-comment"
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  placeholder="Share your experience with this tool..."
                  className="text-sm sm:text-base mt-1"
                  rows={6}
                  disabled={submittingReview}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters required
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewFormData.rating === 0 || reviewFormData.comment.trim().length < 10}
                  className="flex-1 gap-2"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewFormData({ rating: 0, title: "", comment: "" });
                  }}
                  disabled={submittingReview}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
