import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error in user submissions:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching submissions for user:", user.id);

    // Fetch all tools submitted by user (all statuses: pending, approved, rejected)
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        categories:tool_categories(category:categories(*)),
        tags:tool_tags(tag:tags(*))
      `)
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user submissions:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      return NextResponse.json({ 
        error: error.message || "Failed to fetch submissions",
        details: error,
        code: error.code
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${data?.length || 0} submissions for user ${user.id}`);

    // Transform data to match Tool interface
    const submissions = (data || []).map((tool: any) => ({
      ...tool,
      categories: tool.categories?.map((c: any) => c.category).filter(Boolean) || [],
      tags: tool.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));

    return NextResponse.json({ 
      submissions: submissions || [],
      count: submissions.length
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error("Unexpected error in GET user submissions route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

