import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/email-layout'

interface ReminderEmailProps {
  firstName: string
  subscriptionName: string
  renewalDate: string
  cost: number
  currency?: string
}

export function ReminderEmail({
  firstName = 'there',
  subscriptionName = 'Netflix',
  renewalDate = 'October 15, 2025',
  cost = 199,
  currency = '₹',
}: ReminderEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subsavvyai.com'

  return (
    <EmailLayout preview={`Your ${subscriptionName} subscription is renewing soon`}>
      <Heading style={h1}>Subscription Renewal Reminder</Heading>

      <Text style={text}>Hi {firstName},</Text>

      <Text style={text}>
        Just a heads up—your <strong>{subscriptionName}</strong> is up for renewal on{' '}
        <strong>{renewalDate}</strong>.
      </Text>

      <Section style={detailsBox}>
        <Heading style={h3}>Renewal Details</Heading>
        <table style={table}>
          <tbody>
            <tr>
              <td style={tableLabel}>Service:</td>
              <td style={tableValue}>{subscriptionName}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Amount:</td>
              <td style={tableValue}>
                {currency}
                {cost}
              </td>
            </tr>
            <tr>
              <td style={tableLabel}>Renewal Date:</td>
              <td style={tableValue}>{renewalDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Heading style={h2}>What you can do now:</Heading>
      <ul style={actionList}>
        <li style={actionItem}>
          <strong>Keep it:</strong> No action needed if you&apos;re happy with the service.
        </li>
        <li style={actionItem}>
          <strong>Pause or cancel:</strong> Save money if you no longer need it.
        </li>
        <li style={actionItem}>
          <strong>Compare:</strong> See cheaper plans or bundle options we found for you.
        </li>
      </ul>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/dashboard`}>
          Manage {subscriptionName}
        </Button>
      </Section>

      <Section style={tipBox}>
        <Text style={tipText}>
          💡 <strong>Tip:</strong> If you want, I can suggest alternatives and show potential
          savings in rupees before you decide.
        </Text>
      </Section>

      <Hr style={hr} />

      <Text style={helpText}>
        Need help? Reply or visit our{' '}
        <a href={`${appUrl}/help`} style={link}>
          Help Center
        </a>
        .
      </Text>

      <Text style={signature}>
        Best,
        <br />
        The SubSavvyAI Team
      </Text>
    </EmailLayout>
  )
}

export default ReminderEmail

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
  margin: '24px 0 12px',
}

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tableLabel = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '8px 0',
  width: '40%',
}

const tableValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '8px 0',
}

const actionList = {
  margin: '0 0 24px',
  padding: '0 0 0 20px',
}

const actionItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
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

const tipBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde047',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const tipText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
