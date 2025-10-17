'use server'

/**
 * Server Actions for Subscription Management
 * Handles all CRUD operations for user subscriptions
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { trackServerEvent } from '@/lib/analytics/server-events'
import { convertToINR } from '@/lib/currency/exchange-rates'
import { generateBundleRecommendations } from '@/lib/bundles/bundle-actions'
import { generateRecommendations } from '@/lib/recommendations/recommendation-actions'

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type SubscriptionStatus = 'active' | 'cancellation_initiated' | 'cancelled' | 'paused' | 'expired'

export interface Subscription {
  id: string
  user_id: string
  service_id: string | null
  custom_service_name: string | null
  cost: number  // Always in INR
  currency: string  // Always 'INR'
  original_cost: number | null  // Original amount entered by user
  original_currency: string | null  // Original currency selected by user
  billing_cycle: BillingCycle
  billing_date: string
  next_billing_date: string
  status: SubscriptionStatus
  payment_method_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  service?: {
    id: string
    name: string
    category: string
    logo_url: string | null
  }
}

export interface CreateSubscriptionInput {
  service_id?: string
  custom_service_name?: string
  cost: number
  currency?: string
  billing_cycle: BillingCycle
  billing_date: string
  next_billing_date: string
  payment_method_id?: string
  notes?: string
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  status?: SubscriptionStatus
}

/**
 * Get all active subscriptions for the current user
 */
export async function getUserSubscriptions(): Promise<{ success: boolean; data?: Subscription[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        service:services(id, name, category, logo_url)
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Subscription[] }
  } catch (error) {
    console.error('Unexpected error fetching subscriptions:', error)
    return { success: false, error: 'Failed to fetch subscriptions' }
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<{ success: boolean; data?: Subscription; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate that either service_id or custom_service_name is provided
    if (!input.service_id && !input.custom_service_name) {
      return { success: false, error: 'Either service or custom service name is required' }
    }

    // Convert cost to INR
    const selectedCurrency = input.currency || 'INR'
    const costInINR = convertToINR(input.cost, selectedCurrency)

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        service_id: input.service_id || null,
        custom_service_name: input.custom_service_name || null,
        cost: costInINR,  // Normalized cost in INR
        currency: 'INR',  // Always INR
        original_cost: input.cost,  // Original amount entered by user
        original_currency: selectedCurrency,  // Original currency selected by user
        billing_cycle: input.billing_cycle,
        billing_date: input.billing_date,
        next_billing_date: input.next_billing_date,
        payment_method_id: input.payment_method_id || null,
        notes: input.notes || null,
        status: 'active'
      })
      .select()
      .single()

    // If insert succeeded and has a service_id, fetch the service separately
    if (data && data.service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('id, name, category, logo_url')
        .eq('id', data.service_id)
        .single()

      if (service) {
        data.service = service
      }
    }

    if (error) {
      console.error('Error creating subscription:', error)
      return { success: false, error: error.message }
    }

    // Track subscription added event
    await trackServerEvent(user.id, 'subscription_added', {
      subscriptionId: data.id,
      serviceName: data.service?.name || data.custom_service_name || 'Unknown',
      cost: data.cost,
      billingCycle: data.billing_cycle,
      isCustom: !data.service_id,
    })

    // Auto-generate bundle recommendations (fire-and-forget)
    // This runs in the background without blocking the response
    generateBundleRecommendations().catch(error => {
      console.error('Failed to auto-generate bundle recommendations:', error)
    })

    // Auto-generate AI recommendations (fire-and-forget)
    generateRecommendations().catch(error => {
      console.error('Failed to auto-generate AI recommendations:', error)
    })

    // Revalidate dashboard to show updated data
    revalidatePath('/dashboard')

    return { success: true, data: data as Subscription }
  } catch (error) {
    console.error('Unexpected error creating subscription:', error)
    return { success: false, error: 'Failed to create subscription' }
  }
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  input: UpdateSubscriptionInput
): Promise<{ success: boolean; data?: Subscription; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // If cost or currency is being updated, convert to INR
    const updateData: Record<string, unknown> = { ...input }
    if (input.cost !== undefined && input.currency !== undefined) {
      const selectedCurrency = input.currency || 'INR'
      updateData.cost = convertToINR(input.cost, selectedCurrency)
      updateData.currency = 'INR'
      updateData.original_cost = input.cost
      updateData.original_currency = selectedCurrency
    } else if (input.cost !== undefined) {
      // If only cost is updated, assume INR
      updateData.cost = input.cost
      updateData.original_cost = input.cost
      updateData.original_currency = 'INR'
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select(`
        *,
        service:services(id, name, category, logo_url)
      `)
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return { success: false, error: error.message }
    }

    // Auto-generate bundle recommendations (fire-and-forget)
    generateBundleRecommendations().catch(error => {
      console.error('Failed to auto-generate bundle recommendations:', error)
    })

    // Auto-generate AI recommendations (fire-and-forget)
    generateRecommendations().catch(error => {
      console.error('Failed to auto-generate AI recommendations:', error)
    })

    // Revalidate dashboard
    revalidatePath('/dashboard')

    return { success: true, data: data as Subscription }
  } catch (error) {
    console.error('Unexpected error updating subscription:', error)
    return { success: false, error: 'Failed to update subscription' }
  }
}

/**
 * Soft delete a subscription
 */
export async function deleteSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return { success: false, error: error.message }
    }

    // Track subscription deleted event
    await trackServerEvent(user.id, 'subscription_deleted', {
      subscriptionId,
    })

    // Auto-generate bundle recommendations (fire-and-forget)
    generateBundleRecommendations().catch(error => {
      console.error('Failed to auto-generate bundle recommendations:', error)
    })

    // Auto-generate AI recommendations (fire-and-forget)
    generateRecommendations().catch(error => {
      console.error('Failed to auto-generate AI recommendations:', error)
    })

    // Revalidate dashboard
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting subscription:', error)
    return { success: false, error: 'Failed to delete subscription' }
  }
}

/**
 * Get all available services for dropdown
 */
export async function getServices(): Promise<{ success: boolean; data?: Array<{ id: string; name: string; category: string; logo_url: string | null }>; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('services')
      .select('id, name, category, logo_url')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching services:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error fetching services:', error)
    return { success: false, error: 'Failed to fetch services' }
  }
}

/**
 * Calculate next billing date based on billing cycle
 */
export async function calculateNextBillingDate(startDate: string, cycle: BillingCycle): Promise<string> {
  const date = new Date(startDate)

  switch (cycle) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      // For custom, default to 1 month
      date.setMonth(date.getMonth() + 1)
  }

  return date.toISOString().split('T')[0]
}
