import { createClient } from '@supabase/supabase-js'

/**
 * Test Supabase connection
 * Run this once to verify your Supabase setup is working
 */
export async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test connection by getting the current timestamp from the database
    const { data, error } = await supabase
      .from('_test')
      .select('*')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist (expected for now)
      throw error
    }

    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}
