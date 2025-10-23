/**
 * Gmail Email Scanner
 * Fetches and scans Gmail for subscription receipts
 */

import { google } from 'googleapis';
import { getGmailOAuth2Client, refreshGmailToken } from './oauth';
import { matchMerchantPatterns, EmailMatch } from './patterns';

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  snippet: string;
}

export interface ScanResult {
  success: boolean;
  messagesScanned: number;
  subscriptionsFound: EmailMatch[];
  error?: string;
}

/**
 * Scan Gmail for subscription receipts
 * @param userId User ID
 * @param options Scan options (timeframe, max results)
 * @returns Detected subscriptions with confidence scores
 */
export async function scanGmailForSubscriptions(
  userId: string,
  options: {
    daysBack?: number;      // Default: 90 days
    maxResults?: number;    // Default: 100 emails
  } = {}
): Promise<ScanResult> {
  const { daysBack = 90, maxResults = 100 } = options;

  try {
    // Step 1: Get fresh access token
    const tokenResult = await refreshGmailToken(userId);

    if (!tokenResult.success || !tokenResult.accessToken) {
      return {
        success: false,
        messagesScanned: 0,
        subscriptionsFound: [],
        error: 'Failed to refresh Gmail token',
      };
    }

    // Step 2: Initialize Gmail API client
    const oauth2Client = getGmailOAuth2Client();
    oauth2Client.setCredentials({
      access_token: tokenResult.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Step 3: Search for subscription-related emails
    // Query targets: receipts, payments, subscriptions, renewals
    const searchQuery = buildSearchQuery(daysBack);

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults,
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      return {
        success: true,
        messagesScanned: 0,
        subscriptionsFound: [],
      };
    }

    // Step 4: Fetch full message details
    const emailDetails = await Promise.all(
      messages.map((msg) => fetchMessageDetails(gmail, msg.id!))
    );

    // Step 5: Filter out null results (errors)
    const validEmails = emailDetails.filter(
      (email): email is GmailMessage => email !== null
    );

    // Step 6: Match emails against merchant patterns
    const allMatches: EmailMatch[] = [];

    for (const email of validEmails) {
      const matches = matchMerchantPatterns({
        from: email.from,
        subject: email.subject,
        body: email.body,
      });

      // Add email metadata to matches
      matches.forEach((match) => {
        allMatches.push({
          ...match,
          // Store email details for later reference (optional)
        });
      });
    }

    // Step 7: Deduplicate matches (keep highest confidence per service)
    const dedupedMatches = deduplicateMatches(allMatches);

    return {
      success: true,
      messagesScanned: validEmails.length,
      subscriptionsFound: dedupedMatches,
    };
  } catch (error) {
    console.error('Gmail scan error:', error);
    return {
      success: false,
      messagesScanned: 0,
      subscriptionsFound: [],
      error: error instanceof Error ? error.message : 'Scan failed',
    };
  }
}

/**
 * Build Gmail search query for subscription emails
 * @param daysBack Number of days to search back
 * @returns Gmail search query string
 */
function buildSearchQuery(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const afterDate = date.toISOString().split('T')[0].replace(/-/g, '/');

  // Search terms for subscription receipts
  const terms = [
    'receipt',
    'payment',
    'subscription',
    'renewal',
    'charged',
    'invoice',
    'membership',
  ];

  // Combine with OR, add date filter
  const query = `(${terms.join(' OR ')}) after:${afterDate}`;

  return query;
}

/**
 * Gmail API message header interface
 */
interface GmailHeader {
  name: string;
  value: string;
}

/**
 * Gmail API message payload interface
 */
interface GmailPayload {
  headers: GmailHeader[];
  body?: { data?: string };
  parts?: GmailPayload[];
  mimeType?: string;
}

/**
 * Fetch full message details from Gmail
 * @param gmail Gmail API client
 * @param messageId Message ID
 * @returns Parsed email data
 */
async function fetchMessageDetails(
  gmail: ReturnType<typeof google.gmail>,
  messageId: string
): Promise<GmailMessage | null> {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = response.data;
    const headers = message.payload?.headers as GmailHeader[] | undefined;

    if (!headers) {
      return null;
    }

    // Extract headers
    const from = headers.find((h) => h.name === 'From')?.value || '';
    const subject = headers.find((h) => h.name === 'Subject')?.value || '';
    const date = headers.find((h) => h.name === 'Date')?.value || '';

    // Extract body (plain text preferred, fallback to HTML)
    const body = extractBody(message.payload as GmailPayload);

    return {
      id: message.id || '',
      threadId: message.threadId || '',
      from,
      subject,
      body,
      date,
      snippet: message.snippet || '',
    };
  } catch (error) {
    console.error(`Error fetching message ${messageId}:`, error);
    return null;
  }
}

/**
 * Extract email body from Gmail message payload
 * Handles multipart messages and base64 encoding
 * @param payload Gmail message payload
 * @returns Decoded body text
 */
function extractBody(payload: GmailPayload): string {
  let body = '';

  // If payload has body data directly
  if (payload.body?.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    return body;
  }

  // If payload has parts (multipart message)
  if (payload.parts) {
    for (const part of payload.parts) {
      // Prefer text/plain
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      }

      // Fallback to text/html
      if (part.mimeType === 'text/html' && part.body?.data && !body) {
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        // Strip HTML tags (basic)
        body = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }

      // Check nested parts (recursive)
      if (part.parts) {
        const nestedBody = extractBody(part);
        if (nestedBody) {
          body = nestedBody;
          break;
        }
      }
    }
  }

  return body;
}

/**
 * Deduplicate matches - keep highest confidence per service
 * @param matches All detected matches
 * @returns Deduplicated matches
 */
function deduplicateMatches(matches: EmailMatch[]): EmailMatch[] {
  const serviceMap = new Map<string, EmailMatch>();

  for (const match of matches) {
    const existing = serviceMap.get(match.serviceId);

    // Keep match with higher confidence, or higher amount if confidence is equal
    if (
      !existing ||
      match.confidence > existing.confidence ||
      (match.confidence === existing.confidence &&
        (match.amount || 0) > (existing.amount || 0))
    ) {
      serviceMap.set(match.serviceId, match);
    }
  }

  return Array.from(serviceMap.values()).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get scan history for a user
 * (Future enhancement: Track scan history in database)
 */
export interface ScanHistory {
  userId: string;
  lastScanDate: string | null;
  totalScans: number;
  totalSubscriptionsFound: number;
}

export async function getScanHistory(userId: string): Promise<ScanHistory> {
  // TODO: Implement scan history tracking in database
  // For now, return empty history
  return {
    userId,
    lastScanDate: null,
    totalScans: 0,
    totalSubscriptionsFound: 0,
  };
}
