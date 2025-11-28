import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("tools")
      .select("views_count, favorites_count")
      .eq("submitted_by", user.id);

    if (submissionsError) throw submissionsError;

    // Calculate total views from submissions
    const totalViews = submissions?.reduce((sum, tool) => sum + (tool.views_count || 0), 0) || 0;

    // Get favorites count
    const { count: totalFavorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (favoritesError) throw favoritesError;

    // Get submissions count
    const { count: totalSubmissions, error: submissionsCountError } = await supabase
      .from("tools")
      .select("*", { count: "exact", head: true })
      .eq("submitted_by", user.id);

    if (submissionsCountError) throw submissionsCountError;

    // Get reviews count
    const { count: reviewsWritten, error: reviewsError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (reviewsError) throw reviewsError;

    // Calculate monthly growth (comparing this month vs last month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const { data: thisMonthViews, error: thisMonthError } = await supabase
      .from("tools")
      .select("views_count")
      .eq("submitted_by", user.id)
      .gte("created_at", thisMonthStart.toISOString());

    if (thisMonthError) throw thisMonthError;

    const { data: lastMonthViews, error: lastMonthError } = await supabase
      .from("tools")
      .select("views_count")
      .eq("submitted_by", user.id)
      .gte("created_at", lastMonthStart.toISOString())
      .lt("created_at", thisMonthStart.toISOString());

    if (lastMonthError) throw lastMonthError;

    const thisMonthTotal = thisMonthViews?.reduce((sum, tool) => sum + (tool.views_count || 0), 0) || 0;
    const lastMonthTotal = lastMonthViews?.reduce((sum, tool) => sum + (tool.views_count || 0), 0) || 0;
    
    const monthlyGrowth = lastMonthTotal > 0 
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonthTotal > 0 ? 100 : 0;

    return NextResponse.json({
      totalViews,
      totalFavorites: totalFavorites || 0,
      totalSubmissions: totalSubmissions || 0,
      reviewsWritten: reviewsWritten || 0,
      monthlyGrowth: monthlyGrowth || 0,
    });
  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

