-- =====================================================
-- DROP EXISTING STORAGE POLICIES FOR blog-images BUCKET
-- Run this first if you need to recreate policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

-- Also drop the old policies if they have different names
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own blog images" ON storage.objects;

