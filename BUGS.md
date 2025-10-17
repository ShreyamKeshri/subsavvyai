# Known Bugs & Issues

**Last Updated:** October 17, 2025

## ✅ Critical Security Fixes (Day 5 - Oct 17, 2025)

### 1. ✅ FIXED: useAuth Infinite Re-render Bug
**Fixed in:** PR #25, Commit `4eaa0b5`
**File:** `hooks/useAuth.ts`

**Problem:**
- Supabase client created outside useEffect on every render
- Dependencies `[router, supabase]` caused infinite re-render loop
- Led to memory leaks and browser freezing
- Critical performance impact on all authenticated pages

**Solution Applied:**
- Moved Supabase client creation inside useEffect
- Changed dependency array from `[router, supabase]` to `[]` (run once on mount)
- Properly unsubscribe from auth state changes on unmount

---

### 2. ✅ FIXED: Missing Input Validation (CRITICAL)
**Fixed in:** PR #25, Commit `ed97fc5`
**Files:** `lib/subscriptions/subscription-actions.ts`, `lib/usage/manual-usage-actions.ts`, `lib/recommendations/recommendation-actions.ts`

**Problem:**
- All user inputs passed directly to database without validation
- Risk of SQL injection, XSS, and data corruption
- Zod schemas existed but were never used

**Solution Applied:**
- Applied Zod validation to all subscription CRUD operations
- Added manual usage validation schema
- Added UUID validation to all ID parameters
- Returns user-friendly error messages on validation failures

---

### 3. ✅ FIXED: Missing CSRF State Verification (CRITICAL)
**Fixed in:** PR #25, Commit `a2f2277`
**Files:** `app/api/oauth/spotify/connect/route.ts`, `app/api/oauth/spotify/callback/route.ts`

**Problem:**
- Spotify OAuth generated state token but never verified it
- Exposed to CSRF attacks where attackers could link their Spotify to victim's account

**Solution Applied:**
- Generate 32-byte random state token in connect route
- Store state and user ID in httpOnly cookies (10-minute expiry)
- Verify state matches in callback route (constant-time comparison)
- Verify user ID matches to prevent session hijacking
- Clear OAuth cookies after successful verification

---

### 4. ✅ FIXED: Missing Rate Limiting (CRITICAL)
**Fixed in:** PR #25, Commit `35fb17e`
**Files:** All API routes

**Problem:**
- Rate limit utilities existed but were never used
- All API routes vulnerable to abuse and brute force attacks
- OAuth routes had no throttling

**Solution Applied:**
- OAuth routes: 10 attempts per 15 minutes per IP
- Usage sync API: 30 requests per minute per IP
- Recommendations API: 30 requests per minute per IP
- Returns 429 status with resetAt timestamp

---

### 5. ✅ FIXED: Race Conditions in Auto-Generation (HIGH)
**Fixed in:** PR #25, Commit `4c8ebd6`
**Files:** `lib/utils/debounce.ts` (NEW), `lib/subscriptions/subscription-actions.ts`, `lib/usage/manual-usage-actions.ts`

**Problem:**
- Multiple concurrent calls to generateRecommendations() and generateBundleRecommendations()
- When user adds/updates/deletes multiple subscriptions rapidly, race conditions occurred
- Multiple concurrent database writes could corrupt recommendations

**Solution Applied:**
- Created debounce utility with per-key timer management
- Debounced AI and bundle recommendation generation (2-second delay)
- Applied to subscription and usage operations
- Shared debounce keys across files for global deduplication

---

### 📄 Security Audit Documentation
**Created in:** PR #25, Commit `cfc3b06`
**File:** `SECURITY_AUDIT.md` (NEW)

**Summary:**
- Comprehensive audit identified 23 security issues
- All 5 critical issues fixed
- Documented 8 remaining issues (2 high, 4 medium, 2 low)
- Provided actionable recommendations for production readiness
- Security posture improved from 🟡 Moderate to 🟢 Good

---

## ✅ Recently Fixed (Day 2 - Oct 12, 2025)

### 1. ✅ FIXED: RESEND_API_KEY Blocking Signup Flow
**Fixed in:** `lib/email/email-service.ts`

**Problem:**
- Module-level initialization threw error if RESEND_API_KEY not set
- Blocked entire signup flow even though email is optional

**Solution Applied:**
- Changed to lazy initialization with `getResendClient()` function
- Graceful fallback if API key not configured
- Signup flow no longer blocked

---

### 2. ✅ FIXED: Settings Page Database Errors
**Fixed in:** `lib/settings/settings-actions.ts`

**Problem:**
- "column profiles.user_id does not exist" error
- Incorrect column reference: `user_id` should be `id`
- Currency column name mismatch

**Solution Applied:**
- Changed `.eq('user_id', user.id)` → `.eq('id', user.id)`
- Fixed currency column reference
- Settings page now loads and updates correctly

---

### 3. ✅ FIXED: Edit/Delete Subscription Placeholders
**Fixed in:** `app/dashboard/page.tsx`

**Problem:**
- Edit and Delete buttons showed "Coming soon" toast
- Functionality existed but wasn't wired up

**Solution Applied:**
- Connected existing EditSubscriptionDialog component
- Added delete handler with confirmation
- Added state management for editing/deleting
- Full CRUD operations now working

---

### 4. ✅ FIXED: Dark Theme Not Working
**Fixed in:** `app/layout.tsx`, `components/ui/theme-toggle.tsx`

**Problem:**
- Manual dark mode script not reliable
- No UI toggle for theme switching
- Flash of wrong theme on page load

**Solution Applied:**
- Implemented next-themes with ThemeProvider
- Created enhanced ThemeToggle with Light/Dark/System dropdown
- Zero-flash dark mode with localStorage persistence
- Respects system preference

---

### 5. ✅ FIXED: Spotify OAuth Documentation Missing
**Fixed in:** Created `SPOTIFY_SETUP.md`

**Problem:**
- No setup guide for Spotify OAuth
- Redirect URI security requirement unclear (127.0.0.1 vs localhost)

**Solution Applied:**
- Comprehensive setup guide with step-by-step instructions
- Fixed redirect URI to use 127.0.0.1 (Spotify requirement)
- Updated .env.example with correct values
- Troubleshooting section added

---

## 🐛 Active Issues (Day 3 - Oct 13, 2025)

### 1. ✅ FIXED: Spotify OAuth `service_not_found` Error
**Status:** Fixed (Day 5 - Oct 17, 2025)
**File:** `app/api/oauth/spotify/callback/route.ts`
**Fix:** `supabase/seeds/001_indian_services.sql`

**Problem:**
- After successful Spotify OAuth, redirects to dashboard with error: `oauth_error=service_not_found`
- Callback route can't find "Spotify" service in database
- OAuth flow completes but fails at final step
- **Root Cause:** Services table was empty - seed data needs to be run separately from migrations

**Steps to Reproduce:**
1. Click "Connect Spotify" on dashboard
2. Authorize app on Spotify
3. Get redirected back to dashboard
4. URL shows: `http://localhost:3000/dashboard?oauth_error=service_not_found`

**Solution Applied:**
- Seed data exists in `supabase/seeds/001_indian_services.sql` with 52 popular Indian services
- Includes Spotify, Netflix, Amazon Prime, and 49+ other services
- Seed file was run in Supabase to populate services table
- Spotify OAuth now works correctly

**Priority:** ✅ FIXED

---

### 2. 🔴 HIGH: Google OAuth Login Not Working
**Status:** Should be fixed (needs testing)
**Files:** `lib/auth/auth-helpers.ts`, `.env.local`

**Problem:**
- Google OAuth was broken after changing `NEXT_PUBLIC_APP_URL` to 127.0.0.1
- Google Cloud Console expects `localhost` redirect URI

**Solution Applied (Day 3):**
- Created separate `SPOTIFY_REDIRECT_URI` env variable
- Reverted `NEXT_PUBLIC_APP_URL` back to `localhost`
- Google OAuth should now work again

**Next Action:** Test Google login after restarting dev server

---

### 3. 🟡 MEDIUM: Signup Page Issues
**Status:** Not yet investigated
**File:** `app/(auth)/signup/page.tsx`

**Problem:**
- User reported "Sign Up page need to be fixed"
- Specific issue not yet identified

**Next Action:** Investigate signup flow and identify issues

---

### 4. 🟡 MEDIUM: Type Errors
**Status:** Not yet checked
**Command:** `npm run type-check`

**Problem:**
- Type errors reported by user
- Haven't run type-check yet to identify specific errors

**Next Action:** Run `npm run type-check` and fix any TypeScript errors

---

### 5. 🟢 LOW: Dashboard Spotify Button Route Fixed
**Status:** ✅ FIXED (Day 3)
**File:** `app/dashboard/page.tsx`

**Problem:**
- Button called non-existent route `/api/oauth/spotify`
- Should call `/api/oauth/spotify/connect`

**Solution Applied:**
- Updated button onClick to use correct route
- Committed in PR #16

---

## Priority: Medium

### 1. Onboarding Flow Needs Refinement
**Status:** Deferred (not blocking MVP)

**Issue:**
- User's name already captured during signup
- Onboarding asks for name again
- Redundant step

**Proposed Solution:**
- Skip name collection in onboarding if already have it
- Focus onboarding on preferences:
  - Budget setting
  - Category interests
  - Notification preferences
  - Quick tour of features

---

### 2. Theme Preference Not Synced to Database
**Status:** Low priority (localStorage works)

**Issue:**
- Theme stored in localStorage only
- Not synced to `user_preferences` table
- Won't sync across devices

**Proposed Solution:**
- Add `theme` column to `user_preferences` table
- Update theme on change via server action
- Load theme from database on login
- Fall back to localStorage if not logged in

---

### 3. Email Templates Need Branding Update
**Status:** Tracked in EMAIL_TEMPLATES.md

**Issue:**
- Welcome email uses basic template
- Needs SubSavvyAI branding improvements
- Could use better formatting

**Proposed Solution:**
- Update email templates with new design
- Add logo and brand colors
- Improve mobile responsiveness
- See EMAIL_TEMPLATES.md for details

---

## Priority: Low

### 1. SMS Provider Not Configured
**Status:** Feature deferred to Month 2

**Issue:**
- Phone OTP authentication not set up
- No SMS provider configured (Twilio, MessageBird, etc.)

**Note:**
- Email and Google OAuth sufficient for MVP
- Will implement in Month 2 if needed

---

### 2. Migration 007 Not Yet Applied
**Status:** Pending Supabase execution

**Issue:**
- Migration 007 (manual usage tracking) created but not run in Supabase
- Usage survey dialog exists but can't save data until migration runs

**Action Required:**
1. Run migration 007 in Supabase SQL Editor
2. Reload PostgREST schema: `NOTIFY pgrst, 'reload schema';`
3. Test manual usage tracking end-to-end

---

## Testing Status

### Completed Testing:
- [x] RESEND_API_KEY fix verified
- [x] Settings page loading correctly
- [x] Edit/Delete subscription working
- [x] Dark mode toggle functional
- [x] Spotify OAuth documented

### Pending Testing:
- [ ] Run migration 007 in Supabase
- [ ] Test manual usage tracking flow
- [ ] Test AI recommendations with manual data
- [ ] Verify hybrid system (OAuth + Manual)

---

## Bug Reporting

If you find a new bug, add it here with:
- **Title:** Short description
- **File:** Affected file(s)
- **Problem:** What's broken
- **Steps to Reproduce:** How to see the bug
- **Proposed Solution:** How to fix (if known)
- **Priority:** High/Medium/Low
- **Status:** New/In Progress/Fixed

---

**Next Review:** After Day 3 completion
**Critical Bugs:** 2 HIGH (Spotify OAuth, needs Google OAuth testing)
**Active Issues:** 5 (2 HIGH, 2 MEDIUM, 1 FIXED)
**Total Open Issues:** 9 (2 HIGH, 4 MEDIUM, 3 LOW)
