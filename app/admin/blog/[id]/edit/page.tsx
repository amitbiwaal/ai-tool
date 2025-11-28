"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface SEOAnalysis {
  score: number;
  titleLength: number;
  descriptionLength: number;
  contentLength: number;
  keywordDensity: number;
  readabilityScore: number;
  issues: string[];
  suggestions: string[];
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [blogCategories, setBlogCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    category: "",
    tags: [] as string[],
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
    status: "draft" as "draft" | "published" | "scheduled",
  });

  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis>({
    score: 0,
    titleLength: 0,
    descriptionLength: 0,
    contentLength: 0,
    keywordDensity: 0,
    readabilityScore: 0,
    issues: [],
    suggestions: [],
  });

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      setInitialLoading(true);
      try {
        const response = await fetch(`/api/admin/blog/${postId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load post");
        }

        const data = await response.json();
        const post = data.post;
        
        if (post) {
          setFormData({
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            featuredImage: post.cover_image || "",
            category: post.category_id || "",
            tags: post.tags || [],
            seoTitle: post.seo_title || post.title || "",
            seoDescription: post.seo_description || "",
            focusKeyword: "",
            status: post.status || "draft",
          });
          // Set preview if existing image URL
          if (post.cover_image) {
            setFeaturedImagePreview(post.cover_image);
          }
        } else {
          toast.error("Post not found");
          router.push("/admin/blog");
        }
      } catch (error: any) {
        console.error("Error loading post:", error);
        toast.error(error?.message || "Failed to load post");
        router.push("/admin/blog");
      } finally {
        setInitialLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // SEO Analysis
  useEffect(() => {
    analyzeSEO();
  }, [formData.title, formData.seoDescription, formData.content, formData.focusKeyword]);

  // Fetch blog categories from database
  useEffect(() => {
    fetchBlogCategories();
  }, []);

  const fetchBlogCategories = async () => {
    try {
      setLoadingCategories(true);
      
      const response = await fetch("/api/blog-categories", {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        
        console.error("Failed to fetch blog categories:", response.status, errorData);
        
        if (response.status === 500 && (errorData.code === '42P01' || errorData.error?.includes('does not exist'))) {
          toast.error("Blog categories table not found. Please run the database migration first.");
        } else if (response.status === 503) {
          toast.error("Database connection not available. Please check your Supabase configuration.");
        } else {
          toast.error(`Failed to load blog categories (${response.status}). Please check your connection.`);
        }
        setBlogCategories([]);
        return;
      }
      
      const data = await response.json();
      setBlogCategories(data.categories || []);
      
      if (!data.categories || data.categories.length === 0) {
        console.info("No blog categories found. Create categories in admin panel.");
      }
    } catch (error: any) {
      console.error("Error fetching blog categories:", error);
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error("Network error: Could not connect to server. Please check if the server is running.");
      } else {
        toast.error(`Failed to load blog categories: ${error.message || 'Unknown error'}`);
      }
      
      setBlogCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (featuredImagePreview && !featuredImagePreview.startsWith("http")) {
        URL.revokeObjectURL(featuredImagePreview);
      }
    };
  }, [featuredImagePreview]);

  const analyzeSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Title analysis
    const titleLength = (formData.seoTitle || formData.title).length;
    if (titleLength === 0) {
      issues.push("SEO title is missing");
      score -= 20;
    } else if (titleLength < 30) {
      issues.push("SEO title is too short (< 30 characters)");
      score -= 10;
    } else if (titleLength > 60) {
      issues.push("SEO title is too long (> 60 characters)");
      score -= 10;
    } else {
      suggestions.push("SEO title length is optimal");
    }

    // Description analysis
    const descLength = formData.seoDescription.length;
    if (descLength === 0) {
      issues.push("Meta description is missing");
      score -= 20;
    } else if (descLength < 120) {
      issues.push("Meta description is too short (< 120 characters)");
      score -= 10;
    } else if (descLength > 160) {
      issues.push("Meta description is too long (> 160 characters)");
      score -= 10;
    } else {
      suggestions.push("Meta description length is optimal");
    }

    // Content analysis (strip HTML tags)
    const plainContent = formData.content.replace(/<[^>]*>/g, "");
    const contentLength = plainContent.split(" ").filter((w) => w).length;
    if (contentLength === 0) {
      issues.push("Content is empty");
      score -= 30;
    } else if (contentLength < 300) {
      issues.push("Content is too short (< 300 words recommended)");
      score -= 15;
    } else if (contentLength > 1000) {
      suggestions.push("Content has good length for SEO");
    }

    // Focus keyword analysis
    if (!formData.focusKeyword) {
      issues.push("Focus keyword is not set");
      score -= 10;
    } else {
      const keyword = formData.focusKeyword.toLowerCase();
      const titleHasKeyword = (formData.seoTitle || formData.title).toLowerCase().includes(keyword);
      const descHasKeyword = formData.seoDescription.toLowerCase().includes(keyword);
      const contentHasKeyword = plainContent.toLowerCase().includes(keyword);

      if (!titleHasKeyword) {
        issues.push("Focus keyword not found in title");
        score -= 5;
      }
      if (!descHasKeyword) {
        issues.push("Focus keyword not found in description");
        score -= 5;
      }
      if (!contentHasKeyword) {
        issues.push("Focus keyword not found in content");
        score -= 5;
      } else {
        const keywordCount = (plainContent.toLowerCase().match(new RegExp(keyword, "g")) || []).length;
        const density = (keywordCount / plainContent.split(" ").filter((w) => w).length) * 100;
        if (density < 0.5) {
          suggestions.push("Consider using focus keyword more frequently");
        } else if (density > 3) {
          issues.push("Focus keyword density is too high (keyword stuffing)");
          score -= 10;
        } else {
          suggestions.push("Focus keyword density is optimal");
        }
      }
    }

    // Readability
    const words = plainContent.split(" ").filter((w) => w).length;
    const sentences = plainContent.split(/[.!?]+/).filter((s) => s.trim()).length;
    const avgWordsPerSentence = words / sentences || 0;
    const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence - 15) * 2);

    if (avgWordsPerSentence > 25) {
      issues.push("Sentences are too long on average");
      score -= 5;
    } else {
      suggestions.push("Sentence length is good for readability");
    }

    // Calculate keyword density
    const keywordDensity = formData.focusKeyword
      ? ((plainContent.toLowerCase().match(new RegExp(formData.focusKeyword.toLowerCase(), "g")) || []).length / words) * 100
      : 0;

    setSeoAnalysis({
      score: Math.max(0, score),
      titleLength,
      descriptionLength: descLength,
      contentLength: words,
      keywordDensity,
      readabilityScore,
      issues,
      suggestions,
    });
  };

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setFeaturedImage(file);
    const preview = URL.createObjectURL(file);
    setFeaturedImagePreview(preview);
    toast.success("Featured image uploaded successfully");
  };

  const removeFeaturedImage = () => {
    if (featuredImagePreview && !featuredImagePreview.startsWith("http")) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImage(null);
    setFeaturedImagePreview("");
    setFormData({ ...formData, featuredImage: "" });
    toast.success("Featured image removed");
  };

  const handleSubmit = async (status: string) => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      // TODO: Upload featured image first and get URL
      // const imageUrl = featuredImage ? await uploadImage(featuredImage) : formData.featuredImage;

      const submitData = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt: formData.excerpt || null,
        content: formData.content,
        cover_image: featuredImage ? null : (featuredImagePreview.startsWith("http") ? featuredImagePreview : formData.featuredImage) || null, // TODO: Replace with uploaded URL
        category_id: formData.category || null,
        status: status,
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || null,
      };

      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update post");
      }
      
      toast.success(
        status === "published"
          ? "Post updated and published successfully!"
          : status === "scheduled"
          ? "Post updated and scheduled successfully!"
          : "Post updated successfully!"
      );
      
      router.push("/admin/blog");
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error(error?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSEOScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  if (initialLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Post</h1>
            <p className="text-sm text-muted-foreground">Update and optimize your blog content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Update & Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your post title..."
                  className="text-lg font-semibold h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="post-url-slug"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  yoursite.com/blog/{formData.slug || "post-slug"}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of your post..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="Write your post content here... Use the toolbar above to format your text."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.content.replace(/<[^>]*>/g, "").split(" ").filter((w) => w).length} words
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SEO Optimization
              </CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="focusKeyword">Focus Keyword</Label>
                <Input
                  id="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                  placeholder="e.g., AI tools"
                />
              </div>

              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder={formData.title || "SEO title for search results"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(formData.seoTitle || formData.title).length}/60 - {seoAnalysis.titleLength < 30 ? "Too short" : seoAnalysis.titleLength > 60 ? "Too long" : "Good"}
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Brief description for search results..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.seoDescription.length}/160 - {seoAnalysis.descriptionLength < 120 ? "Too short" : seoAnalysis.descriptionLength > 160 ? "Too long" : "Good"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Score */}
          <Card className={`border-2 ${getSEOScoreBg(seoAnalysis.score)}`}>
            <CardHeader>
              <CardTitle className="text-sm">SEO Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className={`text-5xl font-bold ${getSEOScoreColor(seoAnalysis.score)}`}>
                  {seoAnalysis.score}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">/ 100</p>
                  <p className={`text-sm font-semibold ${getSEOScoreColor(seoAnalysis.score)}`}>
                    {seoAnalysis.score >= 80 ? "Excellent" : seoAnalysis.score >= 60 ? "Good" : "Needs Work"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Title</span>
                  <span className={seoAnalysis.titleLength >= 30 && seoAnalysis.titleLength <= 60 ? "text-green-600" : "text-red-600"}>
                    {seoAnalysis.titleLength} chars
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Description</span>
                  <span className={seoAnalysis.descriptionLength >= 120 && seoAnalysis.descriptionLength <= 160 ? "text-green-600" : "text-red-600"}>
                    {seoAnalysis.descriptionLength} chars
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Content</span>
                  <span className={seoAnalysis.contentLength >= 300 ? "text-green-600" : "text-red-600"}>
                    {seoAnalysis.contentLength} words
                  </span>
                </div>
                {formData.focusKeyword && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Keyword Density</span>
                    <span className={seoAnalysis.keywordDensity >= 0.5 && seoAnalysis.keywordDensity <= 3 ? "text-green-600" : "text-red-600"}>
                      {seoAnalysis.keywordDensity.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Issues & Suggestions */}
          {seoAnalysis.issues.length > 0 && (
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Issues ({seoAnalysis.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {seoAnalysis.issues.map((issue, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {seoAnalysis.suggestions.length > 0 && (
            <Card className="border-2 border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Good ({seoAnalysis.suggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {seoAnalysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Post Settings */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm">Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loadingCategories}
                >
                  <option value="">Select category</option>
                  {blogCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <p className="text-xs text-muted-foreground mt-1">Loading categories...</p>
                )}
                {!loadingCategories && blogCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">No categories available. Create categories in admin panel.</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" | "scheduled" })}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="featuredImage">Featured Image</Label>
                <div className="space-y-4">
                  {featuredImagePreview ? (
                    <div className="relative group">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={featuredImagePreview}
                          alt="Featured image preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeFeaturedImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {featuredImage && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {`${featuredImage.name} (${(featuredImage.size / 1024 / 1024).toFixed(2)} MB)`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="featuredImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="featuredImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP (MAX. 5MB)
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

