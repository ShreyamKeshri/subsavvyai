/**
 * Legal Pages Configuration
 * Centralized configuration for legal document dates and metadata
 */

export const legalDates = {
  terms: 'October 28, 2025',
  privacy: 'October 28, 2025',
  refund: 'October 28, 2025',
} as const

export type LegalPageType = keyof typeof legalDates
