import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSpotifyAuthUrl } from '@/lib/oauth/spotify'
import { randomBytes } from 'crypto'

/**
 * Initiate Spotify OAuth Flow
 * Generates authorization URL and redirects user to Spotify
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate random state for CSRF protection
    const state = randomBytes(16).toString('hex')

    // Store state in session or database (for verification in callback)
    // For now, we'll just use it in the URL

    // Get Spotify authorization URL
    const authUrl = getSpotifyAuthUrl(state)

    // Redirect to Spotify authorization page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Spotify OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Spotify connection' },
      { status: 500 }
    )
  }
}
