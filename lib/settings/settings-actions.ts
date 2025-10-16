'use server'

/**
 * Settings Server Actions
 * Handle profile, preferences, and notification settings updates
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProfileData {
  full_name?: string
  phone_number?: string
}

export interface PreferencesData {
  theme?: 'light' | 'dark' | 'system'
  language?: string
}

export interface NotificationPreferencesData {
  email_notifications?: boolean
  push_notifications?: boolean
  sms_notifications?: boolean
}

/**
 * Get user profile data
 */
export async function getUserProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone_number, avatar_url, timezone, currency_preference')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Fetch user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('theme, language, currency')
      .eq('user_id', user.id)
      .single()

    if (preferencesError) {
      return { success: false, error: preferencesError.message }
    }

    // Fetch notification preferences
    const { data: notifications, error: notificationsError } = await supabase
      .from('notification_preferences')
      .select('email_enabled, sms_enabled, push_enabled')
      .eq('user_id', user.id)
      .single()

    if (notificationsError) {
      return { success: false, error: notificationsError.message }
    }

    return {
      success: true,
      data: {
        profile,
        preferences,
        notifications,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile'
    return { success: false, error: message }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: ProfileData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone_number: data.phone_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: message }
  }
}

/**
 * Update user preferences (theme, language, etc.)
 */
export async function updatePreferences(data: PreferencesData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('user_preferences')
      .update({
        theme: data.theme,
        language: data.language,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update preferences'
    return { success: false, error: message }
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(data: NotificationPreferencesData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('notification_preferences')
      .update({
        email_enabled: data.email_notifications,
        push_enabled: data.push_notifications,
        sms_enabled: data.sms_notifications,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update notification preferences'
    return { success: false, error: message }
  }
}
