-- =====================================================
-- TEST SCRIPT: Savings Optimization Types
-- =====================================================
-- This script creates test data for "Tested User" to demonstrate
-- all optimization types: cancel, downgrade, and bundle
--
-- INSTRUCTIONS:
-- 1. Run this in Supabase SQL Editor
-- 2. Replace 'YOUR_USER_EMAIL' with the actual test user email
-- 3. Visit /dashboard/savings to see the results
-- =====================================================

-- Step 1: Find your test user ID
-- Replace 'testeduser@example.com' with actual email
DO $$
DECLARE
  v_user_id UUID;
  v_netflix_id UUID;
  v_spotify_id UUID;
  v_hotstar_id UUID;
  v_byjus_id UUID;
  v_prime_id UUID;
BEGIN
  -- Get user ID (REPLACE THIS EMAIL!)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'testeduser@example.com'  -- ⚠️ CHANGE THIS!
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found! Update the email in the script.';
  END IF;

  RAISE NOTICE 'Found user: %', v_user_id;

  -- Get service IDs (using exact names from seeds)
  SELECT id INTO v_netflix_id FROM public.services WHERE name = 'Netflix' LIMIT 1;
  SELECT id INTO v_spotify_id FROM public.services WHERE name = 'Spotify' LIMIT 1;
  SELECT id INTO v_hotstar_id FROM public.services WHERE name = 'Disney+ Hotstar' LIMIT 1;
  SELECT id INTO v_byjus_id FROM public.services WHERE name = 'BYJU''S' LIMIT 1;
  SELECT id INTO v_prime_id FROM public.services WHERE name = 'Amazon Prime Video' LIMIT 1;

  RAISE NOTICE 'Service IDs - Netflix: %, Spotify: %, Hotstar: %, Prime: %',
    v_netflix_id, v_spotify_id, v_hotstar_id, v_prime_id;

  -- Clean up existing test data for this user
  DELETE FROM public.subscriptions WHERE user_id = v_user_id;

  -- =====================================================
  -- TEST CASE 1: CANCELLED SUBSCRIPTION
  -- =====================================================
  -- Scenario: User cancelled Netflix Premium (₹649/month)
  -- Saved: ₹649/month × 6 months = ₹3,894

  INSERT INTO public.subscriptions (
    user_id,
    service_id,
    custom_service_name,
    cost,
    currency,
    billing_cycle,
    billing_date,
    next_billing_date,
    status,
    notes,
    cancelled_at,
    cancellation_reason,
    optimization_type,
    optimization_date,
    previous_cost,
    monthly_savings,
    optimization_notes
  ) VALUES (
    v_user_id,
    v_netflix_id,
    CASE WHEN v_netflix_id IS NULL THEN 'Netflix' ELSE NULL END,
    649,
    'INR',
    'monthly',
    '2024-04-01',
    '2024-05-01',
    'cancelled',
    'Premium plan - not using enough',
    '2024-04-27',  -- Cancelled 6 months ago
    'not_using',
    'cancel',      -- Optimization type: CANCEL
    '2024-04-27',
    NULL,
    649,           -- Full monthly cost saved
    'Not watching enough to justify premium'
  );

  RAISE NOTICE 'Created: Cancelled Netflix (₹649/month saved)';

  -- =====================================================
  -- TEST CASE 2: DOWNGRADED SUBSCRIPTION
  -- =====================================================
  -- Scenario: User downgraded Spotify from Premium Family (₹179/month) to Individual (₹119/month)
  -- Saved: ₹60/month × 4 months = ₹240

  INSERT INTO public.subscriptions (
    user_id,
    service_id,
    custom_service_name,
    cost,
    currency,
    billing_cycle,
    billing_date,
    next_billing_date,
    status,
    notes,
    optimization_type,
    optimization_date,
    previous_cost,
    monthly_savings,
    optimization_notes
  ) VALUES (
    v_user_id,
    v_spotify_id,
    CASE WHEN v_spotify_id IS NULL THEN 'Spotify' ELSE NULL END,
    119,           -- Current cost (Individual plan)
    'INR',
    'monthly',
    '2024-06-15',
    '2024-11-15',
    'active',      -- Still active, but downgraded
    'Individual plan',
    'downgrade',   -- Optimization type: DOWNGRADE
    '2024-06-27',  -- Downgraded 4 months ago
    179,           -- Previous cost (Family plan)
    60,            -- Savings: 179 - 119 = ₹60/month
    'Switched from Family to Individual plan - only I was using it'
  );

  RAISE NOTICE 'Created: Downgraded Spotify (₹60/month saved)';

  -- =====================================================
  -- TEST CASE 3: BUNDLE OPTIMIZATION
  -- =====================================================
  -- Scenario: User bundled Hotstar with Disney+ (saves ₹200/month)
  -- This is tracked as an optimization even though subscription is active

  INSERT INTO public.subscriptions (
    user_id,
    service_id,
    custom_service_name,
    cost,
    currency,
    billing_cycle,
    billing_date,
    next_billing_date,
    status,
    notes,
    optimization_type,
    optimization_date,
    previous_cost,
    monthly_savings,
    optimization_notes
  ) VALUES (
    v_user_id,
    v_hotstar_id,
    CASE WHEN v_hotstar_id IS NULL THEN 'Hotstar + Disney+ Bundle' ELSE NULL END,
    499,           -- Bundle cost (yearly ÷ 12)
    'INR',
    'yearly',
    '2024-08-01',
    '2025-08-01',
    'active',
    'Hotstar + Disney+ Bundle',
    'bundle',      -- Optimization type: BUNDLE
    '2024-08-27',  -- Bundled 2 months ago
    699,           -- Previous separate cost
    200,           -- Manual savings amount (calculated from bundle deal)
    'Combined Hotstar Premium + Disney+ Hotstar into single bundle subscription'
  );

  RAISE NOTICE 'Created: Bundled Hotstar + Disney+ (₹200/month saved)';

  -- =====================================================
  -- TEST CASE 4: ANOTHER CANCEL (for variety)
  -- =====================================================
  -- Scenario: Cancelled Amazon Prime (₹1,499/year = ₹125/month)

  INSERT INTO public.subscriptions (
    user_id,
    service_id,
    custom_service_name,
    cost,
    currency,
    billing_cycle,
    billing_date,
    next_billing_date,
    status,
    cancelled_at,
    cancellation_reason,
    optimization_type,
    optimization_date,
    monthly_savings,
    optimization_notes
  ) VALUES (
    v_user_id,
    v_prime_id,
    CASE WHEN v_prime_id IS NULL THEN 'Amazon Prime' ELSE NULL END,
    1499,
    'INR',
    'yearly',
    '2024-01-01',
    '2025-01-01',
    'cancelled',
    '2024-03-27',  -- Cancelled 7 months ago
    'found_alternative',
    'cancel',
    '2024-03-27',
    125,           -- 1499 ÷ 12 = ₹125/month
    'Switched to free delivery with JioMart'
  );

  RAISE NOTICE 'Created: Cancelled Amazon Prime (₹125/month saved)';

  -- =====================================================
  -- SUMMARY
  -- =====================================================
  RAISE NOTICE '
  ========================================
  TEST DATA CREATED SUCCESSFULLY!
  ========================================

  Visit: http://localhost:3000/dashboard/savings

  Expected Results:
  ------------------
  1. Netflix (Cancelled) - ₹649/month × 6 months = ₹3,894 saved
  2. Spotify (Downgraded) - ₹60/month × 4 months = ₹240 saved
  3. Hotstar Bundle - ₹200/month × 2 months = ₹400 saved
  4. Prime (Cancelled) - ₹125/month × 7 months = ₹875 saved

  Total Monthly Savings Rate: ₹1,034/month
  Total Year-to-Date Savings: ~₹5,409
  Annual Projection: ₹12,408

  Timeline will show:
  - Red "Cancelled" badges for Netflix & Prime
  - Blue "Downgraded" badge for Spotify
  - Purple "Bundled" badge for Hotstar
  ';

END $$;
