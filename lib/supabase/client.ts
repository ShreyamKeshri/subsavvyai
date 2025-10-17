import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cached Supabase client instance
 * Prevents memory leaks by reusing the same client with WebSocket connections
 */
let cachedClient: SupabaseClient | null = null

/**
 * Supabase client for use in Client Components
 * This client is used in components that run in the browser
 * Updated to use @supabase/ssr (latest stable method)
 *
 * **Fixed:** Now caches the client to prevent memory leaks from multiple WebSocket connections
 */
export function createClient() {
  // Return cached client if it exists
  if (cachedClient) {
    return cachedClient
  }

  // Create new client and cache it
  cachedClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return cachedClient
}

/**
 * Reset the cached client (useful for testing or auth state changes)
 * Use sparingly - only when you need a fresh client with new auth state
 */
export function resetClient() {
  cachedClient = null
}
