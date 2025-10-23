/**
 * Email Pattern Matching for Indian Subscription Services
 * Detects subscription receipts from 52+ popular Indian services
 */

/* eslint-disable security/detect-unsafe-regex */
// Amount patterns use global flag for multiple matches - safe for our use case

export interface MerchantPattern {
  serviceId: string;
  serviceName: string;
  category: string;
  patterns: {
    from: RegExp[];          // Email sender patterns
    subject: RegExp[];       // Email subject patterns
    body: RegExp[];          // Email body patterns
  };
  amountPatterns: RegExp[];  // Amount extraction patterns
  currency: string;
}

/**
 * Comprehensive merchant patterns for 52 Indian services
 * Pattern priority: from > subject > body (most reliable to least)
 */
export const MERCHANT_PATTERNS: MerchantPattern[] = [
  // ======================
  // OTT PLATFORMS
  // ======================
  {
    serviceId: 'netflix',
    serviceName: 'Netflix',
    category: 'OTT',
    patterns: {
      from: [/@netflix\.com$/i, /@mailer\.netflix\.com$/i],
      subject: [/netflix.*payment/i, /netflix.*receipt/i, /netflix.*subscription/i],
      body: [/netflix.*charged/i, /netflix.*membership/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'amazon-prime',
    serviceName: 'Amazon Prime Video',
    category: 'OTT',
    patterns: {
      from: [/@amazon\.in$/i, /@primevideo\.com$/i],
      subject: [/prime.*payment/i, /prime video.*receipt/i, /prime membership/i],
      body: [/prime.*charged/i, /prime video/i, /amazon prime/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'hotstar',
    serviceName: 'Disney+ Hotstar',
    category: 'OTT',
    patterns: {
      from: [/@hotstar\.com$/i, /@disneyplus\.com$/i],
      subject: [/hotstar.*payment/i, /disney.*hotstar/i, /subscription.*hotstar/i],
      body: [/hotstar.*charged/i, /disney.*hotstar/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'sonyliv',
    serviceName: 'SonyLIV',
    category: 'OTT',
    patterns: {
      from: [/@sonyliv\.com$/i, /@sony\.com$/i],
      subject: [/sonyliv.*payment/i, /sonyliv.*receipt/i],
      body: [/sonyliv.*subscription/i, /sony liv/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'zee5',
    serviceName: 'ZEE5',
    category: 'OTT',
    patterns: {
      from: [/@zee5\.com$/i],
      subject: [/zee5.*payment/i, /zee5.*subscription/i],
      body: [/zee5.*charged/i, /zee entertainment/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'voot',
    serviceName: 'Voot',
    category: 'OTT',
    patterns: {
      from: [/@voot\.com$/i],
      subject: [/voot.*select/i, /voot.*subscription/i],
      body: [/voot.*premium/i, /voot select/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },

  // ======================
  // MUSIC STREAMING
  // ======================
  {
    serviceId: 'spotify',
    serviceName: 'Spotify',
    category: 'Music',
    patterns: {
      from: [/@spotify\.com$/i, /@mail\.spotify\.com$/i],
      subject: [/spotify.*receipt/i, /spotify premium/i, /spotify.*payment/i],
      body: [/spotify.*subscription/i, /spotify premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'apple-music',
    serviceName: 'Apple Music',
    category: 'Music',
    patterns: {
      from: [/@apple\.com$/i, /@email\.apple\.com$/i],
      subject: [/apple music/i, /receipt.*apple/i],
      body: [/apple music.*subscription/i, /music membership/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'youtube-music',
    serviceName: 'YouTube Music',
    category: 'Music',
    patterns: {
      from: [/@youtube\.com$/i, /@google\.com$/i],
      subject: [/youtube music/i, /youtube premium/i],
      body: [/youtube.*subscription/i, /youtube premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'gaana',
    serviceName: 'Gaana Plus',
    category: 'Music',
    patterns: {
      from: [/@gaana\.com$/i],
      subject: [/gaana.*plus/i, /gaana.*subscription/i],
      body: [/gaana plus/i, /gaana.*premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'jiosaavn',
    serviceName: 'JioSaavn Pro',
    category: 'Music',
    patterns: {
      from: [/@jiosaavn\.com$/i, /@jio\.com$/i],
      subject: [/jiosaavn.*pro/i, /saavn.*subscription/i],
      body: [/jiosaavn pro/i, /saavn.*premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },

  // ======================
  // FOOD DELIVERY
  // ======================
  {
    serviceId: 'zomato-gold',
    serviceName: 'Zomato Gold',
    category: 'Food Delivery',
    patterns: {
      from: [/@zomato\.com$/i],
      subject: [/zomato.*gold/i, /zomato.*pro/i, /zomato.*membership/i],
      body: [/zomato gold/i, /zomato pro/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'swiggy-one',
    serviceName: 'Swiggy One',
    category: 'Food Delivery',
    patterns: {
      from: [/@swiggy\.in$/i, /@swiggy\.com$/i],
      subject: [/swiggy one/i, /swiggy.*membership/i],
      body: [/swiggy one/i, /swiggy super/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'dineout',
    serviceName: 'Dineout Passport',
    category: 'Food Delivery',
    patterns: {
      from: [/@dineout\.co\.in$/i],
      subject: [/dineout.*passport/i, /dineout.*membership/i],
      body: [/dineout passport/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },

  // ======================
  // SAAS & PRODUCTIVITY
  // ======================
  {
    serviceId: 'microsoft-365',
    serviceName: 'Microsoft 365',
    category: 'SaaS',
    patterns: {
      from: [/@microsoft\.com$/i, /@office\.com$/i],
      subject: [/microsoft 365/i, /office 365/i, /microsoft.*subscription/i],
      body: [/microsoft 365/i, /office subscription/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'google-workspace',
    serviceName: 'Google Workspace',
    category: 'SaaS',
    patterns: {
      from: [/@google\.com$/i, /@workspace\.google\.com$/i],
      subject: [/google workspace/i, /g suite/i],
      body: [/google workspace/i, /workspace subscription/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'adobe-creative',
    serviceName: 'Adobe Creative Cloud',
    category: 'SaaS',
    patterns: {
      from: [/@adobe\.com$/i],
      subject: [/adobe.*creative/i, /creative cloud/i, /adobe.*subscription/i],
      body: [/creative cloud/i, /adobe subscription/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'canva-pro',
    serviceName: 'Canva Pro',
    category: 'SaaS',
    patterns: {
      from: [/@canva\.com$/i],
      subject: [/canva pro/i, /canva.*subscription/i],
      body: [/canva pro/i, /canva premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'notion',
    serviceName: 'Notion Plus',
    category: 'SaaS',
    patterns: {
      from: [/@notion\.so$/i, /@mail\.notion\.so$/i],
      subject: [/notion.*plus/i, /notion.*subscription/i],
      body: [/notion.*workspace/i, /notion premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'chatgpt',
    serviceName: 'ChatGPT Plus',
    category: 'SaaS',
    patterns: {
      from: [/@openai\.com$/i],
      subject: [/chatgpt.*plus/i, /chatgpt.*subscription/i],
      body: [/chatgpt plus/i, /openai.*subscription/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /\$\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'USD',
  },

  // ======================
  // FITNESS
  // ======================
  {
    serviceId: 'cultfit',
    serviceName: 'Cult.fit',
    category: 'Fitness',
    patterns: {
      from: [/@cure\.fit$/i, /@cult\.fit$/i],
      subject: [/cult\.fit/i, /cultfit/i, /cult.*membership/i],
      body: [/cult\.fit/i, /cure\.fit/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'healthifyme',
    serviceName: 'HealthifyMe Pro',
    category: 'Fitness',
    patterns: {
      from: [/@healthifyme\.com$/i],
      subject: [/healthifyme.*pro/i, /healthifyme.*subscription/i],
      body: [/healthifyme pro/i, /healthifyme premium/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },

  // ======================
  // NEWS & MAGAZINES
  // ======================
  {
    serviceId: 'times-prime',
    serviceName: 'Times Prime',
    category: 'News',
    patterns: {
      from: [/@timesprime\.com$/i, /@timesgroup\.com$/i],
      subject: [/times prime/i, /times.*membership/i],
      body: [/times prime/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },

  // ======================
  // GAMING
  // ======================
  {
    serviceId: 'xbox-gamepass',
    serviceName: 'Xbox Game Pass',
    category: 'Gaming',
    patterns: {
      from: [/@xbox\.com$/i, /@microsoft\.com$/i],
      subject: [/xbox.*game pass/i, /game pass/i],
      body: [/xbox game pass/i, /game pass subscription/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'playstation-plus',
    serviceName: 'PlayStation Plus',
    category: 'Gaming',
    patterns: {
      from: [/@playstation\.com$/i, /@sony\.com$/i],
      subject: [/playstation.*plus/i, /ps plus/i],
      body: [/playstation plus/i, /ps\+ subscription/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },

  // ======================
  // EDUCATION
  // ======================
  {
    serviceId: 'coursera',
    serviceName: 'Coursera Plus',
    category: 'Education',
    patterns: {
      from: [/@coursera\.org$/i],
      subject: [/coursera.*plus/i, /coursera.*subscription/i],
      body: [/coursera plus/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /\$\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'USD',
  },
  {
    serviceId: 'linkedin-learning',
    serviceName: 'LinkedIn Learning',
    category: 'Education',
    patterns: {
      from: [/@linkedin\.com$/i],
      subject: [/linkedin learning/i, /linkedin.*subscription/i],
      body: [/linkedin learning/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
  {
    serviceId: 'unacademy',
    serviceName: 'Unacademy Plus',
    category: 'Education',
    patterns: {
      from: [/@unacademy\.com$/i],
      subject: [/unacademy.*plus/i, /unacademy.*subscription/i],
      body: [/unacademy plus/i],
    },
    amountPatterns: [/₹\s*[\d,]+(?:\.\d{2})?/g, /INR\s*[\d,]+(?:\.\d{2})?/g],
    currency: 'INR',
  },
];

/**
 * Match confidence scoring thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,      // From match + subject/body match
  MEDIUM: 0.6,    // Subject match + body match OR from match only
  LOW: 0.4,       // Single pattern match
  REJECT: 0.3,    // Below this, don't include
};

/**
 * Calculate match confidence score
 * @param matches Object with boolean flags for pattern matches
 * @returns Confidence score between 0-1
 */
export function calculateConfidence(matches: {
  fromMatch: boolean;
  subjectMatch: boolean;
  bodyMatch: boolean;
  amountMatch: boolean;
}): number {
  let score = 0;

  if (matches.fromMatch) score += 0.5;      // Most reliable indicator
  if (matches.subjectMatch) score += 0.3;   // Strong indicator
  if (matches.bodyMatch) score += 0.15;     // Supportive indicator
  if (matches.amountMatch) score += 0.05;   // Weak indicator (amounts can be anything)

  return Math.min(score, 1.0);
}

/**
 * Get confidence label from score
 */
export function getConfidenceLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

/**
 * Extract amount from text using patterns
 * @param text Email content
 * @param patterns Amount regex patterns
 * @returns Extracted amount or null
 */
export function extractAmount(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean amount string (remove currency symbols, commas)
      const amountStr = matches[0].replace(/[₹$,INR\s]/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return null;
}

/**
 * Match email content against merchant patterns
 * @param emailData Email from, subject, body
 * @returns Array of matches with confidence scores
 */
export interface EmailMatch {
  serviceId: string;
  serviceName: string;
  category: string;
  confidence: number;
  confidenceLabel: 'high' | 'medium' | 'low';
  amount: number | null;
  currency: string;
  matchDetails: {
    fromMatch: boolean;
    subjectMatch: boolean;
    bodyMatch: boolean;
    amountMatch: boolean;
  };
}

export function matchMerchantPatterns(emailData: {
  from: string;
  subject: string;
  body: string;
}): EmailMatch[] {
  const matches: EmailMatch[] = [];

  for (const pattern of MERCHANT_PATTERNS) {
    // Test all patterns
    const fromMatch = pattern.patterns.from.some((regex) => regex.test(emailData.from));
    const subjectMatch = pattern.patterns.subject.some((regex) =>
      regex.test(emailData.subject)
    );
    const bodyMatch = pattern.patterns.body.some((regex) => regex.test(emailData.body));

    // Extract amount
    const amount = extractAmount(
      `${emailData.subject} ${emailData.body}`,
      pattern.amountPatterns
    );
    const amountMatch = amount !== null;

    // Calculate confidence
    const matchDetails = { fromMatch, subjectMatch, bodyMatch, amountMatch };
    const confidence = calculateConfidence(matchDetails);

    // Only include if confidence meets threshold
    if (confidence >= CONFIDENCE_THRESHOLDS.REJECT) {
      matches.push({
        serviceId: pattern.serviceId,
        serviceName: pattern.serviceName,
        category: pattern.category,
        confidence,
        confidenceLabel: getConfidenceLabel(confidence),
        amount,
        currency: pattern.currency,
        matchDetails,
      });
    }
  }

  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}
