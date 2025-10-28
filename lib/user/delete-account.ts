'use server'

/**
 * User Account Deletion
 * Permanently deletes user account and all associated data
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface DeleteAccountResult {
  success: boolean
  error?: string
}

/**
 * Permanently delete user account and all associated data
 * This operation is irreversible
 *
 * @returns Promise<DeleteAccountResult>
 */
export async function deleteUserAccount(): Promise<DeleteAccountResult> {
  try {
    // Get authenticated user from regular client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const userId = user.id

    // Create admin client for privileged operations
    const supabaseAdmin = createAdminClient()

    console.log(`[DELETE ACCOUNT] Starting deletion for user: ${userId}`)

    // Delete user data from all related tables in correct order (respecting foreign keys)
    // Order matters: child tables before parent tables

    const tables = [
      // Child tables first (tables that reference other user tables)
      'bundle_recommendations',
      'optimization_recommendations',
      'service_usage',
      'oauth_tokens',
      'gmail_tokens',
      'payment_history',
      'subscriptions',
      'payment_methods',
      'user_analytics_cache',
      'notification_preferences',
      'user_category_preferences',
      'user_preferences',
      'security_events',
      'notifications',
    ]

    // Delete data from each table
    for (const table of tables) {
      try {
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', userId)

        if (deleteError) {
          console.error(`[DELETE ACCOUNT] Error deleting from ${table}:`, deleteError)
          // Continue with other tables even if one fails
        } else {
          console.log(`[DELETE ACCOUNT] Deleted rows from ${table}`)
        }
      } catch (err) {
        console.error(`[DELETE ACCOUNT] Exception deleting from ${table}:`, err)
        // Continue with other tables
      }
    }

    // Special case: profiles table uses 'id' instead of 'user_id'
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('[DELETE ACCOUNT] Error deleting profile:', profileError)
      } else {
        console.log('[DELETE ACCOUNT] Deleted profile')
      }
    } catch (err) {
      console.error('[DELETE ACCOUNT] Exception deleting profile:', err)
    }

    // Finally, delete the user from auth.users using Admin API
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        userId
      )

      if (authDeleteError) {
        console.error('[DELETE ACCOUNT] Error deleting auth user:', authDeleteError)
        return {
          success: false,
          error: 'Failed to delete authentication user. Please contact support.'
        }
      }

      console.log('[DELETE ACCOUNT] Successfully deleted auth user')
    } catch (err) {
      console.error('[DELETE ACCOUNT] Exception deleting auth user:', err)
      return {
        success: false,
        error: 'Failed to delete authentication user. Please contact support.'
      }
    }

    // Sign out the user (invalidate session)
    await supabase.auth.signOut()

    console.log(`[DELETE ACCOUNT] Successfully deleted user: ${userId}`)

    return { success: true }
  } catch (error) {
    console.error('[DELETE ACCOUNT] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete account'
    return { success: false, error: message }
  }
}

// =====================================================
// SOFT DELETE (OPTIONAL - FOR FUTURE USE)
// =====================================================

/**
 * Soft delete user account (mark for deletion without immediate removal)
 * Useful for grace period or compliance requirements
 *
 * @param userId - User ID to soft delete
 * @returns Promise<DeleteAccountResult>
 */
/*
export async function softDeleteUserAccount(userId: string): Promise<DeleteAccountResult> {
  try {
    const supabaseAdmin = createAdminClient()

    // Update profile with deletion markers
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        pending_deletion: true,
        deletion_scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('[SOFT DELETE] Error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[SOFT DELETE] Marked user ${userId} for deletion`)

    return { success: true }
  } catch (error) {
    console.error('[SOFT DELETE] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Failed to schedule deletion'
    return { success: false, error: message }
  }
}
*/
