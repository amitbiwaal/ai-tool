import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Handle both sync and async params (Next.js 13+ compatibility)
    const { id } = await Promise.resolve(params);

    if (!id) {
      return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get current tool status
    const { data: tool, error: toolCheckError } = await supabase
      .from("tools")
      .select("id, is_featured, status")
      .eq("id", id)
      .single();

    if (toolCheckError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Only allow featuring approved tools
    if (tool.status !== "approved") {
      return NextResponse.json({ 
        error: "Only approved tools can be featured" 
      }, { status: 400 });
    }

    // Toggle featured status
    const newFeaturedStatus = !tool.is_featured;

    const { error } = await supabase
      .from("tools")
      .update({
        is_featured: newFeaturedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Toggle featured error:", error);
      return NextResponse.json({ 
        error: error.message || "Failed to toggle featured status",
        details: error.details || null
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      is_featured: newFeaturedStatus,
      message: newFeaturedStatus ? "Tool featured successfully" : "Tool unfeatured successfully"
    });
  } catch (error: any) {
    console.error("Unexpected error in feature route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

