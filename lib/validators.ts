/**
 * Input Validation Schemas
 * Validates and sanitizes user input to prevent injection attacks
 */

import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

/**
 * Sanitize HTML content - strip all tags
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize user input - escape special characters
 */
export function sanitizeInput(input: string): string {
  return validator.escape(input.trim())
}

/**
 * Phone number validation for Indian numbers
 */
export const phoneSchema = z.string().refine(
  (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    // Must be 10 digits starting with 6-9, or 12 digits with +91
    return (
      (cleaned.length === 10 && /^[6-9]/.test(cleaned)) ||
      (cleaned.length === 12 && /^91[6-9]/.test(cleaned))
    )
  },
  { message: 'Please enter a valid 10-digit Indian mobile number' }
)

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .transform((email) => email.toLowerCase().trim())

/**
 * Password validation - strong password requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid ID format')

/**
 * Subscription validation schema
 */
export const subscriptionSchema = z.object({
  service_id: uuidSchema.optional(),
  custom_service_name: z.string().min(1).max(100).optional()
    .transform((val) => val ? sanitizeHtml(val) : val),
  cost: z.number().positive('Cost must be positive').max(999999.99, 'Cost too large'),
  currency: z.enum(['INR', 'USD', 'EUR']),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  billing_date: z.coerce.date(),
  next_billing_date: z.coerce.date(),
  payment_method_id: uuidSchema.optional(),
  notes: z.string().max(500).optional()
    .transform((val) => val ? sanitizeHtml(val) : val)
}).refine(
  (data) => data.service_id || data.custom_service_name,
  { message: 'Either service_id or custom_service_name must be provided' }
)

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  phone_number: phoneSchema.optional(),
  avatar_url: z.string().url().optional(),
  timezone: z.string().optional(),
  currency_preference: z.enum(['INR', 'USD', 'EUR']).optional()
})

/**
 * Payment method validation schema (never store full card numbers!)
 */
export const paymentMethodSchema = z.object({
  provider: z.enum(['razorpay', 'stripe', 'upi', 'manual']),
  type: z.enum(['card', 'upi', 'netbanking', 'wallet', 'other']),
  last_four_digits: z.string().length(4, 'Must be exactly 4 digits').regex(/^\d{4}$/).optional(),
  card_brand: z.string().max(50).optional(),
  upi_id: z.string().email('Invalid UPI ID').optional(),
  provider_customer_id: z.string().max(255).optional(),
  provider_method_id: z.string().max(255).optional(),
  is_default: z.boolean().default(false)
})

/**
 * Sign up validation schema
 */
export const signUpSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  phone_number: phoneSchema.optional(),
  full_name: z.string().min(1).max(100).optional()
    .transform((val) => val ? sanitizeInput(val) : val)
}).refine(
  (data) => data.email || data.phone_number,
  { message: 'Either email or phone number must be provided' }
)

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: emailSchema.optional(),
  phone_number: phoneSchema.optional(),
  password: z.string().min(1, 'Password is required').optional(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/).optional()
}).refine(
  (data) => data.email || data.phone_number,
  { message: 'Either email or phone number must be provided' }
)

/**
 * OTP verification schema
 */
export const otpVerificationSchema = z.object({
  phone_number: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits')
})

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  email: emailSchema
})

/**
 * Safe parse helper with detailed error messages
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(input)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((err) => {
    const path = err.path.join('.')
    if (path) {
      // eslint-disable-next-line security/detect-object-injection
      errors[path] = err.message
    }
  })

  return { success: false, errors }
}
