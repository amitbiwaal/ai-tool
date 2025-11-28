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

  // If we need to filter by categories/tags, fetch all first, then filter and paginate
  // Otherwise, apply pagination directly
  const needsPostFilter = (categories && categories.length > 0) || (tags && tags.length > 0);
  
  if (!needsPostFilter) {
    // Apply pagination directly if no category/tag filtering needed
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

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

  // Category filter - filter after fetching
  if (categories && categories.length > 0) {
    tools = tools.filter((tool) => {
      const toolCategoryIds = tool.categories?.map((c: any) => c.id) || [];
      return categories.some((catId) => toolCategoryIds.includes(catId));
    });
  }

  // Tag filter - filter after fetching
  if (tags && tags.length > 0) {
    tools = tools.filter((tool) => {
      const toolTagIds = tool.tags?.map((t: any) => t.id) || [];
      return tags.some((tagId) => toolTagIds.includes(tagId));
    });
  }

  // Apply pagination after filtering if needed
  let paginatedTools = tools;
  let filteredTotal: number;
  
  if (needsPostFilter) {
    // Filter was applied, so paginate the filtered results
    const from = (page - 1) * limit;
    const to = from + limit;
    paginatedTools = tools.slice(from, to);
    filteredTotal = tools.length;
  } else {
    // No filter was applied, use original count
    filteredTotal = count || 0;
  }

  const totalPages = Math.ceil(filteredTotal / limit);

  return NextResponse.json({
    tools: paginatedTools || [],
    totalPages: totalPages || 0,
    currentPage: page,
    total: filteredTotal || 0,
  });
}

