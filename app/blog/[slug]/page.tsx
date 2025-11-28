"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Bookmark,
  Eye,
  ThumbsUp,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Sparkles,
  TrendingUp,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getBlogCoverUrl, getAvatarUrl, isDicebearUrl } from "@/lib/utils/images";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [likingComment, setLikingComment] = useState<string | null>(null);
  
  // Content from database
  const [pageContent, setPageContent] = useState<Record<string, string>>({});

  // Resolve params (handle both Promise and direct object)
  useEffect(() => {
    const resolveParams = async () => {
      if (params instanceof Promise) {
        const resolved = await params;
        setSlug(resolved.slug);
      } else {
        setSlug(params.slug);
      }
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
      fetchPageContent();
    }
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      
      if (!supabase || !slug) {
        setPost(null);
        return;
      }

      // Fetch blog post by slug
      const { data: posts, error: postsError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .not("published_at", "is", null)
        .single();

      if (postsError || !posts) {
        console.error("Error fetching blog post:", postsError);
        setPost(null);
        return;
      }

      // Fetch author and category details
      const [authorResult, categoryResult, tagsResult] = await Promise.all([
        posts.author_id
          ? supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url, bio, website")
              .eq("id", posts.author_id)
              .single()
          : Promise.resolve({ data: null, error: null }),
        posts.category_id
          ? supabase
              .from("blog_categories")
              .select("id, name, slug")
              .eq("id", posts.category_id)
              .single()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from("blog_tags")
          .select("tag:tags(*)")
          .eq("blog_post_id", posts.id),
      ]);

      // Calculate reading time
      const calculateReadingTime = (content: string) => {
        if (!content) return null;
        const text = content.replace(/<[^>]*>/g, "");
        const words = text.split(/\s+/).filter((w) => w).length;
        return Math.max(1, Math.ceil(words / 200));
      };

      const formattedPost = {
        ...posts,
        author: authorResult.data || null,
        category: categoryResult.data || null,
        tags: tagsResult.data?.map((bt: any) => bt.tag).filter(Boolean) || [],
        reading_time: posts.reading_time || calculateReadingTime(posts.content),
      };

      setPost(formattedPost);

      // Increment view count
      await supabase
        .from("blog_posts")
        .update({ views_count: (posts.views_count || 0) + 1 })
        .eq("id", posts.id);

      // Fetch related posts (same category, excluding current post)
      if (posts.category_id) {
        const { data: related } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image, published_at")
          .eq("category_id", posts.category_id)
          .eq("status", "published")
          .not("id", "eq", posts.id)
          .not("published_at", "is", null)
          .order("published_at", { ascending: false })
          .limit(3);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      setPost(null);
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

  const fetchComments = async () => {
    if (!post?.id) {
      setComments([]);
      return;
    }
    
    try {
      setCommentsLoading(true);
      
      const response = await fetch(`/api/blog/comments?blog_id=${post.id}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching comments:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || "Unknown error",
        });
        setComments([]);
        return;
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error: any) {
      console.error("Error fetching comments:", {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !post?.id) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setSubmittingComment(true);

      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blog_id: post.id,
          content: commentText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to post a comment");
          router.push("/login?redirect=/blog/" + post.slug);
        } else {
          toast.error(data.error || "Failed to post comment. Please try again.");
        }
        return;
      }

      toast.success(data.message || "Comment submitted! It will be visible after approval.");
      setCommentText("");
      await fetchComments();
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!supabase || !post?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to like comments");
        router.push("/login?redirect=/blog/" + post.slug);
        return;
      }

      if (likingComment === commentId) return;
      setLikingComment(commentId);

      const response = await fetch(`/api/blog/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to like comments");
          router.push("/login?redirect=/blog/" + post.slug);
        } else {
          toast.error(data.error || "Failed to like comment.");
        }
        return;
      }

      // Update liked state
      if (data.liked) {
        setLikedComments(prev => new Set([...prev, commentId]));
      } else {
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }

      // Refresh comments to get updated likes count
      await fetchComments();
    } catch (error: any) {
      console.error("Error liking comment:", error);
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setLikingComment(null);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText[parentId]?.trim() || !post?.id) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setSubmittingReply(parentId);

      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blog_id: post.id,
          content: replyText[parentId].trim(),
          parent_id: parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to post a reply");
          router.push("/login?redirect=/blog/" + post.slug);
        } else {
          toast.error(data.error || "Failed to post reply. Please try again.");
        }
        return;
      }

      toast.success(data.message || "Reply submitted! It will be visible after approval.");
      setReplyText(prev => {
        const newReplyText = { ...prev };
        delete newReplyText[parentId];
        return newReplyText;
      });
      setReplyingTo(null);
      await fetchComments();
    } catch (error: any) {
      console.error("Error posting reply:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setSubmittingReply(null);
    }
  };

  const handleShare = (platform: string) => {
    if (!post) return;
    
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${post.slug}`;
    const text = post.title;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    };

    if (platform === 'copy') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(pageContent.linkCopiedMessage || 'Link copied to clipboard!');
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 sm:py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2 text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              {pageContent.backToBlogButton || "Back to Blog"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Container with Sidebar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Main Content */}
          <article className="lg:col-span-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              {post?.category?.name && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                  {post?.category?.name}
              </Badge>
              )}
              {post?.tags?.map((tag: any) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                  #{tag.name}
              </Badge>
            ))}
          </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {post?.title}
          </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
              {/* Author */}
              {post?.author && (
              <div className="flex items-center gap-2 sm:gap-3">
                  {post.author?.avatar_url && (
                  <div className="relative h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                    <Image
                        src={getAvatarUrl(post.author.avatar_url, undefined, post.author?.full_name)}
                        alt={post.author?.full_name || "Author"}
                      fill
                      className="object-cover"
                        unoptimized={isDicebearUrl(post.author.avatar_url)}
                    />
                  </div>
                )}
                <div>
                    <p className="font-semibold text-foreground text-xs sm:text-sm">{post.author?.full_name || "Unknown Author"}</p>
                  <p className="text-[10px] sm:text-xs">{pageContent.authorRoleText || "AI Writer & Enthusiast"}</p>
                  </div>
              </div>
              )}

              {/* Divider */}
              <div className="hidden sm:block h-6 sm:h-8 w-px bg-border" />

              {/* Date */}
              <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(post?.published_at)}</span>
            </div>

              {/* Reading Time */}
              {post?.reading_time && (
              <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{post.reading_time} {pageContent.minReadText || "min read"}</span>
              </div>
              )}

              {/* Views */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{((post?.views_count) || 0).toLocaleString()} {pageContent.viewsText || "views"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-6 sm:pb-8 border-b">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={() => setLiked(!liked)}
                className="gap-2"
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {((post?.likes_count) || 0) + (liked ? 1 : 0)}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {post?.comments_count || 0}
              </Button>

              <Button
                variant={bookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => setBookmarked(!bookmarked)}
                className="gap-2"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? (pageContent.savedButton || 'Saved') : (pageContent.saveButton || 'Save')}
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {pageContent.shareButton || "Share"}
                </Button>

                {showShareMenu && (
                  <div className="absolute top-full mt-2 left-0 bg-background border rounded-lg shadow-lg p-2 z-10 min-w-[180px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="w-4 h-4" />
                      {pageContent.shareFacebook || "Facebook"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="w-4 h-4" />
                      {pageContent.shareTwitter || "Twitter"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare('linkedin')}
                    >
                      <Linkedin className="w-4 h-4" />
                      {pageContent.shareLinkedIn || "LinkedIn"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => handleShare('copy')}
                    >
                      <LinkIcon className="w-4 h-4" />
                      {pageContent.shareCopyLink || "Copy Link"}
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8 sm:mb-12 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
            <Image
            src={getBlogCoverUrl(post?.cover_image)}
            alt={post?.title || "Blog post"}
              fill
              className="object-cover"
            unoptimized={getBlogCoverUrl(post?.cover_image).includes('unsplash.com')}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop';
            }}
            />
          </div>

        {/* Content */}
          <div className="max-w-none mb-12
            [&>p:first-child]:text-xl [&>p:first-child]:font-medium [&>p:first-child]:text-foreground [&>p:first-child]:leading-relaxed [&>p:first-child]:mb-8
            [&_a]:text-primary [&_a]:font-semibold [&_a]:no-underline hover:[&_a]:underline [&_a]:transition-all
            [&_strong]:text-foreground [&_strong]:font-bold
            [&_hr]:my-10 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-700
          ">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}: any) => (
                <h1 className="scroll-mt-24 text-4xl font-bold tracking-tight mb-6 mt-12 pb-3 border-b-2 border-primary/20 text-foreground" {...props} />
              ),
              h2: ({node, ...props}: any) => (
                <h2 className="scroll-mt-24 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-5 mt-10 pb-2 border-b border-slate-200 dark:border-slate-700 text-foreground flex items-center gap-3" {...props}>
                  <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full flex-shrink-0"></span>
                  <span>{props.children}</span>
                </h2>
              ),
              h3: ({node, ...props}: any) => (
                <h3 className="scroll-mt-24 text-2xl font-bold tracking-tight mb-4 mt-8 text-slate-700 dark:text-slate-200" {...props} />
              ),
              h4: ({node, ...props}: any) => (
                <h4 className="scroll-mt-24 text-xl font-bold tracking-tight mb-3 mt-6 text-foreground" {...props} />
              ),
              p: ({node, ...props}: any) => <p className="text-base leading-[1.8] mb-6 text-slate-700 dark:text-slate-200 font-normal" {...props} />,
              ul: ({node, ...props}: any) => (
                <ul className="space-y-3 list-none pl-0" {...props} />
              ),
              ol: ({node, ...props}) => <ol className="space-y-3 pl-6" {...props} />,
              li: ({node, ordered, ...props}: any) => 
                ordered ? (
                  <li className="leading-relaxed pl-2" {...props} />
                ) : (
                  <li className="flex items-start gap-3 leading-relaxed" {...props}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-primary text-xs font-bold">✓</span>
                    </span>
                    <span className="flex-1">{props.children}</span>
                  </li>
                ),
              code: ({node, inline, ...props}: any) => 
                inline ? (
                  <code className="bg-slate-100 dark:bg-slate-800 text-primary px-2 py-1 rounded text-sm font-semibold" {...props} />
                ) : (
                  <code className="block" {...props} />
                ),
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-primary bg-slate-50 dark:bg-slate-900/50 pl-6 pr-4 py-4 italic rounded-r-lg my-6" {...props} />
              ),
              img: ({node, ...props}: any) => (
                <div className="my-8">
                  <img className="rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full" {...props} />
                </div>
              ),
            }}
          >
            {post?.content || ""}
          </ReactMarkdown>
          </div>

          {/* Tags Section */}
          <div className="mb-12 pb-12 border-b">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{pageContent.taggedInHeading || "TAGGED IN"}</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag: any) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
        </div>

        {/* Author Bio */}
        {post.author && (
          <Card className="mb-12 border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {post.author.avatar_url && (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-primary/20">
                    <Image
                      src={getAvatarUrl(post.author.avatar_url, undefined, post.author.full_name)}
                      alt={post.author.full_name || "Author"}
                      fill
                      className="object-cover"
                      unoptimized={isDicebearUrl(post.author.avatar_url)}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {pageContent.aboutAuthorHeading || "About"} {post.author.full_name || "Unknown Author"}
                  </h3>
                  {post.author.bio && (
                  <p className="text-muted-foreground mb-4">
                    {post.author.bio}
                  </p>
                  )}
                  {post.author.website && (
                    <Button variant="outline" size="sm" asChild>
                    <a
                      href={post.author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                        {pageContent.visitWebsiteButton || "Visit Website →"}
                    </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

          {/* Comments Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                {pageContent.commentsHeading || "Comments"} ({post?.comments_count || 0})
              </h3>
            </div>

            {/* Add Comment Form */}
            <Card className="mb-8 border-2">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">{pageContent.leaveCommentHeading || "Leave a Comment"}</h3>
                <div className="space-y-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={pageContent.commentPlaceholder || "Write your comment here... *"}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <div className="flex items-center justify-end">
                    <Button onClick={handlePostComment} disabled={submittingComment || !commentText.trim()}>
                      {submittingComment ? "Posting..." : (pageContent.postCommentButton || "Post Comment")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : comments.length > 0 ? (
            <div className="space-y-6">
                {comments.map((comment: any) => (
                  <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                      <Image
                            src={getAvatarUrl(comment.user?.avatar_url, undefined, comment.user?.full_name)}
                            alt={comment.user?.full_name || "User"}
                        fill
                        className="object-cover"
                            unoptimized={isDicebearUrl(comment.user?.avatar_url)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{comment.user?.full_name || "Anonymous"}</h4>
                            {comment.user?.id === post?.author?.id && (
                              <Badge variant="secondary" className="text-xs">Author</Badge>
                            )}
                        <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                          <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                            {comment.content}
                      </p>
                      <div className="flex items-center gap-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`h-8 px-3 ${likedComments.has(comment.id) ? 'text-primary' : ''}`}
                              onClick={() => handleLikeComment(comment.id)}
                              disabled={likingComment === comment.id}
                            >
                              <ThumbsUp className={`w-3 h-3 mr-1 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                              {comment.likes_count || 0}
                        </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                          {pageContent.replyButton || "Reply"}
                        </Button>
                      </div>

                          {/* Reply Form */}
                          {replyingTo === comment.id && (
                            <div className="mt-4 pl-6 border-l-2 border-primary/20">
                              <textarea
                                value={replyText[comment.id] || ""}
                                onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                placeholder={pageContent.replyPlaceholder || "Write your reply here... *"}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-2"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handlePostReply(comment.id)}
                                  disabled={submittingReply === comment.id || !replyText[comment.id]?.trim()}
                                  size="sm"
                                >
                                  {submittingReply === comment.id ? "Posting..." : (pageContent.postReplyButton || "Post Reply")}
                        </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText(prev => {
                                      const newReplyText = { ...prev };
                                      delete newReplyText[comment.id];
                                      return newReplyText;
                                    });
                                  }}
                                >
                                  Cancel
                        </Button>
                      </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 pl-6 border-l-2 border-muted space-y-4">
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="flex gap-4">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                            <Image
                                      src={getAvatarUrl(reply.user?.avatar_url, undefined, reply.user?.full_name)}
                                      alt={reply.user?.full_name || "User"}
                              fill
                              className="object-cover"
                                      unoptimized={isDicebearUrl(reply.user?.avatar_url)}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-sm">{reply.user?.full_name || "Anonymous"}</h4>
                                      {reply.user?.id === post?.author?.id && (
                              <Badge variant="secondary" className="text-xs">Author</Badge>
                                      )}
                              <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                            </div>
                                    <p className="text-muted-foreground mb-2 text-sm whitespace-pre-wrap">
                                      {reply.content}
                            </p>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={`h-8 px-3 ${likedComments.has(reply.id) ? 'text-primary' : ''}`}
                                      onClick={() => handleLikeComment(reply.id)}
                                      disabled={likingComment === reply.id}
                                    >
                                      <ThumbsUp className={`w-3 h-3 mr-1 ${likedComments.has(reply.id) ? 'fill-current' : ''}`} />
                                      {reply.likes_count || 0}
                            </Button>
                          </div>
                        </div>
                              ))}
                      </div>
                          )}
                    </div>
                  </div>
                </CardContent>
              </Card>
                ))}
                    </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Comments Yet</h3>
                  <p className="text-muted-foreground">Be the first to share your thoughts!</p>
                </CardContent>
              </Card>
            )}
          </div>
      </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="sticky top-24 space-y-6">
            {/* Newsletter CTA */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{pageContent.newsletterTitle || "Subscribe to Newsletter"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pageContent.newsletterDescription || "Get the latest AI tools and insights delivered to your inbox"}
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder={pageContent.newsletterPlaceholder || "Enter your email"}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button className="w-full">
                    {pageContent.newsletterButton || "Subscribe"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {pageContent.newsletterSubtext || "No spam. Unsubscribe anytime."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {pageContent.popularPostsHeading || "Popular Posts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedPosts.map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <div className="flex gap-3 group cursor-pointer">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(post.published_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {pageContent.categoriesHeading || "Categories"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link href="/blog?category=ai-tools">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      AI Tools
                    </Badge>
                  </Link>
                  <Link href="/blog?category=tutorials">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      Tutorials
                    </Badge>
                  </Link>
                  <Link href="/blog?category=industry-news">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      Industry News
                    </Badge>
                  </Link>
                  <Link href="/blog?category=reviews">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      Reviews
                    </Badge>
                  </Link>
                  <Link href="/blog?category=guides">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      Guides
                    </Badge>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Submit Tool CTA */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{pageContent.submitToolHeading || "Have an AI Tool?"}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {pageContent.submitToolDescription || "Submit your AI tool to our directory and reach thousands of users"}
                </p>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href="/submit" className="inline-flex items-center justify-center">
                    {pageContent.submitToolButton || "Submit Your Tool"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

        {/* Related Posts - Full Width Below */}
      {relatedPosts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">{pageContent.relatedArticlesHeading || "Related Articles"}</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full group transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/30">
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                      <Image
                      src={getBlogCoverUrl(relatedPost.cover_image)}
                        alt={relatedPost.title}
                        fill
                          className="object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
                      unoptimized={getBlogCoverUrl(relatedPost.cover_image).includes('unsplash.com')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop';
                      }}
                      />
                    </div>
                  <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(relatedPost.published_at)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

