"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin, Mail } from "lucide-react";

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
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API", href: "/api" },
    { name: "Support", href: "/support" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ],
  community: [
    { name: "Discord", href: "#" },
    { name: "Twitter", href: "#" },
    { name: "GitHub", href: "#" },
    { name: "Newsletter", href: "#" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "GitHub", href: "#", icon: Github },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "Email", href: "#", icon: Mail },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2024);

  useEffect(() => {
    // Set year on client side to avoid hydration mismatch
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative overflow-hidden bg-slate-900 dark:bg-[#0a0f1e] border-t border-slate-800/50 dark:border-slate-800/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.1),_transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 lg:space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">
                AI Tools Directory
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              Discover the best AI tools to supercharge your productivity. Our curated collection features cutting-edge artificial intelligence solutions for every need.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
              <div>
                <div className="font-bold text-white text-sm sm:text-base">1000+</div>
                <div className="text-slate-400">AI Tools</div>
              </div>
              <div>
                <div className="font-bold text-white text-sm sm:text-base">50K+</div>
                <div className="text-slate-400">Users</div>
              </div>
              <div>
                <div className="font-bold text-white text-sm sm:text-base">25+</div>
                <div className="text-slate-400">Categories</div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group p-2 sm:p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 sm:hover:scale-110"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Product</h3>
              <ul role="list" className="space-y-2 sm:space-y-3">
                {footerLinks.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Company</h3>
              <ul role="list" className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Resources</h3>
              <ul role="list" className="space-y-2 sm:space-y-3">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Community</h3>
              <ul role="list" className="space-y-2 sm:space-y-3">
                {footerLinks.community.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 lg:mt-16 pt-4 sm:pt-6 lg:pt-8 border-t border-slate-800/50">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-400 px-4">
              &copy; {currentYear} AI Tools Directory. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

