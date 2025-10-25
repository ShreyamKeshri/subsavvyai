/**
 * Gmail Email Parser
 * Parses subscription data and matches to services database
 */

import { createClient } from '@/lib/supabase/server';
import { EmailMatch } from './patterns';
import { convertToINR } from '@/lib/currency/exchange-rates';

export interface ParsedSubscription {
  serviceId: string | null;          // UUID from services table (if matched)
  serviceName: string;                // Detected service name
  category: string;                   // Detected category
  cost: number | null;                // Amount in INR
  currency: string;                   // Original currency
  originalCost: number | null;        // Original amount
  confidence: 'high' | 'medium' | 'low';
  matchDetails: {
    fromMatch: boolean;
    subjectMatch: boolean;
    bodyMatch: boolean;
    amountMatch: boolean;
  };
}

/**
 * Parse email matches and match to services database
 * @param matches Detected email matches
 * @returns Parsed subscriptions with service IDs
 */
export async function parseAndMatchSubscriptions(
  matches: EmailMatch[]
): Promise<ParsedSubscription[]> {
  const supabase = await createClient();

  // Step 1: Fetch all services from database for fuzzy matching
  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, category')
    .eq('is_active', true);

  if (error || !services) {
    console.error('Error fetching services:', error);
    // Return matches without service IDs
    return matches.map(matchToSubscription);
  }

  // Step 2: Match each detection to a service
  const parsedSubscriptions: ParsedSubscription[] = [];

  for (const match of matches) {
    const subscription = matchToSubscription(match);

    // Try to find matching service in database
    const matchedService = findServiceMatch(match.serviceName, services);

    if (matchedService) {
      subscription.serviceId = matchedService.id;
      // Use database category if available (more authoritative)
      subscription.category = matchedService.category;
    }

    parsedSubscriptions.push(subscription);
  }

  return parsedSubscriptions;
}

/**
 * Convert EmailMatch to ParsedSubscription
 * @param match Email match result
 * @returns Parsed subscription data
 */
function matchToSubscription(match: EmailMatch): ParsedSubscription {
  // Convert amount to INR if needed
  let costInINR: number | null = null;
  const originalCost = match.amount;
  const currency = match.currency;

  if (match.amount && match.currency) {
    if (match.currency === 'INR') {
      costInINR = match.amount;
    } else {
      costInINR = convertToINR(match.amount, match.currency);
    }
  }

  return {
    serviceId: null,  // Will be filled by fuzzy matching
    serviceName: match.serviceName,
    category: match.category,
    cost: costInINR,
    currency,
    originalCost,
    confidence: match.confidenceLabel,
    matchDetails: match.matchDetails,
  };
}

/**
 * Find matching service in database using fuzzy matching
 * @param detectedName Service name from email
 * @param services List of services from database
 * @returns Matched service or null
 */
function findServiceMatch(
  detectedName: string,
  services: { id: string; name: string; category: string }[]
): { id: string; name: string; category: string } | null {
  const normalizedDetected = normalizeServiceName(detectedName);

  // First pass: Exact match
  for (const service of services) {
    const normalizedService = normalizeServiceName(service.name);
    if (normalizedService === normalizedDetected) {
      return service;
    }
  }

  // Second pass: Contains match
  for (const service of services) {
    const normalizedService = normalizeServiceName(service.name);

    // Check if detected name contains service name or vice versa
    if (
      normalizedDetected.includes(normalizedService) ||
      normalizedService.includes(normalizedDetected)
    ) {
      return service;
    }
  }

  // Third pass: Fuzzy match with Levenshtein distance
  let bestMatch: { id: string; name: string; category: string } | null = null;
  let bestDistance = Infinity;

  for (const service of services) {
    const normalizedService = normalizeServiceName(service.name);
    const distance = levenshteinDistance(normalizedDetected, normalizedService);

    // Match if distance is less than 30% of the longer string length
    const maxLength = Math.max(normalizedDetected.length, normalizedService.length);
    const threshold = Math.floor(maxLength * 0.3);

    if (distance < threshold && distance < bestDistance) {
      bestMatch = service;
      bestDistance = distance;
    }
  }

  return bestMatch;
}

/**
 * Normalize service name for comparison
 * @param name Service name
 * @returns Normalized name (lowercase, no special chars, no spaces)
 */
function normalizeServiceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special chars and spaces
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  /* eslint-disable security/detect-object-injection */
  // Safe: Array indices are controlled by string lengths (not user input)

  // Create 2D array
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deletion
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[len1][len2];
  /* eslint-enable security/detect-object-injection */
}

/**
 * Infer billing cycle from email content or detected patterns
 * @param subscription Parsed subscription
 * @returns Inferred billing cycle
 */
export function inferBillingCycle(
  subscription: ParsedSubscription
): 'monthly' | 'yearly' | null {
  // Heuristics based on typical pricing
  const cost = subscription.cost;

  if (!cost) return null;

  // Typical monthly range: ₹50 - ₹2,000
  // Typical yearly range: ₹500 - ₹20,000

  if (cost < 3000) {
    return 'monthly'; // Likely monthly
  }

  if (cost > 5000) {
    return 'yearly'; // Likely yearly
  }

  // Ambiguous range (₹3,000 - ₹5,000), return null
  return null;
}

/**
 * Deduplicate parsed subscriptions (keep highest confidence)
 * @param subscriptions Parsed subscriptions
 * @returns Deduplicated subscriptions
 */
export function deduplicateParsedSubscriptions(
  subscriptions: ParsedSubscription[]
): ParsedSubscription[] {
  const serviceMap = new Map<string, ParsedSubscription>();

  for (const sub of subscriptions) {
    // Use serviceId if available, otherwise serviceName
    const key = sub.serviceId || sub.serviceName;

    const existing = serviceMap.get(key);

    // Define confidence scores for comparison
    const confidenceScore: Record<'high' | 'medium' | 'low', number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

     
    // Safe: confidence values are constrained to 'high' | 'medium' | 'low'
    if (
      !existing ||
      confidenceScore[sub.confidence] > confidenceScore[existing.confidence] ||
      (sub.confidence === existing.confidence && (sub.cost || 0) > (existing.cost || 0))
    ) {
      serviceMap.set(key, sub);
    }
     
  }

  return Array.from(serviceMap.values());
}
