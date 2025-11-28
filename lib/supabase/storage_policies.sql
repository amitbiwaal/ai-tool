-- =====================================================
-- STORAGE POLICIES FOR SUPABASE STORAGE BUCKETS
-- This script safely creates policies (drops if exists first)
-- =====================================================

-- =====================================================
-- STORAGE POLICIES FOR tool-images BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload tool images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view tool images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own tool images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own tool images" ON storage.objects;

-- Create policies for tool-images
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

-- =====================================================
-- STORAGE POLICIES FOR blog-images BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

-- Create policies for blog-images
-- Public can view blog images (for frontend display)
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

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
-- STORAGE POLICIES FOR user-avatars BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Create policies for user-avatars
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
-- END OF STORAGE POLICIES
-- =====================================================

