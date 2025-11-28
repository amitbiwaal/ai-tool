import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      console.error("Supabase client not available - check environment variables");
      // Return empty array instead of error to prevent UI breaking
      return NextResponse.json({ 
        categories: [],
        message: "Database connection not available. Please check your Supabase configuration."
      });
    }

    // Check if table exists by trying to query it
    const { data: categories, error } = await supabase
      .from("blog_categories")
      .select("id, name, slug, icon, description, color, posts_count")
      .order("name", { ascending: true });

    if (error) {
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.warn("blog_categories table does not exist yet. Please run the migration: lib/supabase/create_blog_categories_table.sql");
        return NextResponse.json({ 
          categories: [],
          message: "Blog categories table not found. Please run the database migration."
        });
      }
      
      console.error("Blog categories API error:", error);
      // Return empty array with error message instead of error status
      return NextResponse.json({ 
        categories: [],
        error: error.message,
        code: error.code
      });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error: any) {
    console.error("Blog categories API error:", error);
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json({ 
      categories: [],
      error: error?.message || "An unexpected error occurred"
    });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection not available" },
      { status: 503 }
    );
  }

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug, icon, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const categorySlug = slug || slugify(name);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("blog_categories")
      .insert({
        name,
        slug: categorySlug,
        icon: icon || "📁",
        description: description || "",
        color: color || "#3b82f6",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating blog category:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog category:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

