"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Target, 
  Users, 
  Heart, 
  Rocket,
  Shield,
  TrendingUp,
  Award,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Mail,
  MessageCircle,
  Star
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  // Content from database
  const [pageContent, setPageContent] = useState<Record<string, string>>({});

  // Fetch page content from database
  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const response = await fetch("/api/admin/content?page=about");
      const content: Record<string, string> = {};

      if (response.ok) {
        const data = await response.json();
        data.content?.forEach((item: any) => {
          const value = typeof item.value === 'object' ? JSON.stringify(item.value) : item.value;
          content[item.key] = value;
        });
      }

      setPageContent(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
    }
  };

  const stats = [
    { label: pageContent.statsTitle1 || "AI Tools Listed", value: pageContent.statsValue1 || "500+", icon: Rocket },
    { label: pageContent.statsTitle2 || "Active Users", value: pageContent.statsValue2 || "50K+", icon: Users },
    { label: pageContent.statsTitle3 || "Categories", value: pageContent.statsValue3 || "25+", icon: Target },
    { label: pageContent.statsTitle4 || "User Reviews", value: pageContent.statsValue4 || "10K+", icon: Star },
  ];

  const values = [
    {
      icon: Shield,
      title: pageContent.value1Title || "Transparency",
      description: pageContent.value1Description || "We provide honest, unbiased reviews and comparisons to help you make informed decisions.",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Award,
      title: pageContent.value2Title || "Quality",
      description: pageContent.value2Description || "Every tool in our directory is carefully vetted and evaluated by our expert team.",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Heart,
      title: pageContent.value3Title || "Community First",
      description: pageContent.value3Description || "Built by the community, for the community. Your feedback shapes our platform.",
      color: "text-pink-600 dark:text-pink-400"
    },
    {
      icon: Zap,
      title: pageContent.value4Title || "Innovation",
      description: pageContent.value4Description || "We stay ahead of the curve, constantly updating with the latest AI tools and technologies.",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-24 text-center">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs sm:text-sm">
            {pageContent.heroBadge || "About Us"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-4">
            {pageContent.heroTitle || "Empowering Your AI Journey"}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            {pageContent.heroDescription || "We're on a mission to help you discover, compare, and choose the perfect AI tools that transform the way you work, create, and innovate."}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12 px-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border hover:shadow-lg transition-all">
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* World's Best AI Tools Directory Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        {/* Premium gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-[120px] animate-pulse dark:bg-blue-500/15" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/8 rounded-full blur-[100px] animate-pulse delay-700 dark:bg-purple-500/15" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] opacity-40"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left side - Animated Rotating Globe */}
            <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px] animate-spin" style={{ animationDuration: '30s' }}>
                {/* Globe circles - multiple layers for 3D effect */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 dark:border-blue-400/40"></div>
                <div className="absolute inset-[30px] rounded-full border-2 border-blue-500/30 dark:border-blue-400/30"></div>
                <div className="absolute inset-[60px] rounded-full border-2 border-blue-500/25 dark:border-blue-400/25"></div>
                <div className="absolute inset-[90px] rounded-full border-2 border-blue-500/20 dark:border-blue-400/20"></div>
                <div className="absolute inset-[120px] rounded-full border-2 border-blue-500/15 dark:border-blue-400/15"></div>
                
                {/* Latitude lines */}
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 dark:via-blue-400/40 to-transparent"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 dark:via-blue-400/50 to-transparent"></div>
                <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 dark:via-blue-400/40 to-transparent"></div>
                
                {/* Longitude lines */}
                <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gradient-to-b from-transparent via-blue-500/40 dark:via-blue-400/40 to-transparent"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/50 dark:via-blue-400/50 to-transparent"></div>
                <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gradient-to-b from-transparent via-blue-500/40 dark:via-blue-400/40 to-transparent"></div>
                
                {/* Animated connection dots representing global reach */}
                <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50"></div>
                <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-1/3 left-2/3 w-3 h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse shadow-lg shadow-indigo-500/50" style={{ animationDelay: '0.7s' }}></div>
                <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-300 animate-pulse shadow-lg shadow-blue-400/50" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/4 right-1/2 w-2.5 h-2.5 rounded-full bg-purple-400 dark:bg-purple-300 animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-300 animate-pulse shadow-lg shadow-indigo-400/50" style={{ animationDelay: '1.2s' }}></div>
                
                {/* Connection lines between dots */}
                <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                  <line x1="25%" y1="33%" x2="66%" y2="50%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" className="animate-pulse" />
                  <line x1="66%" y1="50%" x2="66%" y2="66%" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <line x1="66%" y1="66%" x2="75%" y2="66%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1s' }} />
                </svg>
                
                {/* AI Tool Icons orbiting around the globe */}
                <div className="absolute inset-[-30px] sm:inset-[-40px] lg:inset-[-50px]">
                  {/* Top icons */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 dark:from-blue-500/20 dark:to-indigo-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-lg sm:text-xl lg:text-2xl">✍️</span>
                  </div>
                  
                  {/* Right side icons */}
                  <div className="absolute top-1/4 right-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">🎨</span>
                  </div>
                  <div className="absolute top-1/2 right-[-15px] sm:right-[-20px] w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '1s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">💻</span>
                  </div>
                  <div className="absolute bottom-1/4 right-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 dark:from-orange-500/20 dark:to-amber-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '1.5s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">🎬</span>
                  </div>
                  
                  {/* Bottom icons */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 dark:from-cyan-500/20 dark:to-blue-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '2s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">🎵</span>
                  </div>
                  
                  {/* Left side icons */}
                  <div className="absolute bottom-1/4 left-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-pink-500/30 dark:from-red-500/20 dark:to-pink-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '2.5s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">📊</span>
                  </div>
                  <div className="absolute top-1/2 left-[-15px] sm:left-[-20px] w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-cyan-500/30 dark:from-teal-500/20 dark:to-cyan-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '3s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">💬</span>
                  </div>
                  <div className="absolute top-1/4 left-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 dark:from-yellow-500/20 dark:to-orange-500/20 backdrop-blur-md border border-white/30 dark:border-white/20 flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '3.5s' }}>
                    <span className="text-lg sm:text-xl lg:text-2xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50">
                <span className="text-xl sm:text-2xl">🌍</span>
                <span className="text-[10px] sm:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 uppercase tracking-wider">
                  {pageContent.directoryBadge || "Global AI Platform"}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                  {pageContent.directoryTitle || "The World's Best AI Tools Directory"}
                </span>
              </h2>
              
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  {pageContent.directoryDescription1 || "Lately, the site also posts articles that explain how each AI works. Found an AI tool that doesn't appear in the list? From now on, it is possible to submit new AIs so that they can be added to the ranking or the top 10."}
                </p>
                <p>
                  {pageContent.directoryDescription2 || "Actually, Aixploria is a kind of directory and search engine dedicated to AI. With its simple and clean style, you can easily search using keywords like on a search engine."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Our Story */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="px-4 sm:px-0">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">{pageContent.storyBadge || "Our Story"}</h2>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                {pageContent.storyTitle || "Born from a passion for AI innovation"}
              </h3>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  {pageContent.storyDescription1 || "In 2025, we recognized a growing challenge: the AI tools landscape was becoming increasingly complex and overwhelming. Professionals, creators, and businesses were struggling to find the right tools for their specific needs."}
                </p>
                <p>
                  {pageContent.storyDescription2 || "We founded AI Tools Directory to bridge this gap. What started as a simple curated list has evolved into a comprehensive platform trusted by thousands of users worldwide."}
                </p>
                <p>
                  {pageContent.storyDescription3 || "Today, we're proud to be the go-to resource for anyone looking to harness the power of AI, offering detailed reviews, comparisons, and a vibrant community of AI enthusiasts."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Link href="/tools" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    {pageContent.exploreToolsButton || "Explore Tools"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/submit" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    {pageContent.submitToolButton || "Submit a Tool"}
                    <Rocket className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative px-4 sm:px-0">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 p-6 sm:p-8 h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-primary mx-auto mb-3 sm:mb-4 opacity-20" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">Connecting you with</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    The Future of AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{pageContent.valuesTitle || "Our Core Values"}</h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              {pageContent.valuesDescription || "The principles that guide everything we do"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color.includes('blue') ? 'from-blue-500/10 to-blue-600/10' : value.color.includes('purple') ? 'from-purple-500/10 to-purple-600/10' : value.color.includes('pink') ? 'from-pink-500/10 to-pink-600/10' : 'from-orange-500/10 to-orange-600/10'} flex items-center justify-center mb-4`}>
                    <value.icon className={`w-7 h-7 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
          <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
            <CardContent className="pt-4 sm:pt-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{pageContent.missionTitle || "Our Mission"}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {pageContent.missionDescription || "To democratize access to AI tools by providing a comprehensive, transparent, and user-friendly platform that empowers individuals and businesses to discover and leverage the best AI solutions for their unique needs."}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{pageContent.missionPoint1 || "Curate the highest quality AI tools"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{pageContent.missionPoint2 || "Provide honest, detailed reviews"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{pageContent.missionPoint3 || "Build a thriving AI community"}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
            <CardContent className="pt-4 sm:pt-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{pageContent.visionTitle || "Our Vision"}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {pageContent.visionDescription || "To become the world's most trusted and comprehensive AI tools platform, where anyone—from beginners to experts—can confidently find, compare, and choose the perfect AI solutions to achieve their goals."}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{pageContent.visionPoint1 || "Global leader in AI tool discovery"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{pageContent.visionPoint2 || "Foster innovation and creativity"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{pageContent.visionPoint3 || "Shape the future of AI adoption"}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 overflow-hidden relative mx-4 sm:mx-0">
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <CardContent className="relative pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4 sm:px-6">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 opacity-90" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{pageContent.ctaTitle || "Join Our Community"}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {pageContent.ctaDescription || "Whether you're discovering AI tools or sharing your own, we'd love to have you as part of our growing community."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/submit">
                <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                  <Rocket className="w-5 h-5" />
                  {pageContent.ctaSubmitButton || "Submit Your Tool"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white">
                  <MessageCircle className="w-5 h-5" />
                  {pageContent.ctaContactButton || "Get in Touch"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

