import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET - Fetch all content or content by page/section
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection not available" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const section = searchParams.get("section");

  try {
    let query = supabase.from("frontend_content").select("*");

    if (page) {
      query = query.eq("page", page);
    }
    if (section) {
      query = query.eq("section", section);
    }

    const { data, error } = await query.order("page").order("section").order("key");

    if (error) {
      console.error("Error fetching content:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { content: data || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
        }
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST - Create or update content
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
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error:", authError);
    return NextResponse.json({ 
      error: "Unauthorized - Please sign in to continue" 
    }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return NextResponse.json({ 
      error: "Failed to verify user permissions" 
    }, { status: 500 });
  }

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    console.error(`User ${user.id} attempted to save content but is not admin/moderator. Role: ${profile?.role || "none"}`);
    return NextResponse.json({ 
      error: "Forbidden - Admin or Moderator access required" 
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { page, section, key, value, description } = body;

    if (!page || !section || !key || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: page, section, key, value" },
        { status: 400 }
      );
    }

    // Check if content already exists
    const { data: existing } = await supabase
      .from("frontend_content")
      .select("id")
      .eq("page", page)
      .eq("section", section)
      .eq("key", key)
      .single();

    if (existing) {
      // Update existing - try to parse JSON if it's a string
      let parsedValue = value;
      if (typeof value === "string") {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // If not valid JSON, keep as string
          parsedValue = value;
        }
      }

      const { data, error } = await supabase
        .from("frontend_content")
        .update({
          value: parsedValue,
          description: description || null,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating content:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ content: data, message: "Content updated successfully" });
    } else {
      // Create new - try to parse JSON if it's a string
      let parsedValue = value;
      if (typeof value === "string") {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // If not valid JSON, keep as string
          parsedValue = value;
        }
      }

      const { data, error } = await supabase
        .from("frontend_content")
        .insert({
          page,
          section,
          key,
          value: parsedValue,
          description: description || null,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating content:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ content: data, message: "Content created successfully" }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("frontend_content")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting content:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

