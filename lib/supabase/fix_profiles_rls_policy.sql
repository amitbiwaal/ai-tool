-- =====================================================
-- FIX PROFILES RLS POLICY FOR ADMIN ACCESS
-- =====================================================
-- This script ensures that all users can be viewed by admin/moderator
-- =====================================================

-- Drop existing policies if they exist (in case of duplicates)
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a single, clear policy that allows everyone to SELECT profiles
-- This is safe because profiles table only contains public information
CREATE POLICY "profiles_select" ON public.profiles 
FOR SELECT 
USING (true);

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
WHERE tablename = 'profiles' AND policyname = 'profiles_select';

-- =====================================================
-- END OF FIX
-- =====================================================

