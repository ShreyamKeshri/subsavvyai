import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Supabase client for use in Client Components
 * This client is used in components that run in the browser
 */
export const createClient = () => {
  return createClientComponentClient()
}
