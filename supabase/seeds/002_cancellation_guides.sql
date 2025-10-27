-- Seed Data: Cancellation Guides
-- Populates cancellation_guides table with guides from Guide.json
-- Run this AFTER migration 012 (upi_mandate_instructions column)

-- Note: This matches exact service names from 001_indian_services.sql
-- Only includes services that exist in the services table (14 total)

-- Netflix
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Netflix'),
  '[
    {"step": 1, "title": "Open Netflix Account Settings", "description": "Go to www.netflix.com and sign in. Click on your profile icon in the top right corner and select Account.", "imageUrl": "/guides/netflix/step1.png", "deepLink": "https://www.netflix.com/account"},
    {"step": 2, "title": "Find Membership & Billing", "description": "Scroll down to the Membership & Billing section.", "imageUrl": "/guides/netflix/step2.png"},
    {"step": 3, "title": "Click Cancel Membership", "description": "Click on the Cancel Membership button.", "imageUrl": "/guides/netflix/step3.png"},
    {"step": 4, "title": "Confirm Cancellation", "description": "Click Finish Cancellation to confirm. You will have access until your current billing period ends.", "imageUrl": "/guides/netflix/step4.png"},
    {"step": 5, "title": "Cancel UPI Auto-Pay", "description": "IMPORTANT: Also cancel your UPI mandate to stop future charges.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay app", "Tap on your profile picture", "Select Autopay", "Find Netflix in the list", "Tap Cancel autopay", "Confirm cancellation"]},
    {"provider": "phonepe", "steps": ["Open PhonePe app", "Go to My Account", "Select AutoPay", "Find Netflix", "Tap Disable"]}
  ]'::jsonb,
  8,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Amazon Prime Video
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Amazon Prime Video'),
  '[
    {"step": 1, "title": "Go to Amazon Account", "description": "Visit amazon.in and click on Account & Lists in the top right.", "imageUrl": "/guides/prime/step1.png", "deepLink": "https://www.amazon.in/gp/css/homepage.html"},
    {"step": 2, "title": "Select Prime Membership", "description": "Click on Your Prime Membership from the dropdown menu.", "imageUrl": "/guides/prime/step2.png"},
    {"step": 3, "title": "Manage Membership", "description": "Click Edit membership and then Cancel membership.", "imageUrl": "/guides/prime/step3.png"},
    {"step": 4, "title": "Confirm Cancellation", "description": "Follow the prompts to confirm. You will have access until the end of your billing period.", "imageUrl": "/guides/prime/step4.png"},
    {"step": 5, "title": "Cancel UPI Auto-Pay", "description": "If subscribed via UPI, also cancel the mandate.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay app", "Tap profile picture", "Select Autopay", "Find Amazon in list", "Tap Cancel autopay"]},
    {"provider": "phonepe", "steps": ["Open PhonePe app", "Go to AutoPay section", "Find Amazon", "Disable autopay"]}
  ]'::jsonb,
  10,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Disney+ Hotstar
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Disney+ Hotstar'),
  '[
    {"step": 1, "title": "Go to Hotstar Settings", "description": "Open Disney+ Hotstar app or website and sign in.", "imageUrl": "/guides/hotstar/step1.png", "deepLink": "https://www.hotstar.com/in/subscribe"},
    {"step": 2, "title": "View Subscription", "description": "Go to My Account > Subscription.", "imageUrl": "/guides/hotstar/step2.png"},
    {"step": 3, "title": "Cancel Subscription", "description": "Click View Details and then Cancel Subscription.", "imageUrl": "/guides/hotstar/step3.png"},
    {"step": 4, "title": "Confirm", "description": "Confirm the cancellation. Access continues until period ends.", "imageUrl": "/guides/hotstar/step4.png"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay", "Go to Autopay", "Find Hotstar", "Cancel autopay"]},
    {"provider": "phonepe", "steps": ["Open PhonePe", "Go to AutoPay", "Find Hotstar", "Disable"]}
  ]'::jsonb,
  8,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Spotify
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Spotify'),
  '[
    {"step": 1, "title": "Visit Spotify Account", "description": "Go to spotify.com/account and log in.", "imageUrl": "/guides/spotify/step1.png", "deepLink": "https://www.spotify.com/account"},
    {"step": 2, "title": "Go to Subscription", "description": "Click on your profile and select Account.", "imageUrl": "/guides/spotify/step2.png"},
    {"step": 3, "title": "Cancel Premium", "description": "Under Subscription, click Cancel Premium.", "imageUrl": "/guides/spotify/step3.png"},
    {"step": 4, "title": "Confirm", "description": "Follow prompts to confirm cancellation.", "imageUrl": "/guides/spotify/step4.png"}
  ]'::jsonb,
  NULL,
  7,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- YouTube Music (using YouTube Music instead of YouTube Premium)
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'YouTube Music'),
  '[
    {"step": 1, "title": "Open YouTube Settings", "description": "Go to youtube.com/paid_memberships.", "imageUrl": "/guides/youtube/step1.png", "deepLink": "https://www.youtube.com/paid_memberships"},
    {"step": 2, "title": "View Memberships", "description": "Find YouTube Premium in your memberships list.", "imageUrl": "/guides/youtube/step2.png"},
    {"step": 3, "title": "Cancel Membership", "description": "Click Cancel membership.", "imageUrl": "/guides/youtube/step3.png"},
    {"step": 4, "title": "Confirm", "description": "Confirm cancellation. Access until period ends.", "imageUrl": "/guides/youtube/step4.png"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay", "Tap profile", "Select Subscriptions", "Find YouTube Premium", "Cancel"]}
  ]'::jsonb,
  6,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- ZEE5
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'ZEE5'),
  '[
    {"step": 1, "title": "Login to Zee5", "description": "Go to https://www.zee5.com and log in with your account.", "imageUrl": "/guides/zee5/step1.png", "deepLink": "https://www.zee5.com"},
    {"step": 2, "title": "Access Account Settings", "description": "Click on your profile picture and select Account.", "imageUrl": "/guides/zee5/step2.png"},
    {"step": 3, "title": "Select Subscription", "description": "Go to Subscription to see your active plan.", "imageUrl": "/guides/zee5/step3.png"},
    {"step": 4, "title": "Click Cancel Subscription", "description": "Click Cancel Subscription and confirm the action.", "imageUrl": "/guides/zee5/step4.png"},
    {"step": 5, "title": "Cancel UPI Auto-Pay", "description": "Cancel UPI auto-pay to avoid future charges.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay app", "Tap profile picture", "Select Autopay", "Find Zee5", "Tap Cancel autopay", "Confirm cancellation"]},
    {"provider": "phonepe", "steps": ["Open PhonePe app", "Go to My Account", "Select AutoPay", "Find Zee5", "Tap Disable"]}
  ]'::jsonb,
  7,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- SonyLIV
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'SonyLIV'),
  '[
    {"step": 1, "title": "Sign in to SonyLIV", "description": "Visit https://www.sonyliv.com and log in.", "imageUrl": "/guides/sonyliv/step1.png", "deepLink": "https://www.sonyliv.com"},
    {"step": 2, "title": "Go to Account", "description": "Click on profile icon > Account.", "imageUrl": "/guides/sonyliv/step2.png"},
    {"step": 3, "title": "Select Subscription", "description": "Click on your subscription plan.", "imageUrl": "/guides/sonyliv/step3.png"},
    {"step": 4, "title": "Click Cancel", "description": "Click Cancel Subscription and follow the confirmation steps.", "imageUrl": "/guides/sonyliv/step4.png"},
    {"step": 5, "title": "Cancel UPI Auto-Pay", "description": "Cancel UPI mandate to stop recurring payments.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay app", "Tap profile picture", "Select Autopay", "Find SonyLIV", "Tap Cancel autopay", "Confirm cancellation"]},
    {"provider": "phonepe", "steps": ["Open PhonePe app", "Go to My Account", "Select AutoPay", "Find SonyLIV", "Tap Disable"]}
  ]'::jsonb,
  6,
  'medium',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Zomato Gold
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Zomato Gold'),
  '[
    {"step": 1, "title": "Open Zomato App", "description": "Sign in and go to your profile.", "imageUrl": "/guides/zomato_gold/step1.png", "deepLink": "https://www.zomato.com"},
    {"step": 2, "title": "Go to Gold Membership", "description": "Click on Gold Membership under profile.", "imageUrl": "/guides/zomato_gold/step2.png"},
    {"step": 3, "title": "Select Cancel Membership", "description": "Click Cancel Membership and confirm.", "imageUrl": "/guides/zomato_gold/step3.png"},
    {"step": 4, "title": "Cancel UPI Auto-Pay", "description": "Cancel UPI mandate to prevent future deductions.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay app", "Tap profile picture", "Select Autopay", "Find Zomato Gold", "Tap Cancel autopay", "Confirm cancellation"]},
    {"provider": "phonepe", "steps": ["Open PhonePe app", "Go to My Account", "Select AutoPay", "Find Zomato Gold", "Tap Disable"]}
  ]'::jsonb,
  5,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Swiggy One
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Swiggy One'),
  '[
    {"step": 1, "title": "Open Swiggy App", "description": "Sign in to your Swiggy account and tap on your profile.", "imageUrl": "/guides/swiggy_one/step1.png", "deepLink": "https://www.swiggy.com"},
    {"step": 2, "title": "Go to Swiggy One Membership", "description": "Select Swiggy One from profile menu.", "imageUrl": "/guides/swiggy_one/step2.png"},
    {"step": 3, "title": "Tap Cancel Membership", "description": "Click Cancel Membership and follow prompts.", "imageUrl": "/guides/swiggy_one/step3.png"},
    {"step": 4, "title": "Cancel UPI Auto-Pay", "description": "Cancel UPI mandate to avoid further charges.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open Google Pay app", "Tap profile", "Select Autopay", "Find Swiggy One", "Cancel autopay", "Confirm"]},
    {"provider": "phonepe", "steps": ["Open PhonePe app", "Go to AutoPay", "Find Swiggy One", "Disable autopay"]}
  ]'::jsonb,
  5,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- JioSaavn Pro
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'JioSaavn Pro'),
  '[
    {"step": 1, "title": "Open JioSaavn App", "description": "Sign in and go to Settings.", "imageUrl": "/guides/jiosaavn/step1.png", "deepLink": "https://www.jiosaavn.com"},
    {"step": 2, "title": "Go to My Subscription", "description": "Click on Subscription to view plan.", "imageUrl": "/guides/jiosaavn/step2.png"},
    {"step": 3, "title": "Select Cancel Subscription", "description": "Tap Cancel Subscription and confirm.", "imageUrl": "/guides/jiosaavn/step3.png"},
    {"step": 4, "title": "Cancel UPI Auto-Pay", "description": "Cancel UPI mandate to avoid auto-charges.", "deepLink": "#upi-instructions"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open GPay", "Tap profile", "Select Autopay", "Find JioSaavn", "Cancel autopay", "Confirm"]},
    {"provider": "phonepe", "steps": ["Open PhonePe", "Go to AutoPay", "Find JioSaavn", "Disable autopay"]}
  ]'::jsonb,
  5,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Voot (REMOVED - merged with JioCinema/Disney+ Hotstar)
-- Voot is no longer a standalone service as of 2023

-- Gaana Plus
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Gaana Plus'),
  '[
    {"step": 1, "title": "Open Gaana App", "description": "Sign in and navigate to Settings.", "imageUrl": "/guides/gaana/step1.png", "deepLink": "https://gaana.com"},
    {"step": 2, "title": "Select Subscription", "description": "Go to Subscription to view active plan.", "imageUrl": "/guides/gaana/step2.png"},
    {"step": 3, "title": "Cancel Subscription", "description": "Click Cancel Subscription and confirm.", "imageUrl": "/guides/gaana/step3.png"}
  ]'::jsonb,
  '[
    {"provider": "gpay", "steps": ["Open GPay", "Tap profile", "Autopay", "Find Gaana", "Cancel autopay"]}
  ]'::jsonb,
  4,
  'easy',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Cult.fit
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Cult.fit'),
  '[
    {"step": 1, "title": "Login to Cult.fit App", "description": "Sign in and navigate to Profile.", "imageUrl": "/guides/cult_fit/step1.png", "deepLink": "https://www.cult.fit"},
    {"step": 2, "title": "Go to Memberships", "description": "Select your active membership plan.", "imageUrl": "/guides/cult_fit/step2.png"},
    {"step": 3, "title": "Cancel Membership", "description": "Click Cancel Membership and follow prompts.", "imageUrl": "/guides/cult_fit/step3.png"}
  ]'::jsonb,
  NULL,
  5,
  'medium',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();

-- Times Prime
INSERT INTO public.cancellation_guides (service_id, steps, upi_mandate_instructions, estimated_time_minutes, difficulty_level, last_verified_at)
VALUES (
  (SELECT id FROM public.services WHERE name = 'Times Prime'),
  '[
    {"step": 1, "title": "Login to Times Prime", "description": "Visit https://www.timesprime.com and log in.", "imageUrl": "/guides/times_prime/step1.png", "deepLink": "https://www.timesprime.com"},
    {"step": 2, "title": "Go to My Account > Membership", "description": "Select Membership to see active plans.", "imageUrl": "/guides/times_prime/step2.png"},
    {"step": 3, "title": "Cancel Membership", "description": "Click Cancel Membership and follow confirmation steps.", "imageUrl": "/guides/times_prime/step3.png"}
  ]'::jsonb,
  NULL,
  5,
  'medium',
  '2025-10-26'::timestamptz
)
ON CONFLICT (service_id) DO UPDATE SET
  steps = EXCLUDED.steps,
  upi_mandate_instructions = EXCLUDED.upi_mandate_instructions,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();
