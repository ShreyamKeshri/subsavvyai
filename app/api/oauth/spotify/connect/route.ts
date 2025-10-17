import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSpotifyAuthUrl } from '@/lib/oauth/spotify'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

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
    const state = randomBytes(32).toString('hex') // Increased from 16 to 32 bytes for better security

    // Store state in httpOnly cookie with user ID for verification
    // Expires in 10 minutes (OAuth flow should complete quickly)
    const cookieStore = await cookies()
    cookieStore.set('spotify_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    // Also store user ID to verify in callback
    cookieStore.set('spotify_oauth_user', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    })

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
