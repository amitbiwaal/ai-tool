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

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    // If profile doesn't exist, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      return NextResponse.json({
        profile: {
          ...newProfile,
          email: user.email || newProfile.email,
        },
      });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        email: user.email || profile.email,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
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
    const { full_name, bio, website, avatar_url } = body;

    // Update profile in profiles table
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: full_name || null,
        bio: bio || null,
        website: website || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      // If profile doesn't exist, create it
      if (updateError.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || "",
            full_name: full_name || null,
            bio: bio || null,
            website: website || null,
            avatar_url: avatar_url || null,
          })
          .select()
          .single();

        if (createError) throw createError;

        return NextResponse.json({
          profile: {
            ...newProfile,
            email: user.email || newProfile.email,
          },
        });
      }
      throw updateError;
    }

    return NextResponse.json({
      profile: {
        ...updatedProfile,
        email: user.email || updatedProfile.email,
      },
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

