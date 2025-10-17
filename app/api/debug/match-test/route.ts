import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Copy the matching functions here for debugging
function normalizeServiceName(serviceName: string): string[] {
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

  for (const [canonical, variants] of Object.entries(SERVICE_NAME_MAP)) {
    if (variants.some(v => serviceName.toLowerCase().includes(v.toLowerCase()))) {
      return [canonical, ...variants]
    }
  }
  return [serviceName]
}

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

function calculateMonthlyCost(cost: number, billingCycle: string): number {
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

  return cost
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id,
        service_id,
        cost,
        billing_cycle,
        plan_name,
        services (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')

    const userSubscriptions = (subscriptions || []).map(sub => {
      const service = sub.services as unknown as { id: string; name: string } | null
      return {
        id: sub.id,
        service_id: sub.service_id,
        service_name: service?.name || 'Unknown',
        plan_name: sub.plan_name,
        cost: sub.cost,
        billing_cycle: sub.billing_cycle,
        monthly_cost: calculateMonthlyCost(sub.cost, sub.billing_cycle),
      }
    })

    // Get first bundle to test matching
    const { data: bundles } = await supabase
      .from('telecom_bundles')
      .select('*')
      .eq('is_currently_active', true)
      .limit(3)

    const testResults = bundles?.map(bundle => {
      const matchTests = userSubscriptions.map(sub => {
        const normalized = normalizeServiceName(sub.service_name)
        const matches = bundleIncludesService(bundle.included_ott_services, sub.service_name)

        return {
          userService: sub.service_name,
          normalizedTo: normalized,
          bundleServices: bundle.included_ott_services,
          matches,
          matchDetails: bundle.included_ott_services.map((bs: string) => ({
            bundleService: bs,
            matchesThis: normalized.some((n: string) =>
              bs.toLowerCase().includes(n.toLowerCase()) ||
              n.toLowerCase().includes(bs.toLowerCase())
            )
          }))
        }
      })

      const matched = userSubscriptions.filter(sub =>
        bundleIncludesService(bundle.included_ott_services, sub.service_name)
      )

      const currentCost = matched.reduce((sum, sub) => sum + sub.monthly_cost, 0)
      const savings = currentCost - bundle.monthly_price

      return {
        bundleName: bundle.plan_name,
        bundlePrice: bundle.monthly_price,
        bundleServices: bundle.included_ott_services,
        matchedCount: matched.length,
        matchedServices: matched.map(s => s.service_name),
        currentMonthlyCost: currentCost,
        savings,
        meetsRequirements: {
          atLeast2Matches: matched.length >= 2,
          savesAtLeast100: savings >= 100,
          overall: matched.length >= 2 && savings >= 100
        },
        detailedMatching: matchTests
      }
    })

    return NextResponse.json({
      userSubscriptions: userSubscriptions.map(s => ({
        name: s.service_name,
        cost: s.cost,
        billingCycle: s.billing_cycle,
        monthlyCost: s.monthly_cost
      })),
      testResults
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
