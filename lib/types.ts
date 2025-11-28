export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  pricing_type: "free" | "freemium" | "paid" | "subscription";
  pricing_details: PricingDetail[] | null;
  features: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  screenshots: string[] | null;
  video_url: string | null;
  rating_avg: number;
  rating_count: number;
  views_count: number;
  favorites_count: number;
  status: "pending" | "approved" | "rejected" | "archived";
  is_featured: boolean;
  is_trending: boolean;
  listing_type?: "free" | "paid";
  payment_id?: string | null;
  payment_status?: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  tags?: Tag[];
}

export interface PricingDetail {
  name: string;
  price: string;
  features: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  parent_id: string | null;
  tools_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  pros: string[] | null;
  cons: string[] | null;
  helpful_count: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin" | "moderator";
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_id: string | null;
  category_id: string | null;
  status: "draft" | "published" | "archived";
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category;
  tags?: Tag[];
}

export interface Favorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
  tool?: Tool;
}

export interface Filters {
  search?: string;
  categories?: string[];
  tags?: string[];
  pricing?: string[];
  rating?: number;
  sort?: "newest" | "popular" | "rating" | "name";
}

