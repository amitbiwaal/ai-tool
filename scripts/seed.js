const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const categories = [
  { name: "AI Writing", slug: "ai-writing", description: "AI-powered writing and content creation tools", icon: "✍️", color: "#3b82f6" },
  { name: "AI Art & Design", slug: "ai-art-design", description: "AI tools for creating art, graphics, and designs", icon: "🎨", color: "#8b5cf6" },
  { name: "AI Video", slug: "ai-video", description: "AI-powered video creation and editing tools", icon: "🎬", color: "#ec4899" },
  { name: "AI Music", slug: "ai-music", description: "AI tools for music generation and editing", icon: "🎵", color: "#f59e0b" },
  { name: "AI Coding", slug: "ai-coding", description: "AI-powered coding assistants and development tools", icon: "💻", color: "#10b981" },
  { name: "AI Business", slug: "ai-business", description: "AI tools for business operations and analytics", icon: "📊", color: "#6366f1" },
  { name: "AI Marketing", slug: "ai-marketing", description: "AI-powered marketing and advertising tools", icon: "📱", color: "#ef4444" },
  { name: "AI Research", slug: "ai-research", description: "AI tools for research and data analysis", icon: "🔬", color: "#0ea5e9" },
  { name: "AI Education", slug: "ai-education", description: "AI-powered learning and educational tools", icon: "📚", color: "#14b8a6" },
  { name: "AI Productivity", slug: "ai-productivity", description: "AI tools to boost productivity and efficiency", icon: "⚡", color: "#f97316" },
  { name: "AI Voice & Audio", slug: "ai-voice-audio", description: "AI tools for voice synthesis and audio processing", icon: "🎙️", color: "#a855f7" },
  { name: "AI Image Enhancement", slug: "ai-image-enhancement", description: "AI-powered image editing and enhancement", icon: "🖼️", color: "#06b6d4" },
];

const tags = [
  { name: "GPT", slug: "gpt" },
  { name: "Text Generation", slug: "text-generation" },
  { name: "Image Generation", slug: "image-generation" },
  { name: "Video Generation", slug: "video-generation" },
  { name: "Code Assistant", slug: "code-assistant" },
  { name: "Chatbot", slug: "chatbot" },
  { name: "Voice Synthesis", slug: "voice-synthesis" },
  { name: "Translation", slug: "translation" },
  { name: "SEO", slug: "seo" },
  { name: "Analytics", slug: "analytics" },
  { name: "Automation", slug: "automation" },
  { name: "Machine Learning", slug: "machine-learning" },
  { name: "Natural Language Processing", slug: "nlp" },
  { name: "Computer Vision", slug: "computer-vision" },
  { name: "API", slug: "api" },
];

const tools = [
  {
    name: "ChatGPT",
    slug: "chatgpt",
    tagline: "Conversational AI that answers questions and assists with tasks",
    description: "ChatGPT is an advanced AI language model that can engage in natural conversations, answer questions, and help with various tasks.",
    long_description: "ChatGPT is a powerful conversational AI developed by OpenAI. It can understand and generate human-like text, making it useful for a wide range of applications including content creation, coding assistance, learning, and problem-solving.",
    logo_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop",
    pricing_type: "freemium",
    features: [
      "Natural language understanding",
      "Code generation and debugging",
      "Creative writing assistance",
      "Question answering",
      "Multi-language support"
    ],
    pros: [
      "Highly versatile and capable",
      "Regular updates and improvements",
      "Large knowledge base",
      "User-friendly interface"
    ],
    cons: [
      "Can sometimes provide inaccurate information",
      "Limited to training data cutoff",
      "Requires internet connection"
    ],
    rating_avg: 4.8,
    rating_count: 1250,
    views_count: 15000,
    is_featured: true,
    is_trending: true,
    status: "approved"
  },
  {
    name: "Midjourney",
    slug: "midjourney",
    tagline: "AI art generator that creates stunning images from text",
    description: "Midjourney is an AI-powered tool that generates beautiful, artistic images from textual descriptions.",
    long_description: "Midjourney is a cutting-edge AI art generator that transforms your text prompts into stunning visual artwork. It excels at creating artistic, imaginative images with various styles.",
    logo_url: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=200&h=200&fit=crop",
    pricing_type: "subscription",
    features: [
      "Text-to-image generation",
      "Multiple artistic styles",
      "High-resolution outputs",
      "Image variations",
      "Community gallery"
    ],
    pros: [
      "Exceptional artistic quality",
      "Easy to use",
      "Active community",
      "Regular style updates"
    ],
    cons: [
      "Subscription required",
      "Discord-based interface",
      "Can be slow during peak times"
    ],
    rating_avg: 4.7,
    rating_count: 980,
    views_count: 12000,
    is_featured: true,
    is_trending: true,
    status: "approved"
  },
  {
    name: "GitHub Copilot",
    slug: "github-copilot",
    tagline: "AI pair programmer that helps you write code faster",
    description: "GitHub Copilot is an AI coding assistant that suggests code completions as you type.",
    long_description: "GitHub Copilot is an AI-powered code completion tool developed by GitHub and OpenAI. It suggests entire lines or blocks of code as you type, helping developers code faster and more efficiently.",
    logo_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&h=200&fit=crop",
    pricing_type: "subscription",
    features: [
      "Code completion suggestions",
      "Multiple language support",
      "Context-aware recommendations",
      "IDE integration",
      "Code documentation"
    ],
    pros: [
      "Significantly speeds up coding",
      "Learns from context",
      "Supports many languages",
      "Well-integrated with editors"
    ],
    cons: [
      "Subscription cost",
      "Sometimes suggests incorrect code",
      "May rely too much on common patterns"
    ],
    rating_avg: 4.6,
    rating_count: 2100,
    views_count: 18000,
    is_featured: true,
    status: "approved"
  },
  {
    name: "Jasper AI",
    slug: "jasper-ai",
    tagline: "AI content platform for creating marketing copy and content",
    description: "Jasper AI is a powerful AI writing assistant designed for marketers and content creators.",
    long_description: "Jasper AI helps you create high-quality content at scale. From blog posts to social media content, Jasper can generate various types of marketing copy quickly and effectively.",
    logo_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
    pricing_type: "subscription",
    features: [
      "Multiple content templates",
      "SEO optimization",
      "Brand voice customization",
      "Plagiarism checker",
      "Multi-language support"
    ],
    pros: [
      "Great for marketing copy",
      "Many templates available",
      "Good quality output",
      "Collaborative features"
    ],
    cons: [
      "Expensive for individuals",
      "May require editing",
      "Learning curve for best results"
    ],
    rating_avg: 4.5,
    rating_count: 750,
    views_count: 9000,
    is_featured: true,
    status: "approved"
  },
  {
    name: "Canva AI",
    slug: "canva-ai",
    tagline: "Design platform with AI-powered design tools",
    description: "Canva's AI features help you create stunning designs with minimal effort.",
    long_description: "Canva AI integrates artificial intelligence into the popular design platform, offering features like Magic Design, background removal, and AI-powered image generation.",
    logo_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop",
    pricing_type: "freemium",
    features: [
      "Magic Design feature",
      "AI background removal",
      "Text to image",
      "Smart resize",
      "Brand kit"
    ],
    pros: [
      "User-friendly interface",
      "Extensive template library",
      "Good free tier",
      "Collaborative features"
    ],
    cons: [
      "Some features require Pro",
      "Can be overwhelming for beginners",
      "Limited compared to professional tools"
    ],
    rating_avg: 4.7,
    rating_count: 1800,
    views_count: 22000,
    is_featured: true,
    is_trending: true,
    status: "approved"
  },
  {
    name: "Grammarly",
    slug: "grammarly",
    tagline: "AI-powered writing assistant for better communication",
    description: "Grammarly uses AI to check grammar, spelling, and writing style.",
    long_description: "Grammarly is a comprehensive writing assistant that helps you write clearly and mistake-free. It offers real-time suggestions for grammar, spelling, punctuation, and style improvements.",
    logo_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop",
    pricing_type: "freemium",
    features: [
      "Grammar and spelling check",
      "Style suggestions",
      "Tone detector",
      "Plagiarism checker",
      "Browser extension"
    ],
    pros: [
      "Excellent accuracy",
      "Works across platforms",
      "Easy to use",
      "Good free version"
    ],
    cons: [
      "Premium features can be pricey",
      "Sometimes overly prescriptive",
      "Privacy concerns for some users"
    ],
    rating_avg: 4.6,
    rating_count: 3200,
    views_count: 28000,
    is_trending: true,
    status: "approved"
  },
];

async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Insert categories
    console.log("Inserting categories...");
    const { data: insertedCategories, error: categoriesError } = await supabase
      .from("categories")
      .insert(categories)
      .select();

    if (categoriesError) {
      console.error("Error inserting categories:", categoriesError);
    } else {
      console.log(`Inserted ${insertedCategories.length} categories`);
    }

    // Insert tags
    console.log("Inserting tags...");
    const { data: insertedTags, error: tagsError } = await supabase
      .from("tags")
      .insert(tags)
      .select();

    if (tagsError) {
      console.error("Error inserting tags:", tagsError);
    } else {
      console.log(`Inserted ${insertedTags.length} tags`);
    }

    // Insert tools
    console.log("Inserting tools...");
    const { data: insertedTools, error: toolsError } = await supabase
      .from("tools")
      .insert(tools)
      .select();

    if (toolsError) {
      console.error("Error inserting tools:", toolsError);
    } else {
      console.log(`Inserted ${insertedTools.length} tools`);

      // Link tools to categories
      if (insertedTools && insertedCategories) {
        console.log("Linking tools to categories...");
        const toolCategories = [];

        insertedTools.forEach((tool, index) => {
          // Assign each tool to 1-3 random categories
          const numCategories = Math.floor(Math.random() * 3) + 1;
          const shuffled = [...insertedCategories].sort(() => 0.5 - Math.random());
          const selectedCategories = shuffled.slice(0, numCategories);

          selectedCategories.forEach((category) => {
            toolCategories.push({
              tool_id: tool.id,
              category_id: category.id,
            });
          });
        });

        const { error: toolCategoriesError } = await supabase
          .from("tool_categories")
          .insert(toolCategories);

        if (toolCategoriesError) {
          console.error("Error linking tools to categories:", toolCategoriesError);
        } else {
          console.log(`Created ${toolCategories.length} tool-category links`);
        }
      }

      // Link tools to tags
      if (insertedTools && insertedTags) {
        console.log("Linking tools to tags...");
        const toolTags = [];

        insertedTools.forEach((tool) => {
          // Assign each tool to 2-5 random tags
          const numTags = Math.floor(Math.random() * 4) + 2;
          const shuffled = [...insertedTags].sort(() => 0.5 - Math.random());
          const selectedTags = shuffled.slice(0, numTags);

          selectedTags.forEach((tag) => {
            toolTags.push({
              tool_id: tool.id,
              tag_id: tag.id,
            });
          });
        });

        const { error: toolTagsError } = await supabase
          .from("tool_tags")
          .insert(toolTags);

        if (toolTagsError) {
          console.error("Error linking tools to tags:", toolTagsError);
        } else {
          console.log(`Created ${toolTags.length} tool-tag links`);
        }
      }
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();

