import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

/**
 * Canny SSO Token Generation API
 *
 * Generates a secure SSO token for Canny user authentication.
 * This allows users to post feedback without creating a separate Canny account.
 *
 * @see https://developers.canny.io/install/sso
 */
export async function GET() {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile for full name and avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    // Check if SSO secret is configured
    const ssoSecret = process.env.CANNY_SSO_SECRET
    if (!ssoSecret) {
      console.error('⚠️ CANNY_SSO_SECRET not configured in environment variables')
      return NextResponse.json(
        { error: 'SSO not configured' },
        { status: 500 }
      )
    }

    // Prepare user data for Canny JWT
    // Required: email, id, name | Optional: avatarURL, created (ISO 8601)
    const cannyUserData: {
      avatarURL?: string
      created?: string
      email: string
      id: string
      name: string
    } = {
      email: user.email || '',
      id: user.id,
      name: profile?.full_name || user.email?.split('@')[0] || 'User',
    }

    // Add optional fields if available
    const avatarURL = profile?.avatar_url || user.user_metadata?.avatar_url
    if (avatarURL) {
      cannyUserData.avatarURL = avatarURL
    }

    if (user.created_at) {
      cannyUserData.created = new Date(user.created_at).toISOString()
    }

    // Generate JWT token using HS256 algorithm
    const ssoToken = jwt.sign(cannyUserData, ssoSecret, {
      algorithm: 'HS256',
    })

    return NextResponse.json({
      success: true,
      ssoToken,
      userData: cannyUserData,
    })
  } catch (error) {
    console.error('Error generating Canny SSO token:', error)
    return NextResponse.json(
      { error: 'Failed to generate SSO token' },
      { status: 500 }
    )
  }
}
