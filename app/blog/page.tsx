"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { getBlogCoverUrl, getAvatarUrl, isDicebearUrl } from "@/lib/utils/images";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock blog posts removed - using database instead
const _mockPosts_removed = [
  {
    id: "1",
    title: "Top 10 AI Tools That Will Transform Your Workflow in 2024",
    slug: "top-10-ai-tools-2024",
    excerpt: "Discover the most powerful AI tools that are revolutionizing how we work, create, and innovate in 2024",
    content: "Full article content here...",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    published_at: "2024-01-15",
    views_count: 1250,
    reading_time: 8,
    category: { id: "1", name: "AI Tools", slug: "ai-tools" },
    author: {
      full_name: "Sarah Johnson",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "AI enthusiast and tech writer"
    },
    tags: [
      { id: "1", name: "AI", slug: "ai" },
      { id: "2", name: "Productivity", slug: "productivity" }
    ]
  },
  {
    id: "2",
    title: "How to Choose the Right AI Image Generator for Your Needs",
    slug: "choosing-ai-image-generator",
    excerpt: "A comprehensive guide to selecting the perfect AI image generation tool for your creative projects",
    content: "Full article content here...",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    published_at: "2024-01-12",
    views_count: 980,
    reading_time: 6,
    category: { id: "2", name: "Tutorials", slug: "tutorials" },
    author: {
      full_name: "Mike Chen",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      bio: "Digital artist and AI researcher"
    },
    tags: [
      { id: "3", name: "Image Generation", slug: "image-generation" },
      { id: "4", name: "Guide", slug: "guide" }
    ]
  },
  {
    id: "3",
    title: "The Future of AI in Content Creation: Trends to Watch",
    slug: "future-ai-content-creation",
    excerpt: "Explore the emerging trends and technologies shaping the future of AI-powered content creation",
    content: "Full article content here...",
    cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop",
    published_at: "2024-01-10",
    views_count: 1500,
    reading_time: 10,
    category: { id: "3", name: "Industry News", slug: "industry-news" },
    author: {
      full_name: "Emma Davis",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      bio: "Tech journalist and futurist"
    },
    tags: [
      { id: "5", name: "Trends", slug: "trends" },
      { id: "6", name: "Content Creation", slug: "content-creation" }
    ]
  },
  {
    id: "4",
    title: "Getting Started with ChatGPT: A Beginner's Guide",
    slug: "chatgpt-beginners-guide",
    excerpt: "Learn how to use ChatGPT effectively with this comprehensive beginner's guide and practical tips",
    content: "Full article content here...",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    published_at: "2024-01-08",
    views_count: 2100,
    reading_time: 7,
    category: { id: "2", name: "Tutorials", slug: "tutorials" },
    author: {
      full_name: "Alex Turner",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      bio: "AI educator and consultant"
    },
    tags: [
      { id: "1", name: "AI", slug: "ai" },
      { id: "7", name: "ChatGPT", slug: "chatgpt" }
    ]
  },
  {
    id: "5",
    title: "AI Ethics: Building Responsible AI Tools for Everyone",
    slug: "ai-ethics-responsible-tools",
    excerpt: "Discussing the importance of ethical considerations in AI development and deployment",
    content: "Full article content here...",
    cover_image: "https://images.unsplash.com/photo-1655720033654-a4239dd42d10?w=800&h=600&fit=crop",
    published_at: "2024-01-05",
    views_count: 850,
    reading_time: 9,
    category: { id: "3", name: "Industry News", slug: "industry-news" },
    author: {
      full_name: "Dr. Rachel Kim",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
      bio: "AI ethics researcher"
    },
    tags: [
      { id: "8", name: "Ethics", slug: "ethics" },
      { id: "9", name: "Responsibility", slug: "responsibility" }
    ]
  },
  {
    id: "6",
    title: "5 AI Tools Every Developer Should Know About",
    slug: "ai-tools-for-developers",
    excerpt: "Boost your development workflow with these essential AI-powered coding assistants and tools",
    content: "Full article content here...",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    published_at: "2024-01-03",
    views_count: 1670,
    reading_time: 8,
    category: { id: "1", name: "AI Tools", slug: "ai-tools" },
    author: {
      full_name: "James Wilson",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      bio: "Full-stack developer"
    },
    tags: [
      { id: "10", name: "Development", slug: "development" },
      { id: "11", name: "Coding", slug: "coding" }
    ]
  }
];


export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Content from database
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  // Fetch blog posts from database
  useEffect(() => {
    fetchBlogPosts();
    fetchPageContent();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        setPosts([]);
        return;
      }

      // First fetch blog posts with published status
      const { data: posts, error: postsError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(12);

      if (postsError) {
        console.error("Error fetching blog posts:", postsError);
        setPosts([]);
        return;
      }

      if (!posts || posts.length === 0) {
        setPosts([]);
        return;
      }

      // Fetch author and category details separately
      const authorIds = [...new Set(posts.map((p: any) => p.author_id).filter(Boolean))];
      const categoryIds = [...new Set(posts.map((p: any) => p.category_id).filter(Boolean))];

      const [authorsResult, categoriesResult, tagsResult] = await Promise.all([
        authorIds.length > 0
          ? supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url, bio")
              .in("id", authorIds)
          : Promise.resolve({ data: [], error: null }),
        categoryIds.length > 0
          ? supabase
              .from("blog_categories")
              .select("id, name, slug")
              .in("id", categoryIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("blog_tags")
          .select("blog_post_id, tag:tags(*)")
          .in("blog_post_id", posts.map((p: any) => p.id)),
      ]);

      const authorsMap = new Map(
        (authorsResult.data || []).map((a: any) => [a.id, a])
      );
      const categoriesMap = new Map(
        (categoriesResult.data || []).map((c: any) => [c.id, c])
      );
      const tagsMap = new Map<string, any[]>();
      (tagsResult.data || []).forEach((bt: any) => {
        if (!tagsMap.has(bt.blog_post_id)) {
          tagsMap.set(bt.blog_post_id, []);
        }
        if (bt.tag) {
          tagsMap.get(bt.blog_post_id)!.push(bt.tag);
        }
      });

      // Calculate reading time (average reading speed: 200 words per minute)
      const calculateReadingTime = (content: string) => {
        if (!content) return null;
        const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
        const words = text.split(/\s+/).filter((w) => w).length;
        return Math.max(1, Math.ceil(words / 200)); // At least 1 minute
      };

      // Combine data
      const formattedPosts = posts.map((post: any) => ({
        ...post,
        author: post.author_id ? authorsMap.get(post.author_id) || null : null,
        category: post.category_id ? categoriesMap.get(post.category_id) || null : null,
        tags: tagsMap.get(post.id) || [],
        reading_time: post.reading_time || calculateReadingTime(post.content),
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const response = await fetch(`/api/admin/content?page=blog&t=${Date.now()}`, {
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
  };
  
  const categories = Array.from(new Set(posts.map(p => p.category?.name).filter(Boolean)));
  
  const filteredPosts = regularPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-background" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {pageContent.heroTitle || "Blog"}
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
          {pageContent.heroDescription || "Latest insights, tutorials, and news about AI tools"}
        </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-4 sm:mb-6 px-4">
              <div className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none pl-2 sm:pl-3 pr-2 sm:pr-3">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder={pageContent.searchPlaceholder || "Search articles..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 sm:pl-24 pr-4 sm:pr-6 h-10 sm:h-12 text-sm sm:text-base rounded-xl leading-[1.5]"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 px-4">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
                className="rounded-full"
              >
                {pageContent.allPostsButton || "All Posts"}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        {/* Featured Post */}
        {featuredPost && !searchQuery && !selectedCategory && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pageContent.featuredArticleTitle || "Featured Article"}</h2>
            </div>
            <Link href={`/blog/${featuredPost.slug}`}>
              <Card className="overflow-hidden group cursor-pointer border-2 hover:border-primary/50 transition-all hover:shadow-2xl">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-48 sm:h-64 md:h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    <Image
                      src={getBlogCoverUrl(featuredPost.cover_image)}
                      alt={featuredPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized={getBlogCoverUrl(featuredPost.cover_image).includes('unsplash.com')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop';
                      }}
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <Badge className="bg-yellow-500/90 text-black border-0 text-xs">
                        {pageContent.featuredBadge || "Featured"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                      {featuredPost.category?.name && (
                        <Badge variant="secondary" className="text-xs">{featuredPost.category.name}</Badge>
                      )}
                      {featuredPost.tags?.slice(0, 2).map((tag: any) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
                      ))}
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      {featuredPost.author && (
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={getAvatarUrl(featuredPost.author?.avatar_url, undefined, featuredPost.author?.full_name)}
                              alt={featuredPost.author?.full_name || "Author"}
                              fill
                              className="object-cover"
                              unoptimized={isDicebearUrl(featuredPost.author?.avatar_url)}
                            />
                          </div>
                          <span>{featuredPost.author.full_name || "Unknown Author"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredPost.published_at)}</span>
                      </div>
                      {featuredPost.reading_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.reading_time} {pageContent.minReadText || "min read"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-6 sm:mb-8 px-4 sm:px-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {searchQuery ? (pageContent.searchResultsTitle || "Search Results") : selectedCategory ? selectedCategory : (pageContent.latestArticlesTitle || "Latest Articles")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filteredPosts.length} {filteredPosts.length === 1 ? (pageContent.articleText || "article") : (pageContent.articlesText || "articles")}
              </p>
            </div>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
              {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full group transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/30">
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    <Image
                      src={getBlogCoverUrl(post.cover_image)}
                      alt={post.title}
                      fill
                      className="object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
                      unoptimized={getBlogCoverUrl(post.cover_image).includes('unsplash.com')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop';
                      }}
                    />
                        {post.views_count > 1000 && (
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold">
                              <TrendingUp className="w-3 h-3" />
                              {pageContent.trendingBadge || "Trending"}
                            </div>
                  </div>
                )}
                      </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        {post.category?.name && (
                          <Badge variant="secondary">{post.category.name}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                      
                      {/* Read More Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mb-4 group-hover:bg-primary/10 transition-colors"
                      >
                        {pageContent.readMoreButton || "Read More"}
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <div className="flex items-center justify-between pt-4 border-t">
                        {post.author && (
                          <div className="flex items-center gap-2">
                            <div className="relative h-7 w-7 rounded-full overflow-hidden">
                              <Image
                                src={getAvatarUrl(post.author?.avatar_url, undefined, post.author?.full_name)}
                                alt={post.author?.full_name || "Author"}
                                fill
                                className="object-cover"
                                unoptimized={isDicebearUrl(post.author?.avatar_url)}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {post.author.full_name || "Unknown Author"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{post.reading_time} {pageContent.minReadText ? pageContent.minReadText.split(' ')[0] : "min"}</span>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">{pageContent.emptyStateTitle || "No articles found"}</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {searchQuery
                ? (pageContent.emptyStateMessageSearch || `No articles match "${searchQuery}". Try a different search term.`).replace("{query}", searchQuery)
                : (pageContent.emptyStateMessageCategory || "No articles available in this category.")}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                variant="outline"
                className="text-sm"
              >
                {pageContent.viewAllPostsButton || "View All Posts"}
              </Button>
            )}
        </div>
      )}
      </div>
    </div>
  );
}

