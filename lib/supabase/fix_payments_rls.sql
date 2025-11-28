-- =====================================================
-- FIX PAYMENTS RLS POLICIES
-- =====================================================
-- This ensures payments can be managed by admins/moderators
-- =====================================================

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_update" ON public.payments;
DROP POLICY IF EXISTS "payments_delete" ON public.payments;

-- Policy 1: Users can view their own payments, admins can view all
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.is_admin()
  );

-- Policy 2: Users can insert their own payments
CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Only admins and moderators can update payments
CREATE POLICY "payments_update" ON public.payments
  FOR UPDATE
  USING (public.is_admin());

-- Policy 4: Only admins and moderators can delete payments
CREATE POLICY "payments_delete" ON public.payments
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
WHERE tablename = 'payments'
ORDER BY policyname;

-- =====================================================
-- END OF FIX
-- =====================================================

