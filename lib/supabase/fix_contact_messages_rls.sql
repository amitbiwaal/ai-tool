-- =====================================================
-- FIX CONTACT MESSAGES RLS POLICIES
-- =====================================================
-- This ensures contact messages can be inserted by anyone
-- and viewed/updated/deleted by admins only
-- =====================================================

-- Enable RLS on contact_messages table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_update" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_delete" ON public.contact_messages;

-- Policy 1: Anyone can insert contact messages (public form)
CREATE POLICY "contact_messages_insert" ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Only admins and moderators can view contact messages
CREATE POLICY "contact_messages_select" ON public.contact_messages
  FOR SELECT
  USING (public.is_admin());

-- Policy 3: Only admins and moderators can update contact messages
CREATE POLICY "contact_messages_update" ON public.contact_messages
  FOR UPDATE
  USING (public.is_admin());

-- Policy 4: Only admins and moderators can delete contact messages
CREATE POLICY "contact_messages_delete" ON public.contact_messages
  FOR DELETE
  USING (public.is_admin());

-- Verify policies were created
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
WHERE tablename = 'contact_messages'
ORDER BY policyname;

-- =====================================================
-- END OF FIX
-- =====================================================

