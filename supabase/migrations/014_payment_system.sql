-- =====================================================
-- PAYMENT SYSTEM MIGRATION
-- Version: 014
-- Date: October 30, 2025
-- Description: Razorpay payment system with tiered subscriptions
-- =====================================================

-- =====================================================
-- CUSTOM TYPES FOR PAYMENT SYSTEM
-- =====================================================

-- Subscription tier enum
CREATE TYPE subscription_tier AS ENUM (
  'free',
  'pro',
  'premium'
);

-- Payment transaction status
CREATE TYPE transaction_status AS ENUM (
  'initiated',
  'authorized',
  'captured',
  'failed',
  'refunded'
);

-- =====================================================
-- EXTEND PROFILES TABLE WITH TIER INFORMATION
-- =====================================================

-- Add tier and trial fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tier subscription_tier DEFAULT 'free' NOT NULL,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_ends ON public.profiles(subscription_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_razorpay_customer ON public.profiles(razorpay_customer_id);

-- Add comments
COMMENT ON COLUMN public.profiles.tier IS 'User subscription tier (free, pro, premium)';
COMMENT ON COLUMN public.profiles.trial_ends_at IS 'When the 7-day trial ends (for Pro tier)';
COMMENT ON COLUMN public.profiles.subscription_started_at IS 'When the paid subscription started';
COMMENT ON COLUMN public.profiles.subscription_ends_at IS 'When the current subscription period ends';
COMMENT ON COLUMN public.profiles.razorpay_customer_id IS 'Razorpay customer ID for recurring payments';
COMMENT ON COLUMN public.profiles.razorpay_subscription_id IS 'Razorpay subscription ID for recurring billing';

-- =====================================================
-- PAYMENT TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Razorpay IDs
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,

  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status transaction_status DEFAULT 'initiated' NOT NULL,

  -- Subscription details
  tier subscription_tier NOT NULL,
  billing_cycle TEXT NOT NULL, -- 'monthly' or 'yearly'

  -- Metadata
  payment_method TEXT, -- 'card', 'upi', 'netbanking', etc.
  error_code TEXT,
  error_description TEXT,
  metadata JSONB, -- Additional data from Razorpay

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order ON public.payment_transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER set_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions (for creating orders)
CREATE POLICY "Users can create own transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system can update transactions (via webhook or server actions)
CREATE POLICY "System can update transactions"
  ON public.payment_transactions FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.payment_transactions IS 'Payment transactions for Razorpay subscriptions';

-- =====================================================
-- HELPER FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
-- =====================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_uuid
    AND tier != 'free'
    AND (
      subscription_ends_at IS NULL OR
      subscription_ends_at > NOW()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in trial period
CREATE OR REPLACE FUNCTION public.is_in_trial(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_uuid
    AND tier = 'pro'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription limit based on tier
CREATE OR REPLACE FUNCTION public.get_subscription_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  user_tier subscription_tier;
BEGIN
  SELECT tier INTO user_tier
  FROM public.profiles
  WHERE id = user_uuid;

  CASE user_tier
    WHEN 'free' THEN RETURN 5;
    WHEN 'pro' THEN RETURN 999999; -- Unlimited
    WHEN 'premium' THEN RETURN 999999; -- Unlimited
    ELSE RETURN 5;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can add more subscriptions
CREATE OR REPLACE FUNCTION public.can_add_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
BEGIN
  -- Get current subscription count
  SELECT COUNT(*) INTO current_count
  FROM public.subscriptions
  WHERE user_id = user_uuid
  AND status = 'active';

  -- Get tier limit
  limit_count := public.get_subscription_limit(user_uuid);

  RETURN current_count < limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR SUBSCRIPTION ANALYTICS
-- =====================================================

-- View for active subscriptions with tier info
CREATE OR REPLACE VIEW public.v_user_subscription_summary AS
SELECT
  p.id AS user_id,
  p.tier,
  p.trial_ends_at,
  p.subscription_ends_at,
  COUNT(s.id) AS active_subscriptions,
  public.get_subscription_limit(p.id) AS subscription_limit,
  public.can_add_subscription(p.id) AS can_add_more
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id AND s.status = 'active'
GROUP BY p.id, p.tier, p.trial_ends_at, p.subscription_ends_at;

-- View for payment analytics
CREATE OR REPLACE VIEW public.v_payment_analytics AS
SELECT
  pt.user_id,
  p.tier,
  COUNT(pt.id) AS total_transactions,
  SUM(CASE WHEN pt.status = 'captured' THEN pt.amount ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN pt.status = 'failed' THEN 1 ELSE 0 END) AS failed_count,
  SUM(CASE WHEN pt.status = 'refunded' THEN pt.amount ELSE 0 END) AS refunded_amount,
  MAX(pt.created_at) AS last_payment_date
FROM public.payment_transactions pt
JOIN public.profiles p ON pt.user_id = p.id
GROUP BY pt.user_id, p.tier;

COMMENT ON VIEW public.v_user_subscription_summary IS 'Summary of user subscriptions with tier limits';
COMMENT ON VIEW public.v_payment_analytics IS 'Payment analytics per user';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on types
GRANT USAGE ON TYPE subscription_tier TO authenticated;
GRANT USAGE ON TYPE transaction_status TO authenticated;

-- Grant access to functions
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_in_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_add_subscription(UUID) TO authenticated;

-- Grant select on views
GRANT SELECT ON public.v_user_subscription_summary TO authenticated;
GRANT SELECT ON public.v_payment_analytics TO authenticated;
