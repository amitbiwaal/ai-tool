import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      title: "Blog Post | AI Tools Directory",
      description: "Read our latest blog posts about AI tools.",
    };
  }

  try {
    const { data: post } = await supabase
      .from("blog_posts")
      .select("title, excerpt, content, cover_image, seo_title, seo_description, published_at, author_id")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!post) {
      return {
        title: "Blog Post Not Found | AI Tools Directory",
        description: "The requested blog post could not be found.",
      };
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "AI Tools Directory";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolsdirectory.com";
    const title = post.seo_title || post.title;
    const description = post.seo_description || post.excerpt || post.content?.substring(0, 160) || "Read our blog post about AI tools.";
    const image = post.cover_image || `${siteUrl}/og-image.png`;
    const publishedTime = post.published_at ? new Date(post.published_at).toISOString() : undefined;

    // Get author name if available
    let authorName = "AI Tools Directory";
    if (post.author_id) {
      const { data: author } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", post.author_id)
        .single();
      if (author?.full_name) {
        authorName = author.full_name;
      }
    }

    return {
      title: `${title} | ${siteName}`,
      description,
      authors: [{ name: authorName }],
      openGraph: {
        title,
        description,
        url: `${siteUrl}/blog/${slug}`,
        siteName,
        images: [{ url: image }],
        type: "article",
        publishedTime,
        authors: [authorName],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `${siteUrl}/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for blog post:", error);
    return {
      title: "Blog Post | AI Tools Directory",
      description: "Read our latest blog posts about AI tools.",
    };
  }
}

export default function BlogPostLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params?: Promise<{ slug: string }>;
}) {
  return <>{children}</>;
}

