# Phase 3: Authentication Setup Guide

## Overview

This document guides you through setting up multi-method authentication for Unsubscribr with:
- **Phone OTP** (Primary - SMS via Twilio/MSG91)
- **Google OAuth** (Secondary - One-click sign-in)
- **Email/Password** (Tertiary - Privacy option)

---

## Supabase Dashboard Configuration

### Step 1: Enable Authentication Providers

Go to your Supabase Dashboard → Authentication → Providers

#### 1.1 Phone Authentication (Primary)

**Provider:** Phone
**Status:** Enable

**Twilio Configuration:**
1. Sign up at [Twilio](https://www.twilio.com/try-twilio) or [MSG91](https://msg91.com/)
2. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number (for Twilio)
   - Auth Key (for MSG91)

**Supabase Settings:**
```
Provider: Phone
Enable phone signup: ✓
SMS Provider: Twilio (or custom for MSG91)
Twilio Account SID: [Your Account SID]
Twilio Auth Token: [Your Auth Token]
Twilio Messaging Service SID: [Your Messaging Service SID]
```

**For MSG91 (Recommended for India):**
- Use Supabase's custom SMS hook
- Configure webhook to call MSG91 API
- Cheaper rates for Indian numbers (₹0.10/SMS vs Twilio ₹0.50/SMS)

**Environment Variables to Add:**
```env
# Phone Auth (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# OR Phone Auth (MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=your_sender_id
MSG91_ROUTE=4
```

---

#### 1.2 Google OAuth (Secondary)

**Provider:** Google
**Status:** Enable

**Google Cloud Console Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Unsubscribr"
3. Enable "Google+ API" and "OAuth 2.0"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://unsubscribr.com
   https://unsubscribr.vercel.app
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://unsubscribr.com/auth/callback
   https://unsubscribr.vercel.app/auth/callback
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```

**Get Credentials:**
- Client ID: `123456789-abcdefg.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxxxxxxxxxx`

**Supabase Settings:**
```
Provider: Google
Enable Google provider: ✓
Client ID: [Your Google Client ID]
Client Secret: [Your Google Client Secret]
```

**Environment Variables to Add:**
```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

#### 1.3 Email/Password (Tertiary)

**Provider:** Email
**Status:** Enable (already enabled by default)

**Supabase Settings:**
```
Provider: Email
Enable email signup: ✓
Confirm email: ✓ (require email verification)
Secure email change: ✓
Double confirm email changes: ✓
```

**Email Templates:**
Customize these in Supabase → Authentication → Email Templates

**Confirmation Email:**
```html
<h2>Welcome to Unsubscribr!</h2>
<p>Confirm your email to start tracking your subscriptions:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

**Magic Link Email:**
```html
<h2>Sign in to Unsubscribr</h2>
<p>Click the link below to sign in:</p>
<a href="{{ .ConfirmationURL }}">Sign In</a>
```

**Reset Password Email:**
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

---

### Step 2: Configure Auth Settings

Go to Supabase → Authentication → Settings

**Site URL:**
```
http://localhost:3000 (development)
https://unsubscribr.com (production)
```

**Redirect URLs (whitelist):**
```
http://localhost:3000/**
https://unsubscribr.com/**
https://unsubscribr.vercel.app/**
```

**JWT Settings:**
```
JWT expiry: 3600 (1 hour)
JWT secret: [Auto-generated, don't change]
```

**Security:**
```
Enable email confirmations: ✓
Enable phone confirmations: ✓
Minimum password length: 8
Password requirements:
  ✓ Lowercase letters
  ✓ Uppercase letters
  ✓ Numbers
  ✓ Special characters
```

**Rate Limiting:**
```
Enable rate limiting: ✓
Rate limit: 30 requests per hour
```

**Session Settings:**
```
Session timeout: 604800 seconds (7 days)
Inactivity timeout: 86400 seconds (24 hours)
```

---

## Environment Variables Summary

Add these to your `.env.local`:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://djeogbaiscksgffazslz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Phone Auth - Option 1: Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Phone Auth - Option 2: MSG91 (Recommended)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=UNSBCR
MSG91_ROUTE=4
MSG91_DLT_TEMPLATE_ID=your_template_id

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Database Setup

The database schema is already ready (Phase 2), but verify:

### Profiles Table
```sql
-- Already created in Phase 2
SELECT * FROM profiles LIMIT 1;
```

Columns needed:
- `id` (UUID, FK to auth.users)
- `phone_number` (TEXT) - for phone OTP users
- `full_name` (TEXT) - from OAuth or manual
- `avatar_url` (TEXT) - from Google OAuth
- `email` (TEXT) - for recovery/receipts
- `created_at`, `updated_at`

### Auth Users Table
Managed by Supabase Auth automatically:
- `auth.users.id` (UUID)
- `auth.users.email` (TEXT)
- `auth.users.phone` (TEXT)
- `auth.users.raw_user_meta_data` (JSONB) - from OAuth

---

## Implementation Checklist

### Supabase Dashboard (Manual Steps)

- [ ] Enable Phone provider in Supabase Auth
- [ ] Configure Twilio/MSG91 credentials
- [ ] Test phone OTP (send test SMS)
- [ ] Enable Google OAuth provider
- [ ] Add Google Client ID and Secret
- [ ] Configure redirect URLs
- [ ] Test Google OAuth flow
- [ ] Verify Email provider settings
- [ ] Customize email templates
- [ ] Set site URL and redirect URLs
- [ ] Configure security settings (rate limiting, password requirements)
- [ ] Test email/password signup

### Code Implementation (Automated)

- [ ] Create auth helper functions (`lib/auth/`)
- [ ] Build sign-up page UI
- [ ] Build login page UI
- [ ] Implement phone OTP flow
- [ ] Implement Google OAuth flow
- [ ] Implement email/password flow
- [ ] Add protected route middleware
- [ ] Create session management hooks
- [ ] Build onboarding flow
- [ ] Add profile completion prompts
- [ ] Implement logout functionality
- [ ] Add error handling and validation

---

## Testing Checklist

### Phone OTP
- [ ] Can send OTP to Indian number (+91)
- [ ] OTP received within 30 seconds
- [ ] Can verify OTP successfully
- [ ] Invalid OTP shows error
- [ ] Rate limiting works (max 3 attempts)
- [ ] Phone number stored in `profiles.phone_number`
- [ ] User can receive SMS notifications

### Google OAuth
- [ ] "Continue with Google" button works
- [ ] Google popup appears
- [ ] Can select Google account
- [ ] Redirects back to app successfully
- [ ] User profile created with Google data
- [ ] Email stored in `auth.users.email`
- [ ] Avatar URL stored if available
- [ ] Can prompt for phone number addition

### Email/Password
- [ ] Can sign up with email and password
- [ ] Password validation works (8+ chars, etc.)
- [ ] Verification email sent
- [ ] Can verify email via link
- [ ] Can log in after verification
- [ ] "Forgot password" sends magic link
- [ ] Can reset password successfully
- [ ] Email stored in `auth.users.email`

### Session Management
- [ ] Session persists after browser refresh
- [ ] Session expires after 7 days
- [ ] Can log out successfully
- [ ] Protected routes redirect to login
- [ ] Public routes accessible without auth

---

## Security Considerations

### Phone OTP Security
- Rate limit OTP requests (3 per phone per hour)
- Expire OTPs after 10 minutes
- Lock account after 5 failed attempts
- Use HTTPS for all OTP transmission
- Don't expose OTP in URLs or logs

### Google OAuth Security
- Verify email from Google is confirmed
- Check for profile changes on each login
- Store OAuth provider ID for reference
- Revoke tokens on logout
- Validate redirect URLs strictly

### Email/Password Security
- Enforce strong password requirements
- Hash passwords with bcrypt (Supabase default)
- Use magic links for password reset (no security questions)
- Rate limit login attempts
- Implement CAPTCHA for suspicious activity

### General Security
- All auth endpoints use HTTPS
- CSRF protection enabled
- Session tokens in httpOnly cookies
- No sensitive data in localStorage
- Audit logs for auth events

---

## Cost Estimates

### Phone OTP (MSG91)
```
Cost per SMS: ₹0.10
Average user: 2 OTPs/month (login + occasional re-auth)

1,000 users: ₹200/month
10,000 users: ₹2,000/month
100,000 users: ₹16,000/month (with bulk discount)
```

### Google OAuth
```
Cost: FREE (Google handles everything)
```

### Email/Password
```
Cost: FREE (Supabase handles email sending)
Note: Custom SMTP server can be configured if needed
```

### Total Auth Costs (10,000 users)
```
Phone OTP: ₹2,000/month
Google OAuth: ₹0
Email: ₹0
Total: ₹2,000/month (~$25/month)
```

**Extremely affordable** compared to potential revenue.

---

## Troubleshooting

### Phone OTP Not Received
1. Check Twilio/MSG91 dashboard for delivery status
2. Verify phone number format (+91XXXXXXXXXX)
3. Check SMS provider balance
4. Verify DND (Do Not Disturb) status
5. Try different SMS provider

### Google OAuth Failed
1. Check Client ID and Secret are correct
2. Verify redirect URLs are whitelisted
3. Check Google Cloud Console for errors
4. Ensure Google+ API is enabled
5. Try incognito mode (clear cookies)

### Email Verification Not Sent
1. Check Supabase email logs
2. Verify SMTP settings (if custom)
3. Check spam folder
4. Verify email address is valid
5. Check Supabase email quota

### Session Issues
1. Clear browser cookies
2. Check if session expired (7 days)
3. Verify JWT secret hasn't changed
4. Check Supabase Auth logs
5. Try logging out and back in

---

## Next Steps After Setup

Once all providers are configured:

1. **Test Each Flow** - Phone OTP, Google OAuth, Email/Password
2. **Implement UI** - Sign-up page, Login page, Onboarding
3. **Add Middleware** - Protected routes, session management
4. **Build Onboarding** - Progressive data collection
5. **Add Analytics** - Track sign-up method distribution
6. **Monitor Costs** - Track SMS usage, optimize if needed

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Twilio Setup Guide](https://www.twilio.com/docs/sms/quickstart)
- [MSG91 Setup Guide](https://docs.msg91.com/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Phone Auth Guide](https://supabase.com/docs/guides/auth/phone-login)

---

**Ready to implement Phase 3!** 🚀
