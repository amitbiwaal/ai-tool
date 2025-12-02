import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    console.log("User authorized, fetching tools...");

    // Fetch all tools
    const { data: tools, error: toolsError } = await supabase
      .from("tools")
      .select(`
        id,
        name,
        slug,
        tagline,
        description,
        status,
        pricing_type,
        rating_avg,
        rating_count,
        views_count,
        is_featured,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (toolsError) {
      console.error("Tools fetch error:", toolsError);
      return NextResponse.json({ 
        error: toolsError.message || "Failed to fetch tools",
        details: toolsError
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    if (!tools || tools.length === 0) {
      console.log("No tools found in database");
      return NextResponse.json({ 
        tools: [],
        message: "No tools found"
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    console.log(`✅ Fetched ${tools.length} tools from database`);

    // Transform tools data
    const transformedTools = tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline || "",
      description: tool.description || "",
      status: tool.status || "pending",
      pricing_type: tool.pricing_type || "free",
      rating_avg: Number(tool.rating_avg) || 0,
      rating_count: Number(tool.rating_count) || 0,
      views: Number(tool.views_count) || 0,
      is_featured: tool.is_featured || false,
      created_at: tool.created_at,
    }));

    return NextResponse.json({ 
      tools: transformedTools || [],
      count: transformedTools?.length || 0
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error("Unexpected error in GET tools route:", error);
    return NextResponse.json({
      error: error.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        error: "Database connection not available. Please configure Supabase environment variables."
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      tagline,
      description,
      long_description,
      logo_url,
      cover_image_url,
      website_url,
      pricing_type,
      features,
      video_url,
      categories,
      tags,
      status
    } = body;

    // Validate required fields
    if (!name || !description || !logo_url || !website_url) {
      return NextResponse.json({
        error: "Missing required fields: name, description, logo_url, website_url"
      }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const { data: existingTool, error: slugCheckError } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (slugCheckError && slugCheckError.code !== 'PGRST116') {
      console.error("Slug check error:", slugCheckError);
      return NextResponse.json({ error: "Failed to validate slug" }, { status: 500 });
    }

    if (existingTool) {
      return NextResponse.json({
        error: "A tool with this name already exists. Please choose a different name."
      }, { status: 400 });
    }

    // Prepare tool data
    const toolData = {
      name,
      slug,
      tagline: tagline || null,
      description,
      long_description: long_description || null,
      logo_url,
      cover_image_url: cover_image_url || null,
      website_url,
      pricing_type: pricing_type || "free",
      features: features || [],
      video_url: video_url || null,
      status: status || "pending",
      submitted_by: user.id, // Track who submitted this tool
    };

    console.log("Creating tool with data:", toolData);

    // Create the tool
    const { data: newTool, error: createError } = await supabase
      .from("tools")
      .insert(toolData)
      .select("id, slug")
      .single();

    if (createError) {
      console.error("Tool creation error:", createError);
      return NextResponse.json({
        error: createError.message || "Failed to create tool",
        details: createError
      }, { status: 500 });
    }

    console.log("Tool created successfully:", newTool);

    // Add categories if provided
    if (categories && categories.length > 0) {
      const categoryInserts = categories.map((categoryId: string) => ({
        tool_id: newTool.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from("tool_categories")
        .insert(categoryInserts);

      if (categoryError) {
        console.error("Category association error:", categoryError);
        // Don't fail the whole operation for category errors
      }
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        tool_id: newTool.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from("tool_tags")
        .insert(tagInserts);

      if (tagError) {
        console.error("Tag association error:", tagError);
        // Don't fail the whole operation for tag errors
      }
    }

    // Note: Category tool counts are updated via triggers
    // The database triggers will handle incrementing category tool counts automatically

    return NextResponse.json({
      message: `Tool "${name}" created successfully with status: ${status}`,
      tool: {
        id: newTool.id,
        slug: newTool.slug,
        status: status
      }
    });

  } catch (error: any) {
    console.error("Unexpected error in POST tools route:", error);
    return NextResponse.json({
      error: error.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}

