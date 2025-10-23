import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGmailAuthUrl } from '@/lib/gmail/oauth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Initiate Gmail OAuth Flow
 * Generates authorization URL and redirects user to Google
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (10 OAuth attempts per 15 minutes per IP)
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = await checkRateLimit(clientIp, 'STRICT');

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many OAuth attempts. Please try again later.', resetAt: rateLimitResult.resetAt },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate random state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in httpOnly cookie with user ID for verification
    // Expires in 10 minutes (OAuth flow should complete quickly)
    const cookieStore = await cookies();
    cookieStore.set('gmail_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    // Also store user ID to verify in callback
    cookieStore.set('gmail_oauth_user', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    });

    // Get Gmail authorization URL
    const authUrl = getGmailAuthUrl(state);

    // Redirect to Google authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Gmail OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Gmail connection' },
      { status: 500 }
    );
  }
}
