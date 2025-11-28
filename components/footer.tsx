"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

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
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                AI Tools Directory
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Discover the best AI tools to supercharge your productivity. Our curated collection features cutting-edge artificial intelligence solutions for every need.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <div className="font-bold text-white">1000+</div>
                <div className="text-slate-400">AI Tools</div>
              </div>
              <div>
                <div className="font-bold text-white">50K+</div>
                <div className="text-slate-400">Users</div>
              </div>
              <div>
                <div className="font-bold text-white">25+</div>
                <div className="text-slate-400">Categories</div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul role="list" className="space-y-3">
                {footerLinks.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul role="list" className="space-y-3">
                {footerLinks.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
              <ul role="list" className="space-y-3">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Community</h3>
              <ul role="list" className="space-y-3">
                {footerLinks.community.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
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
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-800/50">
          <div className="flex flex-col items-center justify-center sm:justify-between gap-3 sm:gap-4 sm:flex-row text-center sm:text-left">
            <p className="text-xs sm:text-sm text-slate-400">
              &copy; {currentYear} AI Tools Directory. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1">
              Made with <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-red-500 animate-pulse" /> by AI Enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

