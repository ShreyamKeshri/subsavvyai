import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncServiceUsage } from '@/lib/usage/usage-actions'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * Sync Usage Data API Route
 * Manually trigger usage sync for a specific subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (30 write requests per minute per IP)
    const clientIp = getClientIp(request.headers)
    const rateLimitResult = await checkRateLimit(clientIp, 'API_WRITE')

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', resetAt: rateLimitResult.resetAt },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { subscription_id, service_id } = body

    if (!subscription_id || !service_id) {
      return NextResponse.json(
        { error: 'Missing subscription_id or service_id' },
        { status: 400 }
      )
    }

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('id', subscription_id)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Sync usage data
    const result = await syncServiceUsage(subscription_id, service_id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to sync usage' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Usage sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
