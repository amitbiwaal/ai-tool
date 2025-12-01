"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  author: string | { full_name?: string; email?: string };
  created_at: string;
  published_at?: string;
  views_count?: number;
  views?: number;
  category?: string | { name?: string };
}

export default function BlogManagementPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "scheduled">("all");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blog?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match the expected format
        const transformedPosts = (data.posts || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.content?.substring(0, 150) + "..." || "",
          status: post.status || "draft",
          author: post.author?.full_name || post.author?.email || "Unknown",
          created_at: post.created_at,
          published_at: post.published_at,
          views: post.views_count || post.views || 0,
          category: post.category?.name || post.category || "Uncategorized",
        }));
        setPosts(transformedPosts);
      } else {
        console.error("Failed to fetch blog posts:", response.status);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
      toast.success("Post deleted successfully");
        await fetchPosts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete post");
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error?.message || "Failed to delete post");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Create and manage your blog content
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={fetchPosts} variant="outline" className="gap-2 w-full sm:w-auto order-2 sm:order-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        <Link href="/admin/blog/new" className="w-full sm:w-auto order-1 sm:order-2">
          <Button className="gap-2 shadow-lg w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold mt-1">{stats.published}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold mt-1">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold mt-1">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "published" ? "default" : "outline"}
                onClick={() => setFilterStatus("published")}
                size="sm"
              >
                Published
              </Button>
              <Button
                variant={filterStatus === "draft" ? "default" : "outline"}
                onClick={() => setFilterStatus("draft")}
                size="sm"
              >
                Drafts
              </Button>
              <Button
                variant={filterStatus === "scheduled" ? "default" : "outline"}
                onClick={() => setFilterStatus("scheduled")}
                size="sm"
              >
                Scheduled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Posts List */}
      {!loading && (
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={post.id} className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <Link href={`/admin/blog/${post.id}/edit`} className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg hover:text-primary transition-colors cursor-pointer truncate">
                              {post.title}
                            </h3>
                          </Link>
                          <Badge className={`${getStatusColor(post.status)} w-fit flex-shrink-0`}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(post.created_at).toLocaleDateString()}</span>
                          </span>
                          {post.status === "published" && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3 flex-shrink-0" />
                              {(post.views || 0).toLocaleString()} views
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs w-fit">
                            {typeof post.category === 'string' ? post.category : (post.category?.name || 'Uncategorized')}
                          </Badge>
                          <span className="truncate">By {typeof post.author === 'string' ? post.author : (post.author?.full_name || post.author?.email || 'Unknown')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {post.status === "published" && (
                      <Link href={`/blog/${post.slug}`} target="_blank" className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/blog/${post.id}/edit`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="gap-1 w-full sm:w-auto hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by creating your first blog post"}
              </p>
              {!searchQuery && (
                <Link href="/admin/blog/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </div>
  );
}

