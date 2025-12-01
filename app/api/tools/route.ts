import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const categories = searchParams.get("categories")?.split(",");
  const tags = searchParams.get("tags")?.split(",");
  const pricing = searchParams.get("pricing")?.split(",");
  const rating = parseFloat(searchParams.get("rating") || "0");
  const listingType = searchParams.get("listing_type");

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ 
      tools: [],
      totalPages: 0,
      currentPage: page,
      total: 0,
      error: "Database connection not available" 
    }, { status: 503 });
  }

  let query = supabase
    .from("tools")
    .select(
      `
      *,
      categories:tool_categories(category:categories(*)),
      tags:tool_tags(tag:tags(*))
    `,
      { count: "exact" }
    )
    .eq("status", "approved");

  // Search filter
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // Pricing filter
  if (pricing && pricing.length > 0) {
    query = query.in("pricing_type", pricing);
  }

  // Rating filter
  if (rating > 0) {
    query = query.gte("rating_avg", rating);
  }

  // Listing type filter (paid/free)
  if (listingType) {
    query = query.eq("listing_type", listingType);
  }

  // Sorting
  switch (sort) {
    case "popular":
      query = query.order("views_count", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Apply pagination directly - we'll optimize category/tag filtering below
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // For category/tag filtering, we need to use a different approach
  if (categories && categories.length > 0) {
    // Use subquery to filter by categories first
    const { data: toolIds, error: categoryError } = await supabase
      .from("tool_categories")
      .select("tool_id")
      .in("category_id", categories);

    if (categoryError) {
      console.error("Category filter error:", categoryError);
      return NextResponse.json({
        tools: [],
        totalPages: 0,
        currentPage: page,
        total: 0,
        error: "Failed to filter by categories"
      }, { status: 500 });
    }

    const categoryToolIds = toolIds?.map(tc => tc.tool_id) || [];
    if (categoryToolIds.length === 0) {
      return NextResponse.json({
        tools: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      });
    }

    query = query.in("id", categoryToolIds);
  }

  if (tags && tags.length > 0) {
    // Use subquery to filter by tags first
    const { data: toolIds, error: tagError } = await supabase
      .from("tool_tags")
      .select("tool_id")
      .in("tag_id", tags);

    if (tagError) {
      console.error("Tag filter error:", tagError);
      return NextResponse.json({
        tools: [],
        totalPages: 0,
        currentPage: page,
        total: 0,
        error: "Failed to filter by tags"
      }, { status: 500 });
    }

    const tagToolIds = toolIds?.map(tt => tt.tool_id) || [];
    if (tagToolIds.length === 0) {
      return NextResponse.json({
        tools: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      });
    }

    query = query.in("id", tagToolIds);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Tools API error:", error);
    return NextResponse.json({ 
      tools: [],
      totalPages: 0,
      currentPage: page,
      total: 0,
      error: error.message 
    }, { status: 500 });
  }

  let tools =
    data?.map((tool) => ({
      ...tool,
      categories: tool.categories?.map((c: any) => c.category) || [],
      tags: tool.tags?.map((t: any) => t.tag) || [],
    })) || [];

  const totalPages = Math.ceil((count || 0) / limit);

  return NextResponse.json({
    tools: paginatedTools || [],
    totalPages: totalPages || 0,
    currentPage: page,
    total: filteredTotal || 0,
  });
}

