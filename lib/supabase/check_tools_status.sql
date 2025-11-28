-- =====================================================
-- CHECK TOOLS STATUS AND LISTING TYPE
-- =====================================================
-- Run this to diagnose why tools are not showing on frontend
-- =====================================================

-- Check all tools with their status and listing_type
SELECT 
  id,
  name,
  slug,
  status,
  listing_type,
  payment_status,
  is_featured,
  is_trending,
  created_at,
  approved_at,
  submitted_by
FROM public.tools
ORDER BY created_at DESC;

-- Check approved tools specifically
SELECT 
  id,
  name,
  slug,
  status,
  listing_type,
  payment_status,
  is_featured,
  is_trending,
  created_at,
  approved_at
FROM public.tools
WHERE status = 'approved'
ORDER BY created_at DESC;

-- Check if approved tools have categories assigned
SELECT 
  t.id,
  t.name,
  t.status,
  t.listing_type,
  COUNT(tc.category_id) as category_count
FROM public.tools t
LEFT JOIN public.tool_categories tc ON t.id = tc.tool_id
WHERE t.status = 'approved'
GROUP BY t.id, t.name, t.status, t.listing_type
ORDER BY t.created_at DESC;

-- Check tools without categories (these might not show properly)
SELECT 
  t.id,
  t.name,
  t.status,
  t.listing_type,
  COUNT(tc.category_id) as category_count
FROM public.tools t
LEFT JOIN public.tool_categories tc ON t.id = tc.tool_id
WHERE t.status = 'approved'
GROUP BY t.id, t.name, t.status, t.listing_type
HAVING COUNT(tc.category_id) = 0;

-- =====================================================
-- FIX: Update listing_type for approved tools if NULL
-- =====================================================
-- If listing_type is NULL, set it to 'free' by default
-- Paid tools should have listing_type = 'paid' based on payment_status
UPDATE public.tools
SET listing_type = CASE 
  WHEN payment_status = 'completed' THEN 'paid'
  ELSE 'free'
END
WHERE status = 'approved' 
  AND (listing_type IS NULL OR listing_type = '');

-- Also ensure all approved tools have listing_type set
UPDATE public.tools
SET listing_type = 'free'
WHERE status = 'approved' 
  AND listing_type IS NULL;

-- Verify the update
SELECT 
  id,
  name,
  status,
  listing_type,
  payment_status,
  is_featured,
  created_at
FROM public.tools
WHERE status = 'approved'
ORDER BY created_at DESC;

-- =====================================================
-- CHECK RLS POLICIES FOR TOOLS TABLE
-- =====================================================
-- Verify that RLS is enabled and policies are correct

-- Check if RLS is enabled on tools table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'tools';

-- List all RLS policies on tools table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'tools'
ORDER BY policyname;

-- Check if tools_select policy exists and allows public access
SELECT 
  policyname,
  cmd,
  qual,
  CASE 
    WHEN qual LIKE '%status%approved%' OR qual = 'true' THEN 'Public access allowed'
    ELSE 'Restricted access'
  END as access_level
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'tools'
  AND policyname = 'tools_select';

-- Test RLS policy: Try to select approved tools (should work for all users)
-- This simulates what the frontend API does
SELECT 
  COUNT(*) as total_approved_tools_visible,
  'Should match count from approved tools query above' as note
FROM public.tools
WHERE status = 'approved';

-- Check if there are any tools that should be visible but aren't due to RLS
-- Compare this with the approved tools count
SELECT 
  (SELECT COUNT(*) FROM public.tools WHERE status = 'approved') as approved_count,
  (SELECT COUNT(*) FROM public.tools WHERE status = 'approved' AND listing_type IS NOT NULL) as with_listing_type,
  'If these numbers differ, check RLS policies' as note;

-- =====================================================
-- FIX RLS POLICY IF NEEDED
-- =====================================================
-- If tools_select policy doesn't allow public access to approved tools,
-- run this to fix it (uncomment if needed):

/*
-- Drop existing tools_select policy if it exists
DROP POLICY IF EXISTS "tools_select" ON public.tools;

-- Create new policy that allows public access to approved tools
CREATE POLICY "tools_select" ON public.tools
FOR SELECT
USING (
  status = 'approved' OR 
  submitted_by = auth.uid() OR 
  public.is_admin()
);
*/

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Tools must have status = 'approved' to show on frontend
-- 2. Tools should have listing_type = 'free' or 'paid'
-- 3. Tools should have at least one category assigned
-- 4. Check browser console for API errors
-- 5. RLS policy "tools_select" must allow public SELECT on approved tools
-- 6. If RLS is blocking, the policy should be: status = 'approved' OR submitted_by = auth.uid() OR is_admin()
-- =====================================================

