/**
 * Currency Exchange Rates
 * Convert any currency to INR
 *
 * Note: These are approximate rates. In production, you would:
 * 1. Use a real-time API like exchangerate-api.com or fixer.io
 * 2. Cache rates and refresh daily
 * 3. Store historical rates for accurate reporting
 */

export const EXCHANGE_RATES_TO_INR = {
  INR: 1,
  USD: 83.12,      // 1 USD = 83.12 INR
  EUR: 90.45,      // 1 EUR = 90.45 INR
  GBP: 105.30,     // 1 GBP = 105.30 INR
  AUD: 54.20,      // 1 AUD = 54.20 INR
  CAD: 61.35,      // 1 CAD = 61.35 INR
  SGD: 61.80,      // 1 SGD = 61.80 INR
  AED: 22.63,      // 1 AED = 22.63 INR
} as const

export type SupportedCurrency = keyof typeof EXCHANGE_RATES_TO_INR

/**
 * Convert any supported currency to INR
 */
export function convertToINR(amount: number, fromCurrency: string): number {
  const currency = fromCurrency.toUpperCase() as SupportedCurrency

  // Default to INR if currency not supported
  // eslint-disable-next-line security/detect-object-injection
  const rate = EXCHANGE_RATES_TO_INR[currency] || 1

  return amount * rate
}

/**
 * Convert INR to any supported currency
 */
export function convertFromINR(amountInINR: number, toCurrency: string): number {
  const currency = toCurrency.toUpperCase() as SupportedCurrency

  // Default to INR if currency not supported
  // eslint-disable-next-line security/detect-object-injection
  const rate = EXCHANGE_RATES_TO_INR[currency] || 1

  return amountInINR / rate
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'د.إ',
  }

  const symbol = currencySymbols[currency.toUpperCase()] || currency.toUpperCase()

  return `${symbol}${amount.toFixed(2)}`
}
