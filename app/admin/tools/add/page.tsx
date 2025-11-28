"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, Tag } from "@/lib/types";
import { Sparkles, Plus, X, ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminAddToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    long_description: "",
    logo_url: "",
    cover_image_url: "",
    website_url: "",
    pricing_type: "free",
    features: [""],
    video_url: "",
    selectedCategories: [] as string[],
    selectedTags: [] as string[],
    status: "approved" as "approved" | "pending",
  });

  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverUploading, setCoverUploading] = useState(false);

  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      screenshotPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [screenshotPreviews, logoPreview, coverPreview]);

  const fetchData = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch(`/api/categories?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        }),
        fetch(`/api/tags?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        }),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      } else {
        console.error("Failed to fetch categories:", categoriesRes.status);
        toast.error("Failed to load categories");
        setCategories([]);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags || []);
      } else {
        console.error("Failed to fetch tags:", tagsRes.status);
        toast.error("Failed to load tags");
        setTags([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Network error while fetching categories and tags");
      setCategories([]);
      setTags([]);
    }
  };

  const handleArrayInput = (
    field: "features",
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: "features") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayField = (field: "features", index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  // Upload file function
  const uploadFile = async (file: File, type: "logo" | "cover"): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      return null;
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setLogoFile(file);
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    setLogoUploading(true);

    const url = await uploadFile(file, "logo");
    setLogoUploading(false);

    if (url) {
      setFormData({ ...formData, logo_url: url });
      toast.success("Logo uploaded successfully!");
    } else {
      setLogoFile(null);
      setLogoPreview("");
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setCoverFile(file);
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);
    setCoverUploading(true);

    const url = await uploadFile(file, "cover");
    setCoverUploading(false);

    if (url) {
      setFormData({ ...formData, cover_image_url: url });
      toast.success("Cover image uploaded successfully!");
    } else {
      setCoverFile(null);
      setCoverPreview("");
    }
  };

  // Remove logo
  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview("");
    setFormData({ ...formData, logo_url: "" });
  };

  // Remove cover image
  const removeCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview("");
    setFormData({ ...formData, cover_image_url: "" });
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const imageFiles = newFiles.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    // Check total screenshots limit (e.g., max 10)
    if (screenshots.length + imageFiles.length > 10) {
      toast.error("Maximum 10 screenshots allowed");
      return;
    }

    // Create previews
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setScreenshots([...screenshots, ...imageFiles]);
    setScreenshotPreviews([...screenshotPreviews, ...newPreviews]);
    toast.success(`${imageFiles.length} screenshot(s) added`);
  };

  const removeScreenshot = (index: number) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(screenshotPreviews[index]);

    setScreenshots(screenshots.filter((_, i) => i !== index));
    setScreenshotPreviews(screenshotPreviews.filter((_, i) => i !== index));
    toast.success("Screenshot removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.website_url) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate logo is uploaded
      if (!formData.logo_url) {
        toast.error("Please upload a logo for the tool");
        setLoading(false);
        return;
      }

      // In a real implementation, you would upload screenshots first
      // and get URLs back, then include those URLs in the submission
      const submitData = {
        ...formData,
        features: formData.features.filter((f) => f.trim()),
        categories: formData.selectedCategories,
        tags: formData.selectedTags,
        status: formData.status,
        screenshots: screenshots.length, // Screenshot count
        // screenshots: await uploadScreenshots(screenshots), // In real implementation
      };

      console.log("Screenshots to upload:", screenshots);
      console.log("Submit data:", submitData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Tool added successfully as ${formData.status}!`);
      router.push("/admin/tools");
    } catch (error: any) {
      toast.error(error.message || "Failed to add tool");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/tools">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Tool
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new AI tool to the directory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Tool Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., ChatGPT"
                  className="h-12 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tagline" className="text-base font-semibold">
                  Tagline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tagline"
                  required
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  placeholder="A short, catchy description"
                  className="h-12 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Short Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description (2-3 sentences)"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="long_description" className="text-base font-semibold">
                  Long Description
                </Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) =>
                    setFormData({ ...formData, long_description: e.target.value })
                  }
                  placeholder="Detailed description of the tool"
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="website_url" className="text-base font-semibold">
                  Website URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  required
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="h-12 mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="pricing_type" className="text-base font-semibold">
                  Pricing Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="pricing_type"
                  required
                  value={formData.pricing_type}
                  onChange={(e) =>
                    setFormData({ ...formData, pricing_type: e.target.value })
                  }
                  className="mt-2 flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="contact">Contact for Pricing</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) =>
                      handleArrayInput("features", index, e.target.value)
                    }
                    placeholder={`Feature ${index + 1}`}
                    className="h-12"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayField("features", index)}
                      className="h-12 w-12"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField("features")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Feature
              </Button>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo" className="text-base font-semibold mb-2 block">
                  Tool Logo <span className="text-red-500">*</span>
                </Label>
                {logoPreview || formData.logo_url ? (
                  <div className="relative inline-block">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                      <Image
                        src={logoPreview || formData.logo_url}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {logoUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={logoUploading}
                    />
                    <label
                      htmlFor="logo"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {logoUploading ? (
                          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                        ) : (
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        )}
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
                {formData.logo_url && (
                  <p className="text-xs text-green-600 mt-2">✓ Logo uploaded successfully</p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div>
                <Label htmlFor="cover_image" className="text-base font-semibold mb-2 block">
                  Cover Image (Optional)
                </Label>
                {coverPreview || formData.cover_image_url ? (
                  <div className="relative inline-block w-full">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                      <Image
                        src={coverPreview || formData.cover_image_url}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {coverUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={coverUploading}
                    />
                    <label
                      htmlFor="cover_image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {coverUploading ? (
                          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                        ) : (
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        )}
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
                {formData.cover_image_url && (
                  <p className="text-xs text-green-600 mt-2">✓ Cover image uploaded successfully</p>
                )}
              </div>

              {/* Screenshots Upload */}
              <div>
                <Label htmlFor="screenshots" className="text-base font-semibold mb-2 block">
                  Screenshots
                </Label>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      id="screenshots"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="screenshots"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP (MAX. 10 images)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Screenshot Previews */}
                  {screenshotPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {screenshotPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group aspect-video rounded-lg overflow-hidden border-2 border-border"
                        >
                          <img
                            src={preview}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            {screenshots[index]?.name || `Screenshot ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {screenshots.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {screenshots.length} screenshot(s) uploaded
                    </p>
                  )}
                </div>
              </div>

              {/* Video URL */}
              <div>
                <Label htmlFor="video_url">Video URL (Optional - YouTube, Vimeo)</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-12 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add a video demo or tutorial of your tool
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="categories" className="text-base font-semibold mb-2 block">
                  Categories <span className="text-red-500">*</span>
                </Label>
                <select
                  id="categories"
                  required
                  value={formData.selectedCategories[0] || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, selectedCategories: e.target.value ? [e.target.value] : [] });
                  }}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Choose a category...
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedTags: [...formData.selectedTags, tag.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedTags: formData.selectedTags.filter(
                                (id) => id !== tag.id
                              ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="status" className="text-base font-semibold">
                  Tool Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "approved" | "pending" })
                  }
                  className="mt-2 flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="approved">Approved (Published immediately)</option>
                  <option value="pending">Pending (Requires review)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose whether to publish immediately or save as pending
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link href="/admin/tools" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="flex-1 h-12 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding Tool...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Add Tool
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

