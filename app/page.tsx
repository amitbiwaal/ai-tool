"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, TrendingUp, Star, Clock, PenTool, Palette, Code2, Video, Music, BarChart3, MessageCircle, Image as ImageIcon, Mic, Search, Smartphone, FlaskConical, DollarSign, BookOpen, TrendingUpIcon, Gamepad2, Users, Heart, Search as SearchIcon, GitCompare as Compare, CheckCircle2, ExternalLink, Eye, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { ToolCard } from "@/components/tool-card";
import { toast } from "sonner";
import { CategoryBadge } from "@/components/category-badge";
import { Tool } from "@/lib/types";
import { HomePageSkeleton } from "@/components/loading-skeleton";

// Mock data removed - using database instead
// Keeping only testimonials mock data
const _mockFeaturedTools_removed = [
  {
    id: "1",
    name: "ChatGPT",
    slug: "chatgpt",
    tagline: "Conversational AI that answers questions",
    description: "Advanced AI language model for conversations and tasks",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=GPT",
    pricing_type: "freemium",
    rating_avg: 4.8,
    rating_count: 1250,
    views_count: 15000,
    is_featured: true,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag1", name: "GPT", slug: "gpt" }],
  },
  {
    id: "2",
    name: "Jasper AI",
    slug: "jasper-ai",
    tagline: "AI content platform for marketing",
    description: "Generate high-quality content at scale",
    logo_url: "https://via.placeholder.com/64x64/ef4444/ffffff?text=JA",
    pricing_type: "subscription",
    rating_avg: 4.5,
    rating_count: 750,
    views_count: 9000,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag4", name: "SEO", slug: "seo" }],
  },
  {
    id: "3",
    name: "Copy.ai",
    slug: "copy-ai",
    tagline: "AI-powered copywriting tool",
    description: "Generate marketing copy in seconds",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=CA",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 890,
    views_count: 11000,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag7", name: "Copywriting", slug: "copywriting" }],
  },
  {
    id: "4",
    name: "Writesonic",
    slug: "writesonic",
    tagline: "AI writer for blogs and ads",
    description: "Create SEO-optimized content with AI",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=WS",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 670,
    views_count: 8500,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag8", name: "Content", slug: "content" }],
  },
  {
    id: "5",
    name: "Rytr",
    slug: "rytr",
    tagline: "AI writing assistant for everyone",
    description: "Write better content faster",
    logo_url: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=RY",
    pricing_type: "free",
    rating_avg: 4.2,
    rating_count: 520,
    views_count: 7200,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag9", name: "Writing", slug: "writing" }],
  },
  {
    id: "6",
    name: "QuillBot",
    slug: "quillbot",
    tagline: "AI-powered paraphrasing tool",
    description: "Rephrase and enhance your writing",
    logo_url: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=QB",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 1450,
    views_count: 16000,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag10", name: "Paraphrase", slug: "paraphrase" }],
  },
  {
    id: "7",
    name: "Grammarly",
    slug: "grammarly",
    tagline: "AI writing assistant for better communication",
    description: "Check grammar, spelling, and writing style",
    logo_url: "https://via.placeholder.com/64x64/14b8a6/ffffff?text=G",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 3200,
    views_count: 28000,
    is_featured: true,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag6", name: "Grammar", slug: "grammar" }],
  },
];

// Mock trending tools removed - using database instead
const _mockTrendingTools_removed = [
  {
    id: "8",
    name: "Notion AI",
    slug: "notion-ai",
    tagline: "AI-powered workspace assistant",
    description: "Write, brainstorm, and organize with AI",
    logo_url: "https://via.placeholder.com/64x64/000000/ffffff?text=NA",
    pricing_type: "subscription",
    rating_avg: 4.7,
    rating_count: 2100,
    views_count: 19000,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag11", name: "Productivity", slug: "productivity" }],
  },
  {
    id: "9",
    name: "Wordtune",
    slug: "wordtune",
    tagline: "AI writing companion",
    description: "Rewrite and rephrase your sentences",
    logo_url: "https://via.placeholder.com/64x64/ec4899/ffffff?text=WT",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 890,
    views_count: 10500,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag12", name: "Rewriting", slug: "rewriting" }],
  },
  {
    id: "10",
    name: "Sudowrite",
    slug: "sudowrite",
    tagline: "AI writing tool for authors",
    description: "Write novels and screenplays with AI",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=SW",
    pricing_type: "subscription",
    rating_avg: 4.5,
    rating_count: 340,
    views_count: 5800,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag13", name: "Creative", slug: "creative" }],
  },
  {
    id: "11",
    name: "Shortly AI",
    slug: "shortly-ai",
    tagline: "AI writing partner",
    description: "Break through writer's block with AI",
    logo_url: "https://via.placeholder.com/64x64/f97316/ffffff?text=SA",
    pricing_type: "trial",
    rating_avg: 4.3,
    rating_count: 280,
    views_count: 4900,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat1", name: "AI Writing", slug: "ai-writing" }],
    tags: [{ id: "tag14", name: "Story", slug: "story" }],
  },
  {
    id: "12",
    name: "Midjourney",
    slug: "midjourney",
    tagline: "AI art generator from text prompts",
    description: "Create stunning images from textual descriptions",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=MJ",
    pricing_type: "subscription",
    rating_avg: 4.7,
    rating_count: 980,
    views_count: 12000,
    is_featured: true,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag2", name: "Image Generation", slug: "image-generation" }],
  },
  {
    id: "13",
    name: "DALL-E 3",
    slug: "dall-e-3",
    tagline: "Advanced AI image generator",
    description: "Create realistic images from text",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=DE",
    pricing_type: "subscription",
    rating_avg: 4.8,
    rating_count: 1560,
    views_count: 18500,
    is_featured: true,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag15", name: "Art", slug: "art" }],
  },
];

// Mock recent tools removed - using database instead
const _mockRecentTools_removed = [
  // AI Coding Tools (10)
  {
    id: "14",
    name: "GitHub Copilot",
    slug: "github-copilot",
    tagline: "AI pair programmer for faster coding",
    description: "Suggests code completions as you type",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=GH",
    pricing_type: "subscription",
    rating_avg: 4.6,
    rating_count: 2100,
    views_count: 18000,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag3", name: "Code Assistant", slug: "code-assistant" }],
  },
  {
    id: "15",
    name: "Tabnine",
    slug: "tabnine",
    tagline: "AI code completion tool",
    description: "Smart code suggestions for all languages",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=TN",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 890,
    views_count: 9500,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag21", name: "Code", slug: "code" }],
  },
  {
    id: "16",
    name: "Codeium",
    slug: "codeium",
    tagline: "Free AI code acceleration",
    description: "Fast AI-powered coding assistant",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=CD",
    pricing_type: "free",
    rating_avg: 4.5,
    rating_count: 650,
    views_count: 8200,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag22", name: "Coding", slug: "coding" }],
  },
  {
    id: "17",
    name: "Replit AI",
    slug: "replit-ai",
    tagline: "AI-powered IDE",
    description: "Code, collaborate, and deploy with AI",
    logo_url: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=RP",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 540,
    views_count: 7100,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag23", name: "IDE", slug: "ide" }],
  },
  {
    id: "18",
    name: "Amazon CodeWhisperer",
    slug: "codewhisperer",
    tagline: "AI coding companion",
    description: "Real-time code suggestions from AWS",
    logo_url: "https://via.placeholder.com/64x64/ec4899/ffffff?text=CW",
    pricing_type: "free",
    rating_avg: 4.4,
    rating_count: 720,
    views_count: 8900,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag24", name: "AWS", slug: "aws" }],
  },
  {
    id: "19",
    name: "Sourcegraph Cody",
    slug: "cody",
    tagline: "AI coding assistant",
    description: "Understand and write code faster",
    logo_url: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=CO",
    pricing_type: "freemium",
    rating_avg: 4.2,
    rating_count: 430,
    views_count: 6300,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag25", name: "Assistant", slug: "assistant" }],
  },
  {
    id: "20",
    name: "Cursor",
    slug: "cursor",
    tagline: "AI-first code editor",
    description: "Write code with AI assistance",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=CU",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 980,
    views_count: 11200,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag26", name: "Editor", slug: "editor" }],
  },
  {
    id: "21",
    name: "CodeT5",
    slug: "codet5",
    tagline: "AI code generation",
    description: "Generate code from natural language",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=T5",
    pricing_type: "free",
    rating_avg: 4.1,
    rating_count: 320,
    views_count: 5400,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag27", name: "Generation", slug: "generation" }],
  },
  {
    id: "22",
    name: "Mintlify",
    slug: "mintlify",
    tagline: "AI documentation writer",
    description: "Generate code documentation automatically",
    logo_url: "https://via.placeholder.com/64x64/14b8a6/ffffff?text=MT",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 450,
    views_count: 6700,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag28", name: "Docs", slug: "docs" }],
  },
  {
    id: "23",
    name: "Phind",
    slug: "phind",
    tagline: "AI search for developers",
    description: "Get instant coding answers",
    logo_url: "https://via.placeholder.com/64x64/f97316/ffffff?text=PH",
    pricing_type: "free",
    rating_avg: 4.4,
    rating_count: 670,
    views_count: 8200,
    status: "approved",
    categories: [{ id: "cat3", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ id: "tag29", name: "Search", slug: "search" }],
  },
  // AI Art Tools (7 more to make 10 total)
  {
    id: "24",
    name: "Canva AI",
    slug: "canva-ai",
    tagline: "Design platform with AI tools",
    description: "Create stunning designs with minimal effort",
    logo_url: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=CA",
    pricing_type: "freemium",
    rating_avg: 4.7,
    rating_count: 1800,
    views_count: 22000,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag5", name: "Design", slug: "design" }],
  },
  {
    id: "25",
    name: "Stable Diffusion",
    slug: "stable-diffusion",
    tagline: "Open-source image generation",
    description: "Generate images from text descriptions",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=SD",
    pricing_type: "free",
    rating_avg: 4.6,
    rating_count: 1320,
    views_count: 15200,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag30", name: "Open Source", slug: "open-source" }],
  },
  {
    id: "26",
    name: "Leonardo AI",
    slug: "leonardo-ai",
    tagline: "AI art generation platform",
    description: "Create production-ready art assets",
    logo_url: "https://via.placeholder.com/64x64/ec4899/ffffff?text=LA",
    pricing_type: "freemium",
    rating_avg: 4.5,
    rating_count: 780,
    views_count: 9800,
    is_trending: true,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag31", name: "Art", slug: "art" }],
  },
  {
    id: "27",
    name: "Playground AI",
    slug: "playground-ai",
    tagline: "Free AI image creator",
    description: "Generate art with AI models",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=PG",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 650,
    views_count: 8400,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag32", name: "Image", slug: "image" }],
  },
  {
    id: "28",
    name: "Runway ML",
    slug: "runway-ml",
    tagline: "AI creative tools",
    description: "Generate videos and images with AI",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=RM",
    pricing_type: "trial",
    rating_avg: 4.7,
    rating_count: 920,
    views_count: 11500,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag33", name: "Creative", slug: "creative" }],
  },
  {
    id: "29",
    name: "Adobe Firefly",
    slug: "adobe-firefly",
    tagline: "Adobe's AI art generator",
    description: "Commercial-safe AI image generation",
    logo_url: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=AF",
    pricing_type: "freemium",
    rating_avg: 4.5,
    rating_count: 1100,
    views_count: 13200,
    is_featured: true,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag34", name: "Adobe", slug: "adobe" }],
  },
  {
    id: "30",
    name: "Artbreeder",
    slug: "artbreeder",
    tagline: "Collaborative AI art",
    description: "Mix images and create variations",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=AB",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 540,
    views_count: 7200,
    status: "approved",
    categories: [{ id: "cat2", name: "AI Art", slug: "ai-art" }],
    tags: [{ id: "tag35", name: "Mixing", slug: "mixing" }],
  },
  // AI Video Tools (9 more to make 10 total)
  {
    id: "31",
    name: "Lumen5",
    slug: "lumen5",
    tagline: "AI video creation platform",
    description: "Turn blog posts into videos",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=L5",
    pricing_type: "trial",
    rating_avg: 4.3,
    rating_count: 540,
    views_count: 7600,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag19", name: "Video", slug: "video" }],
  },
  {
    id: "32",
    name: "Synthesia",
    slug: "synthesia",
    tagline: "AI video generation platform",
    description: "Create AI-powered video presentations",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=SY",
    pricing_type: "subscription",
    rating_avg: 4.5,
    rating_count: 780,
    views_count: 9800,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag36", name: "Presentation", slug: "presentation" }],
  },
  {
    id: "33",
    name: "Pictory",
    slug: "pictory",
    tagline: "AI video creator",
    description: "Transform text into engaging videos",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=PI",
    pricing_type: "trial",
    rating_avg: 4.4,
    rating_count: 620,
    views_count: 8100,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag37", name: "Text-to-Video", slug: "text-to-video" }],
  },
  {
    id: "34",
    name: "Descript",
    slug: "descript",
    tagline: "AI video & podcast editor",
    description: "Edit videos by editing text",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=DE",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 950,
    views_count: 11400,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag38", name: "Editing", slug: "editing" }],
  },
  {
    id: "35",
    name: "HeyGen",
    slug: "heygen",
    tagline: "AI spokesperson videos",
    description: "Create videos with AI avatars",
    logo_url: "https://via.placeholder.com/64x64/ec4899/ffffff?text=HG",
    pricing_type: "freemium",
    rating_avg: 4.5,
    rating_count: 680,
    views_count: 8700,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag39", name: "Avatar", slug: "avatar" }],
  },
  {
    id: "36",
    name: "Fliki",
    slug: "fliki",
    tagline: "Text to video with AI voices",
    description: "Convert text into videos with voiceover",
    logo_url: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=FL",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 520,
    views_count: 7200,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag40", name: "Voiceover", slug: "voiceover" }],
  },
  {
    id: "37",
    name: "Invideo AI",
    slug: "invideo-ai",
    tagline: "AI video creation tool",
    description: "Create videos from prompts",
    logo_url: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=IV",
    pricing_type: "trial",
    rating_avg: 4.4,
    rating_count: 590,
    views_count: 7800,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag41", name: "Creation", slug: "creation" }],
  },
  {
    id: "38",
    name: "Kapwing AI",
    slug: "kapwing-ai",
    tagline: "Online video editor with AI",
    description: "Edit videos collaboratively with AI tools",
    logo_url: "https://via.placeholder.com/64x64/14b8a6/ffffff?text=KW",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 740,
    views_count: 9100,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag42", name: "Online", slug: "online" }],
  },
  {
    id: "39",
    name: "Deepbrain AI",
    slug: "deepbrain-ai",
    tagline: "AI video generator",
    description: "Generate realistic AI human videos",
    logo_url: "https://via.placeholder.com/64x64/f97316/ffffff?text=DB",
    pricing_type: "subscription",
    rating_avg: 4.2,
    rating_count: 410,
    views_count: 6200,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag43", name: "Human", slug: "human" }],
  },
  {
    id: "40",
    name: "Colossyan",
    slug: "colossyan",
    tagline: "AI video creator for workplace",
    description: "Create training videos with AI",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=CL",
    pricing_type: "subscription",
    rating_avg: 4.3,
    rating_count: 380,
    views_count: 5800,
    status: "approved",
    categories: [{ id: "cat4", name: "AI Video", slug: "ai-video" }],
    tags: [{ id: "tag44", name: "Training", slug: "training" }],
  },
  // AI Business Tools (9 more to make 10 total)
  {
    id: "41",
    name: "Otter.ai",
    slug: "otter-ai",
    tagline: "AI meeting note-taker",
    description: "Transcribe and summarize meetings automatically",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=OT",
    pricing_type: "freemium",
    rating_avg: 4.5,
    rating_count: 980,
    views_count: 11200,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag16", name: "Transcription", slug: "transcription" }],
  },
  {
    id: "42",
    name: "Beautiful.ai",
    slug: "beautiful-ai",
    tagline: "AI presentation maker",
    description: "Create stunning presentations effortlessly",
    logo_url: "https://via.placeholder.com/64x64/f97316/ffffff?text=BA",
    pricing_type: "free",
    rating_avg: 4.5,
    rating_count: 780,
    views_count: 9200,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag20", name: "Presentation", slug: "presentation" }],
  },
  {
    id: "43",
    name: "Fireflies.ai",
    slug: "fireflies-ai",
    tagline: "AI meeting assistant",
    description: "Record and transcribe meetings",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=FF",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 870,
    views_count: 10400,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag45", name: "Meeting", slug: "meeting" }],
  },
  {
    id: "44",
    name: "Tome",
    slug: "tome",
    tagline: "AI-powered storytelling",
    description: "Create compelling presentations with AI",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=TO",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 620,
    views_count: 8100,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag46", name: "Story", slug: "story" }],
  },
  {
    id: "45",
    name: "Krisp",
    slug: "krisp",
    tagline: "AI noise cancellation",
    description: "Remove background noise from calls",
    logo_url: "https://via.placeholder.com/64x64/ec4899/ffffff?text=KR",
    pricing_type: "freemium",
    rating_avg: 4.7,
    rating_count: 1120,
    views_count: 12800,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag47", name: "Audio", slug: "audio" }],
  },
  {
    id: "46",
    name: "Salesforce Einstein",
    slug: "salesforce-einstein",
    tagline: "AI for CRM",
    description: "AI-powered customer insights",
    logo_url: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=SE",
    pricing_type: "subscription",
    rating_avg: 4.3,
    rating_count: 540,
    views_count: 7600,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag48", name: "CRM", slug: "crm" }],
  },
  {
    id: "47",
    name: "Zoom AI Companion",
    slug: "zoom-ai",
    tagline: "AI meeting companion",
    description: "Get meeting summaries and insights",
    logo_url: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=ZM",
    pricing_type: "subscription",
    rating_avg: 4.4,
    rating_count: 890,
    views_count: 10600,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag49", name: "Zoom", slug: "zoom" }],
  },
  {
    id: "48",
    name: "Sembly AI",
    slug: "sembly-ai",
    tagline: "AI team assistant",
    description: "Automated meeting notes and insights",
    logo_url: "https://via.placeholder.com/64x64/14b8a6/ffffff?text=SM",
    pricing_type: "freemium",
    rating_avg: 4.2,
    rating_count: 430,
    views_count: 6400,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag50", name: "Team", slug: "team" }],
  },
  {
    id: "49",
    name: "Gamma",
    slug: "gamma",
    tagline: "AI presentation creator",
    description: "Generate beautiful presentations in seconds",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=GM",
    pricing_type: "freemium",
    rating_avg: 4.6,
    rating_count: 750,
    views_count: 9400,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag51", name: "Slides", slug: "slides" }],
  },
  {
    id: "50",
    name: "Humata AI",
    slug: "humata-ai",
    tagline: "AI for documents",
    description: "Chat with your documents",
    logo_url: "https://via.placeholder.com/64x64/f97316/ffffff?text=HU",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 510,
    views_count: 7100,
    status: "approved",
    categories: [{ id: "cat6", name: "AI Business", slug: "ai-business" }],
    tags: [{ id: "tag52", name: "Document", slug: "document" }],
  },
  // AI Music Tools (10)
  {
    id: "51",
    name: "Mubert",
    slug: "mubert",
    tagline: "AI music generation",
    description: "Generate royalty-free music instantly",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=MB",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 580,
    views_count: 7800,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag53", name: "Music", slug: "music" }],
  },
  {
    id: "52",
    name: "AIVA",
    slug: "aiva",
    tagline: "AI music composer",
    description: "Compose emotional soundtrack music",
    logo_url: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=AI",
    pricing_type: "freemium",
    rating_avg: 4.5,
    rating_count: 640,
    views_count: 8400,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag54", name: "Composer", slug: "composer" }],
  },
  {
    id: "53",
    name: "Soundraw",
    slug: "soundraw",
    tagline: "AI music generator",
    description: "Create custom music for your projects",
    logo_url: "https://via.placeholder.com/64x64/10b981/ffffff?text=SR",
    pricing_type: "subscription",
    rating_avg: 4.3,
    rating_count: 490,
    views_count: 6900,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag55", name: "Custom", slug: "custom" }],
  },
  {
    id: "54",
    name: "Boomy",
    slug: "boomy",
    tagline: "Create music with AI",
    description: "Make original songs in seconds",
    logo_url: "https://via.placeholder.com/64x64/ec4899/ffffff?text=BM",
    pricing_type: "free",
    rating_avg: 4.1,
    rating_count: 420,
    views_count: 6200,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag56", name: "Song", slug: "song" }],
  },
  {
    id: "55",
    name: "Beatoven.ai",
    slug: "beatoven-ai",
    tagline: "AI music for videos",
    description: "Generate unique mood-based music",
    logo_url: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=BT",
    pricing_type: "freemium",
    rating_avg: 4.4,
    rating_count: 530,
    views_count: 7400,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag57", name: "Background", slug: "background" }],
  },
  {
    id: "56",
    name: "Loudly",
    slug: "loudly",
    tagline: "AI music platform",
    description: "Create and discover AI-generated music",
    logo_url: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=LD",
    pricing_type: "freemium",
    rating_avg: 4.2,
    rating_count: 380,
    views_count: 5900,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag58", name: "Platform", slug: "platform" }],
  },
  {
    id: "57",
    name: "Splash Pro",
    slug: "splash-pro",
    tagline: "AI music creation",
    description: "Make music with AI-powered tools",
    logo_url: "https://via.placeholder.com/64x64/14b8a6/ffffff?text=SP",
    pricing_type: "subscription",
    rating_avg: 4.0,
    rating_count: 290,
    views_count: 4800,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag59", name: "Creation", slug: "creation" }],
  },
  {
    id: "58",
    name: "Ecrett Music",
    slug: "ecrett-music",
    tagline: "AI royalty-free music",
    description: "Create music for content creators",
    logo_url: "https://via.placeholder.com/64x64/6366f1/ffffff?text=EM",
    pricing_type: "subscription",
    rating_avg: 4.3,
    rating_count: 450,
    views_count: 6600,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag60", name: "Royalty-free", slug: "royalty-free" }],
  },
  {
    id: "59",
    name: "Amper Music",
    slug: "amper-music",
    tagline: "AI music composer",
    description: "Create custom music tracks",
    logo_url: "https://via.placeholder.com/64x64/f97316/ffffff?text=AM",
    pricing_type: "subscription",
    rating_avg: 4.2,
    rating_count: 370,
    views_count: 5500,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag61", name: "Track", slug: "track" }],
  },
  {
    id: "60",
    name: "Soundful",
    slug: "soundful",
    tagline: "AI music generator",
    description: "Generate unlimited tracks",
    logo_url: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=SF",
    pricing_type: "freemium",
    rating_avg: 4.3,
    rating_count: 510,
    views_count: 7000,
    status: "approved",
    categories: [{ id: "cat5", name: "AI Music", slug: "ai-music" }],
    tags: [{ id: "tag62", name: "Unlimited", slug: "unlimited" }],
  },
];

// Mock testimonials data - 12 testimonials for 3 columns x 4 rows
const mockTestimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "This directory has been a game-changer for my content creation workflow. I discovered tools I never knew existed!",
    rating: 5,
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Software Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content: "The best curated list of AI tools I've found. Saved me hours of research and helped me find the perfect tools for my projects.",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content: "Incredible resource! The categorization makes it so easy to find exactly what I need. Highly recommend to any marketer.",
    rating: 5,
  },
  {
    id: "4",
    name: "David Kim",
    role: "Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content: "As a designer, I'm always looking for AI tools to enhance my workflow. This directory is my go-to resource now.",
    rating: 5,
  },
  {
    id: "5",
    name: "Jessica Taylor",
    role: "Business Owner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    content: "Found amazing AI tools that have transformed my business operations. The quality of tools listed here is top-notch!",
    rating: 5,
  },
  {
    id: "6",
    name: "Alex Martinez",
    role: "Data Scientist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content: "Comprehensive collection of AI tools with detailed information. Makes comparing different options so much easier.",
    rating: 5,
  },
  {
    id: "7",
    name: "Rachel Green",
    role: "Freelance Writer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
    content: "This platform has helped me discover tools that doubled my productivity. The AI writing tools section is particularly impressive!",
    rating: 5,
  },
  {
    id: "8",
    name: "James Wilson",
    role: "Product Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    content: "An invaluable resource for anyone working with AI. The regular updates and new tool additions keep it relevant and useful.",
    rating: 5,
  },
  {
    id: "9",
    name: "Lisa Anderson",
    role: "Social Media Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    content: "Love how easy it is to navigate and find tools specific to my needs. The filtering system is brilliant!",
    rating: 5,
  },
  {
    id: "10",
    name: "Tom Brown",
    role: "Entrepreneur",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    content: "Best AI tools directory out there. Helped me find cost-effective solutions for my startup. Absolutely essential!",
    rating: 5,
  },
  {
    id: "11",
    name: "Nina Patel",
    role: "UX Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina",
    content: "The user experience of this directory is exceptional. Finding the right AI design tools has never been easier!",
    rating: 5,
  },
  {
    id: "12",
    name: "Chris Lee",
    role: "Video Editor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
    content: "Discovered some incredible AI video tools that cut my editing time in half. This directory is a goldmine!",
    rating: 5,
  },
];

// Mock categories removed - using database instead

// Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: typeof mockTestimonials[0] }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/20 dark:border-slate-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 opacity-10 dark:opacity-5">
        <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      {/* Content */}
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-sm relative z-10">
        &quot;{testimonial.content}&quot;
      </p>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={48}
          height={48}
          className="rounded-full border-2 border-blue-500/20 dark:border-blue-400/20"
        />
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{testimonial.name}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPricing, setSelectedPricing] = useState<string>("");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Content from database
  const [heroContent, setHeroContent] = useState<Record<string, string>>({});
  const [contentLoaded, setContentLoaded] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  
  // Tools from database
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [trendingTools, setTrendingTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Build testimonials from heroContent
  const testimonials = useMemo(() => {
    const testimonialList = [];
    for (let i = 1; i <= 12; i++) {
      const name = heroContent[`testimonial${i}Name`];
      const role = heroContent[`testimonial${i}Role`];
      const content = heroContent[`testimonial${i}Content`];
      const rating = parseInt(heroContent[`testimonial${i}Rating`] || "5");
      const image = heroContent[`testimonial${i}Image`];

      if (name && role && content) {
        testimonialList.push({
          id: i.toString(),
          name,
          role,
          avatar: image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          content,
          rating: isNaN(rating) ? 5 : Math.min(5, Math.max(1, rating)),
        });
      }
    }
    // If no testimonials from database, use mock data
    return testimonialList.length > 0 ? testimonialList : mockTestimonials;
  }, [heroContent]);

  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch all home page content with cache-busting
        const response = await fetch(`/api/admin/content?page=home&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        });
        const content: Record<string, string> = {};

        if (response.ok) {
          const text = await response.text();
          if (text && text.trim() !== '') {
            try {
              const data = JSON.parse(text);
          data.content?.forEach((item: any) => {
            const value = typeof item.value === 'object' ? JSON.stringify(item.value) : item.value;
            content[item.key] = value;
          });
            } catch (parseError) {
              console.error("Error parsing content JSON:", parseError);
            }
          }
        }

        setHeroContent(content);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setContentLoaded(true);
      }
    };
    fetchContent();
  }, []);

  // Fetch tools from database
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setToolsLoading(true);
        
        // Helper function to safely parse JSON
        const safeJsonParse = async (response: Response) => {
          if (!response.ok) {
            const text = await response.text();
            console.error("API Error:", response.status, text);
            return null;
          }
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.warn("Empty response from API");
            return null;
          }
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Response text:", text);
            return null;
          }
        };
        
        // Fetch featured tools (paid listings or is_featured=true)
        const featuredResponse = await fetch("/api/tools?limit=20&sort=popular");
        const featuredData = await safeJsonParse(featuredResponse);
        if (featuredData && featuredData.tools) {
          // Filter for paid or featured tools on frontend
          const featured = (featuredData.tools || []).filter((tool: Tool) => 
            tool.listing_type === 'paid' || tool.is_featured === true
          );
          setFeaturedTools(featured.slice(0, 12));
        } else {
          setFeaturedTools([]);
        }

        // Fetch recent tools (free listings or null listing_type, sorted by newest)
        const recentResponse = await fetch("/api/tools?limit=20&sort=newest");
        const recentData = await safeJsonParse(recentResponse);
        if (recentData && recentData.tools) {
          // Filter for free listings or null listing_type (defaults to free)
          const recent = (recentData.tools || []).filter((tool: Tool) => 
            !tool.listing_type || tool.listing_type === 'free'
          );
          setRecentTools(recent.slice(0, 8));
        } else {
          setRecentTools([]);
        }

        // Fetch trending tools (by views/rating) - all approved tools
        const trendingResponse = await fetch("/api/tools?limit=8&sort=popular");
        const trendingData = await safeJsonParse(trendingResponse);
        if (trendingData && trendingData.tools) {
          setTrendingTools(trendingData.tools || []);
        } else {
          setTrendingTools([]);
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
        // Don't use mock data - keep empty arrays
        setFeaturedTools([]);
        setRecentTools([]);
        setTrendingTools([]);
      } finally {
        setToolsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch(`/api/categories?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchTools();
    fetchCategories();
  }, []);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSubscribing(true);

      console.log("Making newsletter subscription request:", {
        email: newsletterEmail.trim(),
        method: "POST"
      });

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newsletterEmail.trim(),
        }),
      });

      console.log("Newsletter API response:", {
        status: response.status,
        ok: response.ok
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      if (data.alreadySubscribed) {
        toast.success(data.message);
      } else if (data.verificationSent) {
        toast.success(data.message);
      } else {
        toast.success(data.message);
      }

      setNewsletterEmail("");
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast.error(error?.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Scroll effect for micro-interactions
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll carousel effect
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const autoScroll = setInterval(() => {
      if (!carousel) return;
      
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const currentScroll = carousel.scrollLeft;
      
      // If we're at the end, reset to start
      if (currentScroll >= maxScroll - 10) {
        carousel.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        // Scroll by one card width
        const cardWidth = carousel.querySelector('div')?.offsetWidth || 300;
        carousel.scrollBy({
          left: cardWidth + 24, // card width + gap
          behavior: 'smooth'
        });
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(autoScroll);
  }, []);

  // Filter tools based on selection - use database tools only
  const displayFeaturedTools = featuredTools;
  const filteredTools = displayFeaturedTools.filter((tool: any) => {
    // Only show paid/featured tools (paid listings are automatically featured)
    if (tool.listing_type !== "paid" && !tool.is_featured) {
      return false;
    }
    // Category filter
    if (selectedCategory && tool.categories?.[0]?.slug !== selectedCategory) {
      return false;
    }
    // Pricing filter
    if (selectedPricing && tool.pricing_type !== selectedPricing) {
      return false;
    }
    return true;
  });

  // Show loading skeleton until content is loaded
  if (!contentLoaded) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#eef2ff] to-[#e6ebff] text-slate-900 dark:from-[#070a1a] dark:via-[#0f1732] dark:to-[#1a1440] dark:text-white transition-colors">
      {/* Hero Section */}
      <section className={`relative overflow-hidden backdrop-blur-xl ${heroContent.heroImage ? 'bg-cover bg-center bg-no-repeat' : 'bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/50 dark:from-[#0a0f1e]/90 dark:via-[#0f1428]/90 dark:to-[#1a1440]/90'}`} style={heroContent.heroImage ? { backgroundImage: `url(${heroContent.heroImage})` } : undefined}>
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"></div>
        
        {/* Radial blur circle patterns in background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-400/10 to-transparent blur-[80px] dark:from-blue-500/30"></div>
          <div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-400/8 to-transparent blur-[60px] dark:from-purple-500/25"></div>
          <div className="absolute top-32 left-32 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-indigo-400/6 to-transparent blur-[50px] dark:from-indigo-500/20"></div>
          
          <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-gradient-to-l from-purple-400/10 to-transparent blur-[70px] dark:from-purple-500/28"></div>
          <div className="absolute bottom-24 right-24 w-[350px] h-[350px] rounded-full bg-gradient-to-l from-blue-400/8 to-transparent blur-[60px] dark:from-blue-500/25"></div>
          <div className="absolute bottom-40 right-40 w-[250px] h-[250px] rounded-full bg-gradient-to-l from-indigo-400/6 to-transparent blur-[50px] dark:from-indigo-500/20"></div>
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/6 rounded-full blur-[120px] animate-pulse dark:bg-blue-500/20" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-400/6 rounded-full blur-[100px] animate-pulse delay-700 dark:bg-purple-500/20" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-400/5 rounded-full blur-[90px] animate-pulse delay-1000 dark:bg-indigo-500/18" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.04),_transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_rgba(168,85,247,0.03),_transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_60%,_rgba(168,85,247,0.12),_transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/1 to-white/5 dark:via-transparent dark:to-[#0a0f1e]/30" />
        
        {/* Floating AI Tool Icons - Scattered Layout */}
        <div className="absolute inset-0 hidden lg:block z-[5] pointer-events-none" suppressHydrationWarning>
          {/* Left Side - Top to Bottom */}
          <div 
            className="absolute left-24 top-20 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.003) * 10}px, ${Math.sin(scrollY * 0.004) * 15}px) rotate(${scrollY * 0.05}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
              <circle cx="9" cy="10" r="1.5"/>
              <circle cx="15" cy="10" r="1.5"/>
            </svg>
          </div>
          <div 
            className="absolute left-20 top-52 w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.004 + 1) * 12}px, ${Math.sin(scrollY * 0.003 + 1) * 18}px) rotate(${scrollY * 0.05 + 45}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
          <div 
            className="absolute left-28 top-80 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 dark:from-indigo-500/10 dark:to-cyan-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.005 + 2) * 8}px, ${Math.sin(scrollY * 0.003 + 2) * 12}px) rotate(${scrollY * 0.05 + 90}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>

          {/* Left Bottom */}
          <div 
            className="absolute left-24 bottom-48 w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 dark:from-pink-500/10 dark:to-rose-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.003 + 3) * 10}px, ${Math.sin(scrollY * 0.004 + 3) * 14}px) rotate(${scrollY * 0.05 + 135}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
          </div>
          <div 
            className="absolute left-32 bottom-24 w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.004 + 4) * 9}px, ${Math.sin(scrollY * 0.003 + 4) * 16}px) rotate(${scrollY * 0.05 + 180}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
          </div>

          {/* Right Side - Top to Bottom */}
          <div 
            className="absolute right-24 top-24 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 dark:from-orange-500/10 dark:to-amber-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.003 + 0.5) * -10}px, ${Math.sin(scrollY * 0.004 + 0.5) * 15}px) rotate(${-scrollY * 0.05}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div 
            className="absolute right-20 top-56 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-500/20 dark:from-cyan-500/10 dark:to-sky-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.004 + 1.5) * -12}px, ${Math.sin(scrollY * 0.003 + 1.5) * 18}px) rotate(${-scrollY * 0.05 - 45}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div 
            className="absolute right-28 top-84 w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 dark:from-red-500/10 dark:to-pink-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.005 + 2.5) * -8}px, ${Math.sin(scrollY * 0.003 + 2.5) * 12}px) rotate(${-scrollY * 0.05 - 90}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          </div>

          {/* Right Bottom */}
          <div 
            className="absolute right-24 bottom-52 w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-yellow-500/10 dark:to-orange-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.003 + 3.5) * -10}px, ${Math.sin(scrollY * 0.004 + 3.5) * 14}px) rotate(${-scrollY * 0.05 - 135}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          <div 
            className="absolute right-32 bottom-28 w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 dark:from-teal-500/10 dark:to-cyan-500/10 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 pointer-events-auto group"
            style={{
              transform: `translate(${Math.sin(scrollY * 0.004 + 4.5) * -9}px, ${Math.sin(scrollY * 0.003 + 4.5) * 16}px) rotate(${-scrollY * 0.05 - 180}deg)`,
              opacity: Math.max(0.5, 1 - scrollY * 0.0015)
            }}
          >
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.81 14.12L5.64 11.29 8.47 14.12 7.05 15.54 5.64 14.12 4.22 15.54 2.81 14.12M6.05 17.54L8.47 15.12 11.29 17.95 9.88 19.36 8.47 17.95 7.05 19.36 6.05 17.54M15.54 11.29L12.71 14.12 14.12 15.54 15.54 14.12 16.95 15.54 18.36 14.12 15.54 11.29M12 2L9.19 8.63 2 9.24 7 14.14 5.82 21.02 12 17.77 18.18 21.02 17 14.14 22 9.24 14.81 8.63 12 2Z"/>
            </svg>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 relative z-[1]">
          <div className="mx-auto max-w-6xl text-center">
            <div 
              className="inline-flex items-center justify-center mb-4 sm:mb-6 transition-all duration-700 relative z-[1]"
              style={{
                transform: `translateY(${scrollY * 0.1}px) scale(${Math.max(0.85, 1 - scrollY * 0.0003)})`,
                opacity: Math.max(0, 1 - scrollY * 0.002)
              }}
              suppressHydrationWarning
            >
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-[length:200%_200%] bg-clip-text text-transparent px-2">
                {heroContent.heroTitle || "Discover the Best AI Tools for Your Business"}
              </span>
            </div>
            <p 
              className="text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 transition-all duration-700 relative z-[1]"
              style={{
                transform: `translateY(${scrollY * 0.15}px)`,
                opacity: Math.max(0, 1 - scrollY * 0.0025)
              }}
              suppressHydrationWarning
            >
              {heroContent.heroDescription || "Explore our carefully curated collection of cutting-edge AI tools. Find the perfect solution to supercharge your productivity, creativity, and business growth."}
            </p>
            <div 
              className="mt-6 sm:mt-10 max-w-xl mx-auto px-4 transition-all duration-700 relative z-50"
              style={{
                transform: `translateY(${scrollY * 0.2}px) scale(${Math.max(0.9, 1 - scrollY * 0.0002)})`,
                opacity: Math.max(0, 1 - scrollY * 0.003)
              }}
              suppressHydrationWarning
            >
              <SearchBar 
                className="w-full rounded-2xl border border-blue-100 bg-white shadow-[0_20px_50px_rgba(99,102,241,0.15)] focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 text-slate-900 placeholder:text-slate-400 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-300 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-500/40"
                placeholder="Search AI tools, categories, or keywords..."
              />
            </div>
            <div 
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 transition-all duration-700 relative z-[1] px-4"
              style={{
                transform: `translateY(${scrollY * 0.25}px)`,
                opacity: Math.max(0, 1 - scrollY * 0.0035)
              }}
              suppressHydrationWarning
            >
              <Link href="/tools" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-0 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 rounded-full w-full sm:w-auto px-6 sm:px-10"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></span>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10 font-semibold text-sm sm:text-base">{heroContent.primaryButton || "Explore Tools"}</span>
                </Button>
              </Link>
              <Link href="/submit" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group relative border border-blue-600/50 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 hover:text-white dark:hover:text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:border-transparent shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 rounded-full w-full sm:w-auto px-6 sm:px-10 font-semibold text-sm sm:text-base"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></span>
                  <span className="relative z-10">{heroContent.secondaryButton || "Submit Your Tool"}</span>
                </Button>
              </Link>
            </div>
            {/* User Avatars with Community Text - Responsive Layout */}
            <div
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center justify-center transition-all duration-700 relative z-[1] px-4 gap-3 sm:gap-0"
              style={{
                transform: `translateY(${scrollY * 0.25}px)`,
                opacity: Math.max(0, 1 - scrollY * 0.0035)
              }}
              suppressHydrationWarning
            >
              {/* Avatars Section - With Custom Images */}
              <div className="flex items-center justify-center -space-x-1 sm:-space-x-1 sm:mr-3">
                {[
                  { letter: "A", gradient: "from-blue-400 to-blue-600", image: (heroContent as any).heroAvatar1Image },
                  { letter: "M", gradient: "from-purple-400 to-purple-600", image: (heroContent as any).heroAvatar2Image },
                  { letter: "S", gradient: "from-indigo-400 to-indigo-600", image: (heroContent as any).heroAvatar3Image },
                  { letter: "R", gradient: "from-pink-400 to-pink-600", image: (heroContent as any).heroAvatar4Image },
                  { letter: "K", gradient: "from-green-400 to-green-600", image: (heroContent as any).heroAvatar5Image }
                ].map((avatar, index) => (
                  <div
                    key={avatar.letter}
                    className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs lg:text-sm shadow-lg transition-transform duration-300 hover:scale-110 hover:z-10 ${avatar.image ? 'p-0.5' : ''}`}
                    style={{
                      transform: `translateY(${Math.sin(scrollY * 0.01 + index) * 2}px)`
                    }}
                    suppressHydrationWarning
                  >
                    {avatar.image ? (
                      <img
                        src={avatar.image}
                        alt={`User ${avatar.letter}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      avatar.letter
                    )}
                  </div>
                ))}
                {/* Plus indicator */}
                <div className="text-white/80 font-bold text-[10px] sm:text-xs lg:text-sm ml-2 sm:ml-3">+</div>
              </div>

              {/* Community Text */}
              <div className="text-center sm:text-left sm:flex-1 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {heroContent.heroStats || "Thousands of innovative minds are already channeling popular AI tools with us. Join and be part of this fast-evolving community."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Pills Section */}
      <section className="relative py-6 sm:py-8 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 dark:from-[#0a0f1e] dark:via-[#0c1226] dark:to-[#0f0e2a] border-y border-blue-100 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center sm:justify-between gap-3 sm:gap-4 lg:gap-8">
            {/* Category Dropdown - Full width on mobile */}
            <div className="relative w-full sm:w-auto min-w-0 flex-shrink-0 z-10">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full min-w-[200px] sm:min-w-0 sm:w-auto pl-4 pr-10 py-2.5 sm:py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm sm:text-sm font-medium hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all cursor-pointer touch-manipulation"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="">-- Select a category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 text-slate-500 pointer-events-none flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-700"></div>

            {/* Second Row on Mobile - Verified, Info, and Filter Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Verified Badge */}
              <button 
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  showVerifiedOnly
                    ? 'bg-blue-600 dark:bg-blue-600 border border-blue-600 text-white shadow-lg'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                }`}
              >
                <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showVerifiedOnly ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hidden xs:inline">Verified</span>
              </button>

              {/* Info Icon */}
              <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex-shrink-0 touch-manipulation">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-700"></div>

              {/* Filter Pills */}
              <button 
                onClick={() => setSelectedPricing(selectedPricing === 'free' ? '' : 'free')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation whitespace-nowrap ${
                  selectedPricing === 'free'
                    ? 'bg-green-600 dark:bg-green-600 text-white border border-green-600 shadow-lg ring-2 ring-green-500/50'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30'
                }`}
              >
                Free AI
              </button>
              
              <button 
                onClick={() => setSelectedPricing(selectedPricing === 'freemium' ? '' : 'freemium')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation whitespace-nowrap ${
                  selectedPricing === 'freemium'
                    ? 'bg-orange-600 dark:bg-orange-600 text-white border border-orange-600 shadow-lg ring-2 ring-orange-500/50'
                    : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30'
                }`}
              >
                Freemium
              </button>
              
              <button 
                onClick={() => setSelectedPricing(selectedPricing === 'subscription' ? '' : 'subscription')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation whitespace-nowrap ${
                  selectedPricing === 'subscription'
                    ? 'bg-blue-600 dark:bg-blue-600 text-white border border-blue-600 shadow-lg ring-2 ring-blue-500/50'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30'
                }`}
              >
                Paid
              </button>
              
              <button 
                onClick={() => setSelectedPricing(selectedPricing === 'trial' ? '' : 'trial')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation whitespace-nowrap ${
                  selectedPricing === 'trial'
                    ? 'bg-purple-600 dark:bg-purple-600 text-white border border-purple-600 shadow-lg ring-2 ring-purple-500/50'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30'
                }`}
              >
                Free Trial
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-700"></div>

              {/* View All Button */}
              <Link href="/tools" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm touch-manipulation">
                  View All →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filtered Tools Grid Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {(selectedCategory || selectedPricing) && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Filtered Results
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredTools.length > 0 ? (
              filteredTools.slice(0, 8).map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 sm:py-16 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                  No tools found matching your filters
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Try adjusting your filters or browse all tools
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.15),_transparent_60%)] pointer-events-none" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/5 rounded-full blur-[100px] animate-pulse dark:bg-blue-500/10" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-400/5 rounded-full blur-[100px] animate-pulse delay-1000 dark:bg-purple-500/10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                BROWSE BY CATEGORY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 sm:mb-6 px-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                {heroContent.categoriesTitle || "Explore by Category"}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4">
              {heroContent.categoriesDescription || "Discover AI tools organized by their primary use cases and categories. Find the perfect tool for your specific needs."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {(categories.length > 0 ? categories : []).map((category, index) => (
              <div key={category.id} className="group">
                <Link href={`/category/${category.slug}`}>
                  <div className="relative h-full rounded-xl bg-gradient-to-br from-white/90 via-blue-50/50 to-purple-50/50 dark:from-slate-800/80 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-slate-200/80 dark:border-white/20 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/40 transition-all duration-300 cursor-pointer group-hover:scale-[1.03] group-hover:-translate-y-2">
                    {/* Premium gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-indigo-500/10 dark:group-hover:from-blue-500/10 dark:group-hover:via-purple-500/10 dark:group-hover:to-indigo-500/10 transition-all duration-500"></div>
                    
                    {/* Animated border gradient */}
                    <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-30 blur-md animate-pulse"></div>
                    </div>
                    
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:10px_10px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] opacity-30"></div>
                    
                    {/* Radial glow on hover */}
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center top, ${category.color}30, transparent 60%)`
                      }}
                    ></div>
                    
                    <div className="relative p-5 h-full flex flex-col items-center text-center space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-300 dark:group-hover:to-purple-300 transition-all duration-300">
                        {category.name}
                      </h3>
                      
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/15 dark:to-white/10 px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></span>
                        {category.tools_count} tools
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/categories">
              <Button 
                size="lg" 
                variant="outline" 
                className="group relative border-2 border-blue-600/50 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 hover:text-white dark:hover:text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:border-transparent shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 rounded-full px-10 font-semibold"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {heroContent.categoriesButton || "View All Categories"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-[120px] animate-pulse dark:bg-blue-500/15" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/8 rounded-full blur-[100px] animate-pulse delay-700 dark:bg-purple-500/15" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                HOW IT WORKS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 sm:mb-6 px-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                {heroContent.howItWorksTitle || "Simple Steps to Find Your Perfect AI Tool"}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4">
              {heroContent.howItWorksDescription || "Discover, compare, and choose the perfect AI tools for your needs in just a few simple steps."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Step 1: Discover */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6 pb-8 px-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-slate-900 dark:text-white">
                    {heroContent.step1Title || "Discover"}
                  </h3>
                  <p className="text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {heroContent.step1Description || "Browse our curated collection of AI tools or search by keyword, category, or pricing type."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 2: Compare */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6 pb-8 px-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Compare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center text-sm">
                      2
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-slate-900 dark:text-white">
                    {heroContent.step2Title || "Compare"}
                  </h3>
                  <p className="text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {heroContent.step2Description || "Compare multiple tools side-by-side, read detailed reviews, and check ratings to make informed decisions."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Choose */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6 pb-8 px-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/20 dark:from-pink-500/20 dark:to-pink-600/30 mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold flex items-center justify-center text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-slate-900 dark:text-white">
                    {heroContent.step3Title || "Choose"}
                  </h3>
                  <p className="text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {heroContent.step3Description || "View detailed tool pages with features, pricing, screenshots, and user reviews to select the best option."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 4: Use */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              <Card className="relative h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6 pb-8 px-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-500/20 dark:to-orange-600/30 mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Rocket className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      4
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-slate-900 dark:text-white">
                    {heroContent.step4Title || "Use"}
                  </h3>
                  <p className="text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {heroContent.step4Description || "Visit the tool's website directly, start using it, and save your favorites for easy access later."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Connecting arrows (desktop only) */}
          <div className="hidden lg:flex items-center justify-between px-8 mt-12 mb-8">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"></div>
            <ArrowRight className="w-6 h-6 text-blue-500/50 mx-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30"></div>
            <ArrowRight className="w-6 h-6 text-purple-500/50 mx-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500 opacity-30"></div>
            <ArrowRight className="w-6 h-6 text-pink-500/50 mx-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 opacity-30"></div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8 sm:mt-12 px-4">
            <Link href="/tools" className="inline-block">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-0 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 rounded-full w-full sm:w-auto px-6 sm:px-10"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base">
                  {heroContent.ctaButton || "Start Discovering Tools"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Tools Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-[#0a0f23] dark:via-[#101633] dark:to-[#16143b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.25),_transparent_55%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:justify-between sm:text-left gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex-1 max-w-2xl sm:max-w-none">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                <span className="inline-flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-500 flex-shrink-0" />
                  <span className="text-center sm:text-left leading-tight">
                    This Week&apos;s Buzzing AI Tools
                  </span>
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-center sm:text-left">
                See which most popular AI tools are making waves this week and attracting massive global interest.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/tools?sort=popular">
                <Button variant="outline" className="border border-green-500 text-green-600 hover:bg-green-50 dark:text-green-200 dark:hover:bg-green-500/10 whitespace-nowrap">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Carousel Container */}
          <div className="relative">
            <div ref={carouselRef} className="overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
              <div className="flex gap-6 min-w-full">
                {/* Display trending tools multiple times for continuous scrolling */}
                {[...trendingTools, ...trendingTools, ...trendingTools].map((tool: any, index: number) => (
                  <div key={`${tool.id}-${index}`} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1].map((dot) => (
                <div 
                  key={dot} 
                  className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-green-500 dark:hover:bg-green-400 transition-colors cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        {/* Premium gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-[120px] animate-pulse dark:bg-blue-500/15" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/8 rounded-full blur-[100px] animate-pulse delay-700 dark:bg-purple-500/15" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] opacity-40"></div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 uppercase tracking-wider">
              {heroContent.ctaBadgeText || "Join the Revolution"}
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200">
              {heroContent.ctaTitle || "Ready to Transform Your Workflow with AI?"}
            </span>
          </h2>
          
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            {heroContent.ctaDescription || "Join thousands of innovators discovering cutting-edge AI tools daily. Get exclusive updates and early access to new features."}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tools">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-0 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 rounded-full px-10"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  {heroContent.ctaPrimaryButton || "Explore All Tools"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            
            <Link href="/submit">
              <Button 
                size="lg" 
                variant="outline" 
                className="group relative border-2 border-blue-600/50 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 hover:text-white dark:hover:text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:border-transparent shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 rounded-full px-10 font-semibold"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {heroContent.ctaSecondaryButton || "Submit Your Tool"}
                  <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-slate-600 dark:text-slate-400 text-sm">
            {heroContent.ctaTrustIndicator1 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                  <span className="font-medium">{heroContent.ctaTrustIndicator1}</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
              </>
            )}
            {heroContent.ctaTrustIndicator2 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                  <span className="font-medium">{heroContent.ctaTrustIndicator2}</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
              </>
            )}
            {heroContent.ctaTrustIndicator3 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                <span className="font-medium">{heroContent.ctaTrustIndicator3}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Tools Section */}
      <section className="relative overflow-hidden py-16 bg-[#f5f6ff] dark:bg-[#0f1732]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(99,102,241,0.2),_transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:justify-between sm:text-left gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex-1 max-w-2xl sm:max-w-none">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                <span className="inline-flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-indigo-500 flex-shrink-0" />
                  <span className="text-center sm:text-left leading-tight">
                    Newly Added AI Tools
                  </span>
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-slate-300 leading-relaxed text-center sm:text-left">
                We have just added more popular AI tools to our directory that empower you to accomplish more. Check them out.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/tools?sort=newest">
                <Button variant="outline" className="border-indigo-500 text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 dark:text-indigo-200 dark:hover:bg-indigo-500/10 whitespace-nowrap">
                  {heroContent.recentlyAddedButtonText || "View All"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentTools.slice(0, 4).map((tool: any) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-[#0a0f1e] dark:via-[#0d1228] dark:to-[#0f0e2a]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-4">
              <span className="text-xl">{heroContent.testimonialsBadgeEmoji || "💬"}</span>
              <span className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 uppercase tracking-wider">
                {heroContent.testimonialsBadgeText || "Testimonials"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {heroContent.testimonialsTitle || "What Our Users Say"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {heroContent.testimonialsDescription || "Join thousands of satisfied users who are discovering the best AI tools for their needs"}
            </p>
          </div>

          {/* Testimonials Grid - 3 Columns with Vertical Scroll */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-hidden">
            {/* Top Fade Gradient - Matches section background */}
            <div className="absolute top-0 left-0 right-0 h-40 z-10 pointer-events-none" 
                 style={{
                   background: 'linear-gradient(to bottom, rgb(248 250 252) 0%, rgb(239 246 255 / 0.3) 30%, transparent 100%)',
                 }}
            ></div>
            <div className="absolute top-0 left-0 right-0 h-40 z-10 pointer-events-none dark:block hidden" 
                 style={{
                   background: 'linear-gradient(to bottom, rgb(10 15 30) 0%, rgb(13 18 40 / 0.8) 30%, transparent 100%)',
                 }}
            ></div>
            
            {/* Bottom Fade Gradient - Matches section background */}
            <div className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none" 
                 style={{
                   background: 'linear-gradient(to top, rgb(248 250 252) 0%, rgb(250 245 255 / 0.3) 30%, transparent 100%)',
                 }}
            ></div>
            <div className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none dark:block hidden" 
                 style={{
                   background: 'linear-gradient(to top, rgb(10 15 30) 0%, rgb(15 14 42 / 0.8) 30%, transparent 100%)',
                 }}
            ></div>
            
            {/* Column 1 - Scroll Up */}
            <div className="space-y-6 animate-scroll-up">
              {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map((testimonial, idx) => (
                <TestimonialCard key={`col1-${idx}`} testimonial={testimonial} />
              ))}
            </div>

            {/* Column 2 - Scroll Down */}
            <div className="space-y-6 animate-scroll-down">
              {[...testimonials.slice(4, 8), ...testimonials.slice(4, 8)].map((testimonial, idx) => (
                <TestimonialCard key={`col2-${idx}`} testimonial={testimonial} />
              ))}
            </div>

            {/* Column 3 - Scroll Up */}
            <div className="space-y-6 animate-scroll-up">
              {[...testimonials.slice(8, 12), ...testimonials.slice(8, 12)].map((testimonial, idx) => (
                <TestimonialCard key={`col3-${idx}`} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative overflow-hidden py-16 bg-white dark:bg-[#0a1024]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15),_transparent_65%)] dark:bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.25),_transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <Sparkles className="mx-auto h-12 w-12 text-purple-600 dark:text-purple-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {heroContent.newsletterTitle || "Stay Updated with AI Trends"}
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 mb-8">
            {heroContent.newsletterDescription || "Get weekly updates on the latest AI tools, trends, and insights delivered straight to your inbox."}
          </p>
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-500/50"
                placeholder="Enter your email"
                disabled={subscribing}
              />
              <Button
                type="submit"
                disabled={subscribing || !newsletterEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 disabled:opacity-50"
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {heroContent.newsletterSubtext || "Join 10,000+ subscribers. No spam, ever. Unsubscribe anytime."}
          </p>
        </div>
      </section>
    </div>
  );
}

