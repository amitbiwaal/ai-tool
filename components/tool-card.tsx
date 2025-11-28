"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ExternalLink, TrendingUp, Bookmark, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/rating";
import { Tool } from "@/lib/types";
import { getPricingBadgeColor, truncate } from "@/lib/utils";
import { getToolLogoUrl, isDicebearUrl, isSvgUrl } from "@/lib/utils/images";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { useState } from "react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(tool.id);
  const [bookmarked, setBookmarked] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFavorite(tool.id);
    } else {
      addFavorite(tool.id);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarked(!bookmarked);
  };

  return (
    <Link href={`/tools/${tool.slug}`} className="block h-full">
      <Card className="h-full relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 hover:scale-[1.02] group border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/10 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-800/90">
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 dark:from-blue-500/0 dark:to-purple-500/0 group-hover:from-blue-500/8 group-hover:to-purple-500/8 dark:group-hover:from-blue-500/12 dark:group-hover:to-purple-500/12 transition-all duration-300"></div>
        
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] opacity-20"></div>
        
        <CardContent className="p-4 sm:p-6 relative z-10">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 shadow-lg ring-2 ring-white/50 dark:ring-white/10 group-hover:ring-blue-400/30 dark:group-hover:ring-blue-500/30 transition-all duration-300 group-hover:scale-110">
              <Image
                src={getToolLogoUrl(tool.logo_url, tool.name)}
                alt={tool.name}
                fill
                className="object-cover"
                unoptimized={isDicebearUrl(tool.logo_url) || isSvgUrl(tool.logo_url)}
                onError={(e) => {
                  // Fallback to first letter if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-letter')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-letter w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white';
                    fallback.textContent = tool.name.charAt(0).toUpperCase();
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              {tool.is_featured && (
                <Badge className="gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white border-0 font-bold text-xs shadow-lg rounded-full flex items-center whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5 fill-white" />
                  <span>Featured</span>
                </Badge>
              )}
              {tool.is_trending && (
                <Badge variant="secondary" className="gap-1 px-2 py-1 bg-transparent border-0 text-green-700 dark:text-green-400 font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleFavoriteClick}
                  className="focus:outline-none p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-200 ${
                      favorite
                        ? "fill-blue-500 text-blue-500 scale-110"
                        : "text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:scale-110"
                    }`}
                  />
                </button>
                <button
                  onClick={handleBookmarkClick}
                  className="focus:outline-none p-1.5 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <Bookmark
                    className={`h-5 w-5 transition-all duration-200 ${
                      bookmarked
                        ? "fill-purple-500 text-purple-500 scale-110"
                        : "text-slate-400 dark:text-slate-500 hover:text-purple-500 hover:scale-110"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-base sm:text-lg mb-2 text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-300">
            {tool.name}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 line-clamp-2">
            {tool.tagline || tool.description}
          </p>

          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Rating rating={tool.rating_avg} size="sm" />
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({tool.rating_count} reviews)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {tool.categories?.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="outline" className="text-xs border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 font-medium">
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 pt-0 flex items-center justify-between relative z-10">
          <Badge className={`${getPricingBadgeColor(tool.pricing_type)} font-semibold shadow-sm text-xs`}>
            {tool.pricing_type}
          </Badge>
          <Button size="sm" variant="ghost" className="gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group/btn text-xs sm:text-sm">
            <span className="font-semibold">Visit</span>
            <ExternalLink className="h-3 w-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

