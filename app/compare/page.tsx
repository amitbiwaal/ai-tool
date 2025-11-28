"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Star, 
  ArrowLeft, 
  Plus, 
  Search, 
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Zap,
  Shield,
  ChevronDown,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Rating } from "@/components/rating";
import { Tool } from "@/lib/types";
import { getPricingBadgeColor, cn } from "@/lib/utils";

// Mock data removed - using database instead
const _mockTools_removed = [
  {
    id: "1",
    name: "ChatGPT",
    slug: "chatgpt",
    tagline: "Advanced AI chatbot for conversations and assistance",
    description: "ChatGPT is an advanced language model developed by OpenAI that can understand and generate human-like text, making it perfect for conversations, content creation, and problem-solving.",
    logo_url: "https://logo.clearbit.com/openai.com",
    website_url: "https://chat.openai.com",
    pricing_type: "freemium",
    rating_avg: 4.8,
    rating_count: 1250,
    features: [
      "Natural language understanding",
      "Multi-turn conversations",
      "Code generation and debugging",
      "Content creation and editing",
      "Multiple language support"
    ],
    pros: [
      "Highly accurate responses",
      "Fast response time",
      "Versatile use cases",
      "Regular updates and improvements"
    ],
    cons: [
      "Requires subscription for advanced features",
      "Can sometimes generate incorrect information",
      "Limited by training data cutoff"
    ],
    categories: [
      { id: "1", name: "Writing", slug: "writing", icon: "✍️" },
      { id: "2", name: "Productivity", slug: "productivity", icon: "⚡" }
    ]
  },
  {
    id: "2",
    name: "Claude AI",
    slug: "claude-ai",
    tagline: "Constitutional AI for helpful, honest conversations",
    description: "Claude is an AI assistant created by Anthropic with a focus on being helpful, harmless, and honest. It excels at analysis, writing, coding, and creative tasks.",
    logo_url: "https://logo.clearbit.com/anthropic.com",
    website_url: "https://claude.ai",
    pricing_type: "freemium",
    rating_avg: 4.7,
    rating_count: 890,
    features: [
      "Long-form content analysis",
      "Advanced reasoning capabilities",
      "Document understanding",
      "Ethical AI responses",
      "Creative writing assistance"
    ],
    pros: [
      "Excellent at nuanced tasks",
      "Strong ethical guidelines",
      "Great for document analysis",
      "Transparent about limitations"
    ],
    cons: [
      "Slower response times occasionally",
      "Limited availability in some regions",
      "Fewer integrations compared to competitors"
    ],
    categories: [
      { id: "1", name: "Writing", slug: "writing", icon: "✍️" },
      { id: "3", name: "Research", slug: "research", icon: "🔬" }
    ]
  }
];

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tool1Slug = searchParams.get("tool1");
  const tool2Slug = searchParams.get("tool2");

  const [tools, setTools] = useState<Tool[]>([]);
  const [popularComparisons, setPopularComparisons] = useState<Array<{tool1: Tool, tool2: Tool}>>([]);
  const [loading, setLoading] = useState(true);
  
  // Tool selection states
  const [allToolsList, setAllToolsList] = useState<Tool[]>([]);
  const [selectedTool1, setSelectedTool1] = useState<Tool | null>(null);
  const [selectedTool2, setSelectedTool2] = useState<Tool | null>(null);
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const dropdownRef1 = useRef<HTMLDivElement>(null);
  const dropdownRef2 = useRef<HTMLDivElement>(null);

  // Fetch all tools for dropdowns
  useEffect(() => {
    const fetchAllToolsForDropdown = async () => {
      try {
        const response = await fetch("/api/tools?limit=1000");
        if (response.ok) {
          const data = await response.json();
          setAllToolsList(data.tools || []);
        }
      } catch (error) {
        console.error("Error fetching tools for dropdown:", error);
      }
    };
    fetchAllToolsForDropdown();
  }, []);

  // Initialize selected tools from URL params
  useEffect(() => {
    if (tool1Slug && allToolsList.length > 0) {
      const tool1 = allToolsList.find(t => t.slug === tool1Slug);
      if (tool1) {
        setSelectedTool1(tool1);
        setSearchQuery1(tool1.name);
      }
    }
    if (tool2Slug && allToolsList.length > 0) {
      const tool2 = allToolsList.find(t => t.slug === tool2Slug);
      if (tool2) {
        setSelectedTool2(tool2);
        setSearchQuery2(tool2.name);
      }
    }
  }, [tool1Slug, tool2Slug, allToolsList]);

  useEffect(() => {
    if (tool1Slug && tool2Slug) {
      fetchTools();
    } else {
      // If no specific tools selected, fetch all tools
      fetchAllTools();
    }
    // Fetch popular comparisons
    fetchPopularComparisons();
  }, [tool1Slug, tool2Slug]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef1.current && !dropdownRef1.current.contains(event.target as Node)) {
        setIsOpen1(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(event.target as Node)) {
        setIsOpen2(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPopularComparisons = async () => {
    try {
      // Fetch popular/trending tools to create comparison pairs
      const response = await fetch("/api/tools?limit=10&sort=popular");
      if (response.ok) {
        const data = await response.json();
        const popularTools = data.tools || [];
        
        // Create comparison pairs from popular tools
        const comparisons: Array<{tool1: Tool, tool2: Tool}> = [];
        for (let i = 0; i < popularTools.length - 1; i += 2) {
          if (popularTools[i] && popularTools[i + 1]) {
            comparisons.push({
              tool1: popularTools[i],
              tool2: popularTools[i + 1]
            });
          }
        }
        // Limit to 4 comparisons
        setPopularComparisons(comparisons.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching popular comparisons:", error);
      setPopularComparisons([]);
    }
  };

  const fetchAllTools = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tools?limit=50&sort=popular");
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
      } else {
        setTools([]);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTools = async () => {
    if (!tool1Slug || !tool2Slug) return;
    
    setLoading(true);
    try {
      const [tool1Res, tool2Res] = await Promise.all([
        fetch(`/api/tools/${tool1Slug}`),
        fetch(`/api/tools/${tool2Slug}`),
      ]);

      const tool1Data = await tool1Res.json();
      const tool2Data = await tool2Res.json();

      setTools([tool1Data.tool, tool2Data.tool].filter(Boolean));
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tool selection
  const handleToolSelect = (tool: Tool, position: 1 | 2) => {
    if (position === 1) {
      setSelectedTool1(tool);
      setSearchQuery1(tool.name);
      setIsOpen1(false);
      const params = new URLSearchParams();
      params.set('tool1', tool.slug);
      if (selectedTool2) {
        params.set('tool2', selectedTool2.slug);
      }
      router.push(`/compare?${params.toString()}`);
    } else {
      setSelectedTool2(tool);
      setSearchQuery2(tool.name);
      setIsOpen2(false);
      const params = new URLSearchParams();
      if (selectedTool1) {
        params.set('tool1', selectedTool1.slug);
      }
      params.set('tool2', tool.slug);
      router.push(`/compare?${params.toString()}`);
    }
  };

  // Filter tools based on search query
  const filteredTools1 = allToolsList.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery1.toLowerCase()) &&
    tool.slug !== selectedTool2?.slug
  ).slice(0, 10);

  const filteredTools2 = allToolsList.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery2.toLowerCase()) &&
    tool.slug !== selectedTool1?.slug
  ).slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (!tools || tools.length < 2) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Compare AI Tools
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Make informed decisions by comparing features, pricing, and ratings side-by-side
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
          <Card className="border-2 border-dashed">
            <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4 sm:px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Select Tools to Compare</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
                Choose two AI tools from our directory to see a detailed side-by-side comparison
              </p>
              
              {/* Tool Selection Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-6 sm:mb-8">
                {/* First Tool Selector */}
                <div className="relative" ref={dropdownRef1}>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Select First Tool
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search and select first tool..."
                      value={searchQuery1}
                      onChange={(e) => {
                        setSearchQuery1(e.target.value);
                        setIsOpen1(true);
                      }}
                      onFocus={() => setIsOpen1(true)}
                      className="w-full pr-10"
                    />
                    {selectedTool1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTool1(null);
                          setSearchQuery1("");
                          const params = new URLSearchParams();
                          if (selectedTool2) {
                            params.set('tool2', selectedTool2.slug);
                          }
                          const queryString = params.toString();
                          router.push(`/compare${queryString ? `?${queryString}` : ''}`);
                        }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {isOpen1 && filteredTools1.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTools1.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool, 1)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                            {tool.logo_url ? (
                              <Image
                                src={tool.logo_url}
                                alt={tool.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                {tool.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{tool.name}</p>
                            {tool.tagline && (
                              <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Second Tool Selector */}
                <div className="relative" ref={dropdownRef2}>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Select Second Tool
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search and select second tool..."
                      value={searchQuery2}
                      onChange={(e) => {
                        setSearchQuery2(e.target.value);
                        setIsOpen2(true);
                      }}
                      onFocus={() => setIsOpen2(true)}
                      className="w-full pr-10"
                    />
                    {selectedTool2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTool2(null);
                          setSearchQuery2("");
                          const params = new URLSearchParams();
                          if (selectedTool1) {
                            params.set('tool1', selectedTool1.slug);
                          }
                          const queryString = params.toString();
                          router.push(`/compare${queryString ? `?${queryString}` : ''}`);
                        }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {isOpen2 && filteredTools2.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTools2.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool, 2)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                            {tool.logo_url ? (
                              <Image
                                src={tool.logo_url}
                                alt={tool.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                {tool.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{tool.name}</p>
                            {tool.tagline && (
                              <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link href="/tools">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    Browse All Tools
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Package className="w-4 h-4" />
                    Browse Categories
                  </Button>
                </Link>
              </div>

              {/* Popular Comparisons */}
              {popularComparisons.length > 0 && (
                <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Popular Comparisons
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                    {popularComparisons.map((comparison, index) => {
                      const categoryName = comparison.tool1.categories?.[0]?.name || comparison.tool2.categories?.[0]?.name || "AI Tools";
                      return (
                        <Link key={index} href={`/compare?tool1=${comparison.tool1.slug}&tool2=${comparison.tool2.slug}`}>
                          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="font-semibold text-sm">{comparison.tool1.name}</span>
                                <span className="text-muted-foreground">vs</span>
                                <span className="font-semibold text-sm">{comparison.tool2.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{categoryName}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ComparisonRow = ({
    label,
    icon,
    values,
  }: {
    label: string;
    icon?: React.ReactNode;
    values: (string | number | React.ReactNode)[];
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6 px-4 sm:px-6 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="font-semibold flex items-center gap-2 text-sm sm:text-base">
        {icon}
        {label}
      </div>
      {values.map((value, index) => (
        <div key={index} className="text-foreground text-sm sm:text-base">
          {value || <span className="text-muted-foreground italic">N/A</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header with Back Button */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Link href="/tools" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to Tools
            </Button>
          </Link>
          <Link href="/tools" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Compare Different Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-4">
              Tool Comparison
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Side-by-side comparison to help you make the right choice
            </p>
          </div>

          {/* Tool Headers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {tools.map((tool, index) => (
              <Card key={tool.id} className="border-2 hover:shadow-xl transition-all">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="text-center">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mx-auto mb-3 sm:mb-4 ring-4 ring-primary/10">
                      {tool.logo_url ? (
                        <Image
                          src={tool.logo_url}
                          alt={tool.name}
                          fill
                          className="object-cover p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary">
                          {tool.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <Link href={`/tools/${tool.slug}`}>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 hover:text-primary transition-colors break-words">
                        {tool.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 break-words">
                      {tool.tagline}
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-sm sm:text-base">{tool.rating_avg}</span>
                      </div>
                      <div className="h-3 sm:h-4 w-px bg-border" />
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{tool.rating_count} reviews</span>
                      </div>
                    </div>

                    <Badge className={cn("mb-4 text-xs", getPricingBadgeColor(tool.pricing_type))}>
                      {tool.pricing_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">

        {/* Overview Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="bg-muted/30 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ComparisonRow
              label="Description"
              icon={<Package className="w-4 h-4 text-muted-foreground" />}
              values={tools.map((tool) => (
                <p className="text-sm leading-relaxed">{tool.description}</p>
              ))}
            />
            
            <ComparisonRow
              label="Pricing"
              icon={<DollarSign className="w-4 h-4 text-muted-foreground" />}
              values={tools.map((tool) => (
                <Badge className={getPricingBadgeColor(tool.pricing_type)}>
                  {tool.pricing_type}
                </Badge>
              ))}
            />

            <ComparisonRow
              label="Categories"
              icon={<Package className="w-4 h-4 text-muted-foreground" />}
              values={tools.map((tool) => (
                <div className="flex flex-wrap gap-2">
                  {tool.categories?.slice(0, 3).map((cat) => (
                    <Badge key={cat.id} variant="outline" className="text-xs">
                      {cat.icon} {cat.name}
                    </Badge>
                  ))}
                </div>
              ))}
            />
          </CardContent>
        </Card>

        {/* Key Features Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="bg-muted/30 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="font-semibold text-muted-foreground text-sm sm:text-base">Features</div>
              {tools.map((tool) => (
                <div key={tool.id} className="pr-0 sm:pr-4">
                  {tool.features && tool.features.length > 0 ? (
                    <ul className="space-y-2 sm:space-y-3">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground italic text-xs sm:text-sm">N/A</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pros & Cons Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="bg-muted/30 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Pros & Cons
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 sm:p-6 border-b">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Pros
                </div>
                {tools.map((tool) => (
                  <div key={tool.id} className="pr-0 sm:pr-4">
                    {tool.pros && tool.pros.length > 0 ? (
                      <ul className="space-y-2 sm:space-y-3">
                        {tool.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground italic text-xs sm:text-sm">N/A</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm sm:text-base">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cons
                </div>
                {tools.map((tool) => (
                  <div key={tool.id} className="pr-0 sm:pr-4">
                    {tool.cons && tool.cons.length > 0 ? (
                      <ul className="space-y-2 sm:space-y-3">
                        {tool.cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground italic text-xs sm:text-sm">N/A</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="font-semibold flex items-center text-sm sm:text-base">Ready to start?</div>
              {tools.map((tool) => (
                <div key={tool.id} className="flex flex-col gap-2 sm:gap-3">
                  {tool.website_url && (
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full gap-2 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
                        Visit {tool.name}
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </a>
                  )}
                  <Link href={`/tools/${tool.slug}`} className="w-full">
                    <Button variant="outline" className="w-full text-sm sm:text-base">
                      View Full Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

