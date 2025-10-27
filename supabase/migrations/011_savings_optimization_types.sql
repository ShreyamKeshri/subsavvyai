-- Migration 011: Savings Optimization Types
-- Extends savings tracking to handle different optimization types (cancel, downgrade, bundle)
-- Created: 2025-10-27

-- =====================================================
-- ADD OPTIMIZATION FIELDS TO SUBSCRIPTIONS
-- =====================================================

-- Add optimization type field
DO $$ BEGIN
  CREATE TYPE optimization_type AS ENUM ('cancel', 'downgrade', 'upgrade', 'bundle');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS optimization_type optimization_type,
  ADD COLUMN IF NOT EXISTS previous_cost NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS monthly_savings NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS optimization_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS optimization_notes TEXT;

-- Add index for optimization queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_optimization
  ON public.subscriptions(user_id, optimization_type)
  WHERE optimization_type IS NOT NULL AND deleted_at IS NULL;

-- =====================================================
-- UPDATE EXISTING CANCELLED SUBSCRIPTIONS
-- =====================================================

-- Mark existing cancelled subscriptions with optimization_type = 'cancel'
UPDATE public.subscriptions
SET
  optimization_type = 'cancel',
  optimization_date = cancelled_at,
  monthly_savings = calculate_monthly_cost(cost, billing_cycle)
WHERE
  status = 'cancelled'
  AND cancelled_at IS NOT NULL
  AND optimization_type IS NULL;

-- =====================================================
-- HELPER FUNCTION: Calculate Savings Based on Optimization Type
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_optimization_savings(
  p_optimization_type optimization_type,
  p_cost NUMERIC,
  p_previous_cost NUMERIC,
  p_billing_cycle billing_cycle
) RETURNS NUMERIC AS $$
DECLARE
  monthly_current NUMERIC;
  monthly_previous NUMERIC;
BEGIN
  -- Calculate monthly cost for current plan
  monthly_current := calculate_monthly_cost(p_cost, p_billing_cycle);

  CASE p_optimization_type
    -- Cancel: full monthly cost is saved
    WHEN 'cancel' THEN
      RETURN monthly_current;

    -- Downgrade: difference between previous and current
    WHEN 'downgrade' THEN
      IF p_previous_cost IS NULL THEN
        RETURN 0;
      END IF;
      monthly_previous := calculate_monthly_cost(p_previous_cost, p_billing_cycle);
      RETURN GREATEST(monthly_previous - monthly_current, 0);

    -- Upgrade: not counted as savings (per documentation)
    WHEN 'upgrade' THEN
      RETURN 0;

    -- Bundle: calculated externally, stored in monthly_savings
    WHEN 'bundle' THEN
      RETURN 0; -- Bundle savings calculated separately

    ELSE
      RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_optimization_savings IS
  'Calculates monthly savings based on optimization type (cancel, downgrade, upgrade, bundle)';

-- =====================================================
-- TRIGGER: Auto-calculate savings on optimization
-- =====================================================

CREATE OR REPLACE FUNCTION auto_calculate_savings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if optimization_type is set and monthly_savings is not manually set
  -- Don't overwrite intentional zero values for bundles (use IS NULL only)
  IF NEW.optimization_type IS NOT NULL AND NEW.monthly_savings IS NULL THEN
    NEW.monthly_savings := calculate_optimization_savings(
      NEW.optimization_type,
      NEW.cost,
      NEW.previous_cost,
      NEW.billing_cycle
    );
  END IF;

  -- Set optimization_date if not set
  IF NEW.optimization_type IS NOT NULL AND NEW.optimization_date IS NULL THEN
    NEW.optimization_date := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_savings
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  WHEN (NEW.optimization_type IS NOT NULL)
  EXECUTE FUNCTION auto_calculate_savings();

COMMENT ON TRIGGER trigger_auto_calculate_savings ON public.subscriptions IS
  'Automatically calculates monthly_savings when optimization_type changes';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN public.subscriptions.optimization_type IS
  'Type of optimization: cancel (full stop), downgrade (cheaper plan), upgrade (better plan), bundle (combined deal)';

COMMENT ON COLUMN public.subscriptions.previous_cost IS
  'Previous cost before downgrade/upgrade (for calculating savings)';

COMMENT ON COLUMN public.subscriptions.monthly_savings IS
  'Monthly savings amount in INR (calculated or manually set for bundles)';

COMMENT ON COLUMN public.subscriptions.optimization_date IS
  'When the optimization was applied';

COMMENT ON COLUMN public.subscriptions.optimization_notes IS
  'Additional notes about the optimization (e.g., "Bundled with Disney+"")';
