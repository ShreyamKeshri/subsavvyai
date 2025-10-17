/**
 * useAuth Hook
 * Provides auth state and methods throughout the app
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false
  })

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isAuthenticated: !!session
      })
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isAuthenticated: !!session
      })

      // Refresh the page to update server components
      router.refresh()
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  return state
}

/**
 * useUser Hook
 * Simplified hook that only returns the current user
 */
export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

/**
 * useSession Hook
 * Simplified hook that only returns the current session
 */
export function useSession() {
  const { session, loading } = useAuth()
  return { session, loading }
}

/**
 * useRequireAuth Hook
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  return { isAuthenticated, loading }
}
