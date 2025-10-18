/**
 * Analytics Utility Functions
 * Helper functions for calculating metrics and managing analytics context
 */

// Generic types for analytics calculations
interface Subscription {
  id: string
  cost: number
  billing_cycle: string
  status: string
}

interface Recommendation {
  id: string
  recommendation_type: string
  potential_savings: number | null
  annual_savings: number
}

interface BundleRecommendation {
  id: string
  estimated_savings: number | null
}

/**
 * Calculate total savings from all recommendations
 */
export function calculateTotalSavings(
  optimizationRecs: Recommendation[],
  bundleRecs: BundleRecommendation[]
) {
  const optimizationSavings = optimizationRecs.reduce((sum, rec) => {
    return sum + (rec.potential_savings || 0)
  }, 0)

  const bundleSavings = bundleRecs.reduce((sum, rec) => {
    return sum + (rec.estimated_savings || 0)
  }, 0)

  return {
    total: optimizationSavings + bundleSavings,
    byType: {
      downgrade: optimizationRecs
        .filter((r) => r.recommendation_type === 'downgrade')
        .reduce((sum, r) => sum + (r.potential_savings || 0), 0),
      cancel: optimizationRecs
        .filter((r) => r.recommendation_type === 'cancel')
        .reduce((sum, r) => sum + (r.potential_savings || 0), 0),
      bundle: bundleSavings,
      overlap: optimizationRecs
        .filter((r) => r.recommendation_type === 'overlap')
        .reduce((sum, r) => sum + (r.potential_savings || 0), 0),
    },
  }
}

/**
 * Calculate user activation metrics
 */
export function calculateActivationMetrics(data: {
  subscriptions: Subscription[]
  hasOAuthConnection: boolean
  hasViewedRecommendation: boolean
  signupTime: Date
}) {
  return {
    subscriptionsAdded: data.subscriptions.length,
    oauthConnected: data.hasOAuthConnection,
    firstRecommendationViewed: data.hasViewedRecommendation,
    timeToActivation: Math.floor(
      (Date.now() - data.signupTime.getTime()) / 1000
    ),
  }
}

/**
 * Session storage keys for tracking
 */
export const ANALYTICS_STORAGE_KEYS = {
  LAST_VISIT: 'subsavvy_last_visit',
  SESSION_COUNT: 'subsavvy_session_count',
  SIGNUP_TIME: 'subsavvy_signup_time',
  FIRST_SUBSCRIPTION_TIME: 'subsavvy_first_subscription',
} as const

/**
 * Get session metadata for tracking
 */
export function getSessionMetadata() {
  if (typeof window === 'undefined') {
    return null
  }

  const lastVisit = localStorage.getItem(ANALYTICS_STORAGE_KEYS.LAST_VISIT)
  const sessionCount = parseInt(
    localStorage.getItem(ANALYTICS_STORAGE_KEYS.SESSION_COUNT) || '0',
    10
  )

  const now = Date.now()
  const daysSinceLastVisit = lastVisit
    ? Math.floor((now - parseInt(lastVisit, 10)) / (1000 * 60 * 60 * 24))
    : undefined

  // Update storage
  localStorage.setItem(ANALYTICS_STORAGE_KEYS.LAST_VISIT, now.toString())
  localStorage.setItem(
    ANALYTICS_STORAGE_KEYS.SESSION_COUNT,
    (sessionCount + 1).toString()
  )

  return {
    isReturningUser: sessionCount > 0,
    daysSinceLastVisit,
    sessionNumber: sessionCount + 1,
  }
}

/**
 * Track time to first subscription
 */
export function recordFirstSubscriptionTime() {
  if (typeof window === 'undefined') {
    return null
  }

  const signupTime = localStorage.getItem(ANALYTICS_STORAGE_KEYS.SIGNUP_TIME)
  const firstSubscriptionTime = localStorage.getItem(
    ANALYTICS_STORAGE_KEYS.FIRST_SUBSCRIPTION_TIME
  )

  if (!signupTime) {
    return null
  }

  // Only track once
  if (firstSubscriptionTime) {
    return null
  }

  const now = Date.now()
  const timeToFirstSubscription = Math.floor(
    (now - parseInt(signupTime, 10)) / 1000
  )

  localStorage.setItem(
    ANALYTICS_STORAGE_KEYS.FIRST_SUBSCRIPTION_TIME,
    now.toString()
  )

  return timeToFirstSubscription
}

/**
 * Record signup time (call this on successful signup)
 */
export function recordSignupTime() {
  if (typeof window === 'undefined') {
    return
  }

  const signupTime = localStorage.getItem(ANALYTICS_STORAGE_KEYS.SIGNUP_TIME)

  // Only record once
  if (!signupTime) {
    localStorage.setItem(ANALYTICS_STORAGE_KEYS.SIGNUP_TIME, Date.now().toString())
  }
}

/**
 * Clear analytics storage (e.g., on logout)
 */
export function clearAnalyticsStorage() {
  if (typeof window === 'undefined') {
    return
  }

  Object.values(ANALYTICS_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

/**
 * Format savings for display
 */
export function formatSavings(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate confidence score for recommendations
 */
export function calculateRecommendationConfidence(data: {
  usageHours: number
  planCost: number
  averageUsage: number
}): number {
  // Higher confidence when:
  // 1. Usage is significantly below average
  // 2. Plan cost is high
  // 3. Data is recent

  const usageRatio = data.usageHours / data.averageUsage
  const costFactor = Math.min(data.planCost / 1000, 1) // Normalize to 0-1

  let confidence = 0

  if (usageRatio < 0.3) {
    confidence = 0.9 // Very low usage = high confidence
  } else if (usageRatio < 0.5) {
    confidence = 0.7 // Low usage = medium-high confidence
  } else if (usageRatio < 0.7) {
    confidence = 0.5 // Moderate usage = medium confidence
  } else {
    confidence = 0.3 // High usage = low confidence
  }

  // Boost confidence for expensive plans
  confidence = Math.min(confidence + costFactor * 0.1, 1)

  return Math.round(confidence * 100) / 100
}

/**
 * Debounce function for analytics (prevent spam)
 */
const analyticsDebounceTimers: Record<string, NodeJS.Timeout> = {}

export function debounceAnalytics(
  key: string,
  callback: () => void,
  delay = 1000
) {
  // eslint-disable-next-line security/detect-object-injection
  if (analyticsDebounceTimers[key]) {
    // eslint-disable-next-line security/detect-object-injection
    clearTimeout(analyticsDebounceTimers[key])
  }

  // eslint-disable-next-line security/detect-object-injection
  analyticsDebounceTimers[key] = setTimeout(() => {
    callback()
    // eslint-disable-next-line security/detect-object-injection
    delete analyticsDebounceTimers[key]
  }, delay)
}
