-- =====================================================
-- SYNC MISSING PROFILES - CREATE PROFILES FOR AUTH USERS
-- =====================================================
-- This will create profiles for all auth.users that don't have profiles
-- =====================================================

-- Step 1: Check current status
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) as missing_profiles_count;

-- Step 2: Show which users are missing profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  'Missing Profile' as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 3: Create missing profiles
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

-- Step 4: Verify sync completed
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ SYNCED - All users have profiles'
    ELSE '❌ NOT SYNCED - Count mismatch'
  END as sync_status;

-- Step 5: Show all profiles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- =====================================================
-- END OF SYNC
-- =====================================================

