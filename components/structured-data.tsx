import { Tool } from "@/lib/types";

export function ToolStructuredData({ tool }: { tool: Tool }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: tool.pricing_type === "free" ? "0" : undefined,
      priceCurrency: "USD",
    },
    aggregateRating: tool.rating_count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: tool.rating_avg,
      ratingCount: tool.rating_count,
    } : undefined,
    image: tool.logo_url,
    url: tool.website_url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Tools Directory",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: "Discover, compare, and find the best AI tools for your needs.",
    sameAs: [
      "https://twitter.com/aitoolsdirectory",
      "https://github.com/aitoolsdirectory",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BlogPostStructuredData({ post }: { post: any }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolsdirectory.com";
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.content?.substring(0, 200),
    image: post.cover_image || `${siteUrl}/og-image.png`,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      "@type": "Person",
      name: post.author?.full_name || "AI Tools Directory",
      ...(post.author?.avatar_url && { image: post.author.avatar_url }),
    },
    publisher: {
      "@type": "Organization",
      name: "AI Tools Directory",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    ...(post.category && {
      articleSection: post.category.name,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolsdirectory.com";
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

