/**
 * Security Event Logging System
 * Logs security-related events for monitoring and auditing
 */

import { createClient } from '@/lib/supabase/server'

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_locked'
  | 'signup_success'
  | 'signup_failed'
  | 'otp_requested'
  | 'otp_verification_success'
  | 'otp_verification_failed'
  | 'otp_brute_force_detected'
  | 'password_reset_requested'
  | 'password_reset_success'
  | 'password_changed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'session_created'
  | 'session_destroyed'
  | 'session_expired'
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_signature_mismatch'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'suspicious_activity'
  | 'data_export_requested'
  | 'account_deleted'
  | 'csrf_token_mismatch'
  | 'sql_injection_attempt'
  | 'xss_attempt'

export interface SecurityEventMetadata {
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  error?: string
  attempts?: number
  [key: string]: string | number | boolean | undefined
}

/**
 * Critical events that require immediate alert
 */
const CRITICAL_EVENTS: SecurityEventType[] = [
  'otp_brute_force_detected',
  'payment_signature_mismatch',
  'login_locked',
  'csrf_token_mismatch',
  'sql_injection_attempt',
  'xss_attempt',
  'unauthorized_access',
  'suspicious_activity'
]

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  metadata: SecurityEventMetadata = {}
): Promise<void> {
  try {
    const supabase = await createClient()

    // Store security event in database
    const { error } = await supabase.from('security_events').insert({
      event_type: eventType,
      user_id: metadata.userId || null,
      ip_address: metadata.ip || null,
      user_agent: metadata.userAgent || null,
      metadata: sanitizeMetadata(metadata),
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error('Failed to log security event:', error)
    }

    // Send alert for critical events
    if (CRITICAL_EVENTS.includes(eventType)) {
      await sendSecurityAlert(eventType, metadata)
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Security logging error:', error)
  }
}

/**
 * Sanitize metadata to remove sensitive information
 */
function sanitizeMetadata(metadata: SecurityEventMetadata): Record<string, string | number | boolean | undefined> {
  const sanitized: Record<string, string | number | boolean | undefined> = { ...metadata }

  // Remove sensitive fields
  const sensitiveFields = ['password', 'otp', 'token', 'secret', 'card_number', 'cvv']
  sensitiveFields.forEach(field => {
     
    if (field in sanitized) {
      // eslint-disable-next-line security/detect-object-injection
      delete sanitized[field]
    }
  })

  // Truncate long values
  Object.keys(sanitized).forEach(key => {
    // eslint-disable-next-line security/detect-object-injection
    const value = sanitized[key]
    if (typeof value === 'string' && value.length > 1000) {
      // eslint-disable-next-line security/detect-object-injection
      sanitized[key] = value.substring(0, 1000) + '...[truncated]'
    }
  })

  return sanitized
}

/**
 * Send alert for critical security events
 * TODO: Implement email/Slack/PagerDuty notifications
 */
async function sendSecurityAlert(
  eventType: SecurityEventType,
  metadata: SecurityEventMetadata
): Promise<void> {
  // In production, send to:
  // - Email (security team)
  // - Slack channel (#security-alerts)
  // - PagerDuty (for critical incidents)

  console.warn('🚨 SECURITY ALERT:', {
    event: eventType,
    timestamp: new Date().toISOString(),
    ...sanitizeMetadata(metadata)
  })

  // TODO: Implement actual alerting
  // await sendEmail({
  //   to: process.env.SECURITY_EMAIL,
  //   subject: `Security Alert: ${eventType}`,
  //   body: JSON.stringify(metadata, null, 2)
  // })
}

/**
 * Log failed login attempt and check for brute force
 */
export async function logFailedLogin(
  identifier: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await logSecurityEvent('login_failed', {
    userId: identifier,
    ip,
    userAgent
  })

  // Check for brute force pattern
  const recentFailures = await getRecentFailedLogins(identifier, 15) // Last 15 minutes

  if (recentFailures >= 5) {
    await logSecurityEvent('login_locked', {
      userId: identifier,
      ip,
      userAgent,
      attempts: recentFailures
    })
  }
}

/**
 * Get count of recent failed login attempts
 */
async function getRecentFailedLogins(
  identifier: string,
  minutes: number
): Promise<number> {
  try {
    const supabase = await createClient()
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()

    const { count } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'login_failed')
      .eq('user_id', identifier)
      .gte('created_at', cutoff)

    return count || 0
  } catch (error) {
    console.error('Error checking failed logins:', error)
    return 0
  }
}

/**
 * Log successful authentication
 */
export async function logSuccessfulAuth(
  userId: string,
  method: 'email' | 'phone' | 'oauth',
  ip: string,
  userAgent: string
): Promise<void> {
  await logSecurityEvent('login_success', {
    userId,
    ip,
    userAgent,
    method
  })
}

/**
 * Log payment event
 */
export async function logPaymentEvent(
  userId: string,
  eventType: 'payment_initiated' | 'payment_success' | 'payment_failed',
  metadata: {
    amount: number
    currency: string
    orderId?: string
    paymentId?: string
    error?: string
  }
): Promise<void> {
  await logSecurityEvent(eventType, {
    userId,
    ...metadata
  })
}
