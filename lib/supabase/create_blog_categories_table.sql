-- =====================================================
-- CREATE BLOG CATEGORIES TABLE
-- Separate categories for blog posts vs tools
-- =====================================================

-- Create blog_categories table
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

-- Update blog_posts table to reference blog_categories instead of categories
-- First, drop the old foreign key constraint if it exists
DO $$ 
BEGIN
  -- Drop old constraint if it references categories table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey' 
    AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE public.blog_posts DROP CONSTRAINT blog_posts_category_id_fkey;
  END IF;
END $$;

-- Add new foreign key to blog_categories
ALTER TABLE public.blog_posts 
  ADD CONSTRAINT blog_posts_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES public.blog_categories(id) 
  ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name ON public.blog_categories(name);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "blog_categories_select" ON public.blog_categories;
  DROP POLICY IF EXISTS "blog_categories_insert" ON public.blog_categories;
  DROP POLICY IF EXISTS "blog_categories_update" ON public.blog_categories;
  DROP POLICY IF EXISTS "blog_categories_delete" ON public.blog_categories;
END $$;

-- RLS Policies for blog_categories
CREATE POLICY "blog_categories_select" ON public.blog_categories 
  FOR SELECT USING (true);

CREATE POLICY "blog_categories_insert" ON public.blog_categories 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "blog_categories_update" ON public.blog_categories 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "blog_categories_delete" ON public.blog_categories 
  FOR DELETE USING (public.is_admin());

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

-- Trigger to update posts count
DROP TRIGGER IF EXISTS update_blog_category_count ON public.blog_posts;
CREATE TRIGGER update_blog_category_count
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_category_posts_count();

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER update_blog_categories_updated_at 
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default blog categories
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
-- END OF MIGRATION
-- =====================================================

