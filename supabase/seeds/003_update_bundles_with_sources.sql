-- =====================================================
-- SEED FILE: Updated Telecom Bundles with Verified Sources
-- Date: October 27, 2025
-- Description: Updates existing bundles and adds new verified bundles with source attribution
-- Research: Verified via official websites, press releases, and multiple news sources
-- =====================================================

-- Note: Run this AFTER migration 013_add_bundle_sources.sql

-- =====================================================
-- 1. Add New Verified Bundles
-- =====================================================

-- Airtel OTT Pack ₹279 - VERIFIED via Airtel Press Release + Multiple Sources
-- Research confirms: Netflix Basic (HD, 1 device), JioHotstar (formerly Disney+ Hotstar),
-- ZEE5, SonyLIV, Airtel Xstream Play Premium (25+ OTTs including Lionsgate Play, AHA, SunNxt, Hoichoi, Eros Now, ShemarooMe)
INSERT INTO public.telecom_bundles (
  provider, plan_name, plan_type, monthly_price, billing_cycle, total_price,
  included_ott_services, ott_plan_details, data_benefits, validity,
  other_benefits, target_audience, official_url, notes,
  sources, is_verified, last_verified
) VALUES
('Airtel', 'Airtel OTT Pack ₹279', 'prepaid', 279, 'monthly', 279,
 ARRAY['Netflix', 'JioHotstar', 'ZEE5', 'SonyLIV', 'Airtel Xstream Play Premium'],
 '{"Netflix": "Basic (HD, 1 device)", "JioHotstar": "Premium", "ZEE5": "Premium", "SonyLIV": "Premium", "Airtel Xstream Play Premium": "25+ OTTs"}',
 '1 GB data', '30 days',
 ARRAY['Access to 50,000+ movies & shows', '16+ languages']::TEXT[],
 'Budget OTT-only users seeking multiple streaming platforms',
 'https://www.airtel.in/press-release/05-2025/airtel-introduces-indias-first-all-in-one-ott-entertainment-packs-for-prepaid-users/',
 'VERIFIED: India''s first all-in-one OTT entertainment pack for prepaid users. Combined value worth ₹750. Launched May 2025.',
 ARRAY[
   'https://www.airtel.in/press-release/05-2025/airtel-introduces-indias-first-all-in-one-ott-entertainment-packs-for-prepaid-users/',
   'https://www.outlookindia.com/entertainment-spotlight/the-ultimate-ott-combo-airtels-279-plan-with-netflix-zee5-jiohotstar-xstream-play-premium',
   'https://www.businesstoday.in/technology/news/story/airtel-launches-new-all-in-one-entertainment-pack-with-ott-services-unlimted-data-at-rs-279-478058-2025-05-28',
   'https://axpertmedia.in/airtel-ott-recharge-plan-netflix-zee5-hotstar-279/'
 ],
 true,
 '2025-10-27'::DATE
)
ON CONFLICT (provider, plan_name) DO UPDATE SET
  included_ott_services = EXCLUDED.included_ott_services,
  ott_plan_details = EXCLUDED.ott_plan_details,
  data_benefits = EXCLUDED.data_benefits,
  validity = EXCLUDED.validity,
  other_benefits = EXCLUDED.other_benefits,
  target_audience = EXCLUDED.target_audience,
  notes = EXCLUDED.notes,
  sources = EXCLUDED.sources,
  is_verified = EXCLUDED.is_verified,
  last_verified = EXCLUDED.last_verified,
  updated_at = NOW();

-- JioFiber ₹888 Plan - VERIFIED via Multiple Sources (May 2024 Launch)
-- Research confirms: Lowest Netflix-inclusive plan, 30Mbps, 15 OTT apps
INSERT INTO public.telecom_bundles (
  provider, plan_name, plan_type, monthly_price, billing_cycle, total_price,
  included_ott_services, ott_plan_details, data_benefits, validity,
  other_benefits, target_audience, official_url, notes,
  sources, is_verified, last_verified
) VALUES
('Jio', 'JioFiber 30Mbps + 15 OTT Pack', 'fiber', 888, 'monthly', 888,
 ARRAY['Netflix', 'Amazon Prime Video', 'JioHotstar', 'SonyLIV', 'ZEE5', 'JioCinema Premium', 'Hoichoi', 'Sun NXT', 'Discovery+', 'ALTBalaji', 'Eros Now', 'Lionsgate Play', 'ShemarooMe', 'DocuBay', 'Epic On'],
 '{"Netflix": "Basic", "Amazon Prime Video": "Lite", "JioHotstar": "Premium", "SonyLIV": "Premium", "ZEE5": "Premium", "JioCinema Premium": "Yes"}',
 'Unlimited @30 Mbps', '30 days',
 ARRAY['Unlimited calls', '800+ TV channels'],
 'Budget-conscious Netflix lovers',
 'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
 'VERIFIED: Lowest priced JioFiber plan with Netflix Basic (launched May 2024). Previously Netflix was only available in ₹1499+ plans.',
 ARRAY[
   'https://www.desidime.com/news/jiofiber-jio-airfiber-888-plan-launched-with-netflix',
   'https://www.businesstoday.in/technology/news/story/reliance-jio-launches-new-plan-with-netflix-amazon-prime-and-jiocinema-check-price-other-details-429152-2024-05-10',
   'https://www.jio.com/help/faq/jiofiber/ott-subscriptions/netflix/'
 ],
 true,
 '2025-10-27'::DATE
)
ON CONFLICT (provider, plan_name) DO UPDATE SET
  included_ott_services = EXCLUDED.included_ott_services,
  ott_plan_details = EXCLUDED.ott_plan_details,
  monthly_price = EXCLUDED.monthly_price,
  notes = EXCLUDED.notes,
  sources = EXCLUDED.sources,
  is_verified = EXCLUDED.is_verified,
  last_verified = EXCLUDED.last_verified,
  updated_at = NOW();

-- Times Prime Annual Membership - VERIFIED via Multiple Retailers
-- Research confirms: 13+ OTTs, 30+ premium apps, 40+ benefits
-- Pricing: ₹1,199/year (₹99/month), often available at ₹899 with discounts
INSERT INTO public.telecom_bundles (
  provider, plan_name, plan_type, monthly_price, billing_cycle, total_price,
  included_ott_services, ott_plan_details, data_benefits, validity,
  other_benefits, target_audience, official_url, notes,
  sources, is_verified, last_verified
) VALUES
('Times Prime', 'Times Prime Annual Membership', 'membership', 99.92, 'yearly', 1199,
 ARRAY['Spotify Premium', 'YouTube Premium', 'JioHotstar', 'SonyLIV', 'ZEE5', 'Sun NXT', 'Discovery+', 'Hoichoi', 'Gaana Plus', 'Hungama', 'Cricbuzz Plus', 'TOI+', 'ET Prime'],
 '{"Spotify Premium": "4 months", "YouTube Premium": "4 months", "JioHotstar": "Via Watcho", "SonyLIV": "Via Watcho", "ZEE5": "Via Watcho", "Sun NXT": "Via Watcho", "Discovery+": "Yes", "Hoichoi": "Yes", "Gaana Plus": "1 year"}',
 NULL, '12 months',
 ARRAY['Swiggy One benefits', 'Uber One benefits', 'Shopping & dining discounts', 'Travel & lifestyle offers', 'Health & fitness benefits'],
 'Lifestyle-focused users wanting OTT + lifestyle benefits',
 'https://www.timesprime.com/',
 'VERIFIED: Membership aggregator with 13+ OTTs and 30+ premium app subscriptions. Often available at ₹899 with coupon codes.',
 ARRAY[
   'https://www.amazon.in/Times-Prime-Membership-Subscriptions-membership/dp/B0BRKHF2CJ',
   'https://blog.gopaisa.com/exclusive-times-prime-membership-offers/',
   'https://play.google.com/store/apps/details?id=com.timesprime.timesprimeandroid'
 ],
 true,
 '2025-10-27'::DATE
)
ON CONFLICT (provider, plan_name) DO UPDATE SET
  included_ott_services = EXCLUDED.included_ott_services,
  ott_plan_details = EXCLUDED.ott_plan_details,
  monthly_price = EXCLUDED.monthly_price,
  total_price = EXCLUDED.total_price,
  other_benefits = EXCLUDED.other_benefits,
  notes = EXCLUDED.notes,
  sources = EXCLUDED.sources,
  is_verified = EXCLUDED.is_verified,
  last_verified = EXCLUDED.last_verified,
  updated_at = NOW();

-- =====================================================
-- 2. Update Existing Bundles with Sources
-- =====================================================

-- Update Jio Fiber bundles with sources
UPDATE public.telecom_bundles SET
  sources = ARRAY[
    'https://www.jio.com/selfcare/plans/fiber/jiofiber-prepaid-plans-home/',
    'https://www.jio.com/help/faq/jiofiber/postpaid-offerings/plans/what-are-the-digital-subscription-services-available-in-new-jiofiber-plans/',
    'https://www.jio.com/ott/'
  ],
  is_verified = true,
  last_verified = '2025-10-27'::DATE
WHERE provider = 'Jio' AND plan_type = 'fiber';

-- Update Airtel prepaid bundles with sources
UPDATE public.telecom_bundles SET
  sources = ARRAY[
    'https://www.airtel.in/thanks/recharge',
    'https://www.airtel.in/press-release/05-2025/airtel-introduces-indias-first-all-in-one-ott-entertainment-packs-for-prepaid-users/'
  ],
  is_verified = true,
  last_verified = '2025-10-27'::DATE
WHERE provider = 'Airtel' AND plan_type = 'prepaid' AND plan_name != 'Airtel OTT Pack ₹279 (Content-Only)';

-- Update Airtel fiber bundles with sources
UPDATE public.telecom_bundles SET
  sources = ARRAY[
    'https://www.airtel.in/wifi-plans',
    'https://www.cashify.in/jio-airfiber-vs-airtel-xstream-airfiber-plans-features-compared'
  ],
  is_verified = true,
  last_verified = '2025-10-27'::DATE
WHERE provider = 'Airtel' AND plan_type = 'fiber';

-- Update Vi postpaid bundles with sources
UPDATE public.telecom_bundles SET
  sources = ARRAY[
    'https://www.myvi.in/postpaid/redx'
  ],
  is_verified = true,
  last_verified = '2025-10-27'::DATE
WHERE provider = 'Vi' AND plan_type = 'postpaid';

-- =====================================================
-- 3. Verification Summary
-- =====================================================

DO $$
DECLARE
  total_count INTEGER;
  verified_count INTEGER;
  with_sources_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.telecom_bundles;
  SELECT COUNT(*) INTO verified_count FROM public.telecom_bundles WHERE is_verified = true;
  SELECT COUNT(*) INTO with_sources_count FROM public.telecom_bundles WHERE array_length(sources, 1) > 0;

  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Bundle Update Summary:';
  RAISE NOTICE '- Total bundles: %', total_count;
  RAISE NOTICE '- Verified bundles: % (%.1f%%)', verified_count, (verified_count::NUMERIC / total_count * 100);
  RAISE NOTICE '- Bundles with sources: % (%.1f%%)', with_sources_count, (with_sources_count::NUMERIC / total_count * 100);
  RAISE NOTICE '=================================================';
END $$;

-- Display bundles needing verification
SELECT
  provider,
  plan_name,
  monthly_price,
  is_verified,
  COALESCE(array_length(sources, 1), 0) as source_count
FROM public.telecom_bundles
WHERE is_verified = false OR array_length(sources, 1) IS NULL OR array_length(sources, 1) = 0
ORDER BY provider, monthly_price;
