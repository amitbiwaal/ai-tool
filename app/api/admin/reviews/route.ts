import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
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
    } = await supabase.auth.getUser();

    if (!user) {
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

    // Fetch all reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Reviews fetch error:", reviewsError);
      return NextResponse.json({ error: reviewsError.message }, { status: 500 });
    }

    // Fetch user profiles and tools separately
    const userIds = reviews?.map((r: any) => r.user_id).filter(Boolean) || [];
    const toolIds = reviews?.map((r: any) => r.tool_id).filter(Boolean) || [];
    
    let profilesMap: Record<string, any> = {};
    let toolsMap: Record<string, any> = {};

    // Fetch profiles
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

      if (!profilesError && profiles) {
        profiles.forEach((profile) => {
          profilesMap[profile.id] = profile;
        });
      }
    }

    // Fetch tools
    if (toolIds.length > 0) {
      const { data: tools, error: toolsError } = await supabase
        .from("tools")
        .select("id, name, slug")
        .in("id", toolIds);

      if (!toolsError && tools) {
        tools.forEach((tool) => {
          toolsMap[tool.id] = tool;
        });
      }
    }

    // Join reviews with profiles and tools
    const reviewsWithRelations = reviews?.map((review: any) => ({
      ...review,
      user: profilesMap[review.user_id] || null,
      tool: toolsMap[review.tool_id] || null,
    })) || [];

    return NextResponse.json({ reviews: reviewsWithRelations });
  } catch (error: any) {
    console.error("Unexpected error in GET admin reviews route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

