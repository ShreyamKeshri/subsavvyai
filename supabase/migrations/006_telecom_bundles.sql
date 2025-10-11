-- Migration 006: Telecom Bundles for India Bundle Optimizer
-- Created: October 11, 2025
-- Description: Creates tables for telecom bundles and bundle recommendations

-- =====================================================
-- 1. Create telecom_bundles table
-- =====================================================

CREATE TABLE IF NOT EXISTS telecom_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider info
  provider TEXT NOT NULL CHECK (provider IN ('Jio', 'Airtel', 'Vi', 'BSNL')),
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('fiber', 'prepaid', 'postpaid', 'mobile')),

  -- Pricing
  monthly_price NUMERIC NOT NULL CHECK (monthly_price > 0),
  billing_cycle TEXT NOT NULL, -- 'monthly', '28 days', '84 days', 'yearly'
  total_price NUMERIC NOT NULL CHECK (total_price > 0),

  -- OTT Services (normalized array of service names)
  included_ott_services TEXT[] NOT NULL DEFAULT '{}',
  ott_service_count INTEGER GENERATED ALWAYS AS (array_length(included_ott_services, 1)) STORED,

  -- Detailed OTT info (JSONB for flexibility)
  ott_plan_details JSONB NOT NULL DEFAULT '{}',

  -- Data & Benefits
  data_benefits TEXT,
  validity TEXT, -- '30 days', '84 days', etc.
  other_benefits TEXT[] DEFAULT '{}',

  -- Metadata
  target_audience TEXT,
  official_url TEXT,
  is_currently_active BOOLEAN DEFAULT true,
  last_verified DATE DEFAULT CURRENT_DATE,
  notes TEXT,

  -- Value scoring (for ranking)
  value_score NUMERIC GENERATED ALWAYS AS (
    CASE
      WHEN monthly_price > 0 THEN
        CAST(array_length(included_ott_services, 1) AS NUMERIC) / (monthly_price / 1000.0)
      ELSE 0
    END
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(provider, plan_name)
);

-- Indexes for performance
CREATE INDEX idx_telecom_bundles_provider ON telecom_bundles(provider);
CREATE INDEX idx_telecom_bundles_price ON telecom_bundles(monthly_price);
CREATE INDEX idx_telecom_bundles_plan_type ON telecom_bundles(plan_type);
CREATE INDEX idx_telecom_bundles_active ON telecom_bundles(is_currently_active) WHERE is_currently_active = true;
CREATE INDEX idx_telecom_bundles_value_score ON telecom_bundles(value_score DESC NULLS LAST);
CREATE INDEX idx_telecom_bundles_ott_count ON telecom_bundles(ott_service_count DESC);

-- GIN index for array searches (find bundles containing specific OTT services)
CREATE INDEX idx_telecom_bundles_ott_services ON telecom_bundles USING GIN(included_ott_services);

-- Comment
COMMENT ON TABLE telecom_bundles IS 'Telecom bundles from Indian providers (Jio, Airtel, Vi, BSNL) that include OTT services';

-- =====================================================
-- 2. Create bundle_recommendations table
-- =====================================================

CREATE TABLE IF NOT EXISTS bundle_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_id UUID NOT NULL REFERENCES telecom_bundles(id) ON DELETE CASCADE,

  -- Matched subscriptions (UUIDs of user's subscriptions that are in this bundle)
  matched_subscription_ids UUID[] NOT NULL DEFAULT '{}',
  matched_subscription_count INTEGER GENERATED ALWAYS AS (array_length(matched_subscription_ids, 1)) STORED,

  -- Savings calculation
  current_monthly_cost NUMERIC NOT NULL CHECK (current_monthly_cost >= 0),
  bundle_monthly_cost NUMERIC NOT NULL CHECK (bundle_monthly_cost >= 0),
  monthly_savings NUMERIC GENERATED ALWAYS AS (current_monthly_cost - bundle_monthly_cost) STORED,
  annual_savings NUMERIC GENERATED ALWAYS AS ((current_monthly_cost - bundle_monthly_cost) * 12) STORED,

  -- Match quality
  match_percentage NUMERIC CHECK (match_percentage >= 0 AND match_percentage <= 100),

  -- Recommendation details
  recommendation_type TEXT NOT NULL DEFAULT 'bundle' CHECK (recommendation_type IN ('bundle', 'upgrade', 'switch')),
  confidence_score NUMERIC DEFAULT 0.75 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'dismissed', 'expired')),
  viewed_at TIMESTAMPTZ,
  status_updated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, bundle_id) -- One recommendation per bundle per user
);

-- Indexes
CREATE INDEX idx_bundle_recommendations_user ON bundle_recommendations(user_id);
CREATE INDEX idx_bundle_recommendations_bundle ON bundle_recommendations(bundle_id);
CREATE INDEX idx_bundle_recommendations_status ON bundle_recommendations(status);
CREATE INDEX idx_bundle_recommendations_savings ON bundle_recommendations(annual_savings DESC NULLS LAST);
CREATE INDEX idx_bundle_recommendations_user_status ON bundle_recommendations(user_id, status);

-- Comment
COMMENT ON TABLE bundle_recommendations IS 'AI-generated bundle recommendations for users based on their current subscriptions';

-- =====================================================
-- 3. Row-Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE telecom_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_recommendations ENABLE ROW LEVEL SECURITY;

-- Telecom bundles are public (everyone can read)
CREATE POLICY "Telecom bundles are publicly readable"
  ON telecom_bundles FOR SELECT
  TO authenticated
  USING (is_currently_active = true);

-- Bundle recommendations: users can only see their own
CREATE POLICY "Users can view own bundle recommendations"
  ON bundle_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bundle recommendations"
  ON bundle_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bundle recommendations"
  ON bundle_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bundle recommendations"
  ON bundle_recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telecom_bundles_updated_at
  BEFORE UPDATE ON telecom_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bundle_recommendations_updated_at
  BEFORE UPDATE ON bundle_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. Helper Functions
-- =====================================================

-- Function to find bundles containing specific OTT services
CREATE OR REPLACE FUNCTION find_bundles_with_services(service_names TEXT[])
RETURNS SETOF telecom_bundles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM telecom_bundles
  WHERE is_currently_active = true
    AND included_ott_services && service_names -- Array overlap operator
  ORDER BY value_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate potential savings for a user
CREATE OR REPLACE FUNCTION calculate_bundle_savings(
  p_user_id UUID,
  p_bundle_id UUID
)
RETURNS TABLE (
  current_cost NUMERIC,
  bundle_cost NUMERIC,
  savings NUMERIC,
  matched_count INTEGER
) AS $$
DECLARE
  v_bundle_price NUMERIC;
  v_bundle_services TEXT[];
BEGIN
  -- Get bundle details
  SELECT monthly_price, included_ott_services
  INTO v_bundle_price, v_bundle_services
  FROM telecom_bundles
  WHERE id = p_bundle_id;

  -- Calculate user's current cost for services in the bundle
  RETURN QUERY
  WITH user_services AS (
    SELECT
      s.id,
      s.service_id,
      srv.name as service_name,
      calculate_monthly_cost(s.cost, s.billing_cycle) as monthly_cost
    FROM subscriptions s
    JOIN services srv ON s.service_id = srv.id
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
  ),
  matched_services AS (
    SELECT *
    FROM user_services
    WHERE service_name = ANY(v_bundle_services)
  )
  SELECT
    COALESCE(SUM(monthly_cost), 0) as current_cost,
    v_bundle_price as bundle_cost,
    COALESCE(SUM(monthly_cost), 0) - v_bundle_price as savings,
    COUNT(*)::INTEGER as matched_count
  FROM matched_services;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Seed Data (Telecom Bundles)
-- =====================================================

-- Clear existing data (for re-running migration)
TRUNCATE telecom_bundles CASCADE;

-- Insert Jio Fiber Bundles
INSERT INTO telecom_bundles (
  provider, plan_name, plan_type, monthly_price, billing_cycle, total_price,
  included_ott_services, ott_plan_details, data_benefits, validity,
  other_benefits, target_audience, official_url, notes
) VALUES
-- Jio 1
('Jio', 'JioFiber 30Mbps + 6 OTT Pack', 'fiber', 499, 'monthly', 499,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV', 'Lionsgate Play'],
 '{"Netflix": "Standard/Premium", "Hotstar": "Premium", "Amazon Prime Video": "Yes", "Zee5": "Premium", "SonyLIV": "Premium", "Lionsgate Play": "Yes"}',
 'Unlimited @30Mbps', '30 days',
 ARRAY['Unlimited calls', 'GST extra'],
 'Budget-conscious streamers',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 'Entry-level fiber with good OTT coverage'),

-- Jio 2
('Jio', 'JioFiber 30Mbps + 14 OTT Pack', 'fiber', 599, 'monthly', 599,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV', 'Lionsgate Play', 'ALTBalaji', 'JioCinema', 'JioSaavn', 'Sun NXT', 'Hoichoi', 'Discovery+', 'Voot', 'Eros Now'],
 '{"Netflix": "Premium", "Hotstar": "Premium", "Amazon Prime Video": "Yes", "Zee5": "Premium", "SonyLIV": "Premium"}',
 'Unlimited @30Mbps', '30 days',
 ARRAY['Unlimited calls'],
 'Families, heavy content viewers',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 'Best value for 30Mbps - 14 OTT apps'),

-- Jio 3
('Jio', 'JioFiber 100Mbps + 6 OTT Pack', 'fiber', 799, 'monthly', 799,
 ARRAY['Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'Lionsgate Play', 'ALTBalaji', 'Sun NXT'],
 '{"Hotstar": "Premium", "Amazon Prime Video": "Yes", "Zee5": "Premium"}',
 'Unlimited @100Mbps', '30 days',
 ARRAY['Unlimited calls'],
 'Mid-tier fiber users',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 NULL),

-- Jio 4
('Jio', 'JioFiber 100Mbps + 14 OTT Pack', 'fiber', 899, 'monthly', 899,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV', 'Lionsgate Play', 'ALTBalaji', 'JioCinema', 'JioSaavn', 'Sun NXT', 'Hoichoi', 'Discovery+', 'Voot', 'Eros Now'],
 '{"Netflix": "Premium", "Hotstar": "Premium", "Amazon Prime Video": "Yes", "Zee5": "Premium", "SonyLIV": "Premium"}',
 'Unlimited @100Mbps', '30 days',
 ARRAY['Unlimited calls'],
 'Content enthusiasts',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 'Great value - ₹64/OTT service'),

-- Jio 5: BEST VALUE
('Jio', 'JioFiber 150Mbps + 15 OTT Pack', 'fiber', 999, 'monthly', 999,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV', 'Lionsgate Play', 'ALTBalaji', 'JioCinema', 'JioSaavn', 'Sun NXT', 'Hoichoi', 'Discovery+', 'Voot', 'Eros Now', 'ShemarooMe'],
 '{"Netflix": "Premium (4K)", "Hotstar": "Premium", "Amazon Prime Video": "Yes", "Zee5": "Premium", "SonyLIV": "Premium", "Discovery+": "Yes"}',
 'Unlimited @150Mbps', '30 days',
 ARRAY['Unlimited calls'],
 'Premium video streaming, families',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 'BEST VALUE - ₹66/OTT service, Netflix Premium 4K included'),

-- Jio 6
('Jio', 'JioFiber 300Mbps + 16 OTT Pack', 'fiber', 1499, 'monthly', 1499,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV', 'Lionsgate Play', 'ALTBalaji', 'JioCinema', 'JioSaavn', 'Sun NXT', 'Hoichoi', 'Discovery+', 'Voot', 'Eros Now', 'ShemarooMe', 'Docubay'],
 '{"Netflix": "Premium (4K)", "Hotstar": "Premium", "Amazon Prime Video": "Yes", "Zee5": "Premium", "SonyLIV": "Premium"}',
 'Unlimited @300Mbps', '30 days',
 ARRAY['Unlimited calls'],
 'High-end streamers, large families',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 'Fastest speed + most OTT services'),

-- Airtel Prepaid Bundles
-- Airtel 1
('Airtel', 'Airtel OTT Pack ₹279', 'prepaid', 279, 'monthly', 279,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Zee5', 'Airtel Xstream'],
 '{"Netflix": "Basic (SD, 1 screen)", "Hotstar": "Premium (sports included)", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 '1 GB data', '30 days',
 ARRAY[]::TEXT[],
 'Budget OTT users',
 'https://www.airtel.in/thanks/recharge',
 'Entry-level OTT access'),

-- Airtel 2
('Airtel', 'Airtel OTT Pack ₹598', 'prepaid', 598, '28 days', 598,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Zee5', 'Airtel Xstream'],
 '{"Netflix": "Basic (SD, 1 screen)", "Hotstar": "Premium (sports included)", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited 5G data, unlimited calls', '28 days',
 ARRAY['Free national roaming'],
 'All-round mobile entertainment',
 'https://www.airtel.in/thanks/recharge',
 'Best mobile prepaid bundle'),

-- Airtel 3
('Airtel', 'Airtel OTT Pack ₹1729', 'prepaid', 576.33, '84 days', 1729,
 ARRAY['Netflix', 'Disney+ Hotstar', 'Zee5', 'Airtel Xstream'],
 '{"Netflix": "Basic (SD, 1 screen)", "Hotstar": "Premium", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited 5G data, unlimited calls', '84 days',
 ARRAY['Free national roaming'],
 'Value-seeking binge-watchers',
 'https://www.airtel.in/thanks/recharge',
 'Quarterly prepaid - best value per day'),

-- Airtel Fiber Bundles
-- Airtel 4
('Airtel', 'Airtel Xstream Fiber 699', 'fiber', 699, 'monthly', 699,
 ARRAY['Disney+ Hotstar', 'Zee5', 'Airtel Xstream'],
 '{"Hotstar": "Super (TV + Mobile)", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited @40Mbps', '30 days',
 ARRAY['Unlimited local/STD calls'],
 'Mid-speed home users',
 'https://www.airtel.in/wifi-plans',
 NULL),

-- Airtel 5
('Airtel', 'Airtel Xstream Fiber 899', 'fiber', 899, 'monthly', 899,
 ARRAY['Disney+ Hotstar', 'Zee5', 'Airtel Xstream'],
 '{"Hotstar": "Super", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited @100Mbps', '30 days',
 ARRAY['₹350 DTH TV channels (HD)'],
 'TV + OTT viewers',
 'https://www.airtel.in/wifi-plans',
 'Includes HD TV channels'),

-- Airtel 6: SPORTS FANS BEST
('Airtel', 'Airtel Xstream Fiber 999', 'fiber', 999, 'monthly', 999,
 ARRAY['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'Apple TV+', 'Zee5', 'Airtel Xstream', 'SonyLIV'],
 '{"Netflix": "Basic (SD, 1 screen)", "Hotstar": "Super (TV + Mobile)", "Amazon Prime Video": "1-year", "Apple TV+": "Subscription", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited @100Mbps', '30 days',
 ARRAY['Unlimited calls', '300+ DTH channels (HD)', 'Wi-Fi router free'],
 'Movie lovers, sports fans (Premier League)',
 'https://www.airtel.in/wifi-plans',
 'Best for sports fans - Hotstar Super with Premier League'),

-- Airtel 7
('Airtel', 'Airtel Xstream Fiber 1199', 'fiber', 1199, 'monthly', 1199,
 ARRAY['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'Apple TV+', 'Zee5', 'Airtel Xstream'],
 '{"Netflix": "Basic", "Hotstar": "Super", "Amazon Prime Video": "1-year", "Apple TV+": "Subscription", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited @100Mbps', '30 days',
 ARRAY['Unlimited calls', '350+ TV channels (HD)'],
 'Families with streaming needs',
 'https://www.airtel.in/wifi-plans',
 'Family-friendly bundle with TV'),

-- Airtel 8
('Airtel', 'Airtel Xstream Fiber 1599', 'fiber', 1599, 'monthly', 1599,
 ARRAY['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'Apple TV+', 'Zee5', 'Airtel Xstream'],
 '{"Netflix": "Basic", "Hotstar": "Super", "Amazon Prime Video": "1-year", "Apple TV+": "Subscription", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited @300Mbps', '30 days',
 ARRAY['Unlimited calls', '350+ TV channels (HD)'],
 'High-usage families, remote work',
 'https://www.airtel.in/wifi-plans',
 'Fastest Airtel fiber with full OTT suite'),

-- Airtel 9: PREMIUM NETFLIX 4K
('Airtel', 'Airtel Xstream Fiber 3999 (Infinity)', 'fiber', 3999, 'monthly', 3999,
 ARRAY['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'Apple TV+', 'Zee5', 'Airtel Xstream'],
 '{"Netflix": "Premium (4K, 4 screens)", "Hotstar": "Super", "Amazon Prime Video": "1-year", "Apple TV+": "Subscription", "Zee5": "Premium", "Airtel Xstream": "Premium"}',
 'Unlimited @1Gbps (1024 Mbps)', '30 days',
 ARRAY['Unlimited calls', '350+ TV channels (HD)', 'Wi-Fi router free'],
 'Premium users, UHD 4K streaming enthusiasts',
 'https://www.airtel.in/wifi-plans',
 'ONLY bundle with Netflix Premium 4K - ideal for serious Netflix users'),

-- Vi Postpaid Bundles
-- Vi 1
('Vi', 'Vi REDX (Postpaid)', 'postpaid', 1201, 'monthly', 1201,
 ARRAY['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'SonyLIV'],
 '{"Netflix": "Basic (SD, 1 device)", "Amazon Prime Video": "6-month subscription", "Hotstar": "TV & Mobile (1 year)", "SonyLIV": "Premium"}',
 'Unlimited mobile data', '30 days',
 ARRAY['Unlimited calls', '3000 SMS', 'Vi Games (esports)'],
 'Heavy mobile users and streamers',
 'https://www.myvi.in/postpaid/redx',
 'Premium mobile postpaid with long-term OTT benefits'),

-- Vi 2: FAMILY PLAN
('Vi', 'Vi REDX Family (Postpaid)', 'postpaid', 1601, 'monthly', 1601,
 ARRAY['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'SonyLIV'],
 '{"Netflix": "Basic", "Amazon Prime Video": "6-month subscription", "Hotstar": "TV & Mobile (1 year)", "SonyLIV": "Premium"}',
 'Unlimited data (2 lines)', '30 days',
 ARRAY['Unlimited calls', '4 airport lounges per year', 'Free Swiggy One (3 months)', 'Norton Mobile Security'],
 'Families (2 lines) needing multiple OTT',
 'https://www.myvi.in/postpaid/redx',
 'Best family postpaid plan - 2 lines with shared OTT benefits + perks');

-- Note: BSNL bundles excluded due to unspecified OTT service details

-- =====================================================
-- 7. Grant Permissions
-- =====================================================

-- Grant select on bundles to authenticated users
GRANT SELECT ON telecom_bundles TO authenticated;

-- Grant all on recommendations to authenticated users (RLS will restrict)
GRANT ALL ON bundle_recommendations TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify data
DO $$
DECLARE
  bundle_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bundle_count FROM telecom_bundles;
  RAISE NOTICE 'Migration 006 complete: % telecom bundles imported', bundle_count;
END $$;
