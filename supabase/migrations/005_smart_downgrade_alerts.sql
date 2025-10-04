-- Migration 005: Smart Downgrade Alerts
-- Adds tables for OAuth tokens, service usage tracking, and AI optimization recommendations

-- 1. OAUTH TOKENS TABLE
-- Store encrypted OAuth tokens for external service APIs (Spotify, Netflix, etc.)
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'spotify', 'netflix', etc.
  access_token TEXT NOT NULL, -- Will be encrypted in application layer
  refresh_token TEXT, -- Will be encrypted in application layer
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT, -- OAuth scopes granted
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_service_oauth UNIQUE (user_id, service_id, provider)
);

-- 2. SERVICE USAGE TABLE
-- Track actual usage data fetched from external APIs
CREATE TABLE IF NOT EXISTS public.service_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  usage_hours NUMERIC(10, 2), -- Hours of usage (e.g., listening/watching time)
  usage_sessions INTEGER, -- Number of sessions/logins
  usage_count INTEGER, -- Generic usage counter
  usage_data JSONB, -- Store raw usage data from API for flexibility
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. OPTIMIZATION RECOMMENDATIONS TABLE
-- Store AI-generated recommendations for subscription optimization
CREATE TABLE IF NOT EXISTS public.optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('downgrade', 'upgrade', 'cancel', 'bundle', 'overlap', 'price_alert')),
  title TEXT NOT NULL, -- e.g., "Downgrade Spotify to Free"
  description TEXT NOT NULL, -- Detailed explanation
  current_cost NUMERIC(10, 2) NOT NULL,
  optimized_cost NUMERIC(10, 2) NOT NULL,
  monthly_savings NUMERIC(10, 2) NOT NULL,
  annual_savings NUMERIC(10, 2) NOT NULL,
  confidence_score NUMERIC(3, 2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1), -- AI confidence 0-1
  details JSONB, -- Store additional details like usage stats, reasoning, etc.
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'dismissed', 'expired')),
  expires_at TIMESTAMPTZ, -- Recommendations can expire (e.g., after 30 days)
  accepted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. UPDATE SERVICES TABLE
-- Add fields to support OAuth integration and usage tracking
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS api_provider TEXT, -- 'spotify', 'netflix', etc.
  ADD COLUMN IF NOT EXISTS supports_usage_tracking BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS oauth_authorization_url TEXT,
  ADD COLUMN IF NOT EXISTS oauth_token_url TEXT,
  ADD COLUMN IF NOT EXISTS oauth_scopes TEXT[], -- Required OAuth scopes
  ADD COLUMN IF NOT EXISTS api_base_url TEXT,
  ADD COLUMN IF NOT EXISTS usage_api_endpoint TEXT;

-- INDEXES for better query performance
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_service_id ON public.oauth_tokens(service_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_provider ON public.oauth_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON public.oauth_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_service_usage_user_id ON public.service_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_service_usage_subscription_id ON public.service_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_service_usage_service_id ON public.service_usage(service_id);
CREATE INDEX IF NOT EXISTS idx_service_usage_period ON public.service_usage(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_optimization_recs_user_id ON public.optimization_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_subscription_id ON public.optimization_recommendations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_status ON public.optimization_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_type ON public.optimization_recommendations(type);

-- TRIGGERS: Auto-update updated_at timestamp
CREATE TRIGGER update_oauth_tokens_updated_at
  BEFORE UPDATE ON public.oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_service_usage_updated_at
  BEFORE UPDATE ON public.service_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_optimization_recs_updated_at
  BEFORE UPDATE ON public.optimization_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on new tables
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- OAuth Tokens Policies (Highly sensitive - only owner can access)
CREATE POLICY "Users can view their own OAuth tokens"
  ON public.oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OAuth tokens"
  ON public.oauth_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth tokens"
  ON public.oauth_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth tokens"
  ON public.oauth_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Service Usage Policies
CREATE POLICY "Users can view their own service usage"
  ON public.service_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service usage"
  ON public.service_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service usage"
  ON public.service_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service usage"
  ON public.service_usage FOR DELETE
  USING (auth.uid() = user_id);

-- Optimization Recommendations Policies
CREATE POLICY "Users can view their own recommendations"
  ON public.optimization_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
  ON public.optimization_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.optimization_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
  ON public.optimization_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.oauth_tokens IS 'OAuth access and refresh tokens for external service APIs';
COMMENT ON TABLE public.service_usage IS 'Usage data fetched from external service APIs for optimization';
COMMENT ON TABLE public.optimization_recommendations IS 'AI-generated recommendations for subscription optimization';

COMMENT ON COLUMN public.oauth_tokens.access_token IS 'OAuth access token - should be encrypted in application layer';
COMMENT ON COLUMN public.oauth_tokens.refresh_token IS 'OAuth refresh token - should be encrypted in application layer';
COMMENT ON COLUMN public.service_usage.usage_hours IS 'Hours of usage (listening/watching time)';
COMMENT ON COLUMN public.service_usage.usage_data IS 'Raw usage data from API for flexibility';
COMMENT ON COLUMN public.optimization_recommendations.confidence_score IS 'AI confidence level between 0 and 1';
COMMENT ON COLUMN public.optimization_recommendations.details IS 'Additional details like usage stats, reasoning, alternative plans';

-- =====================================================
-- FIX: Analytics Nested Aggregate Error
-- =====================================================
-- The original refresh_user_analytics function had nested aggregates
-- causing PostgreSQL error 42803. Fixed by using subquery pattern.

CREATE OR REPLACE FUNCTION refresh_user_analytics(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_monthly_spend NUMERIC;
  v_yearly_spend NUMERIC;
  v_active_count INTEGER;
  v_category_breakdown JSONB;
BEGIN
  -- Calculate total monthly spend
  SELECT
    COALESCE(SUM(calculate_monthly_cost(cost, billing_cycle)), 0)
  INTO v_monthly_spend
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND deleted_at IS NULL;

  -- Calculate yearly spend
  v_yearly_spend := v_monthly_spend * 12;

  -- Count active subscriptions
  SELECT COUNT(*)
  INTO v_active_count
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND deleted_at IS NULL;

  -- Calculate category breakdown (FIXED: use subquery to avoid nested aggregates)
  SELECT jsonb_object_agg(
    category,
    category_total
  )
  INTO v_category_breakdown
  FROM (
    SELECT
      COALESCE(s.category::text, 'Other') as category,
      COALESCE(SUM(calculate_monthly_cost(sub.cost, sub.billing_cycle)), 0) as category_total
    FROM public.subscriptions sub
    LEFT JOIN public.services s ON sub.service_id = s.id
    WHERE sub.user_id = p_user_id
      AND sub.status = 'active'
      AND sub.deleted_at IS NULL
    GROUP BY s.category
  ) category_sums;

  -- Upsert into cache
  INSERT INTO public.user_analytics_cache (
    user_id,
    total_monthly_spend,
    total_yearly_spend,
    active_subscriptions_count,
    category_breakdown,
    last_calculated_at
  ) VALUES (
    p_user_id,
    v_monthly_spend,
    v_yearly_spend,
    v_active_count,
    v_category_breakdown,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_monthly_spend = EXCLUDED.total_monthly_spend,
    total_yearly_spend = EXCLUDED.total_yearly_spend,
    active_subscriptions_count = EXCLUDED.active_subscriptions_count,
    category_breakdown = EXCLUDED.category_breakdown,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER allows bypassing RLS for cache updates

COMMENT ON FUNCTION refresh_user_analytics IS 'Recalculates user subscription analytics. Fixed nested aggregate error. Runs with SECURITY DEFINER to bypass RLS on cache table.';
