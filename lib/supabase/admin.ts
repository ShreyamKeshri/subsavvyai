import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 * Uses service role key for admin operations (user deletion, etc.)
 * ONLY use this for privileged operations that cannot be done with regular client
 *
 * SECURITY: This module is server-only and will throw an error if imported on the client
 */

// Validate environment variables at module load (fail fast)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables for admin client')
}

export function createAdminClient() {
  // Non-null assertion is safe because we validate above
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
