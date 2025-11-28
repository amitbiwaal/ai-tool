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

