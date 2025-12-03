import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function getPricingBadgeColor(pricingType: string): string {
  const colors: Record<string, string> = {
    free: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    freemium: "bg-blue-100 text-blue-800 dark:bg-white dark:text-blue-900",
    paid: "bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-white",
    subscription: "bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
  };
  return colors[pricingType] || colors.free;
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  type = "website",
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "AI Tools Directory";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mostpopularaitools.com";

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      url: url || siteUrl,
      siteName,
      images: image ? [{ url: image }] : [],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

