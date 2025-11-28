import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

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
    // First fetch blog posts
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching blog posts:", postsError);
      return NextResponse.json(
        { error: postsError.message },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Fetch author and category details separately
    const authorIds = [...new Set(posts.map((p: any) => p.author_id).filter(Boolean))];
    const categoryIds = [...new Set(posts.map((p: any) => p.category_id).filter(Boolean))];

    const [authorsResult, categoriesResult] = await Promise.all([
      authorIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", authorIds)
        : Promise.resolve({ data: [], error: null }),
      categoryIds.length > 0
        ? supabase
            .from("blog_categories")
            .select("id, name, slug")
            .in("id", categoryIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const authorsMap = new Map(
      (authorsResult.data || []).map((a: any) => [a.id, a])
    );
    const categoriesMap = new Map(
      (categoriesResult.data || []).map((c: any) => [c.id, c])
    );

    // Combine data
    const postsWithDetails = posts.map((post: any) => ({
      ...post,
      author: post.author_id ? authorsMap.get(post.author_id) || null : null,
      category: post.category_id ? categoriesMap.get(post.category_id) || null : null,
    }));

    return NextResponse.json({ posts: postsWithDetails });
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
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
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      cover_image,
      category_id,
      status,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const postSlug = slug || slugify(title);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", postSlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    // Use category_id directly (should be blog category ID)
    // If category name is provided for backward compatibility, look in blog_categories
    let finalCategoryId = category_id;
    if (!finalCategoryId && body.category) {
      const { data: category } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("name", body.category)
        .single();
      
      if (category) {
        finalCategoryId = category.id;
      }
    }

    const postData: any = {
      title,
      slug: postSlug,
      excerpt: excerpt || null,
      content,
      cover_image: cover_image || null,
      author_id: user.id,
      category_id: finalCategoryId || null,
      status: status || "draft",
      views_count: 0,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
    };

    // Set published_at if status is published or scheduled
    if (status === "published") {
      postData.published_at = new Date().toISOString();
    } else if (status === "scheduled" && body.scheduled_at) {
      postData.published_at = body.scheduled_at;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error("Error creating blog post:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Handle tags if provided (store as JSON array for now)
    // Note: If blog_posts table has a tags column, this will work
    // Otherwise, you may need to use blog_tags junction table
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0 && data.id) {
      try {
        // Try to update tags column if it exists
        const { error: tagError } = await supabase
          .from("blog_posts")
          .update({ tags: body.tags })
          .eq("id", data.id);
        
        if (tagError) {
          console.warn("Tags column might not exist, skipping tags save:", tagError.message);
        }
      } catch (tagError) {
        console.error("Error saving tags:", tagError);
        // Don't fail the whole request if tags fail
      }
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
