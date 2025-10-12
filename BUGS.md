# Known Bugs & Issues

**Last Updated:** October 12, 2025

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

**Next Review:** After Day 3 (Landing page optimization)
**Critical Bugs:** 0 (All resolved! 🎉)
**Total Open Issues:** 5 (2 medium, 3 low priority)
