import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/email-layout'

interface WelcomeEmailProps {
  firstName: string
}

export function WelcomeEmail({ firstName = 'there' }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subsavvyai.com'

  return (
    <EmailLayout preview="Welcome to SubSavvyAI — Let's get you saving smarter!">
      <Heading style={h1}>Welcome to SubSavvyAI!</Heading>

      <Text style={text}>Hi {firstName},</Text>

      <Text style={text}>
        Welcome to SubSavvyAI — I&apos;m glad you&apos;re here. SubSavvyAI helps you take control of your
        recurring costs by finding savings, spotting overlaps, and reminding you before renewals—all
        tailored for users in India.
      </Text>

      <Section style={benefitsBox}>
        <Heading style={h2}>What you&apos;ll get:</Heading>
        <ul style={list}>
          <li style={listItem}>
            📊 Personalized subscription insights based on your linked accounts
          </li>
          <li style={listItem}>
            💡 Smart recommendations to trim costs and pause unused services
          </li>
          <li style={listItem}>⏰ Timely renewal reminders and easy action links</li>
          <li style={listItem}>
            🇮🇳 Local offers and currency-aware suggestions for India
          </li>
        </ul>
      </Section>

      <Text style={text}>Ready to see your subscriptions in one place?</Text>

      <Button style={button} href={`${appUrl}/dashboard`}>
        Get Started
      </Button>

      <Hr style={hr} />

      <Text style={helpText}>
        If you need help, reply to this email or visit our{' '}
        <a href={`${appUrl}/help`} style={link}>
          Help Center
        </a>
        . I&apos;m here to make sure you save more and stress less.
      </Text>

      <Text style={signature}>
        Warmly,
        <br />
        The SubSavvyAI Team
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail

// Styles
const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 20px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 12px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
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

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
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
