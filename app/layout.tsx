import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Providers } from "@/components/providers";

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aitoolsdirectory.com",
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
      <body className={poppins.className} suppressHydrationWarning>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

