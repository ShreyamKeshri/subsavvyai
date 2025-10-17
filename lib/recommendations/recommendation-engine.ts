/**
 * AI Recommendation Engine for Subscription Optimization
 * Analyzes usage data and generates smart recommendations
 */

import type { Subscription } from '@/lib/subscriptions/subscription-actions'
import type { ServiceUsage } from '@/lib/usage/usage-actions'

export interface OptimizationRecommendation {
  subscription_id: string | null
  type: 'downgrade' | 'upgrade' | 'cancel' | 'bundle' // | 'overlap' | 'price_alert' // POST-MVP: Content Overlap & Price Monitoring
  title: string
  description: string
  current_cost: number
  optimized_cost: number
  monthly_savings: number
  annual_savings: number
  confidence_score: number
  details: Record<string, unknown> | null
  expires_at?: Date | string | null
}

/**
 * Calculate average usage hours per month
 */
function calculateAverageUsageHours(usageData: ServiceUsage): number {
  if (!usageData.usage_hours) return 0

  const periodStart = new Date(usageData.period_start)
  const periodEnd = new Date(usageData.period_end)
  const daysDiff = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  const monthlyFactor = 30 / daysDiff

  return usageData.usage_hours * monthlyFactor
}

/**
 * Generate downgrade recommendation for Spotify
 */
function generateSpotifyDowngradeRecommendation(
  subscription: Subscription,
  usageData: ServiceUsage
): OptimizationRecommendation | null {
  const monthlyUsageHours = calculateAverageUsageHours(usageData)

  // Spotify Premium costs ₹119/month
  // If user listens < 10 hours/month, recommend Free tier
  const USAGE_THRESHOLD = 10 // hours per month
  const PREMIUM_COST = 119 // ₹119/month in India

  if (monthlyUsageHours < USAGE_THRESHOLD) {
    const monthlySavings = PREMIUM_COST
    const annualSavings = monthlySavings * 12

    // Calculate confidence based on how low the usage is
    const confidenceScore = Math.min(0.95, 0.5 + (USAGE_THRESHOLD - monthlyUsageHours) / USAGE_THRESHOLD * 0.45)

    const adsPerHour = 2
    const expectedAds = Math.round(monthlyUsageHours * adsPerHour)

    return {
      subscription_id: subscription.id,
      type: 'downgrade',
      title: 'Downgrade Spotify to Free',
      description: `You're using Spotify only ${monthlyUsageHours.toFixed(1)} hours/month. Downgrade to Free and save ₹${monthlySavings}/month. You'll hear ~${expectedAds} ads/month (${adsPerHour} ads/hour) - totally worth it!`,
      current_cost: subscription.cost,
      optimized_cost: 0,
      monthly_savings: monthlySavings,
      annual_savings: annualSavings,
      confidence_score: confidenceScore,
      details: {
        usage_hours_monthly: monthlyUsageHours,
        threshold_hours: USAGE_THRESHOLD,
        expected_ads_per_month: expectedAds,
        ads_per_hour: adsPerHour,
        reason: 'Low usage detected',
        alternative_plan: 'Spotify Free',
        alternative_cost: 0
      }
    }
  }

  return null
}

/**
 * Generate cancel recommendation (very low usage)
 */
function generateCancelRecommendation(
  subscription: Subscription,
  usageData: ServiceUsage
): OptimizationRecommendation | null {
  const monthlyUsageHours = calculateAverageUsageHours(usageData)

  // If usage < 2 hours/month, recommend cancellation
  const CANCEL_THRESHOLD = 2

  if (monthlyUsageHours < CANCEL_THRESHOLD && monthlyUsageHours >= 0) {
    const monthlySavings = subscription.cost
    const annualSavings = monthlySavings * 12

    const confidenceScore = Math.min(0.98, 0.7 + (CANCEL_THRESHOLD - monthlyUsageHours) / CANCEL_THRESHOLD * 0.28)

    const serviceName = subscription.service?.name || subscription.custom_service_name || 'this service'

    return {
      subscription_id: subscription.id,
      type: 'cancel',
      title: `Cancel ${serviceName} Subscription`,
      description: `You're barely using this service - only ${monthlyUsageHours.toFixed(1)} hours in the last month. Consider canceling to save ₹${monthlySavings}/month.`,
      current_cost: subscription.cost,
      optimized_cost: 0,
      monthly_savings: monthlySavings,
      annual_savings: annualSavings,
      confidence_score: confidenceScore,
      details: {
        usage_hours_monthly: monthlyUsageHours,
        threshold_hours: CANCEL_THRESHOLD,
        reason: 'Extremely low usage',
        last_synced: usageData.last_synced_at
      }
    }
  }

  return null
}

/**
 * Generate generic downgrade recommendation for any OTT service
 */
function generateGenericOTTDowngradeRecommendation(
  subscription: Subscription,
  usageData: ServiceUsage
): OptimizationRecommendation | null {
  const monthlyUsageHours = calculateAverageUsageHours(usageData)

  // Generic threshold for OTT services: < 10 hours/month
  const USAGE_THRESHOLD = 10
  const serviceName = subscription.service?.name || subscription.custom_service_name || 'this service'

  if (monthlyUsageHours < USAGE_THRESHOLD) {
    // Estimate potential savings (assume 50% cheaper plan exists or free tier)
    const estimatedOptimizedCost = Math.max(0, subscription.cost * 0.5)
    const monthlySavings = subscription.cost - estimatedOptimizedCost
    const annualSavings = monthlySavings * 12

    // Calculate confidence based on how low the usage is
    const confidenceScore = Math.min(0.90, 0.5 + (USAGE_THRESHOLD - monthlyUsageHours) / USAGE_THRESHOLD * 0.4)

    return {
      subscription_id: subscription.id,
      type: 'downgrade',
      title: `Consider a Cheaper Plan for ${serviceName}`,
      description: `You're using ${serviceName} only ${monthlyUsageHours.toFixed(1)} hours/month. Check if there's a cheaper plan or free tier available to save ₹${Math.round(monthlySavings)}/month.`,
      current_cost: subscription.cost,
      optimized_cost: estimatedOptimizedCost,
      monthly_savings: monthlySavings,
      annual_savings: annualSavings,
      confidence_score: confidenceScore,
      details: {
        usage_hours_monthly: monthlyUsageHours,
        threshold_hours: USAGE_THRESHOLD,
        reason: 'Low usage detected',
        suggestion: 'Look for a cheaper plan or free tier'
      }
    }
  }

  return null
}

/**
 * Generate all recommendations for a subscription with usage data
 */
export function generateRecommendationsForSubscription(
  subscription: Subscription,
  usageData: ServiceUsage
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = []

  // Only generate recommendations for active subscriptions
  if (subscription.status !== 'active') {
    return recommendations
  }

  // Check for cancellation first (highest priority if usage is extremely low)
  const cancelRecommendation = generateCancelRecommendation(subscription, usageData)
  if (cancelRecommendation) {
    recommendations.push(cancelRecommendation)
    return recommendations // Don't suggest downgrades if we're suggesting cancel
  }

  // Service-specific recommendations (prefer specific over generic)
  const serviceName = subscription.service?.name?.toLowerCase() || subscription.custom_service_name?.toLowerCase() || ''

  if (serviceName.includes('spotify')) {
    const spotifyRec = generateSpotifyDowngradeRecommendation(subscription, usageData)
    if (spotifyRec) {
      recommendations.push(spotifyRec)
    }
  } else {
    // Generic downgrade recommendation for any other service
    const genericRec = generateGenericOTTDowngradeRecommendation(subscription, usageData)
    if (genericRec) {
      recommendations.push(genericRec)
    }
  }

  // Add more service-specific logic here for Netflix, YouTube Premium, etc.

  return recommendations
}

/**
 * Generate recommendations for all user subscriptions
 */
export function generateAllRecommendations(
  subscriptions: Subscription[],
  usageDataMap: Map<string, ServiceUsage>
): OptimizationRecommendation[] {
  const allRecommendations: OptimizationRecommendation[] = []

  for (const subscription of subscriptions) {
    const usageData = usageDataMap.get(subscription.id)

    if (usageData) {
      const recommendations = generateRecommendationsForSubscription(subscription, usageData)
      allRecommendations.push(...recommendations)
    }
  }

  // Sort by annual savings (highest first)
  allRecommendations.sort((a, b) => b.annual_savings - a.annual_savings)

  return allRecommendations
}

/**
 * Calculate total potential savings from recommendations
 */
export function calculateTotalSavings(recommendations: OptimizationRecommendation[]): {
  monthly: number
  annual: number
} {
  const monthlySavings = recommendations.reduce((sum, rec) => sum + rec.monthly_savings, 0)
  const annualSavings = recommendations.reduce((sum, rec) => sum + rec.annual_savings, 0)

  return {
    monthly: monthlySavings,
    annual: annualSavings
  }
}
