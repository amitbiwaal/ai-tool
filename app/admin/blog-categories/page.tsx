"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  BookOpen,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  posts_count: number;
}

export default function BlogCategoriesManagementPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
    description: "",
    color: "#3b82f6",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog-categories?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch blog categories:", response.status, errorData);
        
        // Show helpful error message
        if (response.status === 500 && (errorData.code === '42P01' || errorData.error?.includes('does not exist'))) {
          toast.error("Blog categories table not found. Please run the database migration first.");
        } else {
          toast.error("Failed to load blog categories. Please check your connection.");
        }
        setCategories([]);
      }
    } catch (error: any) {
      console.error("Error fetching blog categories:", error);
      toast.error("Failed to load blog categories. Please check your connection.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || "",
      description: category.description || "",
      color: category.color || "#3b82f6",
    });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/blog-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || slugify(formData.name),
          icon: formData.icon,
          description: formData.description,
          color: formData.color,
        }),
      });

      if (response.ok) {
        toast.success("Blog category updated successfully!");
        setEditingId(null);
        await fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update blog category");
      }
    } catch (error: any) {
      console.error("Error updating blog category:", error);
      toast.error(error?.message || "Failed to update blog category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/blog-categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Blog category deleted successfully!");
        await fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete blog category");
      }
    } catch (error: any) {
      console.error("Error deleting blog category:", error);
      toast.error(error?.message || "Failed to delete blog category");
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const response = await fetch("/api/blog-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || slugify(formData.name),
          icon: formData.icon || "📁",
          description: formData.description || "",
          color: formData.color || "#3b82f6",
        }),
      });

      if (response.ok) {
        toast.success("Blog category added successfully!");
        setFormData({ name: "", slug: "", icon: "", description: "", color: "#3b82f6" });
        setShowAddForm(false);
        await fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add blog category");
      }
    } catch (error: any) {
      console.error("Error adding blog category:", error);
      toast.error(error?.message || "Failed to add blog category");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Blog Categories Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage blog post categories separately from tool categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCategories} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold mt-1">{categories.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold mt-1">
                  {categories.reduce((acc, cat) => acc + (cat.posts_count || 0), 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Posts/Category</p>
                <p className="text-2xl font-bold mt-1">
                  {categories.length > 0 ? Math.round(categories.reduce((acc, cat) => acc + (Number(cat.posts_count) || 0), 0) / categories.length) : 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add New Blog Category
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category Name"
                />
              </div>
              <div>
                <Label>Icon</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📚"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description..."
                rows={2}
              />
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Blog Categories Found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first blog category</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="border-2 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                {editingId === category.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Input
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Slug</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(category.id)} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{category.icon || "📁"}</div>
                        <div>
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline">{category.slug}</Badge>
                        <Badge>{category.posts_count || 0} posts</Badge>
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

