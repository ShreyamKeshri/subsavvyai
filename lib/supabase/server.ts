import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Supabase client for use in Server Components
 * This client is used in components that run on the server
 */
export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
