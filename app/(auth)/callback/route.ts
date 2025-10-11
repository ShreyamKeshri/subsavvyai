/**
 * OAuth Callback Handler
 * Handles the redirect from Google OAuth and other providers
 * Exchanges the auth code for a session and redirects to dashboard or onboarding
 * Updated to use @supabase/ssr (latest stable method)
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trackServerEvent, identifyUser } from '@/lib/analytics/server-events'

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
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

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

        // Check if profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create it (this is a new signup)
        const isNewSignup = profileError || !profile
        if (isNewSignup) {
          const metadata = user.user_metadata || {}
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: metadata.full_name || metadata.name || null,
              avatar_url: metadata.avatar_url || metadata.picture || null,
              phone_number: user.phone || null,
            })

          // Track signup event for Google OAuth (new user)
          await identifyUser(user.id, {
            email: user.email,
            name: metadata.full_name || metadata.name,
          })
          await trackServerEvent(user.id, 'user_signup', {
            method: 'google',
            userId: user.id,
          })
        } else {
          // Track login event for returning Google OAuth user
          await trackServerEvent(user.id, 'user_login', {
            method: 'google',
            userId: user.id,
          })
        }

        // Check onboarding status from user_preferences table
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        // Redirect to onboarding if not completed, otherwise to dashboard
        if (!preferences?.onboarding_completed) {
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
