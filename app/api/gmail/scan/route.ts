import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scanGmailForSubscriptions } from '@/lib/gmail/scanner';
import { parseAndMatchSubscriptions, deduplicateParsedSubscriptions } from '@/lib/gmail/parser';
import { trackServerEvent } from '@/lib/analytics/server-events';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Gmail Scan API Endpoint
 * Scans user's Gmail for subscription receipts and returns detected subscriptions
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting (5 scans per hour per IP)
  const clientIp = getClientIp(request.headers);
  const rateLimitResult = await checkRateLimit(clientIp, 'STRICT');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many scan requests. Please try again later.',
        resetAt: rateLimitResult.resetAt,
      },
      { status: 429 }
    );
  }

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body (optional scan parameters)
    const body = await request.json().catch(() => ({}));
    const { daysBack = 90, maxResults = 100 } = body;

    // Validate parameters
    if (daysBack < 1 || daysBack > 365) {
      return NextResponse.json(
        { error: 'daysBack must be between 1 and 365' },
        { status: 400 }
      );
    }

    if (maxResults < 10 || maxResults > 500) {
      return NextResponse.json(
        { error: 'maxResults must be between 10 and 500' },
        { status: 400 }
      );
    }

    // Track scan start
    await trackServerEvent(user.id, 'gmail_scan_started', {
      daysBack,
      maxResults,
      timestamp: new Date().toISOString(),
    });

    // Step 1: Scan Gmail for subscription emails
    const scanResult = await scanGmailForSubscriptions(user.id, {
      daysBack,
      maxResults,
    });

    if (!scanResult.success) {
      // Track scan failure
      await trackServerEvent(user.id, 'gmail_scan_failed', {
        error: scanResult.error,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: scanResult.error || 'Failed to scan Gmail',
        },
        { status: 500 }
      );
    }

    // Step 2: Parse and match to services database
    const parsedSubscriptions = await parseAndMatchSubscriptions(
      scanResult.subscriptionsFound
    );

    // Step 3: Deduplicate subscriptions
    const dedupedSubscriptions = deduplicateParsedSubscriptions(parsedSubscriptions);

    // Track scan success
    await trackServerEvent(user.id, 'gmail_scan_completed', {
      messagesScanned: scanResult.messagesScanned,
      subscriptionsFound: dedupedSubscriptions.length,
      timestamp: new Date().toISOString(),
    });

    // Return results
    return NextResponse.json({
      success: true,
      messagesScanned: scanResult.messagesScanned,
      subscriptionsFound: dedupedSubscriptions.length,
      subscriptions: dedupedSubscriptions,
    });
  } catch (error) {
    console.error('Gmail scan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check scan status
 * (Future enhancement: Track scan history)
 */
export async function GET() {
  return NextResponse.json({
    message: 'Gmail scan endpoint. Use POST to initiate a scan.',
    endpoint: '/api/gmail/scan',
    method: 'POST',
    body: {
      daysBack: 'number (optional, default: 90, range: 1-365)',
      maxResults: 'number (optional, default: 100, range: 10-500)',
    },
  });
}
