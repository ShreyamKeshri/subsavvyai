/**
 * Savings Calculation Utilities
 * Helper functions for calculating savings from optimized subscriptions
 */

import type { BillingCycle } from '@/lib/subscriptions/subscription-actions'

/**
 * Optimization types for subscriptions
 */
export type OptimizationType = 'cancel' | 'downgrade' | 'upgrade' | 'bundle'

export const OPTIMIZATION_LABELS = {
  cancel: 'Cancelled',
  downgrade: 'Downgraded',
  upgrade: 'Upgraded',
  bundle: 'Bundled',
} as const

/**
 * Calculate monthly cost from any billing cycle
 */
export function calculateMonthlyCost(cost: number, billingCycle: BillingCycle): number {
  switch (billingCycle) {
    case 'monthly':
      return cost
    case 'quarterly':
      return cost / 3
    case 'yearly':
      return cost / 12
    case 'custom':
      return cost // Assume monthly for custom
    default:
      return cost
  }
}

/**
 * Calculate complete months since cancellation
 * Only counts full months - subtracts 1 if current day hasn't reached cancellation day yet
 */
export function calculateMonthsSince(cancelledAt: string): number {
  const now = new Date()
  const cancelled = new Date(cancelledAt)

  const yearsDiff = now.getFullYear() - cancelled.getFullYear()
  const monthsDiff = now.getMonth() - cancelled.getMonth()
  let totalMonths = yearsDiff * 12 + monthsDiff

  // If current day is before cancellation day, we haven't completed this month yet
  if (now.getDate() < cancelled.getDate()) {
    totalMonths -= 1
  }

  // Ensure non-negative result
  return Math.max(0, totalMonths)
}

/**
 * Calculate monthly savings based on optimization type
 */
export function calculateMonthlySavings(
  optimizationType: OptimizationType,
  currentCost: number,
  previousCost: number | null,
  billingCycle: BillingCycle
): number {
  const monthlyCurrentCost = calculateMonthlyCost(currentCost, billingCycle)

  switch (optimizationType) {
    case 'cancel': {
      // Full monthly cost is saved
      return monthlyCurrentCost
    }

    case 'downgrade': {
      // Difference between previous and current
      if (!previousCost) return 0
      const monthlyPreviousCost = calculateMonthlyCost(previousCost, billingCycle)
      return Math.max(0, monthlyPreviousCost - monthlyCurrentCost)
    }

    case 'upgrade': {
      // Negative savings (spending more) - we don't track this in savings
      return 0
    }

    case 'bundle': {
      // Bundle savings are stored directly (calculated externally)
      return 0
    }

    default:
      return 0
  }
}

/**
 * Calculate total savings for a cancelled subscription
 * Formula: monthly_cost × months_since_cancellation
 */
export function calculateSubscriptionSavings(
  cost: number,
  billingCycle: BillingCycle,
  cancelledAt: string
): number {
  const monthlyCost = calculateMonthlyCost(cost, billingCycle)
  const monthsSince = calculateMonthsSince(cancelledAt)

  // Only count savings from complete months
  return monthlyCost * Math.max(0, monthsSince)
}

/**
 * Calculate total savings based on optimization type
 */
export function calculateOptimizationSavings(
  optimizationType: OptimizationType,
  monthlySavings: number,
  optimizationDate: string
): number {
  const monthsSince = calculateMonthsSince(optimizationDate)

  // Total savings = monthly savings × months since optimization
  return monthlySavings * Math.max(0, monthsSince)
}

/**
 * Calculate savings rate (monthly savings if all cancelled subs were still active)
 */
export function calculateMonthlySavingsRate(
  cancelledSubscriptions: Array<{ cost: number; billing_cycle: BillingCycle }>
): number {
  return cancelledSubscriptions.reduce((total, sub) => {
    return total + calculateMonthlyCost(sub.cost, sub.billing_cycle)
  }, 0)
}

/**
 * Project annual savings based on current cancelled subscriptions
 */
export function projectAnnualSavings(monthlySavingsRate: number): number {
  return monthlySavingsRate * 12
}

/**
 * Calculate progress toward ₹10,000 annual goal
 */
export function calculateGoalProgress(totalSavedThisYear: number, goal = 10000): {
  progress: number // 0-100
  amount: number
  goal: number
  remaining: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
} {
  const progress = Math.min(100, (totalSavedThisYear / goal) * 100)
  const remaining = Math.max(0, goal - totalSavedThisYear)

  // Color-coded tiers
  let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze'
  if (totalSavedThisYear >= 20000) {
    tier = 'platinum'
  } else if (totalSavedThisYear >= 10000) {
    tier = 'gold'
  } else if (totalSavedThisYear >= 5000) {
    tier = 'silver'
  }

  return {
    progress,
    amount: totalSavedThisYear,
    goal,
    remaining,
    tier,
  }
}

/**
 * Format INR currency with proper Indian number format
 * Example: 12345 → ₹12,345
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get relative time string
 * Example: "2 months ago", "1 year ago"
 */
export function getRelativeTime(date: string): string {
  const monthsDiff = calculateMonthsSince(date)

  if (monthsDiff === 0) {
    return 'This month'
  } else if (monthsDiff === 1) {
    return '1 month ago'
  } else if (monthsDiff < 12) {
    return `${monthsDiff} months ago`
  } else {
    const years = Math.floor(monthsDiff / 12)
    return years === 1 ? '1 year ago' : `${years} years ago`
  }
}

/**
 * Get cancellation reason display text
 */
export const CANCELLATION_REASONS = {
  not_using: 'Not using enough',
  too_expensive: 'Too expensive',
  found_alternative: 'Found a better alternative',
  downgraded: 'Downgraded to cheaper plan',
  temporary: 'Temporary cancellation',
  other: 'Other reason',
} as const

export type CancellationReason = keyof typeof CANCELLATION_REASONS

export function getCancellationReasonText(reason: string | null): string {
  if (!reason) return 'No reason provided'
  return CANCELLATION_REASONS[reason as CancellationReason] || reason
}

/**
 * Calculate savings for current year only
 */
export function calculateYearToDateSavings(
  cost: number,
  billingCycle: BillingCycle,
  cancelledAt: string
): number {
  const monthlyCost = calculateMonthlyCost(cost, billingCycle)
  const cancelled = new Date(cancelledAt)
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1) // January 1st of current year

  // If cancelled before this year, count from January 1st
  const effectiveStart = cancelled < yearStart ? yearStart : cancelled

  // Calculate months from effective start to now
  const yearsDiff = now.getFullYear() - effectiveStart.getFullYear()
  const monthsDiff = now.getMonth() - effectiveStart.getMonth()
  const monthsInYear = yearsDiff * 12 + monthsDiff

  return monthlyCost * Math.max(0, monthsInYear)
}
