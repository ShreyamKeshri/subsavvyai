/**
 * OAuth Callback Handler
 * Handles the redirect from Google OAuth and other providers
 * Exchanges the auth code for a session and redirects to dashboard or onboarding
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`,
        requestUrl.origin
      )
    )
  }

  // Exchange code for session
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('Failed to authenticate')}`, requestUrl.origin)
        )
      }

      if (data.session) {
        const { user } = data.session

        // Check if this is a new user (needs onboarding)
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        // Redirect to onboarding if new user, otherwise to dashboard
        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }

        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    } catch (err) {
      console.error('Callback handler error:', err)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Something went wrong')}`, requestUrl.origin)
      )
    }
  }

  // No code or error - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
