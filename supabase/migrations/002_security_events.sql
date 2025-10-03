-- Security Events Table
-- Stores all security-related events for monitoring and auditing

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_user_event ON public.security_events(user_id, event_type);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role can write, users can read their own events
CREATE POLICY "Service role can insert security events"
  ON public.security_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Users can view own security events"
  ON public.security_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policy (for future admin dashboard)
CREATE POLICY "Admins can view all security events"
  ON public.security_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Automatic cleanup: Delete security events older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.security_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-security-events', '0 0 * * *', 'SELECT cleanup_old_security_events()');

-- Add comment
COMMENT ON TABLE public.security_events IS 'Security audit log for monitoring authentication and authorization events';
