import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/email-layout'

interface ResetPasswordEmailProps {
  resetUrl: string
}

export function ResetPasswordEmail({
  resetUrl = 'https://subsavvyai.com/reset-password?token=EXAMPLE',
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your SubSavvyAI password">
      <Heading style={h1}>Reset your password</Heading>

      <Text style={text}>Hi,</Text>

      <Text style={text}>
        No worries — we can help you get back in. Click the link below to reset your SubSavvyAI
        password. The link is valid for 30 minutes.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Section style={linkBox}>
        <Text style={linkText}>
          If the button doesn&apos;t work, copy and paste this link into your browser:
        </Text>
        <Text style={linkUrl}>{resetUrl}</Text>
      </Section>

      <Section style={tipsBox}>
        <Heading style={h3}>Tips for a strong password:</Heading>
        <ul style={list}>
          <li style={listItem}>Use at least 12 characters</li>
          <li style={listItem}>Mix letters, numbers, and symbols</li>
          <li style={listItem}>Avoid common phrases or reused passwords</li>
        </ul>
      </Section>

      <Hr style={hr} />

      <Section style={warningBox}>
        <Heading style={h3}>Didn&apos;t request a reset?</Heading>
        <Text style={warningText}>
          If you didn&apos;t ask to reset your password, you can safely ignore this email. Your account
          remains secure.
        </Text>
        <Text style={warningText}>
          If you&apos;re concerned, contact support at{' '}
          <a href={process.env.NEXT_PUBLIC_APP_URL + '/help'} style={link}>
            our Help Center
          </a>
          .
        </Text>
      </Section>

      <Text style={signature}>
        Best,
        <br />
        The SubSavvyAI Team
      </Text>
    </EmailLayout>
  )
}

export default ResetPasswordEmail

// Styles
const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 20px',
}

const h3 = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const linkBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const linkText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const linkUrl = {
  color: '#4f46e5',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
  wordBreak: 'break-all' as const,
}

const tipsBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const list = {
  margin: '0',
  padding: '0 0 0 20px',
}

const listItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const warningBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const warningText = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const link = {
  color: '#4f46e5',
  textDecoration: 'underline',
}

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0 0',
}
