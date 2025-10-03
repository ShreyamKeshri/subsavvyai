/**
 * Rate Limiting Utility
 * Prevents API abuse and brute force attacks
 */

import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiters = new Map<string, RateLimiterMemory>()

export interface RateLimitConfig {
  points: number // Number of requests
  duration: number // Time window in seconds
}

/**
 * Get or create a rate limiter for a specific endpoint
 */
function getRateLimiter(key: string, config: RateLimitConfig): RateLimiterMemory {
  if (!rateLimiters.has(key)) {
    const limiter = new RateLimiterMemory({
      points: config.points,
      duration: config.duration,
      blockDuration: config.duration, // Block for same duration
    })
    rateLimiters.set(key, limiter)
  }
  return rateLimiters.get(key)!
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { points: 5, duration: 900 }, // 5 attempts per 15 minutes
  SIGNUP: { points: 3, duration: 3600 }, // 3 attempts per hour
  OTP_REQUEST: { points: 3, duration: 3600 }, // 3 OTP requests per hour
  OTP_VERIFY: { points: 5, duration: 900 }, // 5 verification attempts per 15 minutes
  PASSWORD_RESET: { points: 3, duration: 3600 }, // 3 reset requests per hour

  // API endpoints
  API_READ: { points: 100, duration: 60 }, // 100 requests per minute
  API_WRITE: { points: 30, duration: 60 }, // 30 write requests per minute

  // Payment endpoints
  PAYMENT_CREATE: { points: 5, duration: 60 }, // 5 payment attempts per minute

  // Strict limits
  STRICT: { points: 10, duration: 900 }, // 10 requests per 15 minutes
} as const

/**
 * Check rate limit for an identifier (IP address, user ID, etc.)
 */
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<{ success: boolean; remaining?: number; resetAt?: Date }> {
  // eslint-disable-next-line security/detect-object-injection
  const config = RATE_LIMITS[limitType]
  const limiter = getRateLimiter(limitType, config)

  try {
    const result = await limiter.consume(identifier, 1)

    return {
      success: true,
      remaining: result.remainingPoints,
      resetAt: new Date(Date.now() + result.msBeforeNext)
    }
  } catch (err) {
    // Rate limit exceeded
    const error = err as { msBeforeNext: number }
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(Date.now() + error.msBeforeNext)
    }
  }
}

/**
 * Reset rate limit for an identifier (use after successful verification)
 */
export async function resetRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<void> {
  // eslint-disable-next-line security/detect-object-injection
  const config = RATE_LIMITS[limitType]
  const limiter = getRateLimiter(limitType, config)
  await limiter.delete(identifier)
}

/**
 * Get rate limit status without consuming a point
 */
export async function getRateLimitStatus(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<{ remaining: number; resetAt: Date }> {
  // eslint-disable-next-line security/detect-object-injection
  const config = RATE_LIMITS[limitType]
  const limiter = getRateLimiter(limitType, config)

  try {
    const result = await limiter.get(identifier)

    if (!result) {
      return {
        remaining: config.points,
        resetAt: new Date(Date.now() + config.duration * 1000)
      }
    }

    return {
      remaining: result.remainingPoints,
      resetAt: new Date(Date.now() + result.msBeforeNext)
    }
  } catch {
    return {
      remaining: 0,
      resetAt: new Date(Date.now() + config.duration * 1000)
    }
  }
}

/**
 * Helper to get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
