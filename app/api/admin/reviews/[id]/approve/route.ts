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
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
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

    // Check if review exists
    const { data: review, error: reviewCheckError } = await supabase
      .from("reviews")
      .select("id, tool_id")
      .eq("id", id)
      .single();

    if (reviewCheckError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update review status
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Approve review error:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Failed to approve review",
        details: updateError.details || null
      }, { status: 500 });
    }

    // Recalculate tool rating
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("tool_id", review.tool_id)
      .eq("status", "approved");

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length;
      const ratingCount = allReviews.length;

      await supabase
        .from("tools")
        .update({
          rating_avg: Math.round(avgRating * 10) / 10,
          rating_count: ratingCount,
        })
        .eq("id", review.tool_id);
    }

    return NextResponse.json({ success: true, message: "Review approved successfully" });
  } catch (error: any) {
    console.error("Unexpected error in approve review route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

