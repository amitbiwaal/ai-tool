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

