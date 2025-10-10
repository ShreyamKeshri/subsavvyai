# Supabase Email Configuration Guide

## Overview

Supabase sends emails for verification and password reset by default using their SMTP service. To use our custom branded email templates, we have two options:

1. **Option 1 (Recommended)**: Use Supabase's default emails for verification/reset, customize templates in Supabase dashboard
2. **Option 2 (Advanced)**: Use webhooks to trigger custom Resend emails

---

## Option 1: Customize Supabase Email Templates (Recommended)

### Pros:
- ✅ Simple setup
- ✅ Works immediately
- ✅ No additional code needed
- ✅ Built-in rate limiting and security

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: Authentication → Email Templates
   - URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/templates`

2. **Customize Templates**

#### **Confirm Signup Template**
```html
<h2>Confirm your signup</h2>
<p>Hi there,</p>
<p>Thanks for signing up for SubSavvyAI! Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Thanks,<br>
The SubSavvyAI Team</p>

<p style="color: #666; font-size: 12px;">
If you didn't sign up for SubSavvyAI, you can safely ignore this email.
</p>
```

#### **Reset Password Template**
```html
<h2>Reset your password</h2>
<p>Hi,</p>
<p>Follow this link to reset your password for SubSavvyAI:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link is valid for 30 minutes.</p>

<p>Best,<br>
The SubSavvyAI Team</p>

<p style="color: #666; font-size: 12px;">
If you didn't request a password reset, you can safely ignore this email.
</p>
```

3. **Add Branding**
   - Add SubSavvyAI logo: `https://subsavvyai.com/logo-full.png`
   - Use brand colors: Primary `#4f46e5` (Indigo)
   - Add footer with links to Help, Privacy, Terms

4. **Test Templates**
   - Use the "Send test email" button in Supabase dashboard
   - Check spam folder if not received
   - Verify links work correctly

---

## Option 2: Use Webhooks with Custom Resend Templates (Advanced)

### Pros:
- ✅ Full control over email design
- ✅ Use React Email templates
- ✅ Track email analytics with Resend
- ✅ Consistent branding across all emails

### Cons:
- ⚠️ More complex setup
- ⚠️ Need to handle rate limiting
- ⚠️ Need to manage email queue

### Steps:

#### 1. Set up Supabase Webhooks

**a) Create Edge Function for Webhooks:**

```bash
cd supabase/functions
mkdir email-webhook
touch email-webhook/index.ts
```

**b) Add Webhook Handler (`supabase/functions/email-webhook/index.ts`):**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { type, user, email_data } = await req.json()

    // Verify webhook signature (important for security)
    const signature = req.headers.get('x-signature')
    if (!verifySignature(signature)) {
      return new Response('Unauthorized', { status: 401 })
    }

    switch (type) {
      case 'user.created':
        // Send welcome email via Resend
        await sendWelcomeEmail(user.email, user.user_metadata.full_name)
        break

      case 'user.email_verification_requested':
        // Send custom verification email via Resend
        await sendVerificationEmail(user.email, email_data.confirmation_url)
        break

      case 'user.password_reset_requested':
        // Send custom password reset email via Resend
        await sendPasswordResetEmail(user.email, email_data.confirmation_url)
        break
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**c) Deploy Edge Function:**

```bash
supabase functions deploy email-webhook
```

#### 2. Configure Webhook in Supabase

1. Go to: Database → Webhooks
2. Create new webhook:
   - **Name**: Email Notifications
   - **Table**: `auth.users`
   - **Events**: INSERT, UPDATE
   - **Webhook URL**: Your Edge Function URL
   - **HTTP Headers**: Add `x-signature` with secret key

#### 3. Disable Supabase Default Emails

1. Go to: Authentication → Settings
2. Under "Email Auth":
   - Disable "Enable email confirmations"
   - Disable "Enable password recovery"

3. Handle these manually via webhooks

---

## Current Implementation (Hybrid Approach)

Our current setup uses a **hybrid approach**:

1. **Welcome Email**: Sent via Resend after signup (✅ Implemented)
   - Triggered in `lib/auth/auth-helpers.ts` after successful signup
   - Works for both email/password and Google OAuth signup

2. **Verification Email**: Uses Supabase default (⏳ To customize in dashboard)
   - Can be customized in Supabase dashboard
   - Or replace with Resend using webhooks

3. **Password Reset Email**: Uses Supabase default (⏳ To customize in dashboard)
   - Can be customized in Supabase dashboard
   - Or replace with Resend using webhooks

4. **Subscription Reminders**: Sent via Resend with cron (⏳ To implement)
   - Will use Vercel Cron Jobs or similar
   - Fully custom implementation

---

## Recommended Approach for MVP

### Phase 1 (Current - MVP Launch):
1. ✅ Use Resend for Welcome emails (already implemented)
2. ⚠️ Use Supabase default for Verification/Reset (customize templates in dashboard)
3. ⏳ Set up cron jobs for subscription reminders

### Phase 2 (Post-Launch):
1. Implement webhooks for full control
2. Migrate all emails to Resend
3. Add email analytics and tracking
4. A/B test email templates

---

## Configuration Checklist

### For MVP (Quick Setup):
- [ ] Customize Supabase verification email template
- [ ] Customize Supabase password reset email template
- [ ] Add SubSavvyAI logo to Supabase emails
- [ ] Test verification flow end-to-end
- [ ] Test password reset flow end-to-end
- [ ] Verify welcome emails are sent on signup

### For Production (Full Custom):
- [ ] Set up Supabase webhooks
- [ ] Create Edge Functions for email handling
- [ ] Implement email queue for reliability
- [ ] Add email delivery monitoring
- [ ] Set up email analytics dashboard
- [ ] Implement retry logic for failed emails

---

## Testing

### Test Welcome Email:
```bash
# Sign up with a new account
# Check inbox for welcome email
# Verify branding and links work
```

### Test Verification Email:
```bash
# Sign up with a new account
# Check inbox for verification email
# Click verification link
# Verify redirect to dashboard works
```

### Test Password Reset:
```bash
# Go to /forgot-password
# Enter email and submit
# Check inbox for reset email
# Click reset link
# Verify password reset form works
```

---

## Troubleshooting

### Welcome emails not sending?
- Check `RESEND_API_KEY` is set correctly
- Check logs for errors: `console.error` in auth-helpers.ts
- Verify Resend API key is valid

### Verification emails going to spam?
- Customize Supabase template with proper HTML
- Add SPF/DKIM records for your domain
- Use consistent "From" email address

### Emails not received at all?
- Check Supabase email logs: Auth → Logs
- Check Resend dashboard for delivery status
- Verify email addresses are valid
- Check spam/junk folders

---

## Resources

- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Resend Documentation](https://resend.com/docs)
- [Email Best Practices](https://resend.com/docs/best-practices)
