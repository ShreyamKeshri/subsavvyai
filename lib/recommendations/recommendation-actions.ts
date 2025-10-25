'use server'

/**
 * Server Actions for Optimization Recommendations
 * Handles CRUD operations for AI-generated recommendations
 */

import { createClient } from '@/lib/supabase/server'
import { getUserSubscriptions } from '@/lib/subscriptions/subscription-actions'
import { getAllUserUsageData } from '@/lib/usage/usage-actions'
import { generateAllRecommendations, calculateTotalSavings } from './recommendation-engine'
import { validateInput, uuidSchema } from '@/lib/validators'
import { trackServerEvent } from '@/lib/analytics/server-events'

export interface OptimizationRecommendation {
  id: string
  user_id: string
  subscription_id: string | null
  type: 'downgrade' | 'upgrade' | 'cancel' | 'bundle' // | 'overlap' | 'price_alert' // POST-MVP: Content Overlap & Price Monitoring
  title: string
  description: string
  current_cost: number
  optimized_cost: number
  monthly_savings: number
  annual_savings: number
  confidence_score: number
  details: Record<string, unknown> | null
  status: 'pending' | 'accepted' | 'dismissed' | 'expired'
  expires_at: string | null
  accepted_at: string | null
  dismissed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Generate fresh recommendations for current user
 */
export async function generateRecommendations(): Promise<{
  success: boolean
  data?: OptimizationRecommendation[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Fetch user subscriptions
    const subscriptionsResult = await getUserSubscriptions()
    if (!subscriptionsResult.success || !subscriptionsResult.data) {
      return { success: false, error: 'Failed to fetch subscriptions' }
    }

    // Fetch usage data (includes both OAuth data from Spotify and manual usage data)
    // Manual usage data is automatically converted to usage_hours in saveManualUsage()
    const usageResult = await getAllUserUsageData()
    if (!usageResult.success || !usageResult.data) {
      return { success: false, error: 'Failed to fetch usage data' }
    }

    // Create a map of subscription_id -> usage data (handles both OAuth and manual)
    const usageDataMap = new Map()
    usageResult.data.forEach((usage) => {
      if (usage.subscription_id) {
        usageDataMap.set(usage.subscription_id, usage)
      }
    })

    // Generate recommendations using the engine
    const recommendations = generateAllRecommendations(subscriptionsResult.data, usageDataMap)

    if (recommendations.length === 0) {
      return { success: true, data: [] }
    }

    // Store recommendations in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Recommendations expire in 30 days

    const recommendationsToInsert = recommendations.map((rec) => ({
      user_id: user.id,
      subscription_id: rec.subscription_id,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      current_cost: rec.current_cost,
      optimized_cost: rec.optimized_cost,
      monthly_savings: rec.monthly_savings,
      annual_savings: rec.annual_savings,
      confidence_score: rec.confidence_score,
      details: rec.details,
      status: 'pending' as const,
      expires_at: expiresAt.toISOString()
    }))

    // First, mark all existing pending recommendations as expired
    await supabase
      .from('optimization_recommendations')
      .update({ status: 'expired' })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    // Insert new recommendations
    const { data, error } = await supabase
      .from('optimization_recommendations')
      .insert(recommendationsToInsert)
      .select()

    if (error) {
      console.error('Error storing recommendations:', error)
      return { success: false, error: error.message }
    }

    // Track recommendation generation (North Star + AI Performance metrics)
    const totalSavings = calculateTotalSavings(data as OptimizationRecommendation[])
    const savingsByType = (data as OptimizationRecommendation[]).reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + rec.annual_savings
      return acc
    }, {} as Record<string, number>)

    await trackServerEvent(user.id, 'recommendations_generated', {
      recommendationsCount: data.length,
      totalAnnualSavings: totalSavings.annual,
      totalMonthlySavings: totalSavings.monthly,
      byType: savingsByType,
    })

    // Track if this is user's first recommendation (activation funnel)
    const { count: totalRecsCount } = await supabase
      .from('optimization_recommendations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (totalRecsCount && totalRecsCount <= recommendations.length) {
      await trackServerEvent(user.id, 'onboarding_step_completed', {
        step: 'first_recommendation_generated',
        recommendationsCount: data.length,
        totalSavings: totalSavings.annual,
      })
    }

    // Note: revalidatePath removed because this action is called from client components
    // Client components handle their own data refetching after calling this action

    return { success: true, data: data as OptimizationRecommendation[] }
  } catch (error) {
    console.error('Unexpected error generating recommendations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendations'
    }
  }
}

/**
 * Get all pending recommendations for current user
 */
export async function getPendingRecommendations(): Promise<{
  success: boolean
  data?: OptimizationRecommendation[]
  totalSavings?: { monthly: number; annual: number }
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('optimization_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('annual_savings', { ascending: false })

    if (error) {
      console.error('Error fetching recommendations:', error)
      return { success: false, error: error.message }
    }

    const recommendations = data as OptimizationRecommendation[]
    const totalSavings = calculateTotalSavings(recommendations)

    return {
      success: true,
      data: recommendations,
      totalSavings
    }
  } catch (error) {
    console.error('Unexpected error fetching recommendations:', error)
    return { success: false, error: 'Failed to fetch recommendations' }
  }
}

/**
 * Get all recommendations (including accepted/dismissed) for current user
 */
export async function getAllRecommendations(): Promise<{
  success: boolean
  data?: OptimizationRecommendation[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('optimization_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all recommendations:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as OptimizationRecommendation[] }
  } catch (error) {
    console.error('Unexpected error fetching all recommendations:', error)
    return { success: false, error: 'Failed to fetch recommendations' }
  }
}

/**
 * Accept a recommendation
 */
export async function acceptRecommendation(
  recommendationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate recommendation ID
    const idValidation = validateInput(uuidSchema, recommendationId)
    if (!idValidation.success) {
      return { success: false, error: 'Invalid recommendation ID' }
    }

    // Fetch recommendation details before updating (for tracking)
    const { data: recommendation } = await supabase
      .from('optimization_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('optimization_recommendations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error accepting recommendation:', error)
      return { success: false, error: error.message }
    }

    // Track recommendation acceptance (KEY METRIC for AI performance)
    if (recommendation) {
      await trackServerEvent(user.id, 'recommendation_action_taken', {
        recommendationId,
        recommendationType: recommendation.type,
        action: 'accepted',
        savingsRealized: recommendation.annual_savings,
      })
    }

    // Note: revalidatePath removed - client components handle their own data refetching

    return { success: true }
  } catch (error) {
    console.error('Unexpected error accepting recommendation:', error)
    return { success: false, error: 'Failed to accept recommendation' }
  }
}

/**
 * Dismiss a recommendation
 */
export async function dismissRecommendation(
  recommendationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate recommendation ID
    const idValidation = validateInput(uuidSchema, recommendationId)
    if (!idValidation.success) {
      return { success: false, error: 'Invalid recommendation ID' }
    }

    // Fetch recommendation details before updating (for tracking)
    const { data: recommendation } = await supabase
      .from('optimization_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('optimization_recommendations')
      .update({
        status: 'dismissed',
        dismissed_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error dismissing recommendation:', error)
      return { success: false, error: error.message }
    }

    // Track recommendation dismissal (helps improve AI recommendations)
    if (recommendation) {
      await trackServerEvent(user.id, 'recommendation_action_taken', {
        recommendationId,
        recommendationType: recommendation.type,
        action: 'dismissed',
      })
    }

    // Note: revalidatePath removed - client components handle their own data refetching

    return { success: true }
  } catch (error) {
    console.error('Unexpected error dismissing recommendation:', error)
    return { success: false, error: 'Failed to dismiss recommendation' }
  }
}
