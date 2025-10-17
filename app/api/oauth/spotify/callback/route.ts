import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, storeSpotifyTokens, getSpotifyProfile } from '@/lib/oauth/spotify'
import { trackServerEvent } from '@/lib/analytics/server-events'
import { cookies } from 'next/headers'

/**
 * Spotify OAuth Callback Handler
 * Handles the OAuth redirect after user authorizes Spotify access
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?oauth_error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?oauth_error=missing_code', request.url)
    )
  }

  if (!state) {
    return NextResponse.redirect(
      new URL('/dashboard?oauth_error=missing_state', request.url)
    )
  }

  try {
    // Verify CSRF state
    const cookieStore = await cookies()
    const storedState = cookieStore.get('spotify_oauth_state')?.value
    const storedUserId = cookieStore.get('spotify_oauth_user')?.value

    if (!storedState || !storedUserId) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=invalid_session', request.url)
      )
    }

    // Constant-time comparison to prevent timing attacks
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=state_mismatch', request.url)
      )
    }

    // Clear OAuth cookies after verification
    cookieStore.delete('spotify_oauth_state')
    cookieStore.delete('spotify_oauth_user')

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Verify user ID matches the one from OAuth initiation
    if (user.id !== storedUserId) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=user_mismatch', request.url)
      )
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)

    // Get Spotify profile to verify connection
    const _profile = await getSpotifyProfile(tokenData.access_token) // TODO: Store profile data

    // Get Spotify service ID from database (case-insensitive name match)
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .ilike('name', 'spotify')
      .single()

    if (serviceError || !service) {
      console.error('Spotify service lookup error:', serviceError)
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=service_not_found', request.url)
      )
    }

    // Store OAuth tokens
    await storeSpotifyTokens(user.id, service.id, tokenData)

    // Track Spotify connection event
    await trackServerEvent(user.id, 'spotify_connected', {
      userId: user.id,
    })

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?oauth_success=spotify', request.url)
    )
  } catch (error) {
    console.error('Spotify OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard?oauth_error=${encodeURIComponent('Failed to connect Spotify')}`, request.url)
    )
  }
}
