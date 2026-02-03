-- Security Fixes Migration
-- Addresses critical security issues and schema improvements
-- Run with: supabase db push

-- ============================================
-- FIX 1: Allow multi-device push tokens
-- ============================================
-- The current constraint only allows one push token per user,
-- which prevents multi-device support. Change to unique on (user_id, token) pair.

-- Drop the existing unique constraint on user_id
ALTER TABLE public.push_tokens DROP CONSTRAINT IF EXISTS push_tokens_user_id_key;

-- Add new composite unique constraint to allow multiple tokens per user
-- but prevent duplicate tokens for the same user
ALTER TABLE public.push_tokens
  ADD CONSTRAINT push_tokens_user_token_unique UNIQUE (user_id, token);

-- Add index for efficient token lookups
CREATE INDEX IF NOT EXISTS push_tokens_token_idx ON public.push_tokens(token);

-- ============================================
-- FIX 2: Make subscriptions.user_id NOT NULL
-- ============================================
-- Subscriptions without a user make no sense and could lead to orphaned data

-- First, delete any orphaned subscriptions (should be none in practice)
DELETE FROM public.subscriptions WHERE user_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE public.subscriptions ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- FIX 3: Add unique constraint on profiles.email
-- ============================================
-- Prevent duplicate emails in profiles table
-- This shouldn't happen since profiles.email mirrors auth.users.email,
-- but adds an extra layer of data integrity

-- First, check for and handle any duplicates (keep the newest one)
DELETE FROM public.profiles a
USING public.profiles b
WHERE a.email = b.email
  AND a.email IS NOT NULL
  AND a.created_at < b.created_at;

-- Add unique constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- ============================================
-- FIX 4: Remove email enumeration vulnerability
-- ============================================
-- The check_email_exists() function allows attackers to enumerate
-- which email addresses are registered in the system.
-- This is a security risk that enables targeted attacks.

-- Revoke permissions first (only if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_email_exists') THEN
    REVOKE EXECUTE ON FUNCTION check_email_exists(text) FROM anon, authenticated;
  END IF;
END $$;

-- Drop the function (IF EXISTS handles non-existence gracefully)
DROP FUNCTION IF EXISTS check_email_exists(text);

-- ============================================
-- ADDITIONAL SECURITY: Add user_id index to subscriptions
-- ============================================
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON CONSTRAINT push_tokens_user_token_unique ON public.push_tokens IS
  'Allows multiple push tokens per user (multi-device) while preventing duplicates';

COMMENT ON CONSTRAINT profiles_email_unique ON public.profiles IS
  'Ensures email uniqueness in profiles, mirroring auth.users constraint';
