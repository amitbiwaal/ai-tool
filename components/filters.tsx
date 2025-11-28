"use client";

import { useState } from "react";
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Grid3x3, 
  DollarSign, 
  Star, 
  Tag as TagIcon,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Category, Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FiltersProps {
  categories: Category[];
  tags: Tag[];
  selectedCategories: string[];
  selectedTags: string[];
  selectedPricing: string[];
  minRating: number;
  onCategoryChange: (categories: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onPricingChange: (pricing: string[]) => void;
  onRatingChange: (rating: number) => void;
  onClearFilters: () => void;
}

export function Filters({
  categories,
  tags,
  selectedCategories,
  selectedTags,
  selectedPricing,
  minRating,
  onCategoryChange,
  onTagChange,
  onPricingChange,
  onRatingChange,
  onClearFilters,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    pricing: true,
    rating: true,
    tags: true,
  });

  const pricingOptions = [
    { value: "free", label: "Free", icon: "🆓", color: "text-green-600" },
    { value: "freemium", label: "Freemium", icon: "💎", color: "text-blue-600" },
    { value: "paid", label: "Paid", icon: "💳", color: "text-purple-600" },
    { value: "subscription", label: "Subscription", icon: "🔄", color: "text-blue-600" },
  ];

  const ratingOptions = [
    { value: 4, label: "4+ Stars", icon: "⭐⭐⭐⭐" },
    { value: 3, label: "3+ Stars", icon: "⭐⭐⭐" },
    { value: 2, label: "2+ Stars", icon: "⭐⭐" },
    { value: 1, label: "1+ Stars", icon: "⭐" },
  ];

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagChange([...selectedTags, tagId]);
    }
  };

  const togglePricing = (pricing: string) => {
    if (selectedPricing.includes(pricing)) {
      onPricingChange(selectedPricing.filter((p) => p !== pricing));
    } else {
      onPricingChange([...selectedPricing, pricing]);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    selectedPricing.length > 0 ||
    minRating > 0;

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full gap-2 justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {selectedCategories.length +
                  selectedTags.length +
                  selectedPricing.length +
                  (minRating > 0 ? 1 : 0)}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className={cn("space-y-3 sm:space-y-4", !isOpen && "hidden lg:block")}>
        {/* Categories Section */}
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
          <button
            onClick={() => toggleSection("categories")}
            className="flex w-full items-center justify-between mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Grid3x3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Label className="text-sm sm:text-base font-semibold cursor-pointer group-hover:text-primary transition-colors">
                Categories
              </Label>
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                  {selectedCategories.length}
                </Badge>
              )}
            </div>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections.categories && (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {categories.slice(0, 10).map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent group",
                      isSelected && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(category.id)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-medium truncate">{category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted">
                      {category.tools_count}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
          <button
            onClick={() => toggleSection("pricing")}
            className="flex w-full items-center justify-between mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Label className="text-sm sm:text-base font-semibold cursor-pointer group-hover:text-primary transition-colors">
                Pricing
              </Label>
              {selectedPricing.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                  {selectedPricing.length}
                </Badge>
              )}
            </div>
            {expandedSections.pricing ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections.pricing && (
            <div className="space-y-2">
              {pricingOptions.map((option) => {
                const isSelected = selectedPricing.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent group",
                      isSelected && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePricing(option.value)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium flex-1">{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
          <button
            onClick={() => toggleSection("rating")}
            className="flex w-full items-center justify-between mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Label className="text-sm sm:text-base font-semibold cursor-pointer group-hover:text-primary transition-colors">
                Minimum Rating
              </Label>
              {minRating > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {minRating}+
                </Badge>
              )}
            </div>
            {expandedSections.rating ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections.rating && (
            <div className="space-y-2">
              {ratingOptions.map((option) => {
                const isSelected = minRating === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent group",
                      isSelected && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={isSelected}
                        onChange={() => onRatingChange(option.value)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium flex-1">{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
          <button
            onClick={() => toggleSection("tags")}
            className="flex w-full items-center justify-between mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10">
                <TagIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
              <Label className="text-sm sm:text-base font-semibold cursor-pointer group-hover:text-primary transition-colors">
                Tags
              </Label>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                  {selectedTags.length}
                </Badge>
              )}
            </div>
            {expandedSections.tags ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections.tags && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      isSelected && "shadow-sm"
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all h-9 sm:h-10 text-xs sm:text-sm"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}

