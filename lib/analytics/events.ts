import posthog from 'posthog-js'

// User events
export function trackUserSignup(userId: string, method: 'email' | 'google' | 'phone') {
  posthog.capture('user_signup', {
    method,
    userId,
  })
  // Identify user in PostHog
  posthog.identify(userId)
}

export function trackUserLogin(userId: string, method: 'email' | 'google' | 'phone') {
  posthog.capture('user_login', {
    method,
    userId,
  })
}

// Subscription events
export function trackSubscriptionAdded(subscriptionData: {
  subscriptionId: string
  serviceName: string
  cost: number
  billingCycle: string
  isCustom: boolean
}) {
  posthog.capture('subscription_added', subscriptionData)
}

export function trackSubscriptionEdited(subscriptionId: string) {
  posthog.capture('subscription_edited', {
    subscriptionId,
  })
}

export function trackSubscriptionDeleted(subscriptionId: string) {
  posthog.capture('subscription_deleted', {
    subscriptionId,
  })
}

// OAuth events
export function trackSpotifyConnected(userId: string) {
  posthog.capture('spotify_connected', {
    userId,
  })
}

export function trackSpotifyDisconnected(userId: string) {
  posthog.capture('spotify_disconnected', {
    userId,
  })
}

// Recommendation events
export function trackRecommendationViewed(recommendationData: {
  recommendationType: 'downgrade' | 'cancel' | 'bundle' | 'overlap'
  recommendationId: string
  potentialSavings: number
}) {
  posthog.capture('recommendation_viewed', recommendationData)
}

export function trackRecommendationDismissed(recommendationId: string, type: string) {
  posthog.capture('recommendation_dismissed', {
    recommendationId,
    type,
  })
}

// Revenue events (Critical for affiliate tracking)
export function trackAffiliateClick(affiliateData: {
  bundleId: string
  bundleName: string
  provider: string
  cost: number
  estimatedSavings: number
  affiliateUrl: string
}) {
  posthog.capture('affiliate_clicked', affiliateData)
}

export function trackBundleRecommendationGenerated(data: {
  userId: string
  bundlesFound: number
  totalSavings: number
}) {
  posthog.capture('bundle_recommendation_generated', data)
}

// Engagement events
export function trackDashboardViewed() {
  posthog.capture('dashboard_viewed')
}

export function trackOnboardingCompleted(userId: string) {
  posthog.capture('onboarding_completed', {
    userId,
  })
}

// Feature usage events
export function trackFeatureUsed(featureName: string, metadata?: Record<string, unknown>) {
  posthog.capture('feature_used', {
    featureName,
    ...metadata,
  })
}

// Error tracking (complement to Sentry)
export function trackError(errorName: string, errorMessage: string, context?: Record<string, unknown>) {
  posthog.capture('error_occurred', {
    errorName,
    errorMessage,
    ...context,
  })
}
