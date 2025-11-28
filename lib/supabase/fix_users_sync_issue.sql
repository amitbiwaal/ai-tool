-- =====================================================
-- FIX USERS SYNC ISSUE - ADMIN PANEL
-- =====================================================
-- This ensures all users from auth.users are synced to profiles table
-- =====================================================

-- Step 1: Check for users in auth.users that don't have profiles
-- Create missing profiles for existing auth users
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'user' as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify profiles_select policy allows all users to view profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles 
FOR SELECT 
USING (true);

-- Step 3: Ensure profiles_update policy allows admins
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_update" ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());

-- Step 4: Verify is_admin() function exists and works
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Check current profiles count
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderator_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM public.profiles;

-- Step 6: Check auth.users count
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if there are users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  'Missing Profile' as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Check if there are profiles without auth users (orphaned)
SELECT 
  p.id,
  p.email,
  p.created_at as profile_created_at,
  'Orphaned Profile' as status
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- =====================================================
-- END OF FIX
-- =====================================================

