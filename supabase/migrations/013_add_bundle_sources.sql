-- Migration 013: Add Sources to Telecom Bundles
-- Date: October 27, 2025
-- Description: Adds sources field for transparency and trust + expands provider types

-- Add sources column to telecom_bundles table
ALTER TABLE public.telecom_bundles
ADD COLUMN IF NOT EXISTS sources TEXT[] DEFAULT '{}';

-- Add is_verified column
ALTER TABLE public.telecom_bundles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Expand provider constraint to include membership aggregators
ALTER TABLE public.telecom_bundles
DROP CONSTRAINT IF EXISTS telecom_bundles_provider_check;

ALTER TABLE public.telecom_bundles
ADD CONSTRAINT telecom_bundles_provider_check
CHECK (provider IN ('Jio', 'Airtel', 'Vi', 'BSNL', 'Times Prime'));

-- Expand plan_type constraint to include membership
ALTER TABLE public.telecom_bundles
DROP CONSTRAINT IF EXISTS telecom_bundles_plan_type_check;

ALTER TABLE public.telecom_bundles
ADD CONSTRAINT telecom_bundles_plan_type_check
CHECK (plan_type IN ('fiber', 'prepaid', 'postpaid', 'mobile', 'membership'));

-- Add comments
COMMENT ON COLUMN public.telecom_bundles.sources IS
'Array of source URLs verifying bundle information (official websites, news articles, press releases)';

COMMENT ON COLUMN public.telecom_bundles.is_verified IS
'Whether the bundle information has been verified from official sources';

-- Update existing bundles to mark as unverified (need manual verification)
UPDATE public.telecom_bundles
SET is_verified = false
WHERE is_verified IS NULL;
