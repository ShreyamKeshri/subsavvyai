import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Supabase client for use in Middleware
 * This client is used to manage auth in Next.js middleware
 */
export async function createClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient({
    req: request,
    res: response,
  })

  // Refresh session if expired
  await supabase.auth.getSession()

  return { supabase, response }
}
