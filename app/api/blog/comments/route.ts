import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection not available" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const blog_id = searchParams.get("blog_id");

    if (!blog_id) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    // Fetch main comments (without parent_id) - without relationship syntax
    const { data: comments, error: commentsError } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("blog_id", blog_id)
      .eq("status", "approved")
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("Error fetching comments:", {
        message: commentsError.message,
        code: commentsError.code,
        details: commentsError.details,
        hint: commentsError.hint,
      });
      return NextResponse.json(
        { error: commentsError.message || "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Fetch replies for each comment
    let commentsWithReplies: any[] = [];
    
    if (comments && comments.length > 0) {
      // Get all unique user_ids from comments
      const userIds = Array.from(new Set(comments.map((c: any) => c.user_id).filter(Boolean)));
      
      // Fetch user profiles separately
      let usersMap = new Map();
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
        } else if (users) {
          users.forEach((user: any) => {
            usersMap.set(user.id, user);
          });
        }
      }

      // Attach user data to comments
      commentsWithReplies = comments.map((comment: any) => ({
        ...comment,
        user: comment.user_id ? usersMap.get(comment.user_id) || null : null,
      }));

      // Fetch replies if there are comments
      const commentIds = comments.map((c: any) => c.id);
      
      if (commentIds.length > 0) {
        const { data: replies, error: repliesError } = await supabase
          .from("blog_comments")
          .select("*")
          .in("parent_id", commentIds)
          .eq("status", "approved")
          .order("created_at", { ascending: true });

        if (repliesError) {
          console.error("Error fetching replies:", {
            message: repliesError.message,
            code: repliesError.code,
            details: repliesError.details,
          });
        } else if (replies && replies.length > 0) {
          // Get user IDs from replies
          const replyUserIds = Array.from(new Set(replies.map((r: any) => r.user_id).filter(Boolean)));
          
          // Fetch reply users if not already fetched
          const newUserIds = replyUserIds.filter((id: string) => !userIds.includes(id));
          if (newUserIds.length > 0) {
            const { data: replyUsers } = await supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url")
              .in("id", newUserIds);

            if (replyUsers) {
              replyUsers.forEach((user: any) => {
                usersMap.set(user.id, user);
              });
            }
          }

          // Attach user data to replies and group by parent
          const repliesWithUsers = replies.map((reply: any) => ({
            ...reply,
            user: reply.user_id ? usersMap.get(reply.user_id) || null : null,
          }));

          // Attach replies to their parent comments
          commentsWithReplies = commentsWithReplies.map((comment: any) => ({
            ...comment,
            replies: repliesWithUsers.filter((r: any) => r.parent_id === comment.id) || [],
          }));
        }
      }
    }

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error: any) {
    console.error("Error fetching comments:", {
      error,
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "Unauthorized. Please login to post a comment." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { blog_id, content, parent_id } = body;

    if (!blog_id || !content || !content.trim()) {
      return NextResponse.json({ error: "Blog ID and content are required" }, { status: 400 });
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          role: "user",
        });

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError);
        // Continue anyway, might be duplicate key error
      }
    }

    // Verify blog post exists
    const { data: blogPost, error: blogError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("id", blog_id)
      .single();

    if (blogError || !blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // If parent_id is provided, verify it exists and belongs to the same blog
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from("blog_comments")
        .select("id, blog_id")
        .eq("id", parent_id)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }

      if (parentComment.blog_id !== blog_id) {
        return NextResponse.json({ error: "Parent comment does not belong to this blog post" }, { status: 400 });
      }
    }

    // Insert comment
    const { data: insertedComment, error } = await supabase
      .from("blog_comments")
      .insert({
        blog_id: blog_id,
        user_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
        status: "pending", // Will be approved by admin
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error posting comment:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // More specific error messages
      if (error.code === "42501" || error.message?.includes("permission") || error.message?.includes("policy")) {
        return NextResponse.json(
          { error: "You don't have permission to post comments. Please contact support." },
          { status: 403 }
        );
      } else if (error.code === "23503" || error.message?.includes("foreign key")) {
        return NextResponse.json(
          { error: "Invalid blog post or user. Please refresh the page and try again." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: error.message || "Failed to post comment. Please try again." },
          { status: 500 }
        );
      }
    }

    // Fetch user profile separately
    let userData = null;
    if (insertedComment?.user_id) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", insertedComment.user_id)
        .single();
      
      userData = userProfile;
    }

    const data = {
      ...insertedComment,
      user: userData,
    };

    return NextResponse.json({
      comment: data,
      message: "Comment submitted! It will be visible after approval.",
    });
  } catch (error: any) {
    console.error("Error posting comment:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
