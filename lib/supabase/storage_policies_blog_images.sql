-- =====================================================
-- SUPABASE STORAGE POLICIES FOR blog-images BUCKET
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, make sure the blog-images bucket exists
-- If it doesn't exist, create it in Supabase Dashboard > Storage > New Bucket
-- Bucket name: blog-images
-- Public bucket: Yes (for public access to images)

-- =====================================================
-- 1. PUBLIC VIEW POLICY (SELECT)
-- =====================================================
-- Anyone can view blog images (public access)
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- =====================================================
-- 2. ADMIN UPLOAD POLICY (INSERT)
-- =====================================================
-- Only admins and moderators can upload blog images
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

-- =====================================================
-- 3. ADMIN UPDATE POLICY (UPDATE)
-- =====================================================
-- Only admins and moderators can update blog images
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

-- =====================================================
-- 4. ADMIN DELETE POLICY (DELETE)
-- =====================================================
-- Only admins and moderators can delete blog images
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

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Make sure the 'blog-images' bucket exists in Supabase Storage
-- 2. Set the bucket to 'Public' in bucket settings
-- 3. These policies ensure:
--    - Public can view all blog images (for frontend display)
--    - Only admins/moderators can upload, update, or delete images
-- 4. If you get "policy already exists" error, drop existing policies first:
--    DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
--    DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
--    DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
--    DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

