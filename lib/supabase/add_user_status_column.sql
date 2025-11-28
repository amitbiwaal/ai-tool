-- =====================================================
-- ADD STATUS COLUMN TO PROFILES TABLE
-- =====================================================
-- This script adds a status column to the profiles table
-- to support user ban/unban functionality
-- =====================================================

-- Add status column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended'));

-- Update existing rows to have 'active' status
UPDATE public.profiles 
SET status = 'active' 
WHERE status IS NULL;

-- Make status NOT NULL after setting defaults
ALTER TABLE public.profiles 
ALTER COLUMN status SET DEFAULT 'active',
ALTER COLUMN status SET NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- =====================================================
-- END OF MIGRATION
-- =====================================================

