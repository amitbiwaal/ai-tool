"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

interface FooterContent {
  siteName?: string;
  description?: string;
  logoUrl?: string;
  logoUrlLight?: string;
  logoUrlDark?: string;
  copyrightText?: string;
}

const footerLinks = {
  product: [
    { name: "All Tools", href: "/tools" },
    { name: "Categories", href: "/categories" },
    { name: "Submit Tool", href: "/submit" },
    { name: "Blog", href: "/blog" },
    { name: "Compare Tools", href: "/compare" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  support: [
    { name: "Help Center", href: "/support" },
    { name: "Contact Us", href: "/contact" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ],
};

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [footerContent, setFooterContent] = useState<FooterContent>({});
  const [footerContentLoaded, setFooterContentLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Safe function to replace year placeholder
  const replaceYearPlaceholder = (text: string, year: number): string => {
    if (!text || typeof text !== 'string') return '';
    try {
      return text.split('{year}').join(year.toString());
    } catch {
      return text;
    }
  };

  useEffect(() => {
    // Set year on client side to avoid hydration mismatch (though we initialize with current year now)
    setCurrentYear(new Date().getFullYear());
    // Fetch footer content
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/public/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.settings && data.settings.site) {
          setFooterContent({
            siteName: data.settings.site.name,
            description: data.settings.site.description,
            logoUrlLight: data.settings.site.logoUrlLight,
            logoUrlDark: data.settings.site.logoUrlDark,
            copyrightText: data.settings.site.copyrightText,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching footer settings:", error);
    } finally {
      setFooterContentLoaded(true);
      setIsLoading(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-black dark:from-[#0a0f1e] dark:via-[#0a0f1e] dark:to-black border-t border-slate-800/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.08),_transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.12),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-2">
            <div className="space-y-0.5">
              <Link href="/" className="inline-flex items-center group">
                {isLoading ? (
                  <div className="flex-shrink-0 h-24 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : footerContentLoaded && (footerContent.logoUrlLight || footerContent.logoUrlDark) ? (
                  <div className="flex-shrink-0">
                    <Image
                      src={theme === 'dark' && footerContent.logoUrlDark ? footerContent.logoUrlDark : (footerContent.logoUrlLight || footerContent.logoUrlDark || '')}
                      alt={footerContent.siteName || "Logo"}
                      width={128}
                      height={96}
                      className="h-24 w-32 object-contain"
                      unoptimized
                    />
                </div>
                ) : (
                  <Sparkles className="h-24 w-32 text-white flex-shrink-0" />
                )}
              </Link>

            <p className="text-base leading-relaxed text-slate-300 max-w-lg">
              {footerContent.description || "Discover the best AI tools to supercharge your productivity. Our curated collection features cutting-edge artificial intelligence solutions for every need."}
            </p>
          </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            {/* Product Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 relative">
                  Product
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block group"
                      >
                        <span className="relative">
                          {item.name}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-200"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Company Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 relative">
                  Company
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block group"
                      >
                        <span className="relative">
                          {item.name}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-200"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Support Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 relative">
                  Support
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block group"
                      >
                        <span className="relative">
                          {item.name}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-200"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-800/50">
          <div className="text-center">
            <p className="text-sm text-slate-400">
              {footerContentLoaded && footerContent.copyrightText
                ? footerContent.copyrightText.split('{year}').join((currentYear || 2024).toString())
                : `© ${currentYear || 2024} ${footerContent.siteName || "AI Tools Directory"}. All rights reserved.`
              }
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

