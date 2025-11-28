-- =====================================================
-- CHECK USERS SYNC STATUS
-- =====================================================
-- Run this to check if all auth.users have profiles
-- =====================================================

-- Step 1: Count auth.users
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Step 2: Count profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Step 3: Find users in auth.users without profiles (MISSING PROFILES)
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  'Missing Profile - Needs to be created' as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 4: Find profiles without auth users (ORPHANED PROFILES - should not exist)
SELECT 
  p.id,
  p.email,
  p.created_at as profile_created_at,
  'Orphaned Profile - No auth user' as status
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- Step 5: Create missing profiles for auth.users that don't have profiles
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
  ) as full_name,
  'user' as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 6: Verify after sync
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ SYNCED - All users have profiles'
    ELSE '❌ NOT SYNCED - Count mismatch'
  END as sync_status;

-- =====================================================
-- END OF CHECK
-- =====================================================

