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
      title: "Tool Not Found | AI Tools Directory",
      description: "The requested tool could not be found.",
    };
  }

  try {
    const { data: tool } = await supabase
      .from("tools")
      .select("name, description, tagline, logo_url, cover_image_url, rating_avg, rating_count")
      .eq("slug", slug)
      .eq("status", "approved")
      .single();

    if (!tool) {
      return {
        title: "Tool Not Found | AI Tools Directory",
        description: "The requested tool could not be found.",
      };
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "AI Tools Directory";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mostpopularaitools.com";
    const title = `${tool.name} - ${tool.tagline || "AI Tool"}`;
    const description = tool.description || tool.tagline || `Discover ${tool.name}, a powerful AI tool.`;
    const image = tool.cover_image_url || tool.logo_url || `${siteUrl}/og-image.png`;

    return {
      title: `${title} | ${siteName}`,
      description,
      keywords: [tool.name, "AI tool", "artificial intelligence", tool.tagline].filter(Boolean),
      openGraph: {
        title,
        description,
        url: `${siteUrl}/tools/${slug}`,
        siteName,
        images: [{ url: image }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `${siteUrl}/tools/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for tool:", error);
    return {
      title: "Tool | AI Tools Directory",
      description: "Discover AI tools for your needs.",
    };
  }
}

export default function ToolLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params?: Promise<{ slug: string }>;
}) {
  return <>{children}</>;
}

