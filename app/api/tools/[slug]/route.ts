import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ 
      error: "Database connection not available. Please configure Supabase environment variables." 
    }, { status: 503 });
  }

  // Handle both sync and async params (Next.js 13+ compatibility)
  const { slug } = await Promise.resolve(params);

  const { data, error } = await supabase
    .from("tools")
    .select(
      `
      *,
      categories:tool_categories(category:categories(*)),
      tags:tool_tags(tag:tags(*))
    `
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  // Increment view count
  await supabase
    .from("tools")
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq("id", data.id);

  const tool = {
    ...data,
    categories: data.categories?.map((c: any) => c.category) || [],
    tags: data.tags?.map((t: any) => t.tag) || [],
  };

  return NextResponse.json({ tool });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Handle both sync and async params (Next.js 13+ compatibility)
    const { slug } = await Promise.resolve(params);

    if (!slug) {
      return NextResponse.json({ error: "Tool slug is required" }, { status: 400 });
    }

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

    // Only admin/moderator can edit tools
    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    // Get the tool
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, tagline, description, pricing_type, status } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description;
    if (pricing_type !== undefined) updateData.pricing_type = pricing_type;
    if (status !== undefined) updateData.status = status;

    // Update the tool
    const { data: updatedTool, error: updateError } = await supabase
      .from("tools")
      .update(updateData)
      .eq("id", tool.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update tool error:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Failed to update tool",
        details: updateError.details || null
      }, { status: 500 });
    }

    return NextResponse.json({ 
      tool: updatedTool,
      message: "Tool updated successfully" 
    });
  } catch (error: any) {
    console.error("Unexpected error in PUT tools route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Handle both sync and async params (Next.js 13+ compatibility)
    const { slug } = await Promise.resolve(params);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, get the tool to check ownership
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, submitted_by")
      .eq("slug", slug)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Check if user owns the tool or is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (tool.submitted_by !== user.id && profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the tool
    const { error: deleteError } = await supabase
      .from("tools")
      .delete()
      .eq("id", tool.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error in DELETE tools route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

