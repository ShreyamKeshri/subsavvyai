/**
 * Branding Configuration
 * Centralized place for all brand-related content
 * Easy to update brand name, tagline, and messaging
 */

export const branding = {
  // Brand Identity
  name: 'SubSavvyAI',
  tagline: "India's First AI-Powered Subscription Optimizer",
  description: 'AI finds ₹10,000/year hidden in your subscriptions',

  // Alternative taglines (for A/B testing or different pages)
  taglines: {
    short: 'Smart Subscription Management',
    value: 'Save ₹10,000/year on subscriptions',
    ai: 'AI-Powered Subscription Optimizer',
    india: "India's Smartest Way to Manage Subscriptions",
  },

  // Logo paths (will be updated when logo is added)
  logo: {
    full: '/logo-full.svg',           // Full logo with text
    icon: '/logo-icon.svg',           // Icon only
    dark: '/logo-dark.svg',           // Dark mode version
    light: '/logo-light.svg',         // Light mode version
    favicon: '/favicon.ico',          // Browser favicon
  },

  // Social Media / Meta
  social: {
    twitter: '@SubSavvyAI',
    email: 'hello@subsavvy.ai',
    website: 'https://subsavvy.ai',
  },

  // Value Propositions
  valueProps: [
    {
      title: 'Smart Downgrade Alerts',
      description: 'AI analyzes your usage and suggests cheaper plans',
      icon: 'TrendingDown',
      savings: '₹1,428/year average',
    },
    {
      title: 'Bundle Optimizer',
      description: 'Find telecom bundles that include your subscriptions',
      icon: 'Package',
      savings: '₹14,388/year potential',
    },
    {
      title: 'Content Overlap Detection',
      description: 'Stop paying for duplicate content across platforms',
      icon: 'Sparkles',
      savings: '₹9,600/year typical',
    },
  ],

  // Messaging
  messages: {
    hero: {
      heading: 'Stop Overpaying for Subscriptions',
      subheading: 'AI finds hidden savings in your Spotify, Netflix, and more',
      cta: 'Start Saving Now',
    },
    dashboard: {
      welcome: (name: string) => `Welcome back, ${name}!`,
      emptyState: 'Connect your services to start optimizing',
      recommendation: 'AI found new ways to save money',
    },
    savings: {
      monthly: (amount: number) => `Save ₹${amount.toFixed(0)}/month`,
      annual: (amount: number) => `Save ₹${amount.toFixed(0)}/year`,
      total: (amount: number) => `Total savings: ₹${amount.toFixed(0)}`,
    },
  },

  // SEO & Meta
  meta: {
    title: 'SubSavvyAI - AI Subscription Optimizer for India',
    description: 'AI-powered subscription management that finds ₹10,000/year in hidden savings. Smart downgrades, bundle optimization, and overlap detection for Spotify, Netflix, and more.',
    keywords: [
      'subscription management',
      'AI optimizer',
      'save money',
      'subscription tracker',
      'India',
      'Spotify',
      'Netflix',
      'OTT platforms',
      'telecom bundles',
    ],
    ogImage: '/og-image.png',
  },

  // Features list (for landing page, etc.)
  features: [
    'AI-powered usage analysis',
    'Smart downgrade recommendations',
    'Telecom bundle optimization',
    'Content overlap detection',
    'Price hike alerts',
    'Automatic usage tracking',
    'Multi-platform support',
    'India-specific optimizations',
  ],

  // Supported services (for marketing)
  supportedServices: [
    'Spotify',
    'Netflix',
    'Amazon Prime',
    'YouTube Premium',
    'Hotstar',
    'Zee5',
    'SonyLIV',
    'Jio',
    'Airtel',
    'Vi',
  ],
} as const

/**
 * Get formatted brand name with AI suffix
 */
export function getBrandName(includeAI = true): string {
  return includeAI ? branding.name : 'SubSavvy'
}

/**
 * Get random tagline for variety
 */
export function getRandomTagline(): string {
  const taglines = Object.values(branding.taglines)
  return taglines[Math.floor(Math.random() * taglines.length)]
}

/**
 * Format savings message
 */
export function formatSavings(amount: number, period: 'monthly' | 'annual' = 'annual'): string {
  return period === 'monthly'
    ? branding.messages.savings.monthly(amount)
    : branding.messages.savings.annual(amount)
}
