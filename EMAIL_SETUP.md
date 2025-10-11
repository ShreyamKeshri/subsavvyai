# Email System Setup Guide

## Overview

SubSavvyAI uses **Resend** for email delivery and **React Email** for beautiful, responsive email templates.

---

## 🚀 Quick Setup

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Create a new API key
3. Add to `.env.local`:

```env
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=SubSavvyAI <onboarding@subsavvyai.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Verify Domain (Production Only)

For production emails to work properly:
1. Go to Resend dashboard → Domains
2. Add your domain (e.g., `subsavvyai.com`)
3. Add the DNS records they provide
4. Wait for verification (usually 24-48 hours)

For development, you can send to your own email without domain verification.

---

## 📧 Available Email Templates

### 1. Welcome Email
**Function:** `sendWelcomeEmail(to, firstName)`
**Trigger:** After successful signup
**Template:** `emails/welcome-email.tsx`

### 2. Verification Email
**Function:** `sendVerificationEmail(to, verificationUrl)`
**Trigger:** User signup (email verification flow)
**Template:** `emails/verification-email.tsx`

### 3. Password Reset Email
**Function:** `sendPasswordResetEmail(to, resetUrl)`
**Trigger:** User requests password reset
**Template:** `emails/reset-password-email.tsx`

### 4. Subscription Reminder Email
**Function:** `sendReminderEmail(to, firstName, subscriptionName, renewalDate, cost)`
**Trigger:** 3 days before subscription renewal
**Template:** `emails/reminder-email.tsx`

### 5. Monthly Summary Email
**Function:** `sendMonthlySummaryEmail(to, firstName, month, data)`
**Trigger:** Monthly cron job
**Template:** Coming soon

---

## 🛠️ Usage Example

```typescript
import { sendWelcomeEmail } from '@/lib/email/email-service'

// Send welcome email after user signs up
const result = await sendWelcomeEmail('user@example.com', 'John')

if (result.success) {
  console.log('Email sent!', result.messageId)
} else {
  console.error('Email failed:', result.error)
}
```

---

## 🎨 Customizing Email Templates

All email templates are in the `emails/` directory using React Email components.

To customize:
1. Edit the template in `emails/your-email.tsx`
2. Update styles (inline styles for email compatibility)
3. Test locally using React Email preview:

```bash
npm run email:dev
```

---

## 📊 Email Limits

### Resend Free Tier:
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ Perfect for MVP/testing

### Resend Paid Plans:
- $20/month: 50,000 emails
- $80/month: 250,000 emails
- Custom: 1M+ emails

---

## ✅ Testing Emails Locally

### Option 1: Send to Your Email
1. Use your own email address
2. Resend allows sending without domain verification in development

### Option 2: React Email Preview
```bash
npm run email:dev
```

Visit `http://localhost:3001` to preview all email templates.

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Contains API keys
2. **Use environment variables** - Always use `process.env.RESEND_API_KEY`
3. **Rate limiting** - Implement rate limits on email-sending endpoints
4. **Validate inputs** - Always sanitize user inputs before sending emails

---

## 📝 Integration Checklist

- [x] Install dependencies (`resend`, `react-email`, `@react-email/components`)
- [x] Create email service (`lib/email/email-service.ts`)
- [x] Design email templates (Welcome, Verification, Reset Password, Reminder)
- [x] Add environment variables (`.env.example`)
- [ ] Integrate with signup flow (send welcome + verification)
- [ ] Integrate with password reset flow
- [ ] Create cron job for subscription reminders
- [ ] Test email deliverability
- [ ] Set up domain verification (production)

---

## 🐛 Troubleshooting

### Emails not sending?
- Check `RESEND_API_KEY` is set correctly
- Verify API key is valid in Resend dashboard
- Check console for error messages
- Ensure `RESEND_FROM_EMAIL` matches your verified domain (production)

### Emails going to spam?
- Verify domain with SPF, DKIM records
- Avoid spammy keywords in subject/body
- Use a consistent "from" email address
- Implement proper unsubscribe links (future)

### Template not rendering?
- Check for TypeScript errors in template files
- Verify all imports are correct
- Test with React Email preview: `npm run email:dev`

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Email Best Practices](https://resend.com/docs/best-practices)

---

**Need help?** Check the Resend dashboard logs or contact support at support@resend.com
