-- Performance Indexes Migration
-- Run with: supabase db push
--
-- This migration adds composite and partial indexes to improve query performance
-- All changes are additive and do not affect existing functionality

-- ============================================
-- TASKS TABLE - Composite Indexes
-- ============================================

-- Composite index for filtering tasks by user + status (most common query pattern)
-- Speeds up: SELECT * FROM tasks WHERE user_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_tasks_user_status
ON public.tasks (user_id, status);

-- Composite index for filtering tasks by user + priority
-- Speeds up: SELECT * FROM tasks WHERE user_id = ? AND priority = ?
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority
ON public.tasks (user_id, priority);

-- Composite index for ordering tasks by user + order field
-- Speeds up: SELECT * FROM tasks WHERE user_id = ? ORDER BY "order"
CREATE INDEX IF NOT EXISTS idx_tasks_user_order
ON public.tasks (user_id, "order");

-- ============================================
-- TASKS TABLE - Partial Indexes
-- ============================================

-- Partial index for active tasks only (pending or in_progress)
-- Smaller index size, faster queries for active task lists
-- Speeds up: SELECT * FROM tasks WHERE user_id = ? AND status IN ('pending', 'in_progress')
CREATE INDEX IF NOT EXISTS idx_tasks_active
ON public.tasks (user_id, due_date)
WHERE status IN ('pending', 'in_progress');

-- Partial index for overdue tasks detection
-- Speeds up: SELECT * FROM tasks WHERE user_id = ? AND due_date < NOW() AND status NOT IN ('completed', 'canceled')
CREATE INDEX IF NOT EXISTS idx_tasks_overdue
ON public.tasks (user_id, due_date)
WHERE status IN ('pending', 'in_progress') AND due_date IS NOT NULL;

-- ============================================
-- SUBSCRIPTIONS TABLE - Missing Indexes
-- ============================================

-- Index for user subscription lookups (missing from initial migration)
-- Speeds up: SELECT * FROM subscriptions WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
ON public.subscriptions (user_id);

-- Partial index for active subscriptions only
-- Speeds up premium status checks
-- Speeds up: SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
ON public.subscriptions (user_id)
WHERE status = 'active';

-- ============================================
-- NOTIFICATION_LOGS TABLE - Missing Indexes
-- ============================================

-- Index for user notification history with date ordering
-- Speeds up: SELECT * FROM notification_logs WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_created
ON public.notification_logs (user_id, created_at DESC);

-- ============================================
-- PUSH_TOKENS TABLE - Token Lookup
-- ============================================

-- Index for token lookups (used by send-notifications function)
-- Speeds up: SELECT token FROM push_tokens WHERE user_id = ?
-- Note: user_id already has UNIQUE constraint, but explicit index helps
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id
ON public.push_tokens (user_id);

-- ============================================
-- PROFILES TABLE - Email Lookup
-- ============================================

-- Index for email lookups (if searching users by email)
-- Speeds up: SELECT * FROM profiles WHERE email = ?
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles (email);
