-- =====================================================
-- Migration 008: Currency Conversion to INR
-- Date: October 17, 2025
-- Description: Add fields to track original currency and amount,
--              while normalizing cost to INR for consistent calculations
-- =====================================================

-- Add original currency tracking fields
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS original_cost NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS original_currency TEXT;

-- Add comments
COMMENT ON COLUMN public.subscriptions.original_cost IS 'Original cost entered by user in their selected currency';
COMMENT ON COLUMN public.subscriptions.original_currency IS 'Original currency code selected by user (USD, EUR, GBP, etc.)';
COMMENT ON COLUMN public.subscriptions.cost IS 'Cost normalized to INR for consistent calculations and reporting';
COMMENT ON COLUMN public.subscriptions.currency IS 'Always INR - normalized currency for consistent calculations';

-- Migrate existing data: copy cost to original_cost and currency to original_currency
UPDATE public.subscriptions
SET original_cost = cost,
    original_currency = currency
WHERE original_cost IS NULL;

-- For existing INR subscriptions, keep original_currency as INR
-- For non-INR subscriptions, the cost is already in their original currency
-- So we just need to mark them properly

-- Note: After this migration, all NEW subscriptions should:
-- 1. Store user-entered cost in original_cost
-- 2. Store user-selected currency in original_currency
-- 3. Convert and store INR amount in cost
-- 4. Always set currency = 'INR'
