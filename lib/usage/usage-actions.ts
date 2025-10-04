'use server'

/**
 * Server Actions for Service Usage Tracking
 * Handles syncing usage data from external APIs and storing in database
 */

import { createClient } from '@/lib/supabase/server'
import { fetchSpotifyUsageData, getValidSpotifyToken } from '@/lib/oauth/spotify'
import { revalidatePath } from 'next/cache'

export interface ServiceUsage {
  id: string
  user_id: string
  subscription_id: string | null
  service_id: string
  usage_hours: number | null
  usage_sessions: number | null
  usage_count: number | null
  usage_data: Record<string, unknown> | null
  period_start: string
  period_end: string
  last_synced_at: string
  created_at: string
  updated_at: string
}

/**
 * Sync usage data for a specific service
 */
export async function syncServiceUsage(
  subscriptionId: string,
  serviceId: string
): Promise<{ success: boolean; data?: ServiceUsage; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the service to determine provider
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('api_provider, name')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return { success: false, error: 'Service not found' }
    }

    // Get valid access token
    const accessToken = await getValidSpotifyToken(user.id, serviceId)

    if (!accessToken) {
      return { success: false, error: 'Not connected to service. Please connect first.' }
    }

    let usageData: Record<string, unknown> = {}
    let usageHours = 0
    let usageSessions = 0

    // Fetch usage data based on provider
    if (service.api_provider === 'spotify') {
      const spotifyUsage = await fetchSpotifyUsageData(accessToken)

      usageHours = spotifyUsage.total_listening_time_ms / (1000 * 60 * 60) // Convert ms to hours
      usageSessions = spotifyUsage.recently_played
      usageData = {
        listening_time_ms: spotifyUsage.total_listening_time_ms,
        tracks_played: spotifyUsage.total_tracks_played,
        top_artists: spotifyUsage.top_artists,
        top_tracks: spotifyUsage.top_tracks,
        provider: 'spotify'
      }
    } else {
      return { success: false, error: 'Service provider not supported yet' }
    }

    // Calculate period (last 30 days)
    const periodEnd = new Date()
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - 30)

    // Store usage data in database
    const { data, error } = await supabase
      .from('service_usage')
      .upsert({
        user_id: user.id,
        subscription_id: subscriptionId,
        service_id: serviceId,
        usage_hours: usageHours,
        usage_sessions: usageSessions,
        usage_data: usageData,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,service_id,period_start,period_end',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing usage data:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')

    return { success: true, data: data as ServiceUsage }
  } catch (error) {
    console.error('Unexpected error syncing service usage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync service usage'
    }
  }
}

/**
 * Get usage data for a subscription
 */
export async function getSubscriptionUsage(
  subscriptionId: string
): Promise<{ success: boolean; data?: ServiceUsage; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('service_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscription_id', subscriptionId)
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching usage data:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'No usage data found' }
    }

    return { success: true, data: data as ServiceUsage }
  } catch (error) {
    console.error('Unexpected error fetching usage data:', error)
    return { success: false, error: 'Failed to fetch usage data' }
  }
}

/**
 * Get all usage data for current user
 */
export async function getAllUserUsageData(): Promise<{ success: boolean; data?: ServiceUsage[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('service_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('last_synced_at', { ascending: false })

    if (error) {
      console.error('Error fetching all usage data:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ServiceUsage[] }
  } catch (error) {
    console.error('Unexpected error fetching all usage data:', error)
    return { success: false, error: 'Failed to fetch usage data' }
  }
}

/**
 * Check if service is connected (has valid OAuth token)
 */
export async function isServiceConnected(serviceId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return false
    }

    const { data } = await supabase
      .from('oauth_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}

/**
 * Get connected services for current user
 */
export async function getConnectedServices(): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('service_id')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching connected services:', error)
      return { success: false, error: error.message }
    }

    const serviceIds = data.map((token: { service_id: string }) => token.service_id)

    return { success: true, data: serviceIds }
  } catch (error) {
    console.error('Unexpected error fetching connected services:', error)
    return { success: false, error: 'Failed to fetch connected services' }
  }
}
