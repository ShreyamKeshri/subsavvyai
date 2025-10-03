import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Test 1: Fetch services
  const { data: services, error } = await supabase
    .from('services')
    .select('name, category, typical_price_inr')
    .limit(5)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    serviceCount: services?.length,
    sampleServices: services
  })
}
