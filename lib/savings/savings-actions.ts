'use server'

/**
 * Server Actions for Savings Tracking
 * Handles cancelling subscriptions with reasons and fetching savings data
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { trackServerEvent } from '@/lib/analytics/server-events'
import { validateInput, uuidSchema, cancellationReasonSchema } from '@/lib/validators'
import {
  projectAnnualSavings,
  calculateGoalProgress,
  type CancellationReason,
} from './savings-utils'
import type { Subscription } from '@/lib/subscriptions/subscription-actions'

export interface CancelledSubscription extends Subscription {
  cancelled_at: string
  cancellation_reason: string | null
  totalSaved: number
  monthsSince: number
}

export interface SavingsData {
  totalLifetimeSavings: number
  totalYearToDateSavings: number
  monthlySavingsRate: number
  annualProjection: number
  cancelledSubscriptions: CancelledSubscription[]
  goalProgress: {
    progress: number
    amount: number
    goal: number
    remaining: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  }
}

/**
 * Cancel a subscription with a reason
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason: CancellationReason
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate subscription ID
    const idValidation = validateInput(uuidSchema, subscriptionId)
    if (!idValidation.success) {
      return { success: false, error: 'Invalid subscription ID' }
    }

    // Validate cancellation reason
    const reasonValidation = validateInput(cancellationReasonSchema, reason)
    if (!reasonValidation.success) {
      const firstError = Object.values(reasonValidation.errors)[0]
      return { success: false, error: firstError }
    }

    // Get subscription details for tracking
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, service:services(name)')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    // Update subscription status to cancelled with reason
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        // cancelled_at is auto-set by database trigger
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error cancelling subscription:', updateError)
      return { success: false, error: updateError.message }
    }

    // Track cancellation event
    await trackServerEvent(user.id, 'subscription_cancelled', {
      subscriptionId,
      serviceName: subscription.service?.name || subscription.custom_service_name || 'Unknown',
      reason,
      monthlyCost: subscription.cost,
      billingCycle: subscription.billing_cycle,
    })

    // Revalidate dashboard and savings page
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/savings')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error cancelling subscription:', error)
    return { success: false, error: 'Failed to cancel subscription' }
  }
}

/**
 * Get all savings data for the current user
 */
export async function getSavingsData(): Promise<{ success: boolean; data?: SavingsData; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Fetch all optimized subscriptions (cancelled, downgraded, bundled)
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        service:services(id, name, category, logo_url)
      `)
      .eq('user_id', user.id)
      .not('optimization_type', 'is', null)
      .not('optimization_date', 'is', null)
      .is('deleted_at', null)
      .order('optimization_date', { ascending: false })

    if (fetchError) {
      console.error('Error fetching cancelled subscriptions:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!subscriptions || subscriptions.length === 0) {
      // No optimized subscriptions - return empty data
      return {
        success: true,
        data: {
          totalLifetimeSavings: 0,
          totalYearToDateSavings: 0,
          monthlySavingsRate: 0,
          annualProjection: 0,
          cancelledSubscriptions: [],
          goalProgress: {
            progress: 0,
            amount: 0,
            goal: 10000,
            remaining: 10000,
            tier: 'bronze',
          },
        },
      }
    }

    // Calculate savings for each optimized subscription
    const cancelledWithSavings: CancelledSubscription[] = subscriptions.map((sub) => {
      // Use monthly_savings from database (auto-calculated by trigger)
      const monthlySavings = sub.monthly_savings || 0
      const optimizationDate = sub.optimization_date || sub.cancelled_at!

      // Calculate total saved = monthly_savings × months since optimization
      const monthsSince = Math.floor(
        (Date.now() - new Date(optimizationDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      const totalSaved = monthlySavings * Math.max(0, monthsSince)

      return {
        ...sub,
        cancelled_at: sub.cancelled_at || optimizationDate,
        totalSaved,
        monthsSince,
      } as CancelledSubscription
    })

    // Calculate aggregate stats
    const totalLifetimeSavings = cancelledWithSavings.reduce(
      (sum, sub) => sum + sub.totalSaved,
      0
    )

    // Year-to-date savings: sum of monthly_savings × months this year
    const totalYearToDateSavings = cancelledWithSavings.reduce((sum, sub) => {
      const monthlySavings = sub.monthly_savings || 0
      const optimizationDate = sub.optimization_date || sub.cancelled_at!
      const optimized = new Date(optimizationDate)
      const now = new Date()
      const yearStart = new Date(now.getFullYear(), 0, 1)

      // If optimized before this year, count from January 1st
      const effectiveStart = optimized < yearStart ? yearStart : optimized

      // Calculate months from effective start to now
      const yearsDiff = now.getFullYear() - effectiveStart.getFullYear()
      const monthsDiff = now.getMonth() - effectiveStart.getMonth()
      const monthsInYear = yearsDiff * 12 + monthsDiff

      return sum + (monthlySavings * Math.max(0, monthsInYear))
    }, 0)

    // Monthly savings rate = sum of all monthly_savings
    const monthlySavingsRate = cancelledWithSavings.reduce(
      (sum, sub) => sum + (sub.monthly_savings || 0),
      0
    )

    const annualProjection = projectAnnualSavings(monthlySavingsRate)

    const goalProgress = calculateGoalProgress(totalYearToDateSavings)

    // Track savings viewed event
    await trackServerEvent(user.id, 'savings_dashboard_viewed', {
      totalLifetimeSavings,
      totalYearToDateSavings,
      cancelledCount: cancelledWithSavings.length,
      tier: goalProgress.tier,
    })

    return {
      success: true,
      data: {
        totalLifetimeSavings,
        totalYearToDateSavings,
        monthlySavingsRate,
        annualProjection,
        cancelledSubscriptions: cancelledWithSavings,
        goalProgress,
      },
    }
  } catch (error) {
    console.error('Unexpected error fetching savings data:', error)
    return { success: false, error: 'Failed to fetch savings data' }
  }
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate subscription ID
    const idValidation = validateInput(uuidSchema, subscriptionId)
    if (!idValidation.success) {
      return { success: false, error: 'Invalid subscription ID' }
    }

    // Get subscription details
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, service:services(name)')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    // Reactivate subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        cancelled_at: null,
        cancellation_reason: null,
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error reactivating subscription:', updateError)
      return { success: false, error: updateError.message }
    }

    // Track reactivation event
    await trackServerEvent(user.id, 'subscription_reactivated', {
      subscriptionId,
      serviceName: subscription.service?.name || subscription.custom_service_name || 'Unknown',
    })

    // Revalidate dashboard and savings page
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/savings')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error reactivating subscription:', error)
    return { success: false, error: 'Failed to reactivate subscription' }
  }
}
