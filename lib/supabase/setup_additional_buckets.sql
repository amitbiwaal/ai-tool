-- =====================================================
-- COMPLETE SETUP FOR ADDITIONAL STORAGE BUCKETS
-- Run this in Supabase SQL Editor to create buckets and policies
-- =====================================================

-- =====================================================
-- 1. CREATE BUCKETS
-- =====================================================

-- Create site-assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create content-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES FOR site-assets BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload site assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site assets" ON storage.objects;

-- Create policies for site-assets
-- Public can view site assets (logos, icons, hero images, etc.)
CREATE POLICY "Public can view site assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-assets');

-- Only admins and moderators can upload site assets
CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-assets' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Only admins and moderators can update site assets
CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-assets' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  bucket_id = 'site-assets' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Only admins and moderators can delete site assets
CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-assets' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- =====================================================
-- 3. STORAGE POLICIES FOR content-images BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload content images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view content images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update content images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete content images" ON storage.objects;

-- Create policies for content-images
-- Public can view content images (for frontend display)
CREATE POLICY "Public can view content images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');

-- Only admins and moderators can upload content images
CREATE POLICY "Admins can upload content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Only admins and moderators can update content images
CREATE POLICY "Admins can update content images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  bucket_id = 'content-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Only admins and moderators can delete content images
CREATE POLICY "Admins can delete content images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- =====================================================
-- 4. BUCKET USAGE GUIDE
-- =====================================================

/*
site-assets bucket structure:
site-assets/
├── logos/
│   ├── header-logo.png
│   ├── footer-logo.png
│   └── favicon.ico
├── hero/
│   ├── hero-background.jpg
│   └── hero-overlay.png
├── sections/
│   ├── about-bg.jpg
│   ├── features-bg.png
│   └── cta-bg.jpg
└── icons/
    ├── social-icons/
    │   ├── twitter.png
    │   ├── linkedin.png
    │   └── github.png
    └── ui-icons/
        ├── arrow-right.svg
        └── check-circle.svg

content-images bucket structure:
content-images/
├── testimonials/
│   ├── testimonial-1.jpg
│   ├── testimonial-2.jpg
│   └── testimonial-3.jpg
├── banners/
│   ├── promo-banner.jpg
│   ├── seasonal-banner.png
│   └── announcement-banner.jpg
├── illustrations/
│   ├── feature-illustration-1.png
│   ├── process-diagram.svg
│   └── workflow-graphic.png
└── general/
    ├── screenshot-1.png
    ├── mockup-1.jpg
    └── graphic-1.svg
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Verify setup by running:
-- SELECT id, name, public FROM storage.buckets WHERE id IN ('site-assets', 'content-images');
