-- =====================================================
-- SEED DATA: INDIAN SUBSCRIPTION SERVICES
-- =====================================================
-- Populate services table with 50+ popular Indian subscription services
-- Source: constants/indian-services.ts

INSERT INTO public.services (name, category, typical_price_inr, is_active) VALUES
  -- OTT Platforms
  ('Netflix', 'OTT', 649.00, true),
  ('Amazon Prime Video', 'OTT', 124.92, true),
  ('Disney+ Hotstar', 'OTT', 124.92, true),
  ('SonyLIV', 'OTT', 299.00, true),
  ('ZEE5', 'OTT', 299.00, true),
  -- ('Voot', 'OTT', 299.00, true), -- REMOVED: Merged with JioCinema/Disney+ Hotstar in 2023
  -- ('MX Player', 'OTT', 149.00, true), -- REMOVED: Premium discontinued, now free with ads only
  -- ('Eros Now', 'OTT', 79.00, true), -- REMOVED: Merged into Eros One, subscription unclear
  ('ALTBalaji', 'OTT', 100.00, true),
  ('hoichoi', 'OTT', 116.33, true),
  ('Sun NXT', 'OTT', 33.25, true),
  ('Lionsgate Play', 'OTT', 99.00, true),

  -- Music Streaming
  ('Spotify', 'Music', 119.00, true),
  ('Apple Music', 'Music', 99.00, true),
  ('YouTube Music', 'Music', 99.00, true),
  ('Gaana Plus', 'Music', 99.00, true),
  ('JioSaavn Pro', 'Music', 99.00, true),
  ('Amazon Music Unlimited', 'Music', 149.00, true),
  -- ('Wynk Music', 'Music', 99.00, true), -- REMOVED: Airtel shutting down, migrating to Apple Music

  -- Food Delivery
  ('Zomato Gold', 'Food Delivery', 300.00, true),
  ('Swiggy One', 'Food Delivery', 116.33, true),
  ('Dineout Passport', 'Food Delivery', 99.67, true),

  -- SaaS & Productivity
  ('Microsoft 365', 'SaaS', 489.00, true),
  ('Google Workspace', 'SaaS', 672.00, true),
  ('Adobe Creative Cloud', 'SaaS', 2599.00, true),
  ('Canva Pro', 'SaaS', 399.00, true),
  ('Notion Plus', 'SaaS', 680.00, true),
  ('Evernote Premium', 'SaaS', 419.00, true),
  ('Dropbox Plus', 'SaaS', 830.00, true),
  ('GitHub Pro', 'SaaS', 330.00, true),
  ('ChatGPT Plus', 'SaaS', 1650.00, true),

  -- Fitness
  ('Cult.fit', 'Fitness', 1499.00, true),
  ('HealthifyMe Pro', 'Fitness', 399.67, true),
  ('Fitpass', 'Fitness', 799.00, true),
  -- ('Nike Training Club', 'Fitness', 499.00, true), -- REMOVED: Made completely free in 2020

  -- News & Magazines
  ('Times Prime', 'News', 83.25, true),
  ('The Hindu', 'News', 149.00, true),
  ('Indian Express', 'News', 149.00, true),
  ('Economic Times', 'News', 199.00, true),
  ('Magzter Gold', 'News', 333.25, true),

  -- Gaming
  ('Xbox Game Pass', 'Gaming', 489.00, true),
  ('PlayStation Plus', 'Gaming', 499.00, true),
  ('Apple Arcade', 'Gaming', 99.00, true),

  -- Education
  ('Coursera Plus', 'Education', 416.58, true),
  ('Udemy Pro', 'Education', 1500.00, true),
  ('LinkedIn Learning', 'Education', 1599.00, true),
  ('Skillshare', 'Education', 1200.00, true),
  ('Unacademy Plus', 'Education', 999.00, true),
  ('BYJU''S', 'Education', 2000.00, true)
ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT
  category,
  COUNT(*) as service_count,
  ROUND(AVG(typical_price_inr), 2) as avg_price
FROM public.services
GROUP BY category
ORDER BY category;

-- Display total count
SELECT COUNT(*) as total_services FROM public.services;
