/**
 * Email Service using Resend
 * Handles all email sending functionality
 */

import { Resend } from 'resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SubSavvyAI <onboarding@subsavvyai.com>'

let resend: Resend | null = null

/**
 * Lazy initialize Resend client
 */
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is not set. Email sending is disabled.')
    return null
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }

  return resend
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const client = getResendClient()

    // If Resend is not configured, log and return gracefully
    if (!client) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('📧 Email would be sent (Resend not configured):', {
          to: options.to,
          subject: options.subject,
        })
      }
      return {
        success: false,
        error: 'Email service not configured',
      }
    }

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    // Log successful email send (only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Email sent successfully:', data?.id)
    }
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
  const { renderWelcomeEmail } = await import('./render-email')

  const subject = 'Welcome to SubSavvyAI — Let\'s get you saving smarter!'
  const html = await renderWelcomeEmail({ firstName })

  return sendEmail({ to, subject, html })
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const { renderVerificationEmail } = await import('./render-email')

  const subject = 'Verify your SubSavvyAI account — one quick step'
  const html = await renderVerificationEmail({ verificationUrl })

  return sendEmail({ to, subject, html })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { renderResetPasswordEmail } = await import('./render-email')

  const subject = 'Reset your SubSavvyAI password'
  const html = await renderResetPasswordEmail({ resetUrl })

  return sendEmail({ to, subject, html })
}

/**
 * Send subscription reminder email
 */
export async function sendReminderEmail(
  to: string,
  firstName: string,
  subscriptionName: string,
  renewalDate: string,
  cost: number
) {
  const { renderReminderEmail } = await import('./render-email')

  const subject = `Your subscription for ${subscriptionName} is renewing soon`
  const html = await renderReminderEmail({
    firstName,
    subscriptionName,
    renewalDate,
    cost,
    currency: '₹',
  })

  return sendEmail({ to, subject, html })
}

/**
 * Send monthly summary email
 */
export async function sendMonthlySummaryEmail(
  to: string,
  firstName: string,
  month: string,
  data: {
    totalTracked: number
    implementedCount: number
    monthlySavings: number
    upcomingCount: number
    topWins: Array<{ name: string; savings: number }>
  }
) {
  const subject = `Monthly summary: How much you saved this month with SubSavvyAI`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">Your Monthly Snapshot for ${month}</h1>
      <p>Hi ${firstName},</p>

      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <h2 style="margin-top: 0; color: #22c55e;">At a glance:</h2>
        <ul style="list-style: none; padding: 0;">
          <li>📊 Total subscriptions tracked: <strong>${data.totalTracked}</strong></li>
          <li>✅ Active saving suggestions implemented: <strong>${data.implementedCount}</strong></li>
          <li>💰 Estimated monthly savings: <strong>₹${data.monthlySavings}</strong></li>
          <li>📅 Upcoming renewals: <strong>${data.upcomingCount}</strong></li>
        </ul>
      </div>

      <h3>Top wins this month:</h3>
      <ol>
        ${data.topWins.map(win => `<li><strong>${win.name}</strong> — Saved ₹${win.savings}</li>`).join('')}
      </ol>

      <h3>Want to maximize savings next month?</h3>
      <p>I can:</p>
      <ul>
        <li>Re-check overlapping services and duplicate features</li>
        <li>Suggest lower-cost plans tailored to your usage</li>
        <li>Set smarter renewal reminders</li>
      </ul>

      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Report</a></p>

      <p>Thanks for trusting SubSavvyAI. Small changes add up — you're doing great.</p>

      <p>Cheers,<br>The SubSavvyAI Team</p>
    </div>
  `

  return sendEmail({ to, subject, html })
}
