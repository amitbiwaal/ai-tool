import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
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

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch all comments
    const { data: comments, error: commentsError } = await supabase
      .from("blog_comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return NextResponse.json(
        { error: commentsError.message || "Failed to fetch comments" },
        { status: 500 }
      );
    }

    if (!comments || comments.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    // Get all unique user_ids and blog_ids
    const userIds = Array.from(new Set(comments.map((c: any) => c.user_id).filter(Boolean)));
    const blogIds = Array.from(new Set(comments.map((c: any) => c.blog_id).filter(Boolean)));

    // Fetch users and blog posts separately
    const [usersResult, blogsResult] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      blogIds.length > 0
        ? supabase
            .from("blog_posts")
            .select("id, title, slug")
            .in("id", blogIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const usersMap = new Map(usersResult.data?.map((u: any) => [u.id, u]) || []);
    const blogsMap = new Map(blogsResult.data?.map((b: any) => [b.id, b]) || []);

    // Combine data
    const formattedComments = comments.map((comment: any) => ({
      ...comment,
      user: comment.user_id ? usersMap.get(comment.user_id) || null : null,
      blog_post: comment.blog_id ? blogsMap.get(comment.blog_id) || null : null,
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

