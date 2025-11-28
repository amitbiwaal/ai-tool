-- =====================================================
-- FIX: Categories Table RLS Policies
-- Run this in Supabase SQL Editor to fix RLS policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "categories_delete" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- Create INSERT policy for admins/moderators
CREATE POLICY "categories_insert" 
ON public.categories FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Create UPDATE policy for admins/moderators
CREATE POLICY "categories_update" 
ON public.categories FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Create DELETE policy for admins/moderators
CREATE POLICY "categories_delete" 
ON public.categories FOR DELETE 
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
--    - Insert new categories
--    - Update existing categories
--    - Delete categories
-- 2. Public SELECT policy already exists (everyone can view)
-- 3. Make sure the is_admin() function exists, or use the EXISTS check above

