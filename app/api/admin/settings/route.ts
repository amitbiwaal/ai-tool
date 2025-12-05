import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET - Fetch all settings
export async function GET(request: NextRequest) {
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("category")
      .order("key");

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Convert array to object for easier access
    const settingsObj: Record<string, any> = {};
    data?.forEach((setting) => {
      if (!settingsObj[setting.category]) {
        settingsObj[setting.category] = {};
      }
      settingsObj[setting.category][setting.key] = setting.value;
    });


    return NextResponse.json({ settings: settingsObj, raw: data || [] });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST - Create or update settings
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
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each category
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings !== "object" || categorySettings === null) {
        continue;
      }

      // Process each setting in the category
      for (const [key, value] of Object.entries(categorySettings)) {
        try {
          // Check if setting already exists
          const { data: existing } = await supabase
            .from("settings")
            .select("id")
            .eq("category", category)
            .eq("key", key)
            .single();

          if (existing) {
            // Update existing
            const { data, error } = await supabase
              .from("settings")
              .update({
                value: value,
                updated_by: user.id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id)
              .select()
              .single();

            if (error) {
              errors.push({ category, key, error: error.message });
            } else {
              results.push(data);
            }
          } else {
            // Create new
            const { data, error } = await supabase
              .from("settings")
              .insert({
                category,
                key,
                value: value,
                updated_by: user.id,
              })
              .select()
              .single();

            if (error) {
              errors.push({ category, key, error: error.message });
            } else {
              results.push(data);
            }
          }
        } catch (err: any) {
          errors.push({ category, key, error: err.message });
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: "Some settings were saved, but some errors occurred",
          saved: results,
          errors: errors,
        },
        { status: 207 } // Multi-Status
      );
    }


    return NextResponse.json({
      message: "Settings saved successfully",
      settings: results,
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

