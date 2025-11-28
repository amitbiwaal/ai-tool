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
-- NOTES:
-- =====================================================
-- 1. Tools must have status = 'approved' to show on frontend
-- 2. Tools should have listing_type = 'free' or 'paid'
-- 3. Tools should have at least one category assigned
-- 4. Check browser console for API errors
-- 5. Check Supabase RLS policies if tools still don't show
-- =====================================================

