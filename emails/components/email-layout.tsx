import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subsavvyai.com'

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${appUrl}/logo-full.png`}
              width="150"
              height="40"
              alt="SubSavvyAI"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} SubSavvyAI. All rights reserved.
            </Text>
            <Text style={footerText}>
              Made with ❤️ in India
            </Text>
            <Text style={footerLinks}>
              <Link href={`${appUrl}/help`} style={link}>
                Help Center
              </Link>
              {' • '}
              <Link href={`${appUrl}/privacy`} style={link}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href={`${appUrl}/terms`} style={link}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 40px',
  borderBottom: '1px solid #e5e7eb',
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '40px',
}

const footer = {
  padding: '20px 40px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
}

const link = {
  color: '#4f46e5',
  textDecoration: 'none',
}
