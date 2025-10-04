import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/recommendations/recommendation-actions'

/**
 * Generate Recommendations API Route
 * Manually trigger AI recommendation generation
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate recommendations
    const result = await generateRecommendations()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate recommendations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    })
  } catch (error) {
    console.error('Recommendation generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
