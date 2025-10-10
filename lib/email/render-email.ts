/**
 * Email Template Renderer
 * Renders React Email templates to HTML
 */

import { render } from '@react-email/components'
import WelcomeEmail from '@/emails/welcome-email'
import VerificationEmail from '@/emails/verification-email'
import ResetPasswordEmail from '@/emails/reset-password-email'
import ReminderEmail from '@/emails/reminder-email'

export interface WelcomeEmailData {
  firstName: string
}

export interface VerificationEmailData {
  verificationUrl: string
}

export interface ResetPasswordEmailData {
  resetUrl: string
}

export interface ReminderEmailData {
  firstName: string
  subscriptionName: string
  renewalDate: string
  cost: number
  currency?: string
}

/**
 * Render Welcome Email
 */
export async function renderWelcomeEmail(data: WelcomeEmailData): Promise<string> {
  return render(WelcomeEmail(data))
}

/**
 * Render Verification Email
 */
export async function renderVerificationEmail(data: VerificationEmailData): Promise<string> {
  return render(VerificationEmail(data))
}

/**
 * Render Reset Password Email
 */
export async function renderResetPasswordEmail(data: ResetPasswordEmailData): Promise<string> {
  return render(ResetPasswordEmail(data))
}

/**
 * Render Reminder Email
 */
export async function renderReminderEmail(data: ReminderEmailData): Promise<string> {
  return render(ReminderEmail(data))
}
