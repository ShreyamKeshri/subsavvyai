/**
 * Spotify OAuth Integration
 * Handles OAuth flow and usage data fetching from Spotify API
 */

import { createClient } from '@/lib/supabase/server'

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
// Spotify requires explicit loopback address (127.0.0.1), not localhost
// Use dedicated env var to avoid conflicts with other OAuth providers
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/api/oauth/spotify/callback'

export const SPOTIFY_SCOPES = [
  'user-read-recently-played',
  'user-top-read',
  'user-read-playback-state',
  'user-read-currently-playing'
].join(' ')

/**
 * Spotify OAuth Types
 */
export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

export interface SpotifyUserProfile {
  id: string
  email: string
  display_name: string
  country: string
  product: string // 'free', 'premium'
}

export interface SpotifyUsageData {
  total_listening_time_ms: number
  total_tracks_played: number
  top_artists: string[]
  top_tracks: string[]
  recently_played: number
}

/**
 * Generate Spotify OAuth authorization URL
 */
export function getSpotifyAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: 'true'
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

/**
 * Refresh expired access token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

/**
 * Get user's Spotify profile
 */
export async function getSpotifyProfile(accessToken: string): Promise<SpotifyUserProfile> {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify profile')
  }

  return response.json()
}

/**
 * Fetch user's listening history and calculate usage
 */
export async function fetchSpotifyUsageData(accessToken: string): Promise<SpotifyUsageData> {
  // Fetch recently played tracks (last 50 tracks)
  const recentlyPlayedResponse = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  // Fetch top tracks (last 4 weeks)
  const topTracksResponse = await fetch(
    'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20',
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  // Fetch top artists (last 4 weeks)
  const topArtistsResponse = await fetch(
    'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10',
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  if (!recentlyPlayedResponse.ok) {
    throw new Error('Failed to fetch Spotify usage data')
  }

  const recentlyPlayed = await recentlyPlayedResponse.json()
  const topTracks = topTracksResponse.ok ? await topTracksResponse.json() : { items: [] }
  const topArtists = topArtistsResponse.ok ? await topArtistsResponse.json() : { items: [] }

  // Calculate total listening time from recently played
  const totalListeningTimeMs = recentlyPlayed.items.reduce(
    (total: number, item: { track: { duration_ms: number } }) => total + item.track.duration_ms,
    0
  )

  return {
    total_listening_time_ms: totalListeningTimeMs,
    total_tracks_played: recentlyPlayed.items.length,
    top_artists: topArtists.items.map((artist: { name: string }) => artist.name),
    top_tracks: topTracks.items.map((track: { name: string }) => track.name),
    recently_played: recentlyPlayed.items.length
  }
}

/**
 * Store OAuth tokens in database (encrypted in future)
 */
export async function storeSpotifyTokens(
  userId: string,
  serviceId: string,
  tokenData: SpotifyTokenResponse
): Promise<void> {
  const supabase = await createClient()

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

  const { error } = await supabase
    .from('oauth_tokens')
    .upsert({
      user_id: userId,
      service_id: serviceId,
      provider: 'spotify',
      access_token: tokenData.access_token, // TODO: Encrypt before storing
      refresh_token: tokenData.refresh_token || null, // TODO: Encrypt before storing
      token_type: tokenData.token_type,
      expires_at: expiresAt.toISOString(),
      scope: tokenData.scope,
      is_active: true,
      last_refreshed_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,service_id,provider'
    })

  if (error) {
    throw new Error(`Failed to store Spotify tokens: ${error.message}`)
  }
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidSpotifyToken(userId: string, serviceId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: tokenData, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('service_id', serviceId)
    .eq('provider', 'spotify')
    .eq('is_active', true)
    .single()

  if (error || !tokenData) {
    return null
  }

  const now = new Date()
  const expiresAt = new Date(tokenData.expires_at)

  // If token is expired, refresh it
  if (now >= expiresAt && tokenData.refresh_token) {
    try {
      const newTokenData = await refreshSpotifyToken(tokenData.refresh_token)
      await storeSpotifyTokens(userId, serviceId, newTokenData)
      return newTokenData.access_token
    } catch {
      return null
    }
  }

  return tokenData.access_token
}

/**
 * Disconnect Spotify (revoke and delete tokens)
 */
export async function disconnectSpotify(userId: string, serviceId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('oauth_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('service_id', serviceId)
    .eq('provider', 'spotify')
}
