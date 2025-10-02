import { SubscriptionCategory } from '@/types/subscription'

/**
 * Popular Indian subscription services
 * This list will be used in the service name dropdown
 */

export interface ServiceOption {
  name: string
  category: SubscriptionCategory
  typicalPrice?: number // INR per month
  logo?: string
}

export const INDIAN_SERVICES: ServiceOption[] = [
  // OTT Platforms
  { name: 'Netflix', category: 'OTT', typicalPrice: 649 },
  { name: 'Amazon Prime Video', category: 'OTT', typicalPrice: 1499 / 12 },
  { name: 'Disney+ Hotstar', category: 'OTT', typicalPrice: 1499 / 12 },
  { name: 'SonyLIV', category: 'OTT', typicalPrice: 299 },
  { name: 'ZEE5', category: 'OTT', typicalPrice: 299 },
  { name: 'Voot', category: 'OTT', typicalPrice: 299 },
  { name: 'MX Player', category: 'OTT', typicalPrice: 149 },
  { name: 'Eros Now', category: 'OTT', typicalPrice: 79 },
  { name: 'ALTBalaji', category: 'OTT', typicalPrice: 100 },
  { name: 'hoichoi', category: 'OTT', typicalPrice: 349 / 3 },
  { name: 'Sun NXT', category: 'OTT', typicalPrice: 399 / 12 },
  { name: 'Lionsgate Play', category: 'OTT', typicalPrice: 99 },

  // Music Streaming
  { name: 'Spotify', category: 'Music', typicalPrice: 119 },
  { name: 'Apple Music', category: 'Music', typicalPrice: 99 },
  { name: 'YouTube Music', category: 'Music', typicalPrice: 99 },
  { name: 'Gaana Plus', category: 'Music', typicalPrice: 99 },
  { name: 'JioSaavn Pro', category: 'Music', typicalPrice: 99 },
  { name: 'Amazon Music Unlimited', category: 'Music', typicalPrice: 149 },
  { name: 'Wynk Music', category: 'Music', typicalPrice: 99 },

  // Food Delivery
  { name: 'Zomato Gold', category: 'Food Delivery', typicalPrice: 300 },
  { name: 'Swiggy One', category: 'Food Delivery', typicalPrice: 349 / 3 },
  { name: 'Dineout Passport', category: 'Food Delivery', typicalPrice: 299 / 3 },

  // SaaS & Productivity
  { name: 'Microsoft 365', category: 'SaaS', typicalPrice: 489 },
  { name: 'Google Workspace', category: 'SaaS', typicalPrice: 672 },
  { name: 'Adobe Creative Cloud', category: 'SaaS', typicalPrice: 2599 },
  { name: 'Canva Pro', category: 'SaaS', typicalPrice: 399 },
  { name: 'Notion Plus', category: 'SaaS', typicalPrice: 680 },
  { name: 'Evernote Premium', category: 'SaaS', typicalPrice: 419 },
  { name: 'Dropbox Plus', category: 'SaaS', typicalPrice: 830 },
  { name: 'GitHub Pro', category: 'SaaS', typicalPrice: 330 },
  { name: 'ChatGPT Plus', category: 'SaaS', typicalPrice: 1650 },

  // Fitness
  { name: 'Cult.fit', category: 'Fitness', typicalPrice: 1499 },
  { name: 'HealthifyMe Pro', category: 'Fitness', typicalPrice: 1199 / 3 },
  { name: 'Fitpass', category: 'Fitness', typicalPrice: 799 },
  { name: 'Nike Training Club', category: 'Fitness', typicalPrice: 499 },

  // News & Magazines
  { name: 'Times Prime', category: 'News', typicalPrice: 999 / 12 },
  { name: 'The Hindu', category: 'News', typicalPrice: 149 },
  { name: 'Indian Express', category: 'News', typicalPrice: 149 },
  { name: 'Economic Times', category: 'News', typicalPrice: 199 },
  { name: 'Magzter Gold', category: 'News', typicalPrice: 3999 / 12 },

  // Gaming
  { name: 'Xbox Game Pass', category: 'Gaming', typicalPrice: 489 },
  { name: 'PlayStation Plus', category: 'Gaming', typicalPrice: 499 },
  { name: 'Apple Arcade', category: 'Gaming', typicalPrice: 99 },

  // Education
  { name: 'Coursera Plus', category: 'Education', typicalPrice: 4999 / 12 },
  { name: 'Udemy Pro', category: 'Education', typicalPrice: 1500 },
  { name: 'LinkedIn Learning', category: 'Education', typicalPrice: 1599 },
  { name: 'Skillshare', category: 'Education', typicalPrice: 1200 },
  { name: 'Unacademy Plus', category: 'Education', typicalPrice: 999 },
  { name: 'BYJU\'S', category: 'Education', typicalPrice: 2000 },
]

/**
 * Get service by name
 */
export const getServiceByName = (name: string): ServiceOption | undefined => {
  return INDIAN_SERVICES.find(
    (service) => service.name.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get services by category
 */
export const getServicesByCategory = (
  category: SubscriptionCategory
): ServiceOption[] => {
  return INDIAN_SERVICES.filter((service) => service.category === category)
}

/**
 * Get all service names for autocomplete
 */
export const getServiceNames = (): string[] => {
  return INDIAN_SERVICES.map((service) => service.name)
}
