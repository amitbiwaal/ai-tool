-- =====================================================
-- FIX PROFILES INSERT RLS POLICY FOR ADMIN USER CREATION
-- =====================================================
-- This allows admins to create user profiles when creating new users
-- =====================================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- Create new insert policy that allows:
-- 1. Users to insert their own profile (auth.uid() = id)
-- 2. Admins/moderators to insert any profile (for user creation)
CREATE POLICY "profiles_insert" ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
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
WHERE tablename = 'profiles' AND policyname = 'profiles_insert';

-- =====================================================
-- NOTE: Service role key bypasses RLS automatically
-- But this policy allows admin users to also create profiles
-- =====================================================
-- END OF FIX
-- =====================================================

