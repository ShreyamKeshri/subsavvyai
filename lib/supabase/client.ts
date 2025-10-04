import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in Client Components
 * This client is used in components that run in the browser
 * Updated to use @supabase/ssr (latest stable method)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
