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

    // Fetch favorites
    const { data: favorites, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Favorites API error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch tools separately
    const toolIds = favorites?.map((f: any) => f.tool_id).filter(Boolean) || [];
    let toolsMap: Record<string, any> = {};

    if (toolIds.length > 0) {
      const { data: tools, error: toolsError } = await supabase
        .from("tools")
        .select("*")
        .in("id", toolIds);

      if (!toolsError && tools) {
        tools.forEach((tool) => {
          toolsMap[tool.id] = tool;
        });
      }
    }

    // Join favorites with tools
    const favoritesWithTools = favorites?.map((favorite: any) => ({
      ...favorite,
      tool: toolsMap[favorite.tool_id] || null,
    })) || [];

    return NextResponse.json({ favorites: favoritesWithTools });
  } catch (error: any) {
    console.error("Unexpected error in favorites GET:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        tool_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Favorites POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track favorite interaction for personalized notifications
    try {
      await supabase.rpc('track_tool_interaction', {
        p_user_id: user.id,
        p_tool_id: tool_id,
        p_interaction_type: 'favorite'
      });
    } catch (interactionError) {
      console.error("Error tracking favorite interaction:", interactionError);
      // Don't fail the request if tracking fails
    }

    return NextResponse.json({ favorite: data }, { status: 201 });
  } catch (error: any) {
    console.error("Unexpected error in favorites POST:", error);
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

    const searchParams = request.nextUrl.searchParams;
    const toolId = searchParams.get("toolId");

    if (!toolId) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("tool_id", toolId);

    if (error) {
      console.error("Favorites DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error in favorites DELETE:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

