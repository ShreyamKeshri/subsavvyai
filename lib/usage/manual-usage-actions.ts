'use server'

/**
 * Manual Usage Tracking Server Actions
 * Handles user-reported usage data for non-OAuth services
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateRecommendations } from '@/lib/recommendations/recommendation-actions'

export type UsageFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never'

export interface ManualUsageInput {
  subscription_id: string
  usage_frequency: UsageFrequency
  last_used_date?: string | null
  manual_usage_note?: string
}

export interface ManualUsageData {
  id: string
  subscription_id: string
  service_id: string
  usage_frequency: UsageFrequency
  last_used_date: string | null
  manual_usage_note: string | null
  usage_hours: number | null // Estimated based on frequency
  created_at: string
  updated_at: string
}

/**
 * Convert usage frequency to estimated monthly hours
 */
function estimateMonthlyHours(frequency: UsageFrequency): number {
  switch (frequency) {
    case 'daily':
      return 60 // ~2 hours/day
    case 'weekly':
      return 20 // ~5 hours/week
    case 'monthly':
      return 5 // ~5 hours/month
    case 'rarely':
      return 2 // < 2 hours/month
    case 'never':
      return 0
    default:
      return 0
  }
}

/**
 * Save or update manual usage data for a subscription
 */
export async function saveManualUsage(input: ManualUsageInput) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get subscription details to find service_id
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, service_id')
      .eq('id', input.subscription_id)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    // Calculate estimated usage hours from frequency
    const estimatedHours = estimateMonthlyHours(input.usage_frequency)

    // Calculate period (last 30 days)
    const periodEnd = new Date()
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - 30)

    // Check if manual usage record already exists
    const { data: existing } = await supabase
      .from('service_usage')
      .select('id')
      .eq('user_id', user.id)
      .eq('subscription_id', input.subscription_id)
      .eq('is_manual', true)
      .single()

    const usageData = {
      user_id: user.id,
      subscription_id: subscription.id,
      service_id: subscription.service_id,
      usage_frequency: input.usage_frequency,
      last_used_date: input.last_used_date || null,
      manual_usage_note: input.manual_usage_note || null,
      usage_hours: estimatedHours,
      is_manual: true,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      last_synced_at: new Date().toISOString(),
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('service_usage')
        .update(usageData)
        .eq('id', existing.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('service_usage')
        .insert(usageData)

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    // Auto-generate AI recommendations (fire-and-forget)
    // New usage data means we should check for optimization opportunities
    generateRecommendations().catch(error => {
      console.error('Failed to auto-generate AI recommendations:', error)
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save usage data'
    return { success: false, error: message }
  }
}

/**
 * Get manual usage data for user's subscriptions
 */
export async function getManualUsageData() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('service_usage')
      .select(`
        id,
        subscription_id,
        service_id,
        usage_frequency,
        last_used_date,
        manual_usage_note,
        usage_hours,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .eq('is_manual', true)
      .order('updated_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ManualUsageData[] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch usage data'
    return { success: false, error: message }
  }
}

/**
 * Delete manual usage data for a subscription
 */
export async function deleteManualUsage(subscriptionId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('service_usage')
      .delete()
      .eq('user_id', user.id)
      .eq('subscription_id', subscriptionId)
      .eq('is_manual', true)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete usage data'
    return { success: false, error: message }
  }
}

/**
 * Get subscriptions that need usage data (no manual usage reported yet)
 */
export async function getSubscriptionsNeedingUsageData() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        service_id,
        custom_service_name,
        cost,
        services (
          id,
          name,
          category,
          api_provider
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (subError) {
      return { success: false, error: subError.message }
    }

    // Get all manual usage records
    const { data: usageRecords } = await supabase
      .from('service_usage')
      .select('subscription_id')
      .eq('user_id', user.id)
      .eq('is_manual', true)

    const usageMap = new Set(usageRecords?.map(r => r.subscription_id) || [])

    // Filter subscriptions that don't have OAuth and don't have manual usage
    const needingData = subscriptions?.filter(sub => {
      // @ts-expect-error - Supabase returns nested object, not array
      const hasOAuth = sub.services?.api_provider === 'spotify' // Can expand this
      const hasManualUsage = usageMap.has(sub.id)
      return !hasOAuth && !hasManualUsage
    }) || []

    return { success: true, data: needingData }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions'
    return { success: false, error: message }
  }
}
