import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get('showAll') === 'true'; // For admin use
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    // Fetch categories with tools count
    let query = supabase
      .from("categories")
      .select("id, name, slug, icon, description, parent_id, created_at, updated_at");

    if (!showAll) {
      // For submit page: only parent categories
      query = query.is("parent_id", null);
    }

    const { data: categories, error: categoriesError } = await query
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Categories API error:", categoriesError);
      return NextResponse.json(
        { error: categoriesError.message },
        { status: 500 }
      );
    }

    // Fetch tools count for each category
    const { data: toolCategories, error: toolCategoriesError } = await supabase
      .from("tool_categories")
      .select("category_id");

    if (toolCategoriesError) {
      console.error("Error fetching tool categories:", toolCategoriesError);
    }

    // Calculate tools_count for each category
    const toolsCountMap = new Map<string, number>();
    if (toolCategories) {
      toolCategories.forEach((tc) => {
        const count = toolsCountMap.get(tc.category_id) || 0;
        toolsCountMap.set(tc.category_id, count + 1);
      });
    }

    // Add tools_count to each category
    const data = categories?.map((cat) => ({
      ...cat,
      tools_count: toolsCountMap.get(cat.id) || 0,
    })) || [];

    return NextResponse.json({ categories: data });
  } catch (error: any) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
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
    const { name, slug, icon, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const categorySlug = slug || slugify(name);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("categories")
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
      .from("categories")
      .insert({
        name,
        slug: categorySlug,
        icon: icon || "📁",
        description: description || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

