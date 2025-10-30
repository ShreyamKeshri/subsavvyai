'use server'

/**
 * Payment Server Actions
 * Handle Razorpay payment operations and tier management
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getRazorpayInstance, verifyPaymentSignature } from './razorpay-server'
import type { BillingCycle, SubscriptionTier } from './razorpay-config'

type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a Razorpay order for subscription purchase
 */
export async function createPaymentOrder(
  tier: SubscriptionTier,
  cycle: BillingCycle
): Promise<ActionResponse<{ orderId: string; amount: number; currency: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate tier (only pro/premium can be purchased)
    if (tier === 'free') {
      return { success: false, error: 'Cannot purchase free tier' }
    }

    // Calculate amount based on tier and cycle
    const amount = tier === 'pro' ? (cycle === 'monthly' ? 99 : 999) : 0

    // Create Razorpay order
    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        tier,
        billing_cycle: cycle,
      },
    })

    // Save transaction in database
    const { error: dbError } = await supabase.from('payment_transactions').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount,
      currency: 'INR',
      status: 'initiated',
      tier,
      billing_cycle: cycle,
    })

    if (dbError) {
      console.error('Error saving transaction:', dbError)
      return { success: false, error: 'Failed to create payment order' }
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        amount,
        currency: 'INR',
      },
    }
  } catch (error) {
    console.error('Error creating payment order:', error)
    return { success: false, error: 'Failed to create payment order' }
  }
}

/**
 * Verify payment and upgrade user tier
 */
export async function verifyPaymentAndUpgrade(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature)
    if (!isValid) {
      return { success: false, error: 'Invalid payment signature' }
    }

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (txError || !transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: 'captured',
        completed_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return { success: false, error: 'Failed to update transaction' }
    }

    // Calculate subscription dates
    const now = new Date()
    const trialEndsAt = new Date(now)
    trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial

    const subscriptionEndsAt = new Date(now)
    if (transaction.billing_cycle === 'monthly') {
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1)
    } else {
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1)
    }

    // Upgrade user tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        tier: transaction.tier,
        trial_ends_at: trialEndsAt.toISOString(),
        subscription_started_at: now.toISOString(),
        subscription_ends_at: subscriptionEndsAt.toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error upgrading user tier:', profileError)
      return { success: false, error: 'Failed to upgrade account' }
    }

    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/upgrade')

    return { success: true }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return { success: false, error: 'Failed to verify payment' }
  }
}

/**
 * Get user's current subscription status
 */
export async function getSubscriptionStatus(): Promise<
  ActionResponse<{
    tier: SubscriptionTier
    isActive: boolean
    isTrial: boolean
    trialEndsAt: string | null
    subscriptionEndsAt: string | null
    subscriptionLimit: number
    currentSubscriptions: number
    canAddMore: boolean
  }>
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Get subscription count
    const { count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    const currentSubscriptions = count || 0
    const subscriptionLimit = profile.tier === 'free' ? 5 : 999999
    const canAddMore = currentSubscriptions < subscriptionLimit

    // Check if subscription is active
    const now = new Date()
    const subscriptionEndsAt = profile.subscription_ends_at
      ? new Date(profile.subscription_ends_at)
      : null
    const isActive =
      profile.tier !== 'free' &&
      (!subscriptionEndsAt || subscriptionEndsAt > now)

    // Check if in trial
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    const isTrial = profile.tier === 'pro' && trialEndsAt !== null && trialEndsAt > now

    return {
      success: true,
      data: {
        tier: profile.tier as SubscriptionTier,
        isActive,
        isTrial,
        trialEndsAt: profile.trial_ends_at,
        subscriptionEndsAt: profile.subscription_ends_at,
        subscriptionLimit,
        currentSubscriptions,
        canAddMore,
      },
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return { success: false, error: 'Failed to get subscription status' }
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(): Promise<
  ActionResponse<
    Array<{
      id: string
      amount: number
      currency: string
      status: string
      tier: string
      billing_cycle: string
      created_at: string
      completed_at: string | null
    }>
  >
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching payment history:', error)
      return { success: false, error: 'Failed to fetch payment history' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting payment history:', error)
    return { success: false, error: 'Failed to get payment history' }
  }
}

/**
 * Cancel subscription (downgrade to free tier)
 */
export async function cancelSubscription(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Downgrade to free tier
    const { error } = await supabase
      .from('profiles')
      .update({
        tier: 'free',
        trial_ends_at: null,
        subscription_started_at: null,
        subscription_ends_at: null,
        razorpay_subscription_id: null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error cancelling subscription:', error)
      return { success: false, error: 'Failed to cancel subscription' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/upgrade')

    return { success: true }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return { success: false, error: 'Failed to cancel subscription' }
  }
}
