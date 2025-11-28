-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR AI TOOLS DIRECTORY
-- All tables are separate (alg alg tables)
-- =====================================================
 -- 
-- IMPORTANT: If tables already exist, skip to line 968 for payment updates only
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- 1. USER MANAGEMENT TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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
CREATE TABLE public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CATEGORY & TAG MANAGEMENT TABLES
-- =====================================================

-- Categories table
CREATE TABLE public.categories (
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
CREATE TABLE public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TOOLS MANAGEMENT TABLES
-- =====================================================

-- Tools table
CREATE TABLE public.tools (
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
CREATE TABLE public.tool_categories (
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

-- Tool Tags junction table (Many-to-Many)
CREATE TABLE public.tool_tags (
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id)
);

-- Tool views table (for detailed analytics)
CREATE TABLE public.tool_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. REVIEWS & RATINGS TABLES
-- =====================================================

-- Reviews table
CREATE TABLE public.reviews (
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
CREATE TABLE public.review_helpful (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- =====================================================
-- 5. USER INTERACTIONS TABLES
-- =====================================================

-- Favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- =====================================================
-- 6. SUBMISSIONS & PAYMENTS TABLES
-- =====================================================

-- Submissions table (for tracking tool submissions)
CREATE TABLE public.submissions (
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
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',  -- Razorpay uses INR
  payment_method TEXT,  -- e.g., 'card', 'netbanking', 'upi', etc.
  payment_provider TEXT,  -- 'razorpay'
  payment_provider_id TEXT,  -- Razorpay order_id or payment_id
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,  -- Razorpay payment_id (unique to prevent duplicates)
  listing_type TEXT DEFAULT 'paid' CHECK (listing_type IN ('free', 'paid')),
  metadata JSONB,  -- Store Razorpay order details, signature, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. BLOG MANAGEMENT TABLES
-- =====================================================

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles(id),
  category_id UUID REFERENCES public.categories(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reading_time INT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Tags junction table (Many-to-Many)
CREATE TABLE public.blog_tags (
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Blog Comments table
CREATE TABLE public.blog_comments (
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
CREATE TABLE public.blog_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

-- Blog Views table (for analytics)
CREATE TABLE public.blog_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. CONTENT MANAGEMENT TABLES
-- =====================================================

-- Frontend Content table (for managing homepage and other frontend content)
CREATE TABLE public.frontend_content (
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
-- 9. COMMUNICATION TABLES
-- =====================================================

-- Newsletter Subscribers table
CREATE TABLE public.newsletter_subscribers (
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
CREATE TABLE public.contact_messages (
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
-- 10. NOTIFICATIONS TABLE
-- =====================================================

-- Notifications table
CREATE TABLE public.notifications (
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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Categories indexes
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Tags indexes
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_name_trgm ON public.tags USING gin(name gin_trgm_ops);

-- Tools indexes
CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_tools_status ON public.tools(status);
CREATE INDEX idx_tools_created_at ON public.tools(created_at DESC);
CREATE INDEX idx_tools_rating ON public.tools(rating_avg DESC);
CREATE INDEX idx_tools_views ON public.tools(views_count DESC);
CREATE INDEX idx_tools_submitted_by ON public.tools(submitted_by);
CREATE INDEX idx_tools_listing_type ON public.tools(listing_type);
CREATE INDEX idx_tools_payment_id ON public.tools(payment_id);
CREATE INDEX idx_tools_payment_status ON public.tools(payment_status);
CREATE INDEX idx_tools_name_trgm ON public.tools USING gin(name gin_trgm_ops);
CREATE INDEX idx_tools_description_trgm ON public.tools USING gin(description gin_trgm_ops);

-- Tool Categories indexes
CREATE INDEX idx_tool_categories_tool_id ON public.tool_categories(tool_id);
CREATE INDEX idx_tool_categories_category_id ON public.tool_categories(category_id);

-- Tool Tags indexes
CREATE INDEX idx_tool_tags_tool_id ON public.tool_tags(tool_id);
CREATE INDEX idx_tool_tags_tag_id ON public.tool_tags(tag_id);

-- Tool Views indexes
CREATE INDEX idx_tool_views_tool_id ON public.tool_views(tool_id);
CREATE INDEX idx_tool_views_viewed_at ON public.tool_views(viewed_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_tool_id ON public.reviews(tool_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Review Helpful indexes
CREATE INDEX idx_review_helpful_review_id ON public.review_helpful(review_id);
CREATE INDEX idx_review_helpful_user_id ON public.review_helpful(user_id);

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_tool_id ON public.favorites(tool_id);

-- Submissions indexes
CREATE INDEX idx_submissions_tool_id ON public.submissions(tool_id);
CREATE INDEX idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX idx_submissions_status ON public.submissions(status);

-- Payments indexes
CREATE INDEX idx_payments_tool_id ON public.payments(tool_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);

-- Blog Posts indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_title_trgm ON public.blog_posts USING gin(title gin_trgm_ops);

-- Blog Tags indexes
CREATE INDEX idx_blog_tags_blog_id ON public.blog_tags(blog_id);
CREATE INDEX idx_blog_tags_tag_id ON public.blog_tags(tag_id);

-- Blog Comments indexes
CREATE INDEX idx_blog_comments_blog_id ON public.blog_comments(blog_id);
CREATE INDEX idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_id ON public.blog_comments(parent_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments(status);

-- Blog Likes indexes
CREATE INDEX idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX idx_blog_likes_user_id ON public.blog_likes(user_id);

-- Blog Views indexes
CREATE INDEX idx_blog_views_blog_id ON public.blog_views(blog_id);
CREATE INDEX idx_blog_views_viewed_at ON public.blog_views(viewed_at DESC);

-- Frontend Content indexes
CREATE INDEX idx_frontend_content_page_section ON public.frontend_content(page, section);
CREATE INDEX idx_frontend_content_page ON public.frontend_content(page);

-- Newsletter Subscribers indexes
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_verification_token ON public.newsletter_subscribers(verification_token);

-- Contact Messages indexes
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- User Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
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
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontend_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Categories RLS Policies
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Tags RLS Policies
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can delete tags"
  ON public.tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Tools RLS Policies
CREATE POLICY "Approved tools are viewable by everyone"
  ON public.tools FOR SELECT
  USING (status = 'approved' OR submitted_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Users can insert tools"
  ON public.tools FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update own tools"
  ON public.tools FOR UPDATE
  USING (auth.uid() = submitted_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Reviews RLS Policies
CREATE POLICY "Approved reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Review Helpful RLS Policies
CREATE POLICY "Review helpful votes are viewable by everyone"
  ON public.review_helpful FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert helpful votes"
  ON public.review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own helpful votes"
  ON public.review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites RLS Policies
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Blog Posts RLS Policies
CREATE POLICY "Published blog posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' OR author_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authors and admins can insert blog posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authors and admins can update blog posts"
  ON public.blog_posts FOR UPDATE
  USING (auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Blog Comments RLS Policies
CREATE POLICY "Approved blog comments are viewable by everyone"
  ON public.blog_comments FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authenticated users can insert blog comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blog comments"
  ON public.blog_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Blog Likes RLS Policies
CREATE POLICY "Blog likes are viewable by everyone"
  ON public.blog_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert blog likes"
  ON public.blog_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blog likes"
  ON public.blog_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Frontend Content RLS Policies
CREATE POLICY "Frontend content is viewable by everyone"
  ON public.frontend_content FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert frontend content"
  ON public.frontend_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update frontend content"
  ON public.frontend_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete frontend content"
  ON public.frontend_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Newsletter Subscribers RLS Policies
CREATE POLICY "Users can view own newsletter subscription"
  ON public.newsletter_subscribers FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can insert newsletter subscription"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own newsletter subscription"
  ON public.newsletter_subscribers FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Contact Messages RLS Policies
CREATE POLICY "Only admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Payments RLS Policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Submissions RLS Policies
CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = submitted_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frontend_content_updated_at BEFORE UPDATE ON public.frontend_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tool rating
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tools
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
      AND status = 'approved'
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
      AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tool_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_tool_rating();

-- Function to update category tools count
CREATE OR REPLACE FUNCTION update_category_tools_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.categories
    SET tools_count = tools_count - 1
    WHERE id = OLD.category_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.categories
    SET tools_count = tools_count + 1
    WHERE id = NEW.category_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_count
  AFTER INSERT OR DELETE ON public.tool_categories
  FOR EACH ROW EXECUTE FUNCTION update_category_tools_count();

-- Function to update tool favorites count
CREATE OR REPLACE FUNCTION update_tool_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.tools
    SET favorites_count = favorites_count - 1
    WHERE id = OLD.tool_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.tools
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.tool_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tool_favorites_count
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION update_tool_favorites_count();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpful_count
  AFTER INSERT OR DELETE ON public.review_helpful
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Function to update blog post comments count
CREATE OR REPLACE FUNCTION update_blog_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.blog_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.blog_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_comments_count
  AFTER INSERT OR DELETE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_blog_comments_count();

-- Function to update blog post likes count
CREATE OR REPLACE FUNCTION update_blog_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.blog_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.blog_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER update_tool_views_count
  AFTER INSERT ON public.tool_views
  FOR EACH ROW EXECUTE FUNCTION update_tool_views_count();

-- =====================================================
-- 12. SETTINGS TABLE
-- =====================================================

-- Settings table (for storing API keys and configuration)
CREATE TABLE public.settings (
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

-- Index for faster lookups
CREATE INDEX idx_settings_category_key ON public.settings(category, key);

-- RLS Policies for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings"
  ON public.settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
  ON public.settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- =====================================================
-- PAYMENT UPDATES FOR EXISTING DATABASES
-- Run this section if tables already exist
-- =====================================================

-- Add payment_id and payment_status columns to tools table if they don't exist
DO $$ 
BEGIN
    -- Add payment_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tools' 
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE public.tools 
        ADD COLUMN payment_id TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_tools_payment_id ON public.tools(payment_id);
    END IF;

    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tools' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.tools 
        ADD COLUMN payment_status TEXT 
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
        
        CREATE INDEX IF NOT EXISTS idx_tools_payment_status ON public.tools(payment_status);
    END IF;
END $$;

-- Update payments table default currency from USD to INR (Razorpay)
DO $$
BEGIN
    -- Check if payments table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
    ) THEN
        -- Update default currency
        ALTER TABLE public.payments 
        ALTER COLUMN currency SET DEFAULT 'INR';
        
        -- Update existing records
        UPDATE public.payments 
        SET currency = 'INR' 
        WHERE currency = 'USD' OR currency IS NULL;
        
        -- Update payment_provider to razorpay if it's stripe or null
        UPDATE public.payments 
        SET payment_provider = 'razorpay' 
        WHERE payment_provider = 'stripe' OR payment_provider IS NULL;
    END IF;
END $$;

