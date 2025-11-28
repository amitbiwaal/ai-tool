import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Handle both sync and async params (Next.js 13+ compatibility)
    const { id } = await params;

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

    // First check if tool exists and get listing_type
    const { data: tool, error: toolCheckError } = await supabase
      .from("tools")
      .select("id, status, listing_type")
      .eq("id", id)
      .single();

    if (toolCheckError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // If it's a paid listing, automatically set is_featured to true
    const updateData: any = {
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Auto-feature paid listings
    if (tool.listing_type === "paid") {
      updateData.is_featured = true;
    }

    const { error } = await supabase
      .from("tools")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Approve tool error:", error);
      return NextResponse.json({ 
        error: error.message || "Failed to approve tool",
        details: error.details || null
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Tool approved successfully" });
  } catch (error: any) {
    console.error("Unexpected error in approve route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

