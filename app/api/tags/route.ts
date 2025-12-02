import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      // Return empty array if Supabase is not configured
      return NextResponse.json({ tags: [] });
    }

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Tags API error:", error);
      return NextResponse.json({ tags: [] });
    }

    return NextResponse.json({ tags: data || [] });
  } catch (error) {
    console.error("Tags API error:", error);
    return NextResponse.json({ tags: [] });
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

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Check if tag with same name or slug already exists
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .or(`name.eq.${name},slug.eq.${slug}`)
      .single();

    if (existingTag) {
      return NextResponse.json({ error: "Tag with this name or slug already exists" }, { status: 409 });
    }

    // Insert new tag
    const { data: newTag, error: insertError } = await supabase
      .from("tags")
      .insert({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Tag insert error:", insertError);
      return NextResponse.json({ 
        error: insertError.message || "Failed to create tag",
        details: insertError.details || null
      }, { status: 500 });
    }

    return NextResponse.json({ 
      tag: newTag,
      message: "Tag created successfully" 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Unexpected error in POST tags route:", error);
    return NextResponse.json({
      error: error.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('id');

    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    // Check if tag exists and get its details
    const { data: tag, error: fetchError } = await supabase
      .from("tags")
      .select("id, name")
      .eq("id", tagId)
      .single();

    if (fetchError || !tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if tag is being used by any tools (optional safety check)
    try {
      const { data: toolTags, error: usageError } = await supabase
        .from("tool_tags")
        .select("tool_id")
        .eq("tag_id", tagId)
        .limit(1);

      if (usageError) {
        // If table doesn't exist or other error, log but don't block deletion
        console.warn("Tag usage check failed (continuing with deletion):", {
          error: usageError.message,
          code: usageError.code
        });

        // For development/staging environments, allow deletion even if check fails
        if (usageError.code === '42P01') { // table doesn't exist
          console.log("tool_tags table doesn't exist, skipping usage check");
        }
        // Continue with deletion for other errors too (non-blocking)
      } else if (toolTags && toolTags.length > 0) {
        return NextResponse.json({
          error: "Cannot delete tag that is being used by tools. Remove this tag from all tools first."
        }, { status: 409 });
      }
    } catch (checkError) {
      // If usage check fails completely, log but allow deletion
      console.warn("Tag usage check threw exception (continuing with deletion):", checkError);
    }

    // Delete the tag
    const { error: deleteError } = await supabase
      .from("tags")
      .delete()
      .eq("id", tagId);

    if (deleteError) {
      console.error("Tag delete error:", deleteError);
      return NextResponse.json({
        error: deleteError.message || "Failed to delete tag"
      }, { status: 500 });
    }

    return NextResponse.json({
      message: `Tag "${tag.name}" deleted successfully`
    });

  } catch (error: any) {
    console.error("Unexpected error in DELETE tags route:", error);
    return NextResponse.json({
      error: error.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}

