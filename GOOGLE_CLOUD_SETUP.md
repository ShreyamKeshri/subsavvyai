# Google Cloud Console Setup Guide

## Gmail API OAuth Configuration for SubSavvyAI

**Date:** October 24, 2025
**Purpose:** Enable Gmail auto-detection of subscription receipts

---

## Prerequisites

- Google Account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- SubSavvyAI project cloned and running locally

---

## Step 1: Create New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click project dropdown (top navbar)
3. Click "**NEW PROJECT**"
4. Enter project details:
   - **Project name:** `SubSavvyAI Gmail Integration`
   - **Organization:** (Leave as-is or select your org)
5. Click "**CREATE**"
6. Wait for project to be created (~30 seconds)
7. Select the new project from dropdown

---

## Step 2: Enable Gmail API

1. In project dashboard, go to "**APIs & Services**" → "**Library**"
2. Search for "**Gmail API**"
3. Click on "Gmail API" card
4. Click "**ENABLE**" button
5. Wait for API to be enabled

---

## Step 3: Configure OAuth Consent Screen

1. Go to "**APIs & Services**" → "**OAuth consent screen**"
2. Select user type:
   - **External** (for public app)
   - Click "**CREATE**"

3. **App information:**
   - App name: `SubSavvyAI`
   - User support email: Your email
   - App logo: (Optional) Upload logo
   - Application home page: `http://localhost:3000` (dev) or `https://subsavvyai.com` (prod)
   - Application privacy policy: `http://localhost:3000/privacy` (create this page)
   - Application terms of service: `http://localhost:3000/terms` (create this page)

4. **Developer contact information:**
   - Email: Your email

5. Click "**SAVE AND CONTINUE**"

6. **Scopes:**
   - Click "**ADD OR REMOVE SCOPES**"
   - Search for: `Gmail API`
   - Select: `https://www.googleapis.com/auth/gmail.readonly`
   - Description: "Read-only access to Gmail for detecting subscription receipts"
   - Click "**UPDATE**"
   - Click "**SAVE AND CONTINUE**"

7. **Test users** (for development):
   - Click "**ADD USERS**"
   - Add your Gmail addresses (you + test accounts)
   - Click "**ADD**"
   - Click "**SAVE AND CONTINUE**"

8. **Summary:**
   - Review all settings
   - Click "**BACK TO DASHBOARD**"

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to "**APIs & Services**" → "**Credentials**"
2. Click "**+ CREATE CREDENTIALS**"
3. Select "**OAuth client ID**"

4. **Application type:**
   - Select: `Web application`

5. **Name:**
   - Enter: `SubSavvyAI Web Client`

6. **Authorized JavaScript origins:**
   - Click "**+ ADD URI**"
   - Add: `http://localhost:3000`
   - Click "**+ ADD URI**"
   - Add: `http://127.0.0.1:3000`
   - (For production, add: `https://subsavvyai.com`)

7. **Authorized redirect URIs:**
   - Click "**+ ADD URI**"
   - Add: `http://localhost:3000/api/gmail/callback`
   - Click "**+ ADD URI**"
   - Add: `http://127.0.0.1:3000/api/gmail/callback`
   - (For production, add: `https://subsavvyai.com/api/gmail/callback`)

8. Click "**CREATE**"

9. **Copy credentials:**
   - You'll see a popup with:
     - **Client ID:** `xxxxx.apps.googleusercontent.com`
     - **Client Secret:** `xxxxx`
   - Copy both values
   - Click "**OK**"

---

## Step 5: Add Credentials to .env.local

1. Open `/Users/shreyamkeshri/Documents/Personal Project/unsubscribr/.env.local`
2. Add the following lines (replace with your actual credentials):

```bash
# Gmail OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/callback
```

3. Save the file
4. Restart your development server

---

## Step 6: Test OAuth Flow

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/api/gmail/connect`

3. You should be redirected to Google's consent screen

4. Click "**Continue**" or select your test account

5. Review permissions:
   - "Read, compose, send, and permanently delete all your email from Gmail"
   - (This is the standard Gmail readonly scope description)

6. Click "**Allow**"

7. You should be redirected back to: `http://localhost:3000/dashboard/scan?gmail_connected=true`

8. Check Supabase:
   - Open Supabase dashboard
   - Go to Table Editor → `gmail_tokens`
   - You should see a new row with encrypted tokens

---

## Verification Checklist

After setup, verify:

- [ ] Project created: "SubSavvyAI Gmail Integration"
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured (External)
- [ ] Scope added: `gmail.readonly`
- [ ] Test users added (your email)
- [ ] OAuth client created (Web application)
- [ ] Authorized redirect URIs added (localhost + 127.0.0.1)
- [ ] Client ID and Secret added to `.env.local`
- [ ] OAuth flow tested successfully
- [ ] Tokens stored in `gmail_tokens` table (encrypted)

---

## Important Notes

### Testing Mode

- **In "Testing" mode:**
  - Only test users can authorize the app
  - Tokens expire every 7 days
  - Limited to 100 test users

- **To add more test users:**
  1. Go to OAuth consent screen
  2. Scroll to "Test users"
  3. Click "ADD USERS"
  4. Add Gmail addresses

### Publishing the App (For Production)

To move beyond testing:

1. Go to OAuth consent screen
2. Click "**PUBLISH APP**"
3. Submit for Google verification (required for sensitive scopes)
4. Verification process:
   - Fill out questionnaire
   - Explain use case
   - Provide app homepage, privacy policy, terms
   - May take 1-2 weeks

**Note:** For MVP launch, you can stay in Testing mode and manually add users.

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause:** Redirect URI not in authorized list
- **Fix:**
  1. Go to Credentials
  2. Edit OAuth client
  3. Add exact redirect URI used in app
  4. Try again

### Error: "invalid_grant"
- **Cause:** Token expired or revoked
- **Fix:**
  1. Delete row from `gmail_tokens` table
  2. Reconnect Gmail
  3. Should get fresh tokens

### Error: "access_denied"
- **Cause:** User declined consent
- **Fix:** User needs to authorize the app

### Error: "Email not in test users"
- **Cause:** App in Testing mode, user not added
- **Fix:**
  1. Go to OAuth consent screen
  2. Add user to "Test users" list
  3. Try again

### Tokens Not Storing
- **Check:**
  - Migration 009 applied in Supabase
  - RLS policies allow user to insert
  - `ENCRYPTION_KEY` set in `.env.local`
  - Server restarted after adding env vars

---

## Security Best Practices

1. **Never commit credentials:**
   - `.env.local` is in `.gitignore`
   - Always use environment variables

2. **Rotate secrets regularly:**
   - Regenerate Client Secret every 6-12 months
   - Update in `.env.local` immediately

3. **Monitor OAuth usage:**
   - Check Google Cloud Console → APIs & Services → Dashboard
   - Watch for unusual activity

4. **Limit scope:**
   - Only request `gmail.readonly` (read-only)
   - Never request write/delete permissions

5. **Token security:**
   - Tokens encrypted at rest (AES-256-GCM)
   - Stored in secure database with RLS
   - Auto-refresh before expiry

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update redirect URIs to production domain
- [ ] Update OAuth consent screen URLs (homepage, privacy, terms)
- [ ] Submit app for Google verification
- [ ] Wait for approval (1-2 weeks)
- [ ] Update `.env` on production server
- [ ] Test OAuth flow on production
- [ ] Monitor error logs for OAuth issues

---

**Last Updated:** October 24, 2025
**Next Steps:** Complete Days 2-3 (email scanning and UI)
