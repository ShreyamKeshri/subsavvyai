'use server';

/**
 * Gmail Subscription Import Actions
 * Server actions for bulk importing detected subscriptions
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { trackServerEvent } from '@/lib/analytics/server-events';

export interface ImportSubscriptionData {
  serviceId: string | null;
  serviceName: string;
  customServiceName?: string;
  category: string;
  cost: number;
  currency: string;
  originalCost: number | null;
  originalCurrency: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled';
  startDate?: string;
  notes?: string;
}

/**
 * Bulk import subscriptions from Gmail scan results
 * @param subscriptions Array of subscriptions to import
 * @returns Result with success count
 */
export async function bulkImportSubscriptions(subscriptions: ImportSubscriptionData[]) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'Not authenticated',
      imported: 0,
    };
  }

  // Validate input
  if (!subscriptions || subscriptions.length === 0) {
    return {
      success: false,
      error: 'No subscriptions provided',
      imported: 0,
    };
  }

  if (subscriptions.length > 50) {
    return {
      success: false,
      error: 'Maximum 50 subscriptions can be imported at once',
      imported: 0,
    };
  }

  try {
    let imported = 0;
    const errors: string[] = [];

    // Import each subscription
    for (const sub of subscriptions) {
      try {
        // Prepare subscription data
        const subscriptionData = {
          user_id: user.id,
          service_id: sub.serviceId,
          custom_service_name: sub.serviceId ? null : sub.customServiceName || sub.serviceName,
          cost: sub.cost,
          currency: sub.currency,
          original_cost: sub.originalCost,
          original_currency: sub.originalCurrency,
          billing_cycle: sub.billingCycle,
          status: sub.status,
          start_date: sub.startDate || new Date().toISOString().split('T')[0],
          next_billing_date: calculateNextBillingDate(
            sub.startDate || new Date().toISOString().split('T')[0],
            sub.billingCycle
          ),
          notes: sub.notes
            ? `${sub.notes} (Auto-imported from Gmail)`
            : 'Auto-imported from Gmail',
        };

        // Insert subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);

        if (insertError) {
          errors.push(`${sub.serviceName}: ${insertError.message}`);
        } else {
          imported++;
        }
      } catch (error) {
        errors.push(
          `${sub.serviceName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Track import event
    await trackServerEvent(user.id, 'gmail_subscriptions_imported', {
      count: imported,
      failed: errors.length,
      timestamp: new Date().toISOString(),
    });

    // Revalidate paths
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/subscriptions');

    if (imported === 0) {
      return {
        success: false,
        error: errors.length > 0 ? errors.join('; ') : 'Failed to import subscriptions',
        imported: 0,
      };
    }

    return {
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Bulk import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Import failed',
      imported: 0,
    };
  }
}

/**
 * Calculate next billing date based on start date and cycle
 */
function calculateNextBillingDate(startDate: string, cycle: 'monthly' | 'yearly'): string {
  const start = new Date(startDate);
  const next = new Date(start);

  if (cycle === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }

  return next.toISOString().split('T')[0];
}

/**
 * Check if Gmail is connected for current user
 */
export async function isGmailConnected() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, connected: false };
  }

  // Check if user has Gmail tokens
  const { data, error } = await supabase
    .from('gmail_tokens')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { success: true, connected: false };
  }

  return { success: true, connected: true };
}
