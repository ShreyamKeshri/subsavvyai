-- Migration 007: Manual Usage Tracking for Non-OAuth Services
-- Extends service_usage table to support user-reported usage data

-- Add columns for manual usage tracking
ALTER TABLE public.service_usage
ADD COLUMN IF NOT EXISTS usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'rarely', 'never')),
ADD COLUMN IF NOT EXISTS last_used_date DATE,
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS manual_usage_note TEXT;

-- Add comment explaining the columns
COMMENT ON COLUMN public.service_usage.usage_frequency IS 'User-reported usage frequency: daily, weekly, monthly, rarely, never';
COMMENT ON COLUMN public.service_usage.last_used_date IS 'User-reported last use date';
COMMENT ON COLUMN public.service_usage.is_manual IS 'TRUE if manually reported, FALSE if from OAuth API';
COMMENT ON COLUMN public.service_usage.manual_usage_note IS 'Optional user notes about their usage';

-- Create index for querying manual vs OAuth usage
CREATE INDEX IF NOT EXISTS idx_service_usage_is_manual ON public.service_usage(is_manual);

-- Create index for last used date queries
CREATE INDEX IF NOT EXISTS idx_service_usage_last_used ON public.service_usage(last_used_date) WHERE is_manual = TRUE;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_usage_updated_at ON public.service_usage;
CREATE TRIGGER service_usage_updated_at
  BEFORE UPDATE ON public.service_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_service_usage_updated_at();

-- RLS policy for manual usage (users can insert their own manual usage data)
CREATE POLICY "Users can insert their own manual usage"
  ON public.service_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_manual = TRUE);

CREATE POLICY "Users can update their own manual usage"
  ON public.service_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_manual = TRUE);
