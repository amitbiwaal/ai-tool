"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  status: "pending" | "approved" | "rejected" | "spam";
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  blog_post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "spam">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/comments?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        console.error("Failed to fetch comments:", response.status);
        toast.error("Failed to fetch comments.");
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Network error while fetching comments.");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId: string, newStatus: "approved" | "rejected" | "spam") => {
    if (processingId) return;
    
    setProcessingId(commentId);
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(`Comment ${newStatus} successfully!`);
        fetchComments(); // Refresh the list
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        toast.error(`Failed to update comment: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast.error(error.message || "Network error. Failed to update comment.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }

    if (processingId) return;
    
    setProcessingId(commentId);
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Comment deleted successfully!");
        fetchComments(); // Refresh the list
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        toast.error(`Failed to delete comment: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error(error.message || "Network error. Failed to delete comment.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "spam":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch = 
      comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.blog_post?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || comment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Comments Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and moderate blog post comments
          </p>
        </div>
        <Button onClick={fetchComments} variant="outline" className="gap-2 shadow-lg">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold mt-1">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spam</p>
                <p className="text-2xl font-bold mt-1">{stats.spam}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-600" />
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
                placeholder="Search comments by content, user, or blog post..."
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
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                onClick={() => setFilterStatus("approved")}
                size="sm"
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === "rejected" ? "default" : "outline"}
                onClick={() => setFilterStatus("rejected")}
                size="sm"
              >
                Rejected
              </Button>
              <Button
                variant={filterStatus === "spam" ? "default" : "outline"}
                onClick={() => setFilterStatus("spam")}
                size="sm"
              >
                Spam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(comment.status)}>
                            {comment.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.parent_id && (
                            <Badge variant="outline" className="text-xs">
                              Reply
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {comment.user && (
                            <span>
                              <strong>User:</strong> {comment.user.full_name || comment.user.email || "Unknown"}
                            </span>
                          )}
                          {comment.blog_post && (
                            <Link href={`/blog/${comment.blog_post.slug}`} target="_blank" className="hover:text-primary">
                              <strong>Post:</strong> {comment.blog_post.title}
                            </Link>
                          )}
                          <span>
                            <strong>Likes:</strong> {comment.likes_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {comment.status === "pending" && (
                      <>
                        <Button
                          onClick={() => handleStatusChange(comment.id, "approved")}
                          size="sm"
                          disabled={processingId === comment.id}
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(comment.id, "rejected")}
                          variant="destructive"
                          size="sm"
                          disabled={processingId === comment.id}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(comment.id, "spam")}
                          variant="outline"
                          size="sm"
                          disabled={processingId === comment.id}
                          className="gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Spam
                        </Button>
                      </>
                    )}
                    {comment.status === "approved" && (
                      <>
                        <Button
                          onClick={() => handleStatusChange(comment.id, "rejected")}
                          variant="destructive"
                          size="sm"
                          disabled={processingId === comment.id}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(comment.id, "spam")}
                          variant="outline"
                          size="sm"
                          disabled={processingId === comment.id}
                          className="gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Mark Spam
                        </Button>
                      </>
                    )}
                    {(comment.status === "rejected" || comment.status === "spam") && (
                      <Button
                        onClick={() => handleStatusChange(comment.id, "approved")}
                        size="sm"
                        disabled={processingId === comment.id}
                        className="gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={processingId === comment.id}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No comments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No comments have been submitted yet"}
              </p>
              {(searchQuery || filterStatus !== "all") && (
                <Button onClick={() => { setSearchQuery(""); setFilterStatus("all"); }} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

