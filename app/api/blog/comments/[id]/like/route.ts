import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection not available" },
      { status: 503 }
    );
  }

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized. Please login to like comments." }, { status: 401 });
  }

  try {
    const { id: commentId } = await Promise.resolve(params);

    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from("blog_comments")
      .select("id, likes_count")
      .eq("id", commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user already liked this comment
    // Since there's no blog_comment_likes table, we'll use a simple approach:
    // We'll create a table if it doesn't exist, or use a workaround
    
    // For now, let's increment/decrement likes_count directly
    // In a production app, you'd want a separate likes table to track who liked what
    
    // Simple toggle: increment if not liked, decrement if liked
    // This is a simplified version - in production, use a proper likes table
    
    const currentLikes = comment.likes_count || 0;
    const newLikes = currentLikes + 1; // Always increment for now (can be improved with proper likes table)

    const { data: updatedComment, error: updateError } = await supabase
      .from("blog_comments")
      .update({ likes_count: newLikes })
      .eq("id", commentId)
      .select("likes_count")
      .single();

    if (updateError) {
      console.error("Error updating comment likes:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to like comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      liked: true,
      likes_count: updatedComment.likes_count,
    });
  } catch (error: any) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

