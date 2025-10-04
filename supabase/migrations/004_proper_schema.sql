-- Proper Database Schema: User Preferences and Category Preferences
-- This migration adds user preferences table and category preferences
-- Note: notification_preferences already exists in migration 001

-- 1. USER PREFERENCES TABLE (App-level settings and state)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  monthly_budget INTEGER,
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- 2. USER CATEGORY PREFERENCES (Track which subscription categories user is interested in)
-- Uses the existing subscription_category ENUM from migration 001
CREATE TABLE IF NOT EXISTS public.user_category_preferences (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category subscription_category NOT NULL,
  is_preferred BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, category)
);

-- INDEXES for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_prefs_user_id ON public.user_category_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_prefs_category ON public.user_category_preferences(category);

-- TRIGGER: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- TRIGGER: Auto-create default preferences when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default notification preferences (if not exists)
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on new tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_category_preferences ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- User Category Preferences Policies
CREATE POLICY "Users can view their own category preferences"
  ON public.user_category_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category preferences"
  ON public.user_category_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category preferences"
  ON public.user_category_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category preferences"
  ON public.user_category_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.user_preferences IS 'User app preferences and settings';
COMMENT ON TABLE public.user_category_preferences IS 'Track which subscription categories user is interested in';

COMMENT ON COLUMN public.user_preferences.monthly_budget IS 'User monthly subscription budget in their preferred currency';
COMMENT ON COLUMN public.user_preferences.onboarding_completed IS 'Whether user has completed onboarding flow';
