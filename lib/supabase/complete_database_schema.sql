-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR AI TOOLS DIRECTORY
-- All-in-one SQL file - Run this in Supabase SQL Editor
-- =====================================================
-- This file contains:
-- 1. Extensions
-- 2. All Tables
-- 3. Indexes
-- 4. Row Level Security (RLS) Policies
-- 5. Functions and Triggers
-- 6. Blog Categories Table
-- 7. Storage Policies
-- 8. Fixes and Migrations
-- =====================================================

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- 2. USER MANAGEMENT TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for tracking user activity)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CATEGORY & TAG MANAGEMENT TABLES
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tools_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TOOLS MANAGEMENT TABLES
-- =====================================================

-- Tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  long_description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  pricing_type TEXT CHECK (pricing_type IN ('free', 'freemium', 'paid', 'subscription')),
  pricing_details JSONB,
  features JSONB,
  pros JSONB,
  cons JSONB,
  screenshots JSONB,
  video_url TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  favorites_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  listing_type TEXT DEFAULT 'free' CHECK (listing_type IN ('free', 'paid')),
  payment_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  submitted_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool Categories junction table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.tool_categories (
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

-- Tool Tags junction table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.tool_tags (
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id)
);

-- Tool views table (for detailed analytics)
CREATE TABLE IF NOT EXISTS public.tool_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. REVIEWS & RATINGS TABLES
-- =====================================================

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  pros JSONB,
  cons JSONB,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Review helpful votes table
CREATE TABLE IF NOT EXISTS public.review_helpful (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- =====================================================
-- 6. USER INTERACTIONS TABLES
-- =====================================================

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- =====================================================
-- 7. SUBMISSIONS & PAYMENTS TABLES
-- =====================================================

-- Submissions table (for tracking tool submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (for paid tool listings - Razorpay integration)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT,
  payment_provider TEXT,
  payment_provider_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,
  listing_type TEXT DEFAULT 'paid' CHECK (listing_type IN ('free', 'paid')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. BLOG MANAGEMENT TABLES
-- =====================================================

-- Blog Posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles(id),
  category_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reading_time INT,
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Categories table (separate from tool categories)
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  posts_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update blog_posts to reference blog_categories
DO $$ 
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey' 
    AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE public.blog_posts DROP CONSTRAINT blog_posts_category_id_fkey;
  END IF;
  
  -- Add new foreign key to blog_categories if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey' 
    AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE public.blog_posts 
      ADD CONSTRAINT blog_posts_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES public.blog_categories(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Blog Tags junction table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.blog_tags (
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Blog Comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

-- Blog Views table (for analytics)
CREATE TABLE IF NOT EXISTS public.blog_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. CONTENT MANAGEMENT TABLES
-- =====================================================

-- Frontend Content table (for managing homepage and other frontend content)
CREATE TABLE IF NOT EXISTS public.frontend_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section, key)
);

-- =====================================================
-- 10. COMMUNICATION TABLES
-- =====================================================

-- Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'unsubscribed')),
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  replied_by UUID REFERENCES public.profiles(id),
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. NOTIFICATIONS TABLE
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tool_approved', 'tool_rejected', 'review_approved', 'comment_reply', 'newsletter', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. SETTINGS TABLE
-- =====================================================

-- Settings table (for storing API keys and configuration)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- =====================================================
-- 13. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON public.tags USING gin(name gin_trgm_ops);

-- Tools indexes
CREATE INDEX IF NOT EXISTS idx_tools_slug ON public.tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_status ON public.tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON public.tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON public.tools(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_tools_views ON public.tools(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_submitted_by ON public.tools(submitted_by);
CREATE INDEX IF NOT EXISTS idx_tools_listing_type ON public.tools(listing_type);
CREATE INDEX IF NOT EXISTS idx_tools_payment_id ON public.tools(payment_id);
CREATE INDEX IF NOT EXISTS idx_tools_payment_status ON public.tools(payment_status);
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm ON public.tools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON public.tools USING gin(description gin_trgm_ops);

-- Tool Categories indexes
CREATE INDEX IF NOT EXISTS idx_tool_categories_tool_id ON public.tool_categories(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_categories_category_id ON public.tool_categories(category_id);

-- Tool Tags indexes
CREATE INDEX IF NOT EXISTS idx_tool_tags_tool_id ON public.tool_tags(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tag_id ON public.tool_tags(tag_id);

-- Tool Views indexes
CREATE INDEX IF NOT EXISTS idx_tool_views_tool_id ON public.tool_views(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_views_viewed_at ON public.tool_views(viewed_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON public.reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Review Helpful indexes
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON public.review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON public.review_helpful(user_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tool_id ON public.favorites(tool_id);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_tool_id ON public.submissions(tool_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_tool_id ON public.payments(tool_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- Blog Posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_trgm ON public.blog_posts USING gin(title gin_trgm_ops);

-- Blog Categories indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name ON public.blog_categories(name);

-- Blog Tags indexes
CREATE INDEX IF NOT EXISTS idx_blog_tags_blog_id ON public.blog_tags(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_tag_id ON public.blog_tags(tag_id);

-- Blog Comments indexes
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON public.blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status);

-- Blog Likes indexes
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);

-- Blog Views indexes
CREATE INDEX IF NOT EXISTS idx_blog_views_blog_id ON public.blog_views(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_viewed_at ON public.blog_views(viewed_at DESC);

-- Frontend Content indexes
CREATE INDEX IF NOT EXISTS idx_frontend_content_page_section ON public.frontend_content(page, section);
CREATE INDEX IF NOT EXISTS idx_frontend_content_page ON public.frontend_content(page);

-- Newsletter Subscribers indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_verification_token ON public.newsletter_subscribers(verification_token);

-- Contact Messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON public.settings(category, key);

-- =====================================================
-- 14. ROW LEVEL SECURITY (RLS) - ENABLE ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontend_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 15. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin/moderator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  
  -- Categories policies
  DROP POLICY IF EXISTS "categories_select" ON public.categories;
  DROP POLICY IF EXISTS "categories_insert" ON public.categories;
  DROP POLICY IF EXISTS "categories_update" ON public.categories;
  DROP POLICY IF EXISTS "categories_delete" ON public.categories;
  DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
  DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
  DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
  DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
  
  -- Tags policies
  DROP POLICY IF EXISTS "tags_select" ON public.tags;
  DROP POLICY IF EXISTS "tags_insert" ON public.tags;
  DROP POLICY IF EXISTS "tags_update" ON public.tags;
  DROP POLICY IF EXISTS "tags_delete" ON public.tags;
  DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
  DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
  DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
  DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;
  
  -- Tools policies
  DROP POLICY IF EXISTS "tools_select" ON public.tools;
  DROP POLICY IF EXISTS "tools_insert" ON public.tools;
  DROP POLICY IF EXISTS "tools_update" ON public.tools;
  DROP POLICY IF EXISTS "tools_delete" ON public.tools;
  DROP POLICY IF EXISTS "Approved tools are viewable by everyone" ON public.tools;
  DROP POLICY IF EXISTS "Users can insert tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can update own tools" ON public.tools;
  
  -- Reviews policies
  DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
  DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
  DROP POLICY IF EXISTS "reviews_update" ON public.reviews;
  DROP POLICY IF EXISTS "reviews_delete" ON public.reviews;
  
  -- Payments policies
  DROP POLICY IF EXISTS "payments_select" ON public.payments;
  DROP POLICY IF EXISTS "payments_insert" ON public.payments;
  DROP POLICY IF EXISTS "payments_update" ON public.payments;
  DROP POLICY IF EXISTS "payments_delete" ON public.payments;
  
  -- Contact messages policies
  DROP POLICY IF EXISTS "contact_messages_select" ON public.contact_messages;
  DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
  DROP POLICY IF EXISTS "contact_messages_update" ON public.contact_messages;
  DROP POLICY IF EXISTS "contact_messages_delete" ON public.contact_messages;
  
  -- Blog categories policies
  DROP POLICY IF EXISTS "blog_categories_select" ON public.blog_categories;
  DROP POLICY IF EXISTS "blog_categories_insert" ON public.blog_categories;
  DROP POLICY IF EXISTS "blog_categories_update" ON public.blog_categories;
  DROP POLICY IF EXISTS "blog_categories_delete" ON public.blog_categories;
END $$;

-- Profiles RLS Policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Categories RLS Policies
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (public.is_admin());

-- Tags RLS Policies
CREATE POLICY "tags_select" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_insert" ON public.tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "tags_update" ON public.tags FOR UPDATE USING (public.is_admin());
CREATE POLICY "tags_delete" ON public.tags FOR DELETE USING (public.is_admin());

-- Tools RLS Policies
CREATE POLICY "tools_select" ON public.tools FOR SELECT 
  USING (status = 'approved' OR submitted_by = auth.uid() OR public.is_admin());
CREATE POLICY "tools_insert" ON public.tools FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "tools_update" ON public.tools FOR UPDATE USING (submitted_by = auth.uid() OR public.is_admin());
CREATE POLICY "tools_delete" ON public.tools FOR DELETE USING (submitted_by = auth.uid() OR public.is_admin());

-- Tool Categories RLS Policies
CREATE POLICY "tool_categories_select" ON public.tool_categories FOR SELECT USING (true);
CREATE POLICY "tool_categories_insert" ON public.tool_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "tool_categories_delete" ON public.tool_categories FOR DELETE USING (true);

-- Tool Tags RLS Policies
CREATE POLICY "tool_tags_select" ON public.tool_tags FOR SELECT USING (true);
CREATE POLICY "tool_tags_insert" ON public.tool_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "tool_tags_delete" ON public.tool_tags FOR DELETE USING (true);

-- Tool Views RLS Policies
CREATE POLICY "tool_views_select" ON public.tool_views FOR SELECT USING (true);
CREATE POLICY "tool_views_insert" ON public.tool_views FOR INSERT WITH CHECK (true);

-- Reviews RLS Policies
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT 
  USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- Review Helpful RLS Policies
CREATE POLICY "review_helpful_select" ON public.review_helpful FOR SELECT USING (true);
CREATE POLICY "review_helpful_insert" ON public.review_helpful FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_helpful_delete" ON public.review_helpful FOR DELETE USING (user_id = auth.uid());

-- Favorites RLS Policies
CREATE POLICY "favorites_select" ON public.favorites FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "favorites_insert" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON public.favorites FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- Submissions RLS Policies
CREATE POLICY "submissions_select" ON public.submissions FOR SELECT 
  USING (submitted_by = auth.uid() OR public.is_admin());
CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "submissions_update" ON public.submissions FOR UPDATE USING (public.is_admin());

-- Payments RLS Policies
CREATE POLICY "payments_select" ON public.payments FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update" ON public.payments FOR UPDATE USING (public.is_admin());
CREATE POLICY "payments_delete" ON public.payments FOR DELETE USING (public.is_admin());

-- Blog Posts RLS Policies
CREATE POLICY "blog_posts_select" ON public.blog_posts FOR SELECT 
  USING (status = 'published' OR author_id = auth.uid() OR public.is_admin());
CREATE POLICY "blog_posts_insert" ON public.blog_posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "blog_posts_update" ON public.blog_posts FOR UPDATE 
  USING (author_id = auth.uid() OR public.is_admin());
CREATE POLICY "blog_posts_delete" ON public.blog_posts FOR DELETE 
  USING (author_id = auth.uid() OR public.is_admin());

-- Blog Categories RLS Policies
CREATE POLICY "blog_categories_select" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "blog_categories_insert" ON public.blog_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "blog_categories_update" ON public.blog_categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "blog_categories_delete" ON public.blog_categories FOR DELETE USING (public.is_admin());

-- Blog Tags RLS Policies
CREATE POLICY "blog_tags_select" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "blog_tags_insert" ON public.blog_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_tags_delete" ON public.blog_tags FOR DELETE USING (true);

-- Blog Comments RLS Policies
CREATE POLICY "blog_comments_select" ON public.blog_comments FOR SELECT 
  USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "blog_comments_insert" ON public.blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "blog_comments_update" ON public.blog_comments FOR UPDATE 
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "blog_comments_delete" ON public.blog_comments FOR DELETE 
  USING (user_id = auth.uid() OR public.is_admin());

-- Blog Likes RLS Policies
CREATE POLICY "blog_likes_select" ON public.blog_likes FOR SELECT USING (true);
CREATE POLICY "blog_likes_insert" ON public.blog_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "blog_likes_delete" ON public.blog_likes FOR DELETE USING (user_id = auth.uid());

-- Blog Views RLS Policies
CREATE POLICY "blog_views_select" ON public.blog_views FOR SELECT USING (true);
CREATE POLICY "blog_views_insert" ON public.blog_views FOR INSERT WITH CHECK (true);

-- Frontend Content RLS Policies
CREATE POLICY "frontend_content_select" ON public.frontend_content FOR SELECT USING (true);
CREATE POLICY "frontend_content_insert" ON public.frontend_content FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "frontend_content_update" ON public.frontend_content FOR UPDATE USING (public.is_admin());
CREATE POLICY "frontend_content_delete" ON public.frontend_content FOR DELETE USING (public.is_admin());

-- Newsletter Subscribers RLS Policies
CREATE POLICY "newsletter_subscribers_select" ON public.newsletter_subscribers FOR SELECT 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR public.is_admin());
CREATE POLICY "newsletter_subscribers_insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_subscribers_update" ON public.newsletter_subscribers FOR UPDATE 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR public.is_admin());

-- Contact Messages RLS Policies
CREATE POLICY "contact_messages_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select" ON public.contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "contact_messages_update" ON public.contact_messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "contact_messages_delete" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- Notifications RLS Policies
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Settings RLS Policies
CREATE POLICY "settings_select" ON public.settings FOR SELECT USING (public.is_admin());
CREATE POLICY "settings_insert" ON public.settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "settings_update" ON public.settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "settings_delete" ON public.settings FOR DELETE USING (public.is_admin());

-- =====================================================
-- 17. TRIGGERS FOR UPDATED_AT COLUMNS
-- =====================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tools_updated_at ON public.tools;
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_frontend_content_updated_at ON public.frontend_content;
CREATE TRIGGER update_frontend_content_updated_at BEFORE UPDATE ON public.frontend_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 18. BUSINESS LOGIC TRIGGERS
-- =====================================================

-- Function to update tool rating
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_tool_id UUID;
BEGIN
  v_tool_id := COALESCE(NEW.tool_id, OLD.tool_id);
  UPDATE public.tools
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE tool_id = v_tool_id AND status = 'approved'
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE tool_id = v_tool_id AND status = 'approved'
    )
  WHERE id = v_tool_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tool_rating_on_review ON public.reviews;
CREATE TRIGGER update_tool_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_tool_rating();

-- Function to update category tools count
CREATE OR REPLACE FUNCTION update_category_tools_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.categories
    SET tools_count = GREATEST(0, tools_count - 1)
    WHERE id = OLD.category_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.categories
    SET tools_count = tools_count + 1
    WHERE id = NEW.category_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_count ON public.tool_categories;
CREATE TRIGGER update_category_count
  AFTER INSERT OR DELETE ON public.tool_categories
  FOR EACH ROW EXECUTE FUNCTION update_category_tools_count();

-- Function to update tool favorites count
CREATE OR REPLACE FUNCTION update_tool_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.tools
    SET favorites_count = GREATEST(0, favorites_count - 1)
    WHERE id = OLD.tool_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.tools
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.tool_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tool_favorites_count ON public.favorites;
CREATE TRIGGER update_tool_favorites_count
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION update_tool_favorites_count();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.reviews
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = OLD.review_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_review_helpful_count ON public.review_helpful;
CREATE TRIGGER update_review_helpful_count
  AFTER INSERT OR DELETE ON public.review_helpful
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Function to update blog post comments count
CREATE OR REPLACE FUNCTION update_blog_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.blog_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.blog_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_comments_count ON public.blog_comments;
CREATE TRIGGER update_blog_comments_count
  AFTER INSERT OR DELETE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_blog_comments_count();

-- Function to update blog post likes count
CREATE OR REPLACE FUNCTION update_blog_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.blog_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.blog_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_likes_count ON public.blog_likes;
CREATE TRIGGER update_blog_likes_count
  AFTER INSERT OR DELETE ON public.blog_likes
  FOR EACH ROW EXECUTE FUNCTION update_blog_likes_count();

-- Function to update blog post views count
CREATE OR REPLACE FUNCTION update_blog_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.blog_posts
  SET views_count = views_count + 1
  WHERE id = NEW.blog_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_views_count ON public.blog_views;
CREATE TRIGGER update_blog_views_count
  AFTER INSERT ON public.blog_views
  FOR EACH ROW EXECUTE FUNCTION update_blog_views_count();

-- Function to update tool views count
CREATE OR REPLACE FUNCTION update_tool_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tools
  SET views_count = views_count + 1
  WHERE id = NEW.tool_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tool_views_count ON public.tool_views;
CREATE TRIGGER update_tool_views_count
  AFTER INSERT ON public.tool_views
  FOR EACH ROW EXECUTE FUNCTION update_tool_views_count();

-- Function to update blog category posts count
CREATE OR REPLACE FUNCTION update_blog_category_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE public.blog_categories
      SET posts_count = GREATEST(0, posts_count - 1)
      WHERE id = OLD.category_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.category_id IS NOT NULL THEN
      UPDATE public.blog_categories
      SET posts_count = posts_count + 1
      WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      -- Decrease count for old category
      IF OLD.category_id IS NOT NULL THEN
        UPDATE public.blog_categories
        SET posts_count = GREATEST(0, posts_count - 1)
        WHERE id = OLD.category_id;
      END IF;
      -- Increase count for new category
      IF NEW.category_id IS NOT NULL THEN
        UPDATE public.blog_categories
        SET posts_count = posts_count + 1
        WHERE id = NEW.category_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_category_count ON public.blog_posts;
CREATE TRIGGER update_blog_category_count
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_category_posts_count();

-- =====================================================
-- 19. MIGRATIONS AND FIXES
-- =====================================================

-- Add status column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended'));
    
    UPDATE public.profiles SET status = 'active' WHERE status IS NULL;
    ALTER TABLE public.profiles ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- Add payment_id and payment_status columns to tools if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tools' 
    AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE public.tools ADD COLUMN payment_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tools' 
    AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE public.tools 
    ADD COLUMN payment_status TEXT 
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Add listing_type column to tools if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tools' 
    AND column_name = 'listing_type'
  ) THEN
    ALTER TABLE public.tools 
    ADD COLUMN listing_type TEXT DEFAULT 'free' 
    CHECK (listing_type IN ('free', 'paid'));
  END IF;
END $$;

-- Update payments table currency to INR if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments ALTER COLUMN currency SET DEFAULT 'INR';
    UPDATE public.payments SET currency = 'INR' WHERE currency IS NULL OR currency = 'USD';
    UPDATE public.payments SET payment_provider = 'razorpay' WHERE payment_provider IS NULL OR payment_provider = 'stripe';
  END IF;
END $$;

-- Add SEO columns to blog_posts if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN seo_title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN seo_description TEXT;
  END IF;
END $$;

-- Insert default blog categories
INSERT INTO public.blog_categories (name, slug, description, icon, color) VALUES
  ('Tutorials', 'tutorials', 'Step-by-step guides and tutorials', '📚', '#3b82f6'),
  ('Guides', 'guides', 'Comprehensive guides and how-tos', '📖', '#8b5cf6'),
  ('News', 'news', 'Latest news and updates', '📰', '#ec4899'),
  ('Reviews', 'reviews', 'In-depth tool reviews', '⭐', '#f59e0b'),
  ('Tips & Tricks', 'tips-tricks', 'Helpful tips and tricks', '💡', '#10b981'),
  ('Case Studies', 'case-studies', 'Real-world use cases', '📊', '#6366f1'),
  ('AI Tools', 'ai-tools', 'AI tools and software reviews', '🤖', '#3b82f6'),
  ('Marketing', 'marketing', 'Marketing strategies and tools', '📈', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 20. STORAGE POLICIES FOR SUPABASE STORAGE BUCKETS
-- =====================================================
-- Note: Make sure these buckets exist in Supabase Storage before running
-- Required buckets: tool-images, blog-images, user-avatars

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload tool images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view tool images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own tool images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own tool images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Storage policies for tool-images bucket
CREATE POLICY "Authenticated users can upload tool images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tool-images');

CREATE POLICY "Public can view tool images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tool-images');

CREATE POLICY "Users can update own tool images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tool-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own tool images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tool-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for blog-images bucket
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Storage policies for user-avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-avatars');

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-avatars' AND name = (auth.uid()::text || '/avatar.*'));

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-avatars' AND name = (auth.uid()::text || '/avatar.*'));

-- =====================================================
-- END OF COMPLETE DATABASE SCHEMA
-- =====================================================
-- 
-- IMPORTANT NOTES:
-- 1. Make sure to create the following storage buckets in Supabase:
--    - tool-images (public)
--    - blog-images (public)
--    - user-avatars (public)
-- 2. This schema is idempotent - safe to run multiple times
-- 3. All tables use IF NOT EXISTS to prevent errors on re-runs
-- =====================================================

-- =====================================================
-- 21. CREATE ADMIN USER
-- =====================================================
-- After running the schema, create an admin user:
--
-- METHOD 1: Via Supabase Dashboard (Recommended)
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email and password
-- 4. User will be created in auth.users
-- 5. Profile will be automatically created (via trigger or app)
-- 6. Run the UPDATE query below to make them admin
--
-- METHOD 2: Via App Registration
-- 1. Register a user through your app (/auth/register)
-- 2. User will be created in auth.users and profiles
-- 3. Run the UPDATE query below to make them admin
--
-- UPDATE PROFILE ROLE TO ADMIN:
-- Replace 'your-email@example.com' with the actual email address
-- =====================================================

-- Update profile role to admin (replace email with your admin email)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Example: Update specific user to admin
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'bipintech9@gmail.com';

-- Verify admin user was created
SELECT id, email, full_name, role, status, created_at
FROM public.profiles
WHERE role = 'admin';

-- =====================================================
-- END OF ADMIN USER SETUP
-- =====================================================

