-- =====================================================
-- ADD SEO COLUMNS TO blog_posts TABLE
-- =====================================================
-- Run this if you get error: "Could not find the 'seo_description' column"
-- =====================================================

-- Add seo_title column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN seo_title TEXT;
    RAISE NOTICE 'Added seo_title column to blog_posts';
  ELSE
    RAISE NOTICE 'seo_title column already exists';
  END IF;
END $$;

-- Add seo_description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN seo_description TEXT;
    RAISE NOTICE 'Added seo_description column to blog_posts';
  ELSE
    RAISE NOTICE 'seo_description column already exists';
  END IF;
END $$;

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'blog_posts'
  AND column_name IN ('seo_title', 'seo_description')
ORDER BY column_name;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. After running this, refresh your Supabase schema cache:
--    - Go to Supabase Dashboard > Settings > API
--    - Click "Reload schema" or wait a few minutes
-- 2. If using Supabase CLI, run: supabase db reset (in development)
-- 3. The columns are nullable, so existing rows won't be affected
-- =====================================================

