import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Providers } from "@/components/providers";
import { GoogleAnalytics } from "@/components/google-analytics";
import { DynamicFavicon } from "@/components/dynamic-favicon";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Tools Directory - Discover the Best AI Tools",
  description:
    "Discover, compare, and find the best AI tools for your needs. Curated collection of cutting-edge artificial intelligence solutions.",
  keywords: ["AI tools", "artificial intelligence", "AI directory", "AI software"],
  authors: [{ name: "AI Tools Directory" }],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mostpopularaitools.com",
    siteName: "AI Tools Directory",
    title: "AI Tools Directory - Discover the Best AI Tools",
    description:
      "Discover, compare, and find the best AI tools for your needs. Curated collection of cutting-edge artificial intelligence solutions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Directory - Discover the Best AI Tools",
    description:
      "Discover, compare, and find the best AI tools for your needs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DynamicFavicon />
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        <GoogleAnalytics />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

