-- =====================================================
-- FIX TOOLS RLS POLICY FOR USER SUBMISSIONS
-- =====================================================
-- This ensures users can view their own submitted tools
-- regardless of status (pending, approved, rejected)
-- =====================================================

-- Drop existing tools_select policy
DROP POLICY IF EXISTS "tools_select" ON public.tools;

-- Create new policy that allows:
-- 1. Public to view approved tools
-- 2. Users to view their own tools (all statuses)
-- 3. Admins to view all tools
CREATE POLICY "tools_select" ON public.tools
  FOR SELECT
  USING (
    status = 'approved' OR 
    submitted_by = auth.uid() OR 
    public.is_admin()
  );

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tools' AND policyname = 'tools_select';

-- =====================================================
-- END OF FIX
-- =====================================================

