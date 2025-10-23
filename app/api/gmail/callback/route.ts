import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeGmailCodeForTokens, storeGmailTokens } from '@/lib/gmail/oauth';
import { trackServerEvent } from '@/lib/analytics/server-events';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Gmail OAuth Callback Handler
 * Handles the OAuth redirect after user authorizes Gmail access
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting (10 callback attempts per 15 minutes per IP)
  const clientIp = getClientIp(request.headers);
  const rateLimitResult = await checkRateLimit(clientIp, 'STRICT');

  if (!rateLimitResult.success) {
    return NextResponse.redirect(
      new URL('/dashboard?oauth_error=rate_limit_exceeded', request.url)
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?oauth_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?oauth_error=missing_code', request.url)
    );
  }

  if (!state) {
    return NextResponse.redirect(
      new URL('/dashboard?oauth_error=missing_state', request.url)
    );
  }

  try {
    // Verify CSRF state
    const cookieStore = await cookies();
    const storedState = cookieStore.get('gmail_oauth_state')?.value;
    const storedUserId = cookieStore.get('gmail_oauth_user')?.value;

    if (!storedState || !storedUserId) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=invalid_session', request.url)
      );
    }

    // Constant-time comparison to prevent timing attacks
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=state_mismatch', request.url)
      );
    }

    // Clear OAuth cookies after verification
    cookieStore.delete('gmail_oauth_state');
    cookieStore.delete('gmail_oauth_user');

    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    // Verify user ID matches stored user ID (prevent session hijacking)
    if (user.id !== storedUserId) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=user_mismatch', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokenResult = await exchangeGmailCodeForTokens(code);

    if (!tokenResult.success || !tokenResult.tokens) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=token_exchange_failed', request.url)
      );
    }

    const { tokens } = tokenResult;

    // Store tokens in database (encrypted)
    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=invalid_tokens', request.url)
      );
    }

    const storeResult = await storeGmailTokens(
      user.id,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date
    );

    if (!storeResult.success) {
      return NextResponse.redirect(
        new URL('/dashboard?oauth_error=token_storage_failed', request.url)
      );
    }

    // Track successful Gmail connection
    await trackServerEvent(user.id, 'gmail_connected', {
      timestamp: new Date().toISOString(),
    });

    // Redirect to scan page
    return NextResponse.redirect(
      new URL('/dashboard/scan?gmail_connected=true', request.url)
    );
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?oauth_error=callback_failed', request.url)
    );
  }
}
