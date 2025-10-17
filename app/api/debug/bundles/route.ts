import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findBundleMatches } from '@/lib/bundles/bundle-matcher'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get active subscriptions
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        cost,
        billing_cycle,
        services (name)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 })
    }

    const ottServices = [
      'Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV',
      'Apple TV+', 'JioCinema', 'JioSaavn', 'Voot', 'Eros Now'
    ]

    const subscriptionsWithOTT = (subs || []).map(sub => {
      const service = sub.services as unknown as { name?: string } | null
      const serviceName = service?.name || 'Custom'
      const isOTT = ottServices.some(ott =>
        serviceName.toLowerCase().includes(ott.toLowerCase())
      )
      return {
        serviceName,
        cost: sub.cost,
        billingCycle: sub.billing_cycle,
        isOTT
      }
    })

    const ottCount = subscriptionsWithOTT.filter(s => s.isOTT).length

    // Try to find bundle matches
    const matches = await findBundleMatches(user.id, {
      minSavings: 100,
      minMatchPercentage: 40,
      maxResults: 10
    })

    return NextResponse.json({
      totalSubscriptions: subscriptionsWithOTT.length,
      ottCount,
      needsAtLeast2OTT: ottCount >= 2,
      subscriptions: subscriptionsWithOTT,
      bundleMatches: matches.length,
      matches: matches.map(m => ({
        bundleName: m.bundle.plan_name,
        provider: m.bundle.provider,
        matchedCount: m.match_count,
        monthlySavings: m.monthly_savings,
        matchedServices: m.matched_subscriptions.map(s => s.service_name)
      })),
      recognizedOTTServices: ottServices
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
