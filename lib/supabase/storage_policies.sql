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
-- STORAGE POLICIES FOR site-assets BUCKET
-- For logos, hero images, section backgrounds, icons, branding
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload site assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site assets" ON storage.objects;

-- Create policies for site-assets
-- Public can view site assets (logos, icons, etc.)
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
-- STORAGE POLICIES FOR content-images BUCKET
-- For general content images used in admin content management
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
-- END OF STORAGE POLICIES
-- =====================================================

