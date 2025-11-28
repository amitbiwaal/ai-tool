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

