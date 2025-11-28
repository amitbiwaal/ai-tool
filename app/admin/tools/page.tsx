"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  TrendingUp,
  Wrench,
  X,
  Save,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  pricing_type: string;
  rating_avg: number;
  rating_count: number;
  views: number;
  is_featured?: boolean;
  created_at: string;
}

export default function ToolsManagementPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    pricing_type: "free",
    status: "pending" as "pending" | "approved" | "rejected",
  });
  const [saving, setSaving] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tools?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched tools:", data.tools?.length || 0);
        setTools(data.tools || []);
      } else {
        const error = await response.json();
        console.error("Failed to fetch tools:", error);
        toast.error(error.error || "Failed to load tools");
        setTools([]);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast.error("Network error while fetching tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || tool.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tools.length,
    pending: tools.filter((t) => t.status === "pending").length,
    approved: tools.filter((t) => t.status === "approved").length,
    rejected: tools.filter((t) => t.status === "rejected").length,
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Tool approved successfully!");
        fetchTools(); // Refresh tools list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to approve tool");
      }
    } catch (error) {
      console.error("Error approving tool:", error);
      toast.error("Network error while approving tool");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Tool rejected successfully!");
        fetchTools(); // Refresh tools list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to reject tool");
      }
    } catch (error) {
      console.error("Error rejecting tool:", error);
      toast.error("Network error while rejecting tool");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${id}/feature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Featured status updated!");
        fetchTools(); // Refresh tools list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Network error while updating featured status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) {
      return;
    }

    try {
      const tool = tools.find(t => t.id === id);
      if (!tool) return;

      const response = await fetch(`/api/tools/${tool.slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tool deleted successfully!");
        fetchTools(); // Refresh tools list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete tool");
      }
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast.error("Network error while deleting tool");
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setEditFormData({
      name: tool.name,
      tagline: tool.tagline,
      description: tool.description || "",
      pricing_type: tool.pricing_type,
      status: tool.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTool) return;

    if (!editFormData.name.trim() || !editFormData.tagline.trim()) {
      toast.error("Name and tagline are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/tools/${editingTool.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Tool updated successfully! 🎉");
        // Update tool in list
        setTools(tools.map(t => 
          t.id === editingTool.id 
            ? { ...t, ...editFormData, description: editFormData.description || t.description || "" }
            : t
        ));
        setEditingTool(null);
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Update tool error:", {
          status: response.status,
          error: errorMessage,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to edit tools.");
        } else {
          toast.error(errorMessage || "Failed to update tool");
        }
      }
    } catch (error: any) {
      console.error("Error updating tool:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tools Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and moderate AI tool submissions
          </p>
        </div>
        <Link href="/admin/tools/add">
          <Button className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            Add Tool
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tools</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
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
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
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

      {/* Edit Modal */}
      {editingTool && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full mx-4 shadow-2xl border-2 max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-muted/30 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Edit Tool</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTool(null)}
                  className="h-8 w-8 p-0"
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="edit-name">Tool Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Tool name"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="edit-tagline">Tagline *</Label>
                <Input
                  id="edit-tagline"
                  value={editFormData.tagline}
                  onChange={(e) => setEditFormData({ ...editFormData, tagline: e.target.value })}
                  placeholder="Short description"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Detailed description"
                  rows={4}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-pricing">Pricing Type</Label>
                  <Select
                    id="edit-pricing"
                    value={editFormData.pricing_type}
                    onChange={(e) => setEditFormData({ ...editFormData, pricing_type: e.target.value })}
                    disabled={saving}
                  >
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="subscription">Subscription</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    id="edit-status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as "pending" | "approved" | "rejected" })}
                    disabled={saving}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingTool(null)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tools List */}
      <div className="space-y-4">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{tool.name}</h3>
                        <Badge className={getStatusColor(tool.status)}>
                          {tool.status}
                        </Badge>
                        {tool.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {tool.pricing_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tool.tagline}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Created: {new Date(tool.created_at).toLocaleDateString()}
                        </span>
                        {tool.status === "approved" && (
                          <>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {tool.views.toLocaleString()} views
                            </span>
                            <span>
                              ⭐ {tool.rating_avg} ({tool.rating_count} reviews)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {tool.status === "approved" && (
                    <>
                    <Link href={`/tools/${tool.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                      <Button
                        variant={tool.is_featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleFeatured(tool.id)}
                        className={`gap-1 ${tool.is_featured ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                        title={tool.is_featured ? "Unfeature this tool" : "Feature this tool"}
                      >
                        <Star className={`h-4 w-4 ${tool.is_featured ? "fill-current" : ""}`} />
                        {tool.is_featured ? "Featured" : "Feature"}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tool)}
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  {tool.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(tool.id)}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(tool.id)}
                        className="gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tool.id)}
                    className="gap-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
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
    </div>
  );
}

