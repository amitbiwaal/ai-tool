"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tool, Category } from "@/lib/types";
import {
  LayoutDashboard,
  Wrench,
  FolderTree,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTools: 0,
    pendingSubmissions: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalViews: 0,
    revenue: 0,
    approvalRate: 0,
  });

  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processingToolId, setProcessingToolId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalTools: Number(data.totalTools) || 0,
          pendingSubmissions: Number(data.pendingSubmissions) || 0,
          totalCategories: Number(data.totalCategories) || 0,
          totalUsers: Number(data.totalUsers) || 0,
          totalReviews: Number(data.totalReviews) || 0,
          totalViews: Number(data.totalViews) || 0,
          revenue: Number(data.revenue) || 0,
          approvalRate: Number(data.approvalRate) || 0,
        });
      } else {
        console.error("Failed to fetch stats:", response.status);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pending?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingTools(data.tools || []);
        // Update pending count in stats
        setStats(prev => ({ ...prev, pendingSubmissions: data.tools?.length || 0 }));
      } else {
        console.error("Failed to fetch pending tools:", response.status);
        setPendingTools([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setPendingTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (toolId: string) => {
    if (processingToolId) return; // Prevent multiple clicks
    
    setProcessingToolId(toolId);
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Tool approved successfully! 🎉");
        // Remove approved tool from list immediately
        setPendingTools(prev => prev.filter(tool => tool.id !== toolId));
        // Update stats
        setStats(prev => ({ 
          ...prev, 
          pendingSubmissions: Math.max(0, prev.pendingSubmissions - 1),
          totalTools: prev.totalTools + 1
        }));
        // Refresh data to get updated list
        await fetchData();
        await fetchStats();
      } else {
        // Better error handling
        const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Approve error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          toolId,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to approve tools.");
        } else {
          toast.error(errorMessage || "Failed to approve tool");
        }
      }
    } catch (error: any) {
      console.error("Error approving tool:", {
        error,
        message: error?.message,
        toolId,
      });
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setProcessingToolId(null);
    }
  };

  const handleReject = async (toolId: string) => {
    if (processingToolId) return; // Prevent multiple clicks
    
    // Confirm before rejecting
    if (!confirm("Are you sure you want to reject this tool submission?")) {
      return;
    }
    
    setProcessingToolId(toolId);
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Tool rejected successfully");
        // Remove rejected tool from list immediately
        setPendingTools(prev => prev.filter(tool => tool.id !== toolId));
        // Update stats
        setStats(prev => ({ 
          ...prev, 
          pendingSubmissions: Math.max(0, prev.pendingSubmissions - 1)
        }));
        // Refresh data to get updated list
        await fetchData();
        await fetchStats();
      } else {
        // Better error handling
        const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Reject error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          toolId,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to reject tools.");
        } else {
          toast.error(errorMessage || "Failed to reject tool");
        }
      }
    } catch (error: any) {
      console.error("Error rejecting tool:", {
        error,
        message: error?.message,
        toolId,
      });
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setProcessingToolId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor your platform performance and manage submissions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tools */}
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tools
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTools || 0}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12 this month
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pendingSubmissions || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers || 0}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +48 this week
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.revenue || 0}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.approvalRate || 0}% conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold mt-1">{(stats.totalViews || 0).toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold mt-1">{stats.totalReviews || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold mt-1">{stats.totalCategories || 0}</p>
              </div>
              <FolderTree className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Submissions */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Pending Tool Submissions</CardTitle>
              <CardDescription className="mt-1">
                Review and approve new tool submissions
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {pendingTools.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            </div>
          ) : pendingTools.length > 0 ? (
            <div className="space-y-4">
              {pendingTools.map((tool) => (
                <Card key={tool.id} className="border-2 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                            <Wrench className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {tool.tagline}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {tool.pricing_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Submitted: {new Date(tool.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            // Show tool details in alert for now (pending tools aren't published)
                            toast.success(
                              `Preview: ${tool.name}\n${tool.tagline || tool.description || "No description"}`,
                              { duration: 5000 }
                            );
                          }}
                          title="Tool is pending approval and not yet published"
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(tool.id)}
                          disabled={processingToolId === tool.id || !!processingToolId}
                          className="gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingToolId === tool.id ? (
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
                          onClick={() => handleReject(tool.id)}
                          disabled={processingToolId === tool.id || !!processingToolId}
                          className="gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingToolId === tool.id ? (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="pt-4">
                <Link href="/admin/tools">
                  <Button variant="outline" className="w-full gap-2">
                    View All Tools
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No pending submissions to review at the moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/tools">
          <Card className="border-2 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">Manage Tools</h3>
              <p className="text-xs text-muted-foreground">
                View, edit, and delete tools
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="border-2 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">Manage Users</h3>
              <p className="text-xs text-muted-foreground">
                View and manage user accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card className="border-2 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                  <FolderTree className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">Categories & Tags</h3>
              <p className="text-xs text-muted-foreground">
                Organize your content
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/blog">
          <Card className="border-2 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">Blog Posts</h3>
              <p className="text-xs text-muted-foreground">
                Create and edit blog content
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

