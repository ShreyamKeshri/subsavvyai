-- =====================================================
-- UNSUBSCRIBR - INITIAL DATABASE SCHEMA
-- Version: 1.0
-- Date: October 3, 2025
-- Description: Complete database schema for subscription management platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CUSTOM TYPES (ENUMS)
-- =====================================================

CREATE TYPE subscription_category AS ENUM (
  'OTT',
  'Music',
  'Food Delivery',
  'SaaS',
  'Fitness',
  'News',
  'Gaming',
  'Education',
  'Other'
);

CREATE TYPE billing_cycle AS ENUM (
  'monthly',
  'quarterly',
  'yearly',
  'custom'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'cancellation_initiated',
  'cancelled',
  'paused',
  'expired'
);

CREATE TYPE payment_provider AS ENUM (
  'razorpay',
  'stripe',
  'upi',
  'manual'
);

CREATE TYPE payment_method_type AS ENUM (
  'card',
  'upi',
  'netbanking',
  'wallet',
  'other'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

CREATE TYPE notification_type AS ENUM (
  'renewal_reminder',
  'payment_success',
  'payment_failed',
  'subscription_cancelled',
  'weekly_summary',
  'custom'
);

CREATE TYPE notification_delivery_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'cancelled'
);

CREATE TYPE difficulty_level AS ENUM (
  'easy',
  'medium',
  'hard'
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE 1: PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency_preference TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number);

-- Trigger
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON TABLE public.profiles IS 'User profile data extending Supabase auth.users';

-- =====================================================
-- TABLE 2: SERVICES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category subscription_category NOT NULL,
  typical_price_inr NUMERIC(10, 2),
  logo_url TEXT,
  website_url TEXT,
  cancellation_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active) WHERE is_active = true;
CREATE INDEX idx_services_name_trgm ON public.services USING gin(name gin_trgm_ops);

-- Trigger
CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: Public read access
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

COMMENT ON TABLE public.services IS 'Reference data for popular subscription services';

-- =====================================================
-- TABLE 3: PAYMENT_METHODS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  type payment_method_type NOT NULL,
  last_four_digits TEXT,
  card_brand TEXT,
  upi_id TEXT,
  provider_customer_id TEXT,
  provider_method_id TEXT,
  is_default BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_payment_methods_active ON public.payment_methods(user_id, is_active) WHERE is_active = true;

-- Trigger
CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON public.payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON public.payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON public.payment_methods FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.payment_methods IS 'User payment methods for subscriptions';

-- =====================================================
-- TABLE 4: SUBSCRIPTIONS (CORE)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  custom_service_name TEXT,
  cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
  currency TEXT DEFAULT 'INR' NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  billing_date DATE NOT NULL,
  next_billing_date DATE NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  paused_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT service_name_check CHECK (
    (service_id IS NOT NULL) OR (custom_service_name IS NOT NULL)
  ),
  CONSTRAINT next_billing_after_current CHECK (
    next_billing_date >= billing_date
  ),
  CONSTRAINT valid_currency CHECK (
    currency ~ '^[A-Z]{3}$'
  ),
  CONSTRAINT custom_service_name_length CHECK (
    char_length(custom_service_name) <= 100
  )
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_user_active ON public.subscriptions(user_id, status)
  WHERE deleted_at IS NULL AND status = 'active';
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date)
  WHERE deleted_at IS NULL AND status = 'active';
CREATE INDEX idx_subscriptions_service_id ON public.subscriptions(service_id);
CREATE INDEX idx_subscriptions_deleted_at ON public.subscriptions(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set cancelled_at timestamp
CREATE OR REPLACE FUNCTION auto_set_cancellation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    NEW.cancelled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cancellation_timestamp
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_cancellation_timestamp();

-- Protect audit columns
CREATE OR REPLACE FUNCTION protect_audit_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.created_at = OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_subscriptions_audit
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION protect_audit_columns();

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.subscriptions IS 'User subscription records with billing and status tracking';

-- =====================================================
-- TABLE 5: PAYMENT_HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'INR' NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  payment_provider payment_provider,
  provider_payment_id TEXT,
  payment_date TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_payment_history_subscription ON public.payment_history(subscription_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);
CREATE INDEX idx_payment_history_date ON public.payment_history(payment_date DESC);
CREATE INDEX idx_payment_history_provider_id ON public.payment_history(provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

-- RLS Policies
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history"
  ON public.payment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.id = payment_history.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payment history for own subscriptions"
  ON public.payment_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.id = payment_history.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.payment_history IS 'Payment transaction records for subscriptions';

-- =====================================================
-- TABLE 6: NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  delivery_status notification_delivery_status DEFAULT 'pending' NOT NULL,
  fcm_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for)
  WHERE delivery_status = 'pending';
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read_at)
  WHERE read_at IS NULL;
CREATE INDEX idx_notifications_subscription ON public.notifications(subscription_id);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.notifications IS 'User notifications for reminders and updates';

-- =====================================================
-- TABLE 7: NOTIFICATION_PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT,
  email_enabled BOOLEAN DEFAULT true NOT NULL,
  push_enabled BOOLEAN DEFAULT true NOT NULL,
  reminder_3_days BOOLEAN DEFAULT true NOT NULL,
  reminder_1_day BOOLEAN DEFAULT true NOT NULL,
  reminder_same_day BOOLEAN DEFAULT true NOT NULL,
  weekly_summary BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notification_prefs_user ON public.notification_preferences(user_id);

-- Trigger
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.notification_preferences IS 'User notification settings and FCM tokens';

-- =====================================================
-- TABLE 8: CANCELLATION_GUIDES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cancellation_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  steps JSONB NOT NULL,
  estimated_time_minutes INTEGER,
  difficulty_level difficulty_level,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_cancellation_guides_service ON public.cancellation_guides(service_id);

-- Trigger
CREATE TRIGGER set_cancellation_guides_updated_at
  BEFORE UPDATE ON public.cancellation_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.cancellation_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cancellation guides viewable by authenticated users"
  ON public.cancellation_guides FOR SELECT
  USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.cancellation_guides IS 'Step-by-step cancellation instructions for services';

-- =====================================================
-- TABLE 9: USER_ANALYTICS_CACHE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_monthly_spend NUMERIC(12, 2) DEFAULT 0,
  total_yearly_spend NUMERIC(12, 2) DEFAULT 0,
  active_subscriptions_count INTEGER DEFAULT 0,
  category_breakdown JSONB,
  spending_trend JSONB,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_analytics_user ON public.user_analytics_cache(user_id);
CREATE INDEX idx_analytics_last_calc ON public.user_analytics_cache(last_calculated_at);

-- Trigger
CREATE TRIGGER set_analytics_cache_updated_at
  BEFORE UPDATE ON public.user_analytics_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.user_analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON public.user_analytics_cache FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_analytics_cache IS 'Pre-calculated analytics for faster dashboard loading';

-- =====================================================
-- ANALYTICS HELPER FUNCTIONS
-- =====================================================

-- Calculate monthly cost from any billing cycle
CREATE OR REPLACE FUNCTION calculate_monthly_cost(cost NUMERIC, cycle billing_cycle)
RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE cycle
    WHEN 'monthly' THEN cost
    WHEN 'quarterly' THEN cost / 3
    WHEN 'yearly' THEN cost / 12
    ELSE cost
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Refresh user analytics cache
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

  -- Calculate category breakdown
  SELECT jsonb_object_agg(
    COALESCE(s.category::text, 'Other'),
    COALESCE(SUM(calculate_monthly_cost(sub.cost, sub.billing_cycle)), 0)
  )
  INTO v_category_breakdown
  FROM public.subscriptions sub
  LEFT JOIN public.services s ON sub.service_id = s.id
  WHERE sub.user_id = p_user_id
    AND sub.status = 'active'
    AND sub.deleted_at IS NULL
  GROUP BY s.category;

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
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh analytics when subscriptions change
CREATE OR REPLACE FUNCTION trigger_refresh_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_user_analytics(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_analytics_on_subscription_change
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_user_analytics();

-- =====================================================
-- MATERIALIZED VIEW: POPULAR SERVICES
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_popular_services AS
SELECT
  s.id,
  s.name,
  s.category,
  COUNT(sub.id) as subscriber_count,
  AVG(sub.cost) as avg_cost
FROM public.services s
LEFT JOIN public.subscriptions sub ON s.id = sub.service_id
  AND sub.status = 'active'
  AND sub.deleted_at IS NULL
GROUP BY s.id, s.name, s.category
ORDER BY subscriber_count DESC;

CREATE UNIQUE INDEX ON public.mv_popular_services (id);

COMMENT ON MATERIALIZED VIEW public.mv_popular_services IS 'Analytics view of popular services by subscriber count';

-- =====================================================
-- COMPLETED
-- =====================================================

-- Grant usage on custom types
GRANT USAGE ON TYPE subscription_category TO authenticated;
GRANT USAGE ON TYPE billing_cycle TO authenticated;
GRANT USAGE ON TYPE subscription_status TO authenticated;
GRANT USAGE ON TYPE payment_provider TO authenticated;
GRANT USAGE ON TYPE payment_method_type TO authenticated;
GRANT USAGE ON TYPE payment_status TO authenticated;
GRANT USAGE ON TYPE notification_type TO authenticated;
GRANT USAGE ON TYPE notification_delivery_status TO authenticated;
GRANT USAGE ON TYPE difficulty_level TO authenticated;
