-- Migration 010: Gmail Scan Tracking
-- Created: October 25, 2025
-- Purpose: Track if user has completed at least one Gmail scan

ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS gmail_scan_completed BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN public.user_preferences.gmail_scan_completed IS 'Whether user has completed at least one Gmail scan for subscriptions';
