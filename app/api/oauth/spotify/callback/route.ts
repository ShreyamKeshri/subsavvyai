import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, storeSpotifyTokens, getSpotifyProfile } from '@/lib/oauth/spotify'

/**
 * Spotify OAuth Callback Handler
 * Handles the OAuth redirect after user authorizes Spotify access
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const _state = searchParams.get('state') // TODO: Implement CSRF state verification
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

  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)

    // Get Spotify profile to verify connection
    const _profile = await getSpotifyProfile(tokenData.access_token) // TODO: Store profile data

    // Get Spotify service ID from database
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('api_provider', 'spotify')
      .single()

    if (serviceError || !service) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=service_not_found', request.url)
      )
    }

    // Store OAuth tokens
    await storeSpotifyTokens(user.id, service.id, tokenData)

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
