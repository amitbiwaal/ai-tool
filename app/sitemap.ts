import { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mostpopularaitools.com";
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Database connection not available");
  }

  // Get all approved tools
  const { data: tools } = await supabase
    .from("tools")
    .select("slug, updated_at")
    .eq("status", "approved");

  // Get all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at");

  // Get all published blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");

  const toolUrls =
    tools?.map((tool) => ({
      url: `${baseUrl}/tools/${encodeURIComponent(tool.slug)}`,
      lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  const categoryUrls =
    categories?.map((category) => ({
      url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  const blogUrls =
    posts?.map((post) => ({
      url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...toolUrls,
    ...categoryUrls,
    ...blogUrls,
  ];
}

