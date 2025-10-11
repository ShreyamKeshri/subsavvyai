# Supabase Email Templates Setup Guide

This guide walks you through setting up custom email templates in Supabase so you can test the complete email system.

## Overview

SubSavvyAI uses a **hybrid email approach**:
- **Supabase**: Verification and Password Reset emails (auth-related)
- **Resend**: Welcome, Reminder, and Monthly Summary emails (custom business logic)

## Prerequisites

1. Supabase project created and configured
2. RESEND_API_KEY set in `.env.local`
3. RESEND_FROM_EMAIL set in `.env.local` (or uses default)

---

## Step 1: Configure Supabase Email Templates

### 1.1 Access Email Templates

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication → Email Templates**
3. Or visit: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/templates`

### 1.2 Set Up Verification Email

1. Click on **"Confirm signup"** template
2. **Copy the entire contents** of `supabase/email-templates/verification-email.html`
3. **Paste** into the template editor, replacing all existing content
4. Click **"Save"**

**What this does:**
- Users will receive a branded SubSavvyAI verification email when they sign up
- The email includes a "Verify My Email" button with the verification link
- Fallback link provided if button doesn't work

### 1.3 Set Up Password Reset Email

1. Click on **"Reset password"** template
2. **Copy the entire contents** of `supabase/email-templates/reset-password-email.html`
3. **Paste** into the template editor, replacing all existing content
4. Click **"Save"**

**What this does:**
- Users will receive a branded SubSavvyAI email when they request password reset
- The email includes a "Reset Password" button with the reset link
- Includes password security tips and warning for non-requesters

---

## Step 2: Test Email Verification Flow

### 2.1 Test Signup with Email/Password

1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:3000/signup`
3. Sign up with a **new email address** (one you can access)
4. Check your inbox for **TWO emails**:
   - ✅ **Welcome Email** (from Resend) - "Welcome to SubSavvyAI — Let's get you saving smarter!"
   - ✅ **Verification Email** (from Supabase) - "Verify your email address"

### 2.2 Verify the Verification Email

1. Open the verification email
2. Check that:
   - SubSavvyAI logo is displayed
   - "Verify My Email" button is visible and styled correctly
   - Fallback link is present
   - Footer has correct branding and links
3. Click the **"Verify My Email"** button
4. You should be redirected to: `http://localhost:3000/callback`
5. Then redirected to: `http://localhost:3000/dashboard`

### 2.3 Verify the Welcome Email

1. Open the welcome email (should arrive around the same time)
2. Check that:
   - SubSavvyAI logo is displayed
   - Personalized greeting with your first name
   - "Get Started" button is visible
   - Benefits list is present
   - Footer has correct branding

---

## Step 3: Test Password Reset Flow

### 3.1 Request Password Reset

1. Go to: `http://localhost:3000/login`
2. Click **"Forgot password?"** (if link exists, or create the page if needed)
3. Or directly trigger password reset via code:
   ```typescript
   import { authWithEmail } from '@/lib/auth/auth-helpers'
   await authWithEmail.resetPassword('your-email@example.com')
   ```
4. Check your inbox for the password reset email

### 3.2 Verify the Reset Email

1. Open the password reset email
2. Check that:
   - SubSavvyAI logo is displayed
   - "Reset Password" button is visible
   - Password tips box is present
   - Warning box for non-requesters is visible
   - Fallback link is present
3. Click the **"Reset Password"** button
4. You should be redirected to: `http://localhost:3000/reset-password`
5. Enter a new password and submit
6. Verify you can log in with the new password

---

## Step 4: Test Google OAuth Flow

### 4.1 Sign Up with Google

1. Go to: `http://localhost:3000/signup`
2. Click **"Continue with Google"**
3. Complete Google OAuth flow
4. Check your inbox for **ONE email**:
   - ✅ **Welcome Email** (from Resend) - personalized with your Google name

**Note:** Google OAuth doesn't require email verification, so you won't receive a verification email.

---

## Step 5: Verify Email Delivery

### 5.1 Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Log in to your Resend account
3. Check the **"Emails"** tab
4. You should see:
   - Welcome emails sent to test users
   - Delivery status (Sent, Delivered, Opened, etc.)

### 5.2 Check Supabase Logs

1. Go to: **Authentication → Logs** in Supabase Dashboard
2. Filter by: **"Email sent"**
3. You should see:
   - Verification emails sent
   - Password reset emails sent
   - Timestamps and recipient addresses

---

## Step 6: Troubleshooting

### Welcome Email Not Received

**Check:**
- ✅ `RESEND_API_KEY` is set correctly in `.env.local`
- ✅ Resend API key is valid (check Resend dashboard)
- ✅ Email didn't go to spam folder
- ✅ Check browser console for errors during signup
- ✅ Check server logs: `console.error('Error sending welcome email:', error)`

**Fix:**
```bash
# Verify environment variable
echo $RESEND_API_KEY

# Restart dev server
npm run dev
```

### Verification Email Not Received

**Check:**
- ✅ Supabase email template is saved correctly
- ✅ Email confirmation is enabled: Authentication → Settings → Email Auth
- ✅ SMTP settings are correct (Supabase handles this by default)
- ✅ Email didn't go to spam folder

**Fix:**
1. Go to: Authentication → Email Templates
2. Click "Send test email" for verification template
3. Check if test email arrives
4. If not, check Supabase logs for errors

### Password Reset Email Not Received

**Check:**
- ✅ Email address exists in auth.users table
- ✅ Supabase reset password template is saved correctly
- ✅ `redirectTo` URL is correct: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`

**Fix:**
1. Verify redirect URL in `lib/auth/auth-helpers.ts:348`
2. Test with Supabase "Send test email" button
3. Check Supabase logs for errors

### Email Styling Issues

**Check:**
- ✅ Logo URL is correct: `https://subsavvyai.com/logo-full.png`
- ✅ All inline CSS is present (email clients strip `<style>` tags)
- ✅ No external CSS or JavaScript

**Fix:**
1. Re-copy the HTML template from `supabase/email-templates/`
2. Ensure all styles are inline: `style="..."`
3. Test in multiple email clients (Gmail, Outlook, Apple Mail)

### Emails Going to Spam

**Why:**
- Using default Supabase SMTP (shared IP)
- No SPF/DKIM records
- Using Resend in sandbox mode

**Fix (Production):**
1. **For Supabase emails:**
   - Set up custom SMTP in: Authentication → Settings → SMTP Settings
   - Use SendGrid, Mailgun, or AWS SES
   - Add SPF/DKIM records to your domain

2. **For Resend emails:**
   - Verify your domain in Resend dashboard
   - Add DNS records (SPF, DKIM, DMARC)
   - Use verified domain in `RESEND_FROM_EMAIL`

---

## Step 7: Production Checklist

Before deploying to production:

### Resend Configuration
- [ ] Verify domain in Resend dashboard
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Update `RESEND_FROM_EMAIL` to use verified domain
- [ ] Test email delivery to Gmail, Outlook, Yahoo
- [ ] Set up email analytics and tracking

### Supabase Configuration
- [ ] Customize email templates with production URLs
- [ ] Update logo URL to production domain
- [ ] Test all auth flows in production
- [ ] Set up custom SMTP (optional, for better deliverability)
- [ ] Enable email rate limiting to prevent abuse

### Environment Variables
- [ ] Set `RESEND_API_KEY` in production environment
- [ ] Set `RESEND_FROM_EMAIL` in production environment
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Verify all environment variables are loaded

### Testing
- [ ] Test signup → verification → dashboard flow
- [ ] Test password reset flow
- [ ] Test Google OAuth → welcome email
- [ ] Test email delivery across different email clients
- [ ] Test email links work correctly (no localhost URLs)

---

## Quick Reference

### Email Types

| Email Type | Service | Template Location | Trigger |
|------------|---------|-------------------|---------|
| Welcome | Resend | `emails/welcome-email.tsx` | After signup (email or Google OAuth) |
| Verification | Supabase | `supabase/email-templates/verification-email.html` | After email/password signup |
| Password Reset | Supabase | `supabase/email-templates/reset-password-email.html` | When user requests reset |
| Reminder | Resend | `emails/reminder-email.tsx` | Cron job (future) |
| Monthly Summary | Resend | N/A (inline HTML) | Cron job (future) |

### Important Files

- `lib/email/email-service.ts` - Core email service
- `lib/auth/auth-helpers.ts` - Auth integration (welcome email)
- `emails/` - React Email templates
- `supabase/email-templates/` - Supabase HTML templates
- `EMAIL_SETUP.md` - Development setup guide
- `SUPABASE_EMAIL_CONFIG.md` - Architecture and configuration

### Useful Commands

```bash
# Preview React Email templates locally
npm run email:dev

# Test welcome email (after signup)
# Just sign up with a new account

# Restart dev server (if env vars changed)
npm run dev
```

---

## Next Steps

After verifying all emails work correctly:

1. **Create forgot-password page** (if not exists)
   - Form to enter email
   - Call `authWithEmail.resetPassword(email)`
   - Show success message

2. **Create reset-password page** (if not exists)
   - Form to enter new password
   - Call `authWithEmail.updatePassword(newPassword)`
   - Redirect to login or dashboard

3. **Implement cron jobs** (future)
   - Subscription renewal reminders (7 days, 3 days, 1 day before)
   - Monthly summary emails (1st of each month)
   - Use Vercel Cron or similar

4. **Set up email analytics**
   - Track open rates in Resend dashboard
   - Monitor delivery rates
   - A/B test subject lines and content

---

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Review `EMAIL_SETUP.md` for development setup
3. Review `SUPABASE_EMAIL_CONFIG.md` for architecture
4. Check Supabase logs: Authentication → Logs
5. Check Resend dashboard: https://resend.com/emails

Happy testing! 🚀
