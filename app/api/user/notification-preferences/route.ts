import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        error: "Database connection not available"
      }, { status: 503 });
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user notification preferences
    const { data: preferences, error } = await supabase
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Notification preferences fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      email_tool_updates: true,
      email_favorite_updates: true,
      email_visited_updates: false,
      email_newsletter: true,
    };

    return NextResponse.json({
      preferences: preferences || defaultPreferences
    });
  } catch (error: any) {
    console.error("Unexpected error in notification preferences GET:", error);
    return NextResponse.json({
      error: error.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        error: "Database connection not available"
      }, { status: 503 });
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      email_tool_updates,
      email_favorite_updates,
      email_visited_updates,
      email_newsletter
    } = body;

    // Update or insert notification preferences
    const { data, error } = await supabase
      .from("user_notification_preferences")
      .upsert({
        user_id: user.id,
        email_tool_updates,
        email_favorite_updates,
        email_visited_updates,
        email_newsletter,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Notification preferences update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      preferences: data
    });
  } catch (error: any) {
    console.error("Unexpected error in notification preferences PUT:", error);
    return NextResponse.json({
      error: error.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}
