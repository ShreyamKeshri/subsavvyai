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
import { validateInput, subscriptionSchema, uuidSchema } from '@/lib/validators'
import { debounce } from '@/lib/utils/debounce'

// Debounced recommendation generators (prevent race conditions)
// These will only execute once if called multiple times within 2 seconds
const debouncedBundleRecommendations = debounce(
  'generate-bundle-recommendations',
  generateBundleRecommendations,
  2000
)

const debouncedAIRecommendations = debounce(
  'generate-ai-recommendations',
  generateRecommendations,
  2000
)

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type SubscriptionStatus = 'active' | 'cancellation_initiated' | 'cancelled' | 'paused' | 'expired'
export type OptimizationType = 'cancel' | 'downgrade' | 'upgrade' | 'bundle'

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
  // Optimization tracking fields
  optimization_type: OptimizationType | null
  previous_cost: number | null
  monthly_savings: number | null
  optimization_date: string | null
  optimization_notes: string | null
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

    // Validate input using Zod schema
    const validation = validateInput(subscriptionSchema, {
      ...input,
      currency: input.currency || 'INR'
    })

    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0]
      return { success: false, error: firstError }
    }

    const validatedInput = validation.data

    // Convert cost to INR
    const selectedCurrency = validatedInput.currency
    const costInINR = convertToINR(validatedInput.cost, selectedCurrency)

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        service_id: validatedInput.service_id || null,
        custom_service_name: validatedInput.custom_service_name || null,
        cost: costInINR,  // Normalized cost in INR
        currency: 'INR',  // Always INR
        original_cost: validatedInput.cost,  // Original amount entered by user
        original_currency: selectedCurrency,  // Original currency selected by user
        billing_cycle: validatedInput.billing_cycle,
        billing_date: validatedInput.billing_date.toISOString().split('T')[0],
        next_billing_date: validatedInput.next_billing_date.toISOString().split('T')[0],
        payment_method_id: validatedInput.payment_method_id || null,
        notes: validatedInput.notes || null,
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

    // Track activation funnel: Check if this is user's first subscription
    const { count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (count === 1) {
      // This is the first subscription - track onboarding step
      await trackServerEvent(user.id, 'onboarding_step_completed', {
        step: 'first_subscription_added',
        subscriptionCount: 1,
      })
    }

    // Auto-generate bundle recommendations (debounced to prevent race conditions)
    // Will only execute once if called multiple times within 2 seconds
    debouncedBundleRecommendations()

    // Auto-generate AI recommendations (debounced to prevent race conditions)
    debouncedAIRecommendations()

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

    // Validate subscription ID
    const idValidation = validateInput(uuidSchema, subscriptionId)
    if (!idValidation.success) {
      return { success: false, error: 'Invalid subscription ID' }
    }

    // Validate input - partial schema for updates
    if (Object.keys(input).length > 0) {
      const validation = validateInput(subscriptionSchema.partial(), input)
      if (!validation.success) {
        const firstError = Object.values(validation.errors)[0]
        return { success: false, error: firstError }
      }
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

    // Track subscription edited event
    await trackServerEvent(user.id, 'subscription_edited', {
      subscriptionId: data.id,
      serviceName: data.service?.name || data.custom_service_name || 'Unknown',
      fieldsUpdated: Object.keys(input),
    })

    // Auto-generate bundle recommendations (debounced to prevent race conditions)
    debouncedBundleRecommendations()

    // Auto-generate AI recommendations (debounced to prevent race conditions)
    debouncedAIRecommendations()

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

    // Validate subscription ID
    const idValidation = validateInput(uuidSchema, subscriptionId)
    if (!idValidation.success) {
      return { success: false, error: 'Invalid subscription ID' }
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

    // Auto-generate bundle recommendations (debounced to prevent race conditions)
    debouncedBundleRecommendations()

    // Auto-generate AI recommendations (debounced to prevent race conditions)
    debouncedAIRecommendations()

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
