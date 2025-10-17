/**
 * Bundle Matching Algorithm
 * Finds the best telecom bundles for a user based on their current subscriptions
 */

import { createClient } from '@/lib/supabase/server'

export interface TelecomBundle {
  id: string
  provider: string
  plan_name: string
  plan_type: string
  monthly_price: number
  billing_cycle: string
  total_price: number
  included_ott_services: string[]
  ott_service_count: number
  ott_plan_details: Record<string, string>
  data_benefits: string | null
  validity: string | null
  other_benefits: string[] | null
  target_audience: string | null
  official_url: string | null
  is_currently_active: boolean
  notes: string | null
  value_score: number
}

export interface UserSubscription {
  id: string
  service_id: string
  service_name: string
  plan_name: string | null
  cost: number
  billing_cycle: string
  monthly_cost: number
}

export interface BundleMatch {
  bundle: TelecomBundle
  matched_subscriptions: UserSubscription[]
  matched_subscription_ids: string[]
  current_monthly_cost: number
  bundle_monthly_cost: number
  monthly_savings: number
  annual_savings: number
  match_percentage: number
  match_count: number
  confidence_score: number
  reasoning: string
  recommendation_type: 'bundle' | 'upgrade' | 'switch'
}

/**
 * Service name normalization map
 * Maps our database service names to bundle service names
 */
const SERVICE_NAME_MAP: Record<string, string[]> = {
  'Netflix': ['Netflix', 'netflix'],
  'Disney+ Hotstar': ['Disney+ Hotstar', 'Hotstar', 'JioHotstar', 'hotstar'],
  'Amazon Prime Video': ['Amazon Prime Video', 'Amazon Prime', 'Prime Video', 'prime'],
  'Zee5': ['Zee5', 'zee5', 'ZEE5'],
  'SonyLIV': ['SonyLIV', 'Sony LIV', 'sonyliv'],
  'Apple TV+': ['Apple TV+', 'Apple TV Plus', 'apple tv'],
  'JioCinema': ['JioCinema', 'Jio Cinema'],
  'JioSaavn': ['JioSaavn', 'Jio Saavn'],
  'Voot': ['Voot', 'voot'],
  'Eros Now': ['Eros Now', 'eros'],
  'ALTBalaji': ['ALTBalaji', 'Alt Balaji'],
  'Lionsgate Play': ['Lionsgate Play', 'lionsgate'],
  'Discovery+': ['Discovery+', 'Discovery Plus'],
  'Sun NXT': ['Sun NXT', 'sun nxt'],
  'Hoichoi': ['Hoichoi', 'hoichoi'],
  'ShemarooMe': ['ShemarooMe', 'shemaroo'],
  'Airtel Xstream': ['Airtel Xstream', 'Xstream'],
}

/**
 * Normalize service name to match bundle service names
 */
function normalizeServiceName(serviceName: string): string[] {
  for (const [canonical, variants] of Object.entries(SERVICE_NAME_MAP)) {
    if (variants.some(v => serviceName.toLowerCase().includes(v.toLowerCase()))) {
      return [canonical, ...variants]
    }
  }
  return [serviceName]
}

/**
 * Check if a bundle includes a user's service
 */
function bundleIncludesService(
  bundleServices: string[],
  userServiceName: string
): boolean {
  const normalizedNames = normalizeServiceName(userServiceName)
  return bundleServices.some(bundleService =>
    normalizedNames.some(normalized =>
      bundleService.toLowerCase().includes(normalized.toLowerCase()) ||
      normalized.toLowerCase().includes(bundleService.toLowerCase())
    )
  )
}

/**
 * Calculate monthly cost from any billing cycle
 */
export function calculateMonthlyCost(cost: number, billingCycle: string): number {
  const cycle = billingCycle.toLowerCase()

  if (cycle.includes('year') || cycle.includes('annual')) {
    return cost / 12
  } else if (cycle.includes('quarter') || cycle === '3 months') {
    return cost / 3
  } else if (cycle.includes('half') || cycle === '6 months') {
    return cost / 6
  } else if (cycle === '28 days') {
    return cost * (365 / 28) / 12
  } else if (cycle === '84 days') {
    return cost * (365 / 84) / 12
  }

  // Default to monthly
  return cost
}

/**
 * Generate human-readable reasoning for a bundle recommendation
 */
function generateReasoning(
  match: Omit<BundleMatch, 'reasoning' | 'confidence_score' | 'recommendation_type'>
): string {
  const { bundle, matched_subscriptions, monthly_savings } = match

  const reasons: string[] = []

  // Main value proposition
  if (monthly_savings > 500) {
    reasons.push(`Save ₹${monthly_savings.toFixed(0)}/month by switching to this bundle`)
  } else if (monthly_savings > 0) {
    reasons.push(`Reduce your monthly costs by ₹${monthly_savings.toFixed(0)}`)
  }

  // Matched services
  const serviceNames = matched_subscriptions.map(s => s.service_name).join(', ')
  reasons.push(`Includes all your current services: ${serviceNames}`)

  // Additional benefits
  if (bundle.ott_service_count > matched_subscriptions.length) {
    const additional = bundle.ott_service_count - matched_subscriptions.length
    reasons.push(`Plus ${additional} more OTT service${additional > 1 ? 's' : ''} you don't currently have`)
  }

  // Data benefits
  if (bundle.data_benefits && bundle.data_benefits.toLowerCase().includes('unlimited')) {
    reasons.push(`Unlimited high-speed internet included`)
  }

  // Special notes
  if (bundle.notes) {
    reasons.push(bundle.notes)
  }

  return reasons.join('. ') + '.'
}

/**
 * Calculate confidence score based on match quality
 */
function calculateConfidence(
  matchPercentage: number,
  savings: number,
  bundleValueScore: number
): number {
  let score = 0

  // Match percentage (40% weight)
  score += (matchPercentage / 100) * 0.4

  // Savings amount (30% weight) - max at ₹1000/month
  const savingsScore = Math.min(savings / 1000, 1)
  score += savingsScore * 0.3

  // Bundle value score (30% weight) - normalized by typical max of 25
  const valueNormalized = Math.min(bundleValueScore / 25, 1)
  score += valueNormalized * 0.3

  return Math.min(Math.max(score, 0), 1) // Clamp between 0 and 1
}

/**
 * Determine recommendation type
 */
function getRecommendationType(
  currentCost: number,
  bundleCost: number,
  matchPercentage: number
): 'bundle' | 'upgrade' | 'switch' {
  if (matchPercentage >= 80) {
    return bundleCost > currentCost ? 'upgrade' : 'bundle'
  }
  return 'switch'
}

/**
 * Find matching bundles for a user's subscriptions
 */
export async function findBundleMatches(
  userId: string,
  options: {
    minSavings?: number // Minimum monthly savings to recommend
    minMatchPercentage?: number // Minimum match percentage (0-100)
    maxResults?: number // Maximum number of results to return
  } = {}
): Promise<BundleMatch[]> {
  const {
    minSavings = 100, // Default: Must save at least ₹100/month
    minMatchPercentage = 40, // Default: Must match at least 40% of subscriptions
    maxResults = 10,
  } = options

  const supabase = await createClient()

  // 1. Get user's active subscriptions with service details
  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('id, service_id, custom_service_name, cost, billing_cycle, plan_name, services(id, name)')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (subsError) {
    console.error('Error fetching subscriptions for bundle matching:', subsError)
    return []
  }

  if (!subscriptions || subscriptions.length === 0) {
    return []
  }

  // Transform subscriptions with monthly cost
  const userSubscriptions: UserSubscription[] = subscriptions.map(sub => {
    const service = sub.services as unknown as { id: string; name: string } | null
    const customName = (sub as unknown as { custom_service_name?: string }).custom_service_name
    // Use service name from join, or fall back to custom service name
    const serviceName = service?.name || customName || 'Unknown Service'

    return {
      id: sub.id,
      service_id: sub.service_id,
      service_name: serviceName,
      plan_name: sub.plan_name,
      cost: sub.cost,
      billing_cycle: sub.billing_cycle,
      monthly_cost: calculateMonthlyCost(sub.cost, sub.billing_cycle),
    }
  })

  // 2. Get all active bundles
  const { data: bundles, error: bundlesError } = await supabase
    .from('telecom_bundles')
    .select('*')
    .eq('is_currently_active', true)
    .order('value_score', { ascending: false })

  if (bundlesError || !bundles) {
    return []
  }

  // 3. Calculate match for each bundle
  const matches: BundleMatch[] = bundles
    .map((bundle: TelecomBundle) => {
      // Find which user subscriptions are in this bundle
      const matched = userSubscriptions.filter(sub =>
        bundleIncludesService(bundle.included_ott_services, sub.service_name)
      )

      // Skip if no matches
      if (matched.length === 0) {
        return null
      }

      // Calculate current cost for matched subscriptions
      const currentCost = matched.reduce((sum, sub) => sum + sub.monthly_cost, 0)

      // Calculate savings
      const savings = currentCost - bundle.monthly_price
      const matchPercentage = (matched.length / userSubscriptions.length) * 100

      const partialMatch: Omit<BundleMatch, 'reasoning' | 'confidence_score' | 'recommendation_type'> = {
        bundle,
        matched_subscriptions: matched,
        matched_subscription_ids: matched.map(s => s.id),
        current_monthly_cost: currentCost,
        bundle_monthly_cost: bundle.monthly_price,
        monthly_savings: savings,
        annual_savings: savings * 12,
        match_percentage: matchPercentage,
        match_count: matched.length,
      }

      const reasoning = generateReasoning(partialMatch)
      const confidence_score = calculateConfidence(matchPercentage, savings, bundle.value_score)
      const recommendation_type = getRecommendationType(currentCost, bundle.monthly_price, matchPercentage)

      return {
        ...partialMatch,
        reasoning,
        confidence_score,
        recommendation_type,
      } as BundleMatch
    })
    .filter((match): match is BundleMatch =>
      match !== null &&
      match.monthly_savings >= minSavings &&
      match.match_percentage >= minMatchPercentage &&
      match.match_count >= 2 // Must match at least 2 services
    )
    .sort((a, b) => {
      // Sort by: 1) Savings (primary), 2) Confidence (secondary)
      if (Math.abs(b.monthly_savings - a.monthly_savings) > 50) {
        return b.monthly_savings - a.monthly_savings
      }
      return b.confidence_score - a.confidence_score
    })
    .slice(0, maxResults)

  return matches
}

/**
 * Get the single best bundle recommendation for a user
 */
export async function getBestBundleMatch(userId: string): Promise<BundleMatch | null> {
  const matches = await findBundleMatches(userId, { maxResults: 1 })
  return matches.length > 0 ? matches[0] : null
}

/**
 * Check if user should see bundle recommendations
 * (e.g., has enough subscriptions to make bundles worthwhile)
 */
export async function shouldShowBundleRecommendations(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  // Show if user has 2+ active subscriptions
  return (count ?? 0) >= 2
}
