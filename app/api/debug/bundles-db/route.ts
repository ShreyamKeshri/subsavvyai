import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check all bundles in database
    const { data: bundles, error: bundlesError } = await supabase
      .from('telecom_bundles')
      .select('*')

    if (bundlesError) {
      return NextResponse.json({
        error: bundlesError.message,
        hint: 'Telecom bundles table might not exist. Run migration 006.'
      }, { status: 500 })
    }

    const activeBundles = bundles?.filter(b => b.is_currently_active) || []

    return NextResponse.json({
      totalBundles: bundles?.length || 0,
      activeBundles: activeBundles.length,
      bundles: activeBundles.map(b => ({
        provider: b.provider,
        planName: b.plan_name,
        monthlyPrice: b.monthly_price,
        ottServices: b.included_ott_services,
        ottCount: b.ott_service_count,
        isActive: b.is_currently_active
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
