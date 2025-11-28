-- =====================================================
-- FIX: Tags Table RLS Policies
-- Run this in Supabase SQL Editor to fix RLS policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tags_insert" ON public.tags;
DROP POLICY IF EXISTS "tags_update" ON public.tags;
DROP POLICY IF EXISTS "tags_delete" ON public.tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;

-- Create INSERT policy for admins/moderators
CREATE POLICY "tags_insert" 
ON public.tags FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Create UPDATE policy for admins/moderators
CREATE POLICY "tags_update" 
ON public.tags FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Create DELETE policy for admins/moderators
CREATE POLICY "tags_delete" 
ON public.tags FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. These policies allow only admins and moderators to:
--    - Insert new tags
--    - Update existing tags
--    - Delete tags
-- 2. Public SELECT policy already exists (everyone can view)
-- 3. Make sure the is_admin() function exists, or use the EXISTS check above

