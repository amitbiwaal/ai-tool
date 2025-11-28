"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Tag {
  id: string;
  name: string;
  slug: string;
  tools_count?: number;
  created_at?: string;
}

export default function TagsPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      } else {
        toast.error("Failed to load tags");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: generateSlug(name),
    });
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Tag slug is required");
      return;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim().toLowerCase(),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Tag added successfully! 🎉");
        setFormData({ name: "", slug: "" });
        setShowAddForm(false);
        // Refresh tags list
        await fetchTags();
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Add tag error:", {
          status: response.status,
          error: errorMessage,
        });
        
        if (response.status === 409) {
          toast.error("Tag with this name or slug already exists");
        } else if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to add tags.");
        } else {
          toast.error(errorMessage || "Failed to add tag");
        }
      }
    } catch (error: any) {
      console.error("Error adding tag:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }
    // TODO: Implement delete API endpoint
    toast.success("Delete functionality coming soon!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tags Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage tool tags</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tags</p>
                <p className="text-2xl font-bold mt-1">{tags.length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add New Tag
              <Button variant="ghost" size="sm" onClick={() => {
                setShowAddForm(false);
                setFormData({ name: "", slug: "" });
              }}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tag Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Machine Learning"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                The display name for the tag
              </p>
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim() })}
                placeholder="machine-learning"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly version (auto-generated from name, but you can edit it)
              </p>
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tags List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground">Loading tags...</p>
          </div>
        </div>
      ) : tags.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <Card key={tag.id} className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{tag.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">{tag.slug}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                  <Badge>{tag.tools_count || 0} tools</Badge>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(tag.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Tags Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first tag
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Tag
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

