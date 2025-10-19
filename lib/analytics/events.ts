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

// ============================================================================
// TOP 10 ACTIONABLE METRICS (Added for better product insights)
// ============================================================================

// 1. NORTH STAR METRIC: Total Savings Delivered
export function trackSavingsDelivered(data: {
  userId: string
  totalPotentialSavings: number
  realizedSavings: number
  savingsByType: {
    downgrade: number
    cancel: number
    bundle: number
    overlap: number
  }
}) {
  posthog.capture('savings_delivered', data)
}

// 2. ACTIVATION FUNNEL: Onboarding Steps
export function trackOnboardingStepCompleted(step: string, userId: string, metadata?: Record<string, unknown>) {
  posthog.capture('onboarding_step_completed', {
    step,
    userId,
    ...metadata,
  })
}

export function trackUserActivated(userId: string, data: {
  subscriptionsAdded: number
  oauthConnected: boolean
  firstRecommendationViewed: boolean
  timeToActivation: number // seconds from signup
}) {
  posthog.capture('user_activated', {
    userId,
    ...data,
  })
}

export function trackTimeToFirstSubscription(userId: string, timeInSeconds: number) {
  posthog.capture('time_to_first_subscription', {
    userId,
    timeInSeconds,
    timeInMinutes: Math.round(timeInSeconds / 60),
  })
}

// 3. RECOMMENDATION ENGAGEMENT: Actions Taken
export function trackRecommendationActionTaken(data: {
  recommendationId: string
  recommendationType: 'downgrade' | 'cancel' | 'bundle' | 'overlap'
  action: 'accepted' | 'dismissed' | 'snoozed'
  savingsRealized?: number
}) {
  posthog.capture('recommendation_action_taken', data)
}

export function trackDowngradeRecommendationGenerated(data: {
  serviceName: string
  currentPlan: string
  recommendedPlan: string
  potentialSavings: number
  usageHours: number
  confidence: number
}) {
  posthog.capture('downgrade_recommendation_generated', data)
}

// 4. ENGAGEMENT & RETENTION: Session Tracking
export function trackSessionStarted(userId: string, data: {
  isReturningUser: boolean
  daysSinceLastVisit?: number
  sessionNumber: number
}) {
  posthog.capture('session_started', {
    userId,
    ...data,
  })
}

export function trackDashboardInteraction(action: string, metadata?: Record<string, unknown>) {
  posthog.capture('dashboard_interaction', {
    action,
    ...metadata,
  })
}

// 5. REVENUE METRICS: Freemium → Pro Conversion
export function trackPaywallViewed(feature: string, userId: string, metadata?: Record<string, unknown>) {
  posthog.capture('paywall_viewed', {
    feature,
    userId,
    ...metadata,
  })
}

export function trackUpgradeClicked(source: string, plan: 'monthly' | 'yearly', userId: string) {
  posthog.capture('upgrade_clicked', {
    source,
    plan,
    userId,
  })
}

export function trackSubscriptionPurchased(data: {
  plan: 'monthly' | 'yearly'
  amount: number
  userId: string
  paymentMethod?: string
}) {
  posthog.capture('subscription_purchased', data)
}

export function trackSubscriptionCancelled(userId: string, reason: string, metadata?: Record<string, unknown>) {
  posthog.capture('subscription_cancelled', {
    userId,
    reason,
    ...metadata,
  })
}

// 6. AFFILIATE CONVERSION FUNNEL
export function trackAffiliateViewed(data: {
  bundleId: string
  bundleName: string
  position: number // Position in list
  potentialSavings: number
}) {
  posthog.capture('affiliate_viewed', data)
}

// 7. OAUTH & DATA COLLECTION
export function trackOAuthStarted(service: string, userId: string) {
  posthog.capture('oauth_started', {
    service,
    userId,
  })
}

export function trackOAuthFailed(data: {
  service: string
  error: string
  stage: 'authorization' | 'callback' | 'token_refresh'
  userId?: string
}) {
  posthog.capture('oauth_failed', data)
}

export function trackUsageDataCollected(data: {
  serviceId: string
  serviceName: string
  method: 'oauth' | 'manual'
  usageHours: number
  userId: string
}) {
  posthog.capture('usage_data_collected', data)
}

// 8. PRODUCT QUALITY: Feature Errors
export function trackFeatureError(data: {
  feature: string
  errorType: string
  errorMessage: string
  userId?: string
  context?: Record<string, unknown>
}) {
  posthog.capture('feature_error', data)
}

export function trackAPIPerformance(data: {
  endpoint: string
  duration: number
  statusCode: number
  method?: string
}) {
  posthog.capture('api_performance', data)
}

// 9. UX OPTIMIZATION
export function trackFormAbandoned(formName: string, step: string, userId?: string) {
  posthog.capture('form_abandoned', {
    formName,
    step,
    userId,
  })
}

export function trackEmptyStateViewed(location: string, cta: string) {
  posthog.capture('empty_state_viewed', {
    location,
    cta,
  })
}

export function trackCTAClicked(data: {
  cta: string
  location: string
  destination: string
}) {
  posthog.capture('cta_clicked', data)
}

// 10. SEARCH & DISCOVERY
export function trackSearchPerformed(query: string, results: number, userId?: string) {
  posthog.capture('search_performed', {
    query,
    results,
    userId,
  })
}
