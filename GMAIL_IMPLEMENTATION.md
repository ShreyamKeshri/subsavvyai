# Gmail Auto-Detection Implementation Plan

**Created:** October 24, 2025
**Status:** Day 1 - In Progress
**Target Completion:** October 31, 2025

---

## Overview

Adding Gmail OAuth integration to auto-detect subscriptions from email receipts. This leverages existing patterns from Spotify OAuth and encryption utilities.

---

## What Already Exists (Reusing)

### ✅ Infrastructure
- **Authentication:** Supabase auth with multi-method (Email/Google/Phone)
- **Database:** PostgreSQL with RLS policies
- **Encryption:** AES-256-GCM encryption (`lib/crypto/encryption.ts`)
- **Rate Limiting:** IP-based rate limiting (`lib/rate-limit.ts`)
- **Analytics:** PostHog + Sentry tracking
- **OAuth Pattern:** Spotify OAuth with CSRF protection

### ✅ Existing Files to Reference
- `app/api/oauth/spotify/connect/route.ts` - OAuth initiation pattern
- `app/api/oauth/spotify/callback/route.ts` - OAuth callback with CSRF
- `lib/oauth/spotify.ts` - Token exchange and storage pattern
- `lib/crypto/encryption.ts` - Encrypt/decrypt functions
- `lib/rate-limit.ts` - Rate limiting utilities

### ✅ Environment Variables Set
- `ENCRYPTION_KEY` - For token encryption
- `NEXT_PUBLIC_APP_URL` - App URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project
- Analytics keys (PostHog, Sentry)

---

## What We're Building (New)

### Day 1: Gmail OAuth Setup ✅ IN PROGRESS

#### Files Created:
1. ✅ `supabase/migrations/009_gmail_tokens.sql` - Token storage table with RLS
2. ⏳ `lib/gmail/oauth.ts` - Gmail OAuth helpers
3. ⏳ `app/api/gmail/connect/route.ts` - Initiate OAuth flow
4. ⏳ `app/api/gmail/callback/route.ts` - Handle OAuth callback

#### Database Schema:
```sql
gmail_tokens:
- id (UUID)
- user_id (UUID, unique) - One Gmail connection per user
- access_token (TEXT, encrypted)
- refresh_token (TEXT, encrypted)
- expires_at (TIMESTAMPTZ)
- created_at, updated_at
```

#### OAuth Flow:
1. User clicks "Connect Gmail" button
2. App generates CSRF state token
3. Redirects to Google OAuth consent screen
4. User authorizes Gmail read-only access
5. Google redirects to `/api/gmail/callback`
6. App verifies state, exchanges code for tokens
7. Tokens encrypted and stored in database
8. Redirects to `/dashboard/scan?gmail_connected=true`

---

### Day 2: Email Scanning Engine ⏳ PENDING

#### Files to Create:
1. `lib/gmail/patterns.ts` - Merchant regex patterns (20+ services)
2. `lib/gmail/scanner.ts` - Gmail API email fetching
3. `lib/gmail/parser.ts` - Extract merchant/amount from emails
4. `app/api/gmail/scan/route.ts` - Scan endpoint

#### Functionality:
- Search Gmail for subscription receipts (last 6 months)
- Pattern match for Indian merchants (Netflix, Prime, Spotify, etc.)
- Extract amounts in ₹ and $ (convert to INR)
- Fuzzy match to services database
- Assign confidence scores (High/Medium/Low)
- Return detected subscriptions for confirmation

---

### Day 3: Scan Results UI ⏳ PENDING

#### Files to Create:
1. `app/dashboard/scan/page.tsx` - Scan results page
2. `components/gmail/connect-button.tsx` - Gmail connect CTA
3. `components/gmail/scan-progress.tsx` - Scanning animation
4. `components/gmail/results-table.tsx` - Detected subs table

#### UI Flow:
1. Show scanning progress (estimated time)
2. Display detected subscriptions with confidence badges
3. Allow edit/remove before confirming
4. "Confirm All" button saves to database
5. Redirect to dashboard with new subscriptions

---

## Environment Variables Needed

Add to `.env.local`:

```bash
# Gmail OAuth (to be added after Google Cloud Console setup)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/callback
```

**Note:** Production will use different redirect URI

---

## Google Cloud Console Setup Checklist

- [ ] Create new project: "SubSavvyAI Gmail Integration"
- [ ] Enable Gmail API
- [ ] Configure OAuth consent screen:
  - [ ] User type: External
  - [ ] App name: SubSavvyAI
  - [ ] Support email
  - [ ] Scopes: `gmail.readonly`
- [ ] Create OAuth 2.0 credentials:
  - [ ] Application type: Web application
  - [ ] Authorized redirect URIs:
    - `http://localhost:3000/api/gmail/callback`
    - `http://127.0.0.1:3000/api/gmail/callback`
  - [ ] Copy Client ID and Client Secret
- [ ] Add test users (for Testing mode)
- [ ] Apply for verification (for production)

---

## Security Considerations

### ✅ Implemented:
- OAuth tokens encrypted with AES-256-GCM
- CSRF protection with random state tokens
- Rate limiting (10 attempts per 15 min)
- HttpOnly cookies for OAuth state
- Constant-time state comparison
- RLS policies on gmail_tokens table

### Additional:
- Tokens stored per-user (one Gmail connection per user)
- Automatic token refresh on expiry
- Clear OAuth cookies after verification
- Graceful error handling with user-friendly messages

---

## Testing Plan

### Day 1 Testing:
- [ ] OAuth flow completes successfully
- [ ] State verification works correctly
- [ ] Tokens encrypted and stored
- [ ] Rate limiting blocks excessive attempts
- [ ] Error states handled gracefully
- [ ] Redirect to scan page works

### Day 2 Testing:
- [ ] Scan finds receipts from last 6 months
- [ ] Detects 70%+ of common subscriptions
- [ ] Amount extraction accurate
- [ ] Currency conversion correct
- [ ] Confidence scores meaningful
- [ ] Scan completes in <15 seconds

### Day 3 Testing:
- [ ] UI shows detected subscriptions
- [ ] Edit/remove works correctly
- [ ] Confirm saves to database
- [ ] Dashboard shows new subscriptions
- [ ] Mobile responsive
- [ ] Error states display correctly

---

## Integration with Existing Features

### Dashboard Updates:
- Add "Connect Gmail" button to onboarding checklist
- Show badge: "Auto-detect from Gmail"
- Track completion in `OnboardingChecklistCard`

### Analytics Events:
- `gmail_connected` - User authorized Gmail
- `gmail_scan_started` - Scan initiated
- `gmail_scan_completed` - Scan finished
- `gmail_subscriptions_detected` - Number of subs found
- `gmail_subscriptions_confirmed` - User confirmed subs

---

## Known Limitations

1. **Gmail API Quotas:**
   - 250 quota units/user/second
   - 1 billion units/day (shared across all users)
   - Each email fetch = 5 quota units
   - Can scan ~100 emails per request

2. **Detection Accuracy:**
   - Regex pattern matching (not ML)
   - May miss some merchants
   - Requires user confirmation
   - Initial accuracy target: 70%+

3. **Supported Email Formats:**
   - Text-based receipts
   - HTML emails (snippet only)
   - Indian ₹ and US $ amounts
   - English language emails

---

## Next Steps After Day 3

1. **Improve Detection:**
   - Add more merchant patterns based on user feedback
   - Implement fuzzy matching for partial matches
   - Add ML-based classification (future)

2. **Enhanced Features:**
   - Periodic re-scanning (weekly/monthly)
   - Email notifications for new subscriptions detected
   - Export detected subscriptions to CSV

3. **Optimization:**
   - Cache scan results for 24 hours
   - Batch email fetching
   - Parallel processing of patterns

---

## Success Criteria

### Day 1 Complete When:
✅ User can authorize Gmail access
✅ Tokens encrypted and stored
✅ OAuth flow secure with CSRF protection
✅ Rate limiting active

### Day 2 Complete When:
✅ Scan endpoint returns detected subscriptions
✅ 70%+ accuracy on test accounts
✅ Confidence scores assigned correctly
✅ Scan completes in <15 seconds

### Day 3 Complete When:
✅ Full flow works end-to-end
✅ Mobile responsive UI
✅ Users can confirm/edit subscriptions
✅ Dashboard integration complete

---

**Last Updated:** October 24, 2025, 2:00 PM
**Next Update:** After Day 1 completion
