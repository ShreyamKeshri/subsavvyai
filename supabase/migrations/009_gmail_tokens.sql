-- Migration 009: Gmail OAuth Tokens Storage
-- Created: October 24, 2025
-- Purpose: Store encrypted Gmail OAuth tokens for email scanning

-- Create gmail_tokens table
CREATE TABLE IF NOT EXISTS public.gmail_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  access_token TEXT NOT NULL,  -- Will be encrypted using AES-256-GCM
  refresh_token TEXT NOT NULL, -- Will be encrypted using AES-256-GCM
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmail_tokens_user_id ON public.gmail_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_tokens_expires_at ON public.gmail_tokens(expires_at);

-- Enable Row-Level Security
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own tokens
CREATE POLICY "Users can view own Gmail tokens"
  ON public.gmail_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Gmail tokens"
  ON public.gmail_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Gmail tokens"
  ON public.gmail_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own Gmail tokens"
  ON public.gmail_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gmail_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gmail_tokens_updated_at_trigger
  BEFORE UPDATE ON public.gmail_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_gmail_tokens_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.gmail_tokens IS 'Stores encrypted OAuth tokens for Gmail API access';
COMMENT ON COLUMN public.gmail_tokens.access_token IS 'Encrypted access token (AES-256-GCM)';
COMMENT ON COLUMN public.gmail_tokens.refresh_token IS 'Encrypted refresh token (AES-256-GCM)';
COMMENT ON COLUMN public.gmail_tokens.expires_at IS 'Token expiration timestamp';
