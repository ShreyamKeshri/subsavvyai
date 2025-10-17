/**
 * Server Actions for Bundle Recommendations
 * Handles CRUD operations for bundle recommendations
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { trackServerEvent } from '@/lib/analytics/server-events'
import {
  findBundleMatches,
  shouldShowBundleRecommendations,
  type BundleMatch,
  type TelecomBundle,
} from './bundle-matcher'

export interface BundleRecommendation {
  id: string
  user_id: string
  bundle_id: string
  bundle?: TelecomBundle
  matched_subscription_ids: string[]
  matched_subscription_count: number
  current_monthly_cost: number
  bundle_monthly_cost: number
  monthly_savings: number
  annual_savings: number
  match_percentage: number
  recommendation_type: string
  confidence_score: number
  reasoning: string
  status: string
  viewed_at: string | null
  status_updated_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Generate bundle recommendations for the current user
 */
export async function generateBundleRecommendations(): Promise<{
  success: boolean
  recommendations?: BundleMatch[]
  count?: number
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user should see recommendations
    const shouldShow = await shouldShowBundleRecommendations(user.id)
    if (!shouldShow) {
      return {
        success: true,
        recommendations: [],
        count: 0,
      }
    }

    // Find matching bundles
    const matches = await findBundleMatches(user.id, {
      minSavings: 100, // Must save at least ₹100/month
      minMatchPercentage: 40, // Must match 40%+ of subscriptions
      maxResults: 5, // Top 5 recommendations
    })

    // Save recommendations to database
    for (const match of matches) {
      const { error: upsertError } = await supabase
        .from('bundle_recommendations')
        .upsert(
          {
            user_id: user.id,
            bundle_id: match.bundle.id,
            matched_subscription_ids: match.matched_subscription_ids,
            current_monthly_cost: match.current_monthly_cost,
            bundle_monthly_cost: match.bundle_monthly_cost,
            match_percentage: match.match_percentage,
            recommendation_type: match.recommendation_type,
            confidence_score: match.confidence_score,
            reasoning: match.reasoning,
            status: 'pending',
          },
          {
            onConflict: 'user_id,bundle_id',
          }
        )

      if (upsertError) {
        console.error('Error upserting recommendation:', upsertError)
      }
    }

    // Track bundle recommendations generated event
    const totalSavings = matches.reduce((sum, match) => sum + (match.annual_savings || 0), 0)
    await trackServerEvent(user.id, 'bundle_recommendation_generated', {
      userId: user.id,
      bundlesFound: matches.length,
      totalSavings,
    })

    // Note: revalidatePath is handled by the caller (subscription actions or manual trigger)
    // Removed from here to allow fire-and-forget calls during component render

    return {
      success: true,
      recommendations: matches,
      count: matches.length,
    }
  } catch (error) {
    console.error('Error generating bundle recommendations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendations',
    }
  }
}

/**
 * Get bundle recommendations for the current user
 */
export async function getBundleRecommendations(): Promise<{
  success: boolean
  recommendations?: BundleRecommendation[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get saved recommendations with bundle details
    const { data, error } = await supabase
      .from('bundle_recommendations')
      .select(
        `
        *,
        bundle:bundle_id (*)
      `
      )
      .eq('user_id', user.id)
      .in('status', ['pending', 'viewed'])
      .order('annual_savings', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching recommendations:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      recommendations: (data as BundleRecommendation[]) || [],
    }
  } catch (error) {
    console.error('Error getting bundle recommendations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations',
    }
  }
}

/**
 * Mark a recommendation as viewed
 */
export async function markRecommendationAsViewed(recommendationId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('bundle_recommendations')
      .update({
        status: 'viewed',
        viewed_at: new Date().toISOString(),
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update recommendation',
    }
  }
}

/**
 * Accept a bundle recommendation (user switches to the bundle)
 */
export async function acceptBundleRecommendation(recommendationId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('bundle_recommendations')
      .update({
        status: 'accepted',
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept recommendation',
    }
  }
}

/**
 * Dismiss a bundle recommendation
 */
export async function dismissBundleRecommendation(recommendationId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('bundle_recommendations')
      .update({
        status: 'dismissed',
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dismiss recommendation',
    }
  }
}

/**
 * Track when user clicks on a bundle affiliate link
 */
export async function trackBundleClick(
  bundleId: string,
  recommendationId?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get bundle details for tracking
    const { data: bundle } = await supabase
      .from('telecom_bundles')
      .select('*')
      .eq('id', bundleId)
      .single()

    // Get recommendation details if exists
    let estimatedSavings = 0
    if (recommendationId) {
      await markRecommendationAsViewed(recommendationId)

      const { data: recommendation } = await supabase
        .from('bundle_recommendations')
        .select('annual_savings')
        .eq('id', recommendationId)
        .single()

      if (recommendation) {
        estimatedSavings = recommendation.annual_savings
      }
    }

    // Track affiliate click event (REVENUE-CRITICAL)
    if (bundle) {
      await trackServerEvent(user.id, 'affiliate_clicked', {
        bundleId: bundle.id,
        bundleName: bundle.plan_name,
        provider: bundle.provider,
        cost: bundle.monthly_price,
        estimatedSavings,
        affiliateUrl: bundle.official_url,
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track click',
    }
  }
}

/**
 * Get all available bundles (for browsing)
 */
export async function getAllBundles(options: {
  provider?: string
  planType?: string
  maxPrice?: number
  sortBy?: 'price' | 'value' | 'ott_count'
} = {}): Promise<{
  success: boolean
  bundles?: TelecomBundle[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('telecom_bundles')
      .select('*')
      .eq('is_currently_active', true)

    // Apply filters
    if (options.provider) {
      query = query.eq('provider', options.provider)
    }

    if (options.planType) {
      query = query.eq('plan_type', options.planType)
    }

    if (options.maxPrice) {
      query = query.lte('monthly_price', options.maxPrice)
    }

    // Apply sorting
    switch (options.sortBy) {
      case 'price':
        query = query.order('monthly_price', { ascending: true })
        break
      case 'value':
        query = query.order('value_score', { ascending: false })
        break
      case 'ott_count':
        query = query.order('ott_service_count', { ascending: false })
        break
      default:
        query = query.order('value_score', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      bundles: (data as TelecomBundle[]) || [],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get bundles',
    }
  }
}

/**
 * Get a single bundle by ID
 */
export async function getBundleById(bundleId: string): Promise<{
  success: boolean
  bundle?: TelecomBundle
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('telecom_bundles')
      .select('*')
      .eq('id', bundleId)
      .eq('is_currently_active', true)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      bundle: data as TelecomBundle,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get bundle',
    }
  }
}
