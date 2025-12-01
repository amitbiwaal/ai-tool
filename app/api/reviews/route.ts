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

  // ✅ FIX 1: Check if user already has a review for this tool
  const { data: existingReview, error: checkError } = await supabase
    .from("reviews")
    .select("id, status")
    .eq("tool_id", tool_id)
    .eq("user_id", user.id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" error, which is expected if no review exists
    console.error("Error checking existing review:", checkError);
    return NextResponse.json({ error: "Failed to check existing review" }, { status: 500 });
  }

  // ✅ FIX 2: If review exists, update it if pending, otherwise return error
  if (existingReview) {
    if (existingReview.status === "pending") {
      // Update existing pending review
      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          title,
          comment,
          pros,
          cons,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ review: data, message: "Review updated successfully" }, { status: 200 });
    } else {
      // Review already exists and is approved/rejected
      return NextResponse.json(
        { error: "You have already submitted a review for this tool. You can only submit one review per tool." },
        { status: 409 } // 409 Conflict
      );
    }
  }

  // Insert new review if none exists
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
    // ✅ FIX 4: Better error handling for duplicate key constraint
    if (error.code === "23505" || error.message.includes("duplicate key") || error.message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "You have already submitted a review for this tool. You can only submit one review per tool." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}

