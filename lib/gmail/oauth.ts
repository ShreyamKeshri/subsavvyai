/**
 * Gmail OAuth Utilities
 * Handles Gmail API OAuth 2.0 flow for email scanning
 */

import { google } from 'googleapis';
import { encrypt, decrypt } from '@/lib/crypto/encryption';
import { createClient } from '@/lib/supabase/server';

/**
 * Get Gmail OAuth2 client instance
 */
export function getGmailOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

/**
 * Generate Gmail authorization URL
 * @param state - CSRF protection state token
 * @returns Authorization URL to redirect user to
 */
export function getGmailAuthUrl(state: string): string {
  const oauth2Client = getGmailOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state,
    prompt: 'consent', // Force consent screen to get refresh token
  });
}

/**
 * Exchange authorization code for access/refresh tokens
 * @param code - Authorization code from OAuth callback
 * @returns Tokens object with access_token, refresh_token, expiry_date
 */
export async function exchangeGmailCodeForTokens(code: string) {
  const oauth2Client = getGmailOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return {
      success: true,
      tokens,
    };
  } catch (error) {
    console.error('Gmail token exchange error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token exchange failed',
    };
  }
}

/**
 * Store Gmail tokens in database (encrypted)
 * @param userId - User ID
 * @param accessToken - Access token from Google
 * @param refreshToken - Refresh token from Google
 * @param expiryDate - Token expiry timestamp
 */
export async function storeGmailTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiryDate: number
) {
  const supabase = await createClient();

  try {
    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);

    const { error } = await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: userId,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: new Date(expiryDate).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id', // Update if already exists
      });

    if (error) {
      console.error('Error storing Gmail tokens:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error storing Gmail tokens:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store tokens',
    };
  }
}

/**
 * Get Gmail tokens for a user (decrypted)
 * @param userId - User ID
 * @returns Decrypted tokens or null if not found
 */
export async function getGmailTokens(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { success: false, error: 'Gmail not connected' };
    }

    // Decrypt tokens
    const accessToken = decrypt(data.access_token);
    const refreshToken = decrypt(data.refresh_token);

    return {
      success: true,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: data.expires_at,
      },
    };
  } catch (error) {
    console.error('Error retrieving Gmail tokens:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve tokens',
    };
  }
}

/**
 * Refresh Gmail access token if expired
 * @param userId - User ID
 * @returns New access token or error
 */
export async function refreshGmailToken(userId: string) {
  const tokensResult = await getGmailTokens(userId);

  if (!tokensResult.success || !tokensResult.tokens) {
    return { success: false, error: 'No tokens found' };
  }

  const { tokens } = tokensResult;

  // Check if token is expired or will expire in next 5 minutes
  const expiresAt = new Date(tokens.expires_at).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt > now + fiveMinutes) {
    // Token still valid
    return { success: true, accessToken: tokens.access_token };
  }

  // Token expired or expiring soon, refresh it
  const oauth2Client = getGmailOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token || !credentials.expiry_date) {
      return { success: false, error: 'Failed to refresh token' };
    }

    // Store new access token
    await storeGmailTokens(
      userId,
      credentials.access_token,
      tokens.refresh_token, // Keep same refresh token
      credentials.expiry_date
    );

    return { success: true, accessToken: credentials.access_token };
  } catch (error) {
    console.error('Error refreshing Gmail token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    };
  }
}

/**
 * Check if user has Gmail connected
 * @param userId - User ID
 * @returns true if connected, false otherwise
 */
export async function isGmailConnected(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('gmail_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !!data;
}

/**
 * Disconnect Gmail (delete tokens)
 * @param userId - User ID
 */
export async function disconnectGmail(userId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('gmail_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Gmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disconnect',
    };
  }
}
