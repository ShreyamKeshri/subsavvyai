/**
 * Razorpay Configuration
 * Centralized configuration for Razorpay payment integration
 */

export const razorpayConfig = {
  // Razorpay credentials (from environment variables)
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  keySecret: process.env.RAZORPAY_KEY_SECRET!, // Server-side only

  // Currency
  currency: 'INR' as const,

  // Pricing Plans
  plans: {
    free: {
      name: 'Free',
      price: 0,
      subscriptionLimit: 5,
      features: [
        '5 subscriptions max',
        'Basic analytics',
        'Manual usage tracking',
        'Email support',
      ],
    },
    pro: {
      name: 'Pro',
      monthly: {
        price: 99,
        razorpayPlanId: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
      },
      yearly: {
        price: 999,
        razorpayPlanId: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
        discount: '₹189 off (16% savings)',
      },
      trialDays: 7,
      subscriptionLimit: 999999, // Unlimited
      features: [
        'Unlimited subscriptions',
        'AI-powered recommendations',
        'Advanced analytics',
        'Bundle optimizer',
        'Cancellation guides',
        'Priority email support',
        '7-day free trial',
      ],
    },
  },

  // Razorpay options
  options: {
    name: 'SubSavvyAI',
    description: 'Upgrade to Pro - India\'s AI-Powered Subscription Optimizer',
    image: '/logo-icon.png',
    theme: {
      color: '#16a34a', // green-600
    },
    prefill: {
      email: '',
      contact: '',
    },
    notes: {
      source: 'subsavvyai',
    },
  },
} as const

// Type exports
export type SubscriptionTier = 'free' | 'pro'
export type BillingCycle = 'monthly' | 'yearly'

// Helper to check if Razorpay is configured
export function isRazorpayConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  )
}

// Helper to get plan details
export function getPlanDetails(tier: SubscriptionTier, cycle?: BillingCycle) {
  if (tier === 'free') {
    return razorpayConfig.plans.free
  }

  if (tier === 'pro') {
    const proPlan = razorpayConfig.plans.pro
    if (cycle === 'monthly') {
      return {
        ...proPlan,
        price: proPlan.monthly.price,
        razorpayPlanId: proPlan.monthly.razorpayPlanId,
      }
    }
    if (cycle === 'yearly') {
      return {
        ...proPlan,
        price: proPlan.yearly.price,
        razorpayPlanId: proPlan.yearly.razorpayPlanId,
        discount: proPlan.yearly.discount,
      }
    }
    return proPlan
  }

  // Default to free plan
  return razorpayConfig.plans.free
}
