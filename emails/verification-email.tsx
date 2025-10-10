import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/email-layout'

interface VerificationEmailProps {
  verificationUrl: string
}

export function VerificationEmail({
  verificationUrl = 'https://subsavvyai.com/verify?token=EXAMPLE',
}: VerificationEmailProps) {
  return (
    <EmailLayout preview="Verify your SubSavvyAI account — one quick step">
      <Heading style={h1}>Verify your email address</Heading>

      <Text style={text}>Hi there,</Text>

      <Text style={text}>
        Thanks for signing up for SubSavvyAI — welcome! Before we get you started, please verify
        your email so we can secure your account and tailor your subscription insights.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Verify My Email
        </Button>
      </Section>

      <Section style={linkBox}>
        <Text style={linkText}>
          If the button above doesn&apos;t work, copy and paste this link into your browser:
        </Text>
        <Text style={linkUrl}>{verificationUrl}</Text>
      </Section>

      <Section style={infoBox}>
        <Heading style={h3}>What happens after verification:</Heading>
        <ul style={list}>
          <li style={listItem}>We&apos;ll finish setting up your account</li>
          <li style={listItem}>
            You&apos;ll get personalized subscription summaries and cost-saving tips for Indian services
          </li>
          <li style={listItem}>
            You&apos;ll be ready to connect bank or wallet details securely when you choose
          </li>
        </ul>
      </Section>

      <Hr style={hr} />

      <Text style={helpText}>
        Need help? Reply to this email or visit our{' '}
        <a href={process.env.NEXT_PUBLIC_APP_URL + '/help'} style={link}>
          Help Center
        </a>
        .
      </Text>

      <Text style={signature}>
        Thanks for joining SubSavvyAI — excited to help you manage subscriptions smarter!
        <br />
        <br />
        Warmly,
        <br />
        The SubSavvyAI Team
      </Text>
    </EmailLayout>
  )
}

export default VerificationEmail

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

const infoBox = {
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

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
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
