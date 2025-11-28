"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Star, 
  CheckCircle, 
  XCircle, 
  Search,
  Clock,
  Eye,
  Trash2,
  User,
  Calendar,
  TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  pros: any;
  cons: any;
  helpful_count: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  tool?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ReviewsPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [processingReviewId, setProcessingReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    if (processingReviewId) return;
    
    setProcessingReviewId(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Review approved successfully! 🎉");
        // Update review in list
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, status: "approved" as const } : r
        ));
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Approve review error:", {
          status: response.status,
          error: errorMessage,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to approve reviews.");
        } else {
          toast.error(errorMessage || "Failed to approve review");
        }
      }
    } catch (error: any) {
      console.error("Error approving review:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (processingReviewId) return;
    
    if (!confirm("Are you sure you want to reject this review?")) {
      return;
    }
    
    setProcessingReviewId(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Review rejected successfully");
        // Update review in list
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, status: "rejected" as const } : r
        ));
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Reject review error:", {
          status: response.status,
          error: errorMessage,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to reject reviews.");
        } else {
          toast.error(errorMessage || "Failed to reject review");
        }
      }
    } catch (error: any) {
      console.error("Error rejecting review:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    if (processingReviewId) return;
    
    setProcessingReviewId(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Review deleted successfully");
        // Remove review from list
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        toast.error(errorMessage || "Failed to delete review");
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setProcessingReviewId(null);
    }
  };

  const getUserName = (review: Review) => {
    return review.user?.full_name || review.user?.email?.split("@")[0] || "Anonymous";
  };

  const getUserAvatar = (review: Review) => {
    if (review.user?.avatar_url) return review.user.avatar_url;
    if (review.user?.email) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.user.email)}`;
    }
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.tool?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getUserName(review).toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "0.0",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reviews Management
        </h1>
        <p className="text-muted-foreground mt-2">Moderate user reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
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
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
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
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold mt-1">{stats.avgRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600 fill-yellow-600" />
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
                placeholder="Search by tool, user, or review content..."
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      ) : filteredReviews.length > 0 ? (
      <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card 
              key={review.id} 
              className={`border-2 hover:shadow-lg transition-all ${
                review.status === "pending" ? "bg-yellow-50/50 dark:bg-yellow-950/10" : ""
              }`}
            >
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* User Info */}
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                      <Image
                        src={getUserAvatar(review)}
                        alt={getUserName(review)}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{getUserName(review)}</p>
                      <p className="text-xs text-muted-foreground">{review.user?.email}</p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                          {review.tool && (
                            <Link 
                              href={`/tools/${review.tool.slug}`}
                              className="font-bold text-lg hover:text-primary transition-colors"
                            >
                              {review.tool.name}
                            </Link>
                          )}
                          <Badge className={getStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                  </div>
                        {review.title && (
                          <h4 className="font-semibold mb-1">{review.title}</h4>
                        )}
                  <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                    ))}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({review.rating}/5)
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                          {review.helpful_count > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {review.helpful_count} helpful
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-col lg:items-end">
                  {review.status === "pending" && (
                    <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          disabled={processingReviewId === review.id || !!processingReviewId}
                          className="gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingReviewId === review.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                        <CheckCircle className="h-4 w-4" />
                        Approve
                            </>
                          )}
                      </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(review.id)}
                          disabled={processingReviewId === review.id || !!processingReviewId}
                          className="gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingReviewId === review.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                        <XCircle className="h-4 w-4" />
                        Reject
                            </>
                          )}
                      </Button>
                    </>
                  )}
                    {review.tool && review.status === "approved" && (
                      <Link href={`/tools/${review.tool.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View Tool
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      disabled={processingReviewId === review.id || !!processingReviewId}
                      className="gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reviews Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filters"
                : "No reviews in the system yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

