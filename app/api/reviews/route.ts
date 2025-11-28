import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const toolId = searchParams.get("toolId");

  const supabase = await createServerSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ 
      error: "Database connection not available. Please configure Supabase environment variables." 
    }, { status: 503 });
  }

  // Fetch reviews
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (toolId) {
    query = query.eq("tool_id", toolId);
  }

  const { data: reviews, error } = await query;

  if (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch user profiles for the reviews
  const userIds = reviews?.map((r: any) => r.user_id).filter(Boolean) || [];
  let profilesMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", userIds);

    if (!profilesError && profiles) {
      profiles.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });
    }
  }

  // Join reviews with profiles
  const reviewsWithUsers = reviews?.map((review: any) => ({
    ...review,
    user: profilesMap[review.user_id] || null,
  })) || [];

  return NextResponse.json({ reviews: reviewsWithUsers });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ 
      error: "Database connection not available. Please configure Supabase environment variables." 
    }, { status: 503 });
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tool_id, rating, title, comment, pros, cons } = body;

  // Validation
  if (!tool_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      tool_id,
      user_id: user.id,
      rating,
      title,
      comment,
      pros,
      cons,
      status: "pending", // Require moderation
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}

