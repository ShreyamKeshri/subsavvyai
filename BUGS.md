# Known Bugs & Issues

## Priority: High

### 1. Email Signup - Alert UX Issue
**File:** `app/(auth)/signup/page.tsx:127`

**Problem:**
- Uses browser `alert()` to show "Check your email to verify your account"
- Poor UX, not mobile-friendly

**Solution:**
- Create a new page `/verify-email` with proper UI
- Show success message with email icon
- Display user's email address
- Add "Resend verification email" button
- Add "Back to login" link

**Implementation:**
```tsx
// After successful signup, redirect to:
router.push(`/verify-email?email=${encodeURIComponent(email)}`)
```

---

### 2. Email Signup - Incorrect Redirect Flow
**File:** `app/(auth)/signup/page.tsx:130`

**Problem:**
- Redirects to `/dashboard` immediately even when email needs verification
- User sees `/login?redirectTo=%2Fdashboard` which is confusing
- Should not redirect to dashboard until email is verified

**Solution:**
```tsx
// Replace lines 125-130 with:
if (result.needsVerification) {
  setError(null)
  // Show success state or redirect to verify-email page
  router.push(`/verify-email?email=${encodeURIComponent(email)}`)
} else {
  // Already verified (shouldn't happen for new signups)
  router.push('/dashboard')
}
```

---

### 3. Email Verification - Emails Not Being Sent
**File:** `lib/auth/auth-helpers.ts:208`

**Possible Causes:**
1. **Environment Variable Missing:**
   - `NEXT_PUBLIC_APP_URL` might not be set in `.env.local`
   - Check: Should be `http://localhost:3000` for dev

2. **Supabase Email Settings:**
   - Supabase may not have SMTP configured
   - For development, need to enable "Confirm email" in Supabase dashboard
   - Go to: Authentication → Email Templates → Confirm signup

3. **Email Template Not Configured:**
   - Default Supabase email might be disabled
   - Check Supabase dashboard → Authentication → Email Templates

**To Debug:**
```bash
# Check if env var is set
echo $NEXT_PUBLIC_APP_URL

# Check .env.local
cat .env.local | grep NEXT_PUBLIC_APP_URL
```

**To Fix:**
1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. In Supabase Dashboard:
   - Go to Authentication → Settings
   - Ensure "Enable email confirmations" is ON
   - Check "Email Templates" → "Confirm signup" is enabled

3. For production:
   - Configure custom SMTP in Supabase (Settings → Auth → SMTP Settings)
   - Use SendGrid, AWS SES, or other email provider

---

### 4. Email Verification - Callback Not Working
**File:** `app/callback/page.tsx` (or route)

**Problem:**
- After clicking verify link in email, user sees `/login?redirectTo=%2Fdashboard`
- Should see dashboard directly or login page without the redirect param

**Root Cause:**
- Email redirect goes to `/callback` with auth tokens
- Callback handler might not be processing the tokens correctly
- Or callback handler doesn't exist

**Solution:**
Check if `app/callback/page.tsx` or `app/callback/route.ts` exists and handles:
```tsx
// Should extract auth tokens from URL
// Should exchange code for session
// Should redirect to dashboard or onboarding
```

**Expected Flow:**
1. User clicks link in email → `http://localhost:3000/callback?token_hash=xxx&type=signup`
2. Callback page extracts token, verifies it with Supabase
3. If valid, creates session
4. Redirects to `/onboarding` (new users) or `/dashboard` (returning users)

---

## Testing Checklist

After fixing:
- [ ] Signup with email shows proper "Check your email" page (not alert)
- [ ] Verification email is actually sent to user's inbox
- [ ] Clicking verify link in email redirects to dashboard
- [ ] User can resend verification email if needed
- [ ] User sees helpful error messages if link expired

---

## Related Files to Update

1. `app/(auth)/signup/page.tsx` - Remove alert, fix redirect
2. `app/(auth)/verify-email/page.tsx` - Create this new page
3. `app/callback/page.tsx` - Ensure proper token handling
4. `.env.local` - Add NEXT_PUBLIC_APP_URL
5. Supabase Dashboard - Enable email confirmations

---

**Created:** 2025-10-04
**Status:** To be fixed later
**Priority:** High (blocks email signup flow)
