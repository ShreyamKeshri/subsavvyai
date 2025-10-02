/**
 * Application types for subscriptions
 */

export type SubscriptionCategory =
  | 'OTT'
  | 'Music'
  | 'Food Delivery'
  | 'SaaS'
  | 'Fitness'
  | 'News'
  | 'Gaming'
  | 'Education'
  | 'Other'

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly'

export type CancellationStatus = 'active' | 'cancellation_initiated' | 'cancelled'

export interface Subscription {
  id: string
  user_id: string
  service_name: string
  category: SubscriptionCategory
  cost: number
  currency: string
  billing_cycle: BillingCycle
  billing_date: string
  next_billing_date: string
  payment_method?: string
  status: CancellationStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionInput {
  service_name: string
  category: SubscriptionCategory
  cost: number
  currency?: string
  billing_cycle: BillingCycle
  billing_date: string
  payment_method?: string
  notes?: string
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  status?: CancellationStatus
}
