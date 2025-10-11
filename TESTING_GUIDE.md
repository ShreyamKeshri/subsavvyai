# SubSavvyAI Testing Guide

Complete guide to test all features of the SubSavvyAI application.

## Setup Before Testing

### 1. Environment Variables
```bash
# Check all required variables are set
cat .env.local

# Required variables:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# RESEND_API_KEY=re_your_resend_api_key
# RESEND_FROM_EMAIL=SubSavvyAI <onboarding@subsavvyai.com>
# SPOTIFY_CLIENT_ID=your_spotify_client_id
# SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
# SPOTIFY_REDIRECT_URI=http://localhost:3000/api/oauth/spotify/callback
```

### 2. Start Development Server
```bash
npm run dev
# Server should start on http://localhost:3000
```

### 3. Clear Browser Data (Optional, for fresh test)
```bash
# Clear cookies, local storage, and cache for localhost:3000
# Or use Incognito/Private browsing mode
```

---

## 1. Authentication System

### 1.1 Email/Password Signup

**Steps:**
1. Go to: `http://localhost:3000/signup`
2. Fill in:
   - Full Name: "Test User"
   - Email: Your real email address (you need to receive verification)
   - Password: "Test@123" (must meet requirements)
3. Click "Sign Up"

**Expected Results:**
- ✅ Redirected to `/verify-email` page
- ✅ Success toast: "Account created successfully!"
- ✅ Receive **2 emails**:
  - Welcome email (from Resend) - "Welcome to SubSavvyAI"
  - Verification email (from Supabase) - "Verify your email address"

**Check:**
- [ ] Signup form validation works (weak password rejected)
- [ ] Success message shows
- [ ] Redirected to verify-email page
- [ ] Welcome email received with personalized name
- [ ] Verification email received with working button
- [ ] Both emails have SubSavvyAI branding

### 1.2 Email Verification

**Steps:**
1. Open verification email
2. Click "Verify My Email" button
3. Or copy/paste the fallback URL

**Expected Results:**
- ✅ Redirected to: `http://localhost:3000/callback`
- ✅ Then redirected to: `http://localhost:3000/dashboard`
- ✅ User is now logged in
- ✅ Profile shows verified status

**Check:**
- [ ] Verification link works
- [ ] Redirected to dashboard
- [ ] User is authenticated
- [ ] Can access protected routes

### 1.3 Email/Password Login

**Steps:**
1. Log out (if logged in)
2. Go to: `http://localhost:3000/login`
3. Enter email and password
4. Click "Sign In"

**Expected Results:**
- ✅ Redirected to `/dashboard`
- ✅ Success toast: "Signed in successfully"
- ✅ User profile loaded

**Check:**
- [ ] Login works with correct credentials
- [ ] Error shown for incorrect password
- [ ] Error shown for non-existent email
- [ ] Redirected to dashboard after login

### 1.4 Google OAuth Signup

**Steps:**
1. Go to: `http://localhost:3000/signup`
2. Click "Continue with Google"
3. Select Google account
4. Grant permissions

**Expected Results:**
- ✅ Redirected to `/callback`
- ✅ Then redirected to `/dashboard`
- ✅ Receive **1 email**:
  - Welcome email (from Resend) with name from Google profile
- ✅ Profile created with Google data (name, avatar)

**Check:**
- [ ] Google OAuth popup works
- [ ] Successfully authenticates
- [ ] Welcome email received
- [ ] Profile has Google name and avatar
- [ ] No verification email needed (Google pre-verified)

### 1.5 Password Reset Flow

**Steps:**
1. Go to: `http://localhost:3000/login`
2. Click "Forgot password?" (if link exists)
3. Or manually trigger: Call `authWithEmail.resetPassword('your-email@example.com')`
4. Check email inbox

**Expected Results:**
- ✅ Receive password reset email (from Supabase)
- ✅ Email has "Reset Password" button
- ✅ Clicking button redirects to `/reset-password`

**Test Reset:**
1. Click "Reset Password" in email
2. Enter new password: "NewTest@456"
3. Submit form
4. Try logging in with new password

**Check:**
- [ ] Reset email received
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can log in with new password
- [ ] Old password no longer works

### 1.6 Session Persistence

**Steps:**
1. Log in to dashboard
2. Close browser tab
3. Reopen: `http://localhost:3000/dashboard`

**Expected Results:**
- ✅ Still logged in
- ✅ Dashboard loads without redirect to login

**Check:**
- [ ] Session persists after browser close
- [ ] Refresh doesn't log user out
- [ ] Protected routes remain accessible

### 1.7 Logout

**Steps:**
1. While logged in, click "Log Out" (in settings or header)
2. Or call: `auth.signOut()`

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ Success toast: "Signed out successfully"
- ✅ Cannot access `/dashboard` anymore

**Check:**
- [ ] Logout works
- [ ] Session cleared
- [ ] Redirected to login
- [ ] Protected routes redirect to login

---

## 2. Dashboard & Analytics

### 2.1 Dashboard Page

**Steps:**
1. Log in and navigate to `/dashboard`
2. Observe the dashboard layout

**Expected Results:**
- ✅ Header with logo and navigation
- ✅ Welcome message with user's name
- ✅ Analytics cards showing:
  - Total subscriptions
  - Monthly spend
  - Yearly spend
  - Active subscriptions
- ✅ "Add Subscription" button
- ✅ Subscriptions list (empty initially)

**Check:**
- [ ] Dashboard loads without errors
- [ ] User name displayed correctly
- [ ] Analytics show 0 for new user
- [ ] Clean, professional UI

### 2.2 Add Subscription (Manual Entry)

**Steps:**
1. Click "Add Subscription" button
2. Fill in form:
   - **Service**: Select "Netflix" (or any service)
   - **Plan**: Select a plan (e.g., "Premium")
   - **Cost**: Enter amount (e.g., "649")
   - **Billing Cycle**: Select "Monthly"
   - **Last Billing Date**: Select today's date
   - **Payment Method**: "UPI"
3. Click "Add Subscription"

**Expected Results:**
- ✅ Success toast: "Subscription added successfully"
- ✅ Dialog closes
- ✅ New subscription appears in list
- ✅ Analytics update automatically:
  - Total subscriptions: 1
  - Monthly spend: ₹649
  - Yearly spend: ₹7,788
- ✅ Next billing date calculated automatically

**Check:**
- [ ] Form validation works
- [ ] Service dropdown populated with 52 Indian services
- [ ] Cost accepts decimal values
- [ ] Next billing date calculated correctly
- [ ] Analytics update in real-time
- [ ] Subscription card shows all details

### 2.3 Add Multiple Subscriptions

**Steps:**
1. Add 3-5 different subscriptions with varying:
   - Billing cycles (Monthly, Yearly, Quarterly)
   - Costs (₹99 to ₹2,000)
   - Services (Spotify, Amazon Prime, Disney+, etc.)

**Expected Results:**
- ✅ All subscriptions appear in list
- ✅ Analytics correctly sum up:
  - Monthly costs normalized (yearly ÷ 12, quarterly ÷ 3)
  - Yearly costs calculated
- ✅ Subscriptions sorted by next billing date

**Check:**
- [ ] Multiple subscriptions displayed correctly
- [ ] Analytics calculations accurate
- [ ] Can scroll through subscription list
- [ ] Each card shows correct details

### 2.4 View Subscription Details

**Steps:**
1. Click on a subscription card
2. View the expanded details

**Expected Results:**
- ✅ Shows all subscription information:
  - Service name and logo
  - Plan name
  - Cost and billing cycle
  - Next billing date
  - Payment method
  - Status (Active/Cancelled)

**Check:**
- [ ] Details are accurate
- [ ] Dates formatted correctly (DD/MM/YYYY)
- [ ] Currency symbol (₹) displayed

### 2.5 Edit Subscription

**Steps:**
1. Click "Edit" on a subscription
2. Modify:
   - Cost: Change to new amount
   - Billing cycle: Change to different cycle
3. Save changes

**Expected Results:**
- ✅ Subscription updated
- ✅ Analytics recalculated
- ✅ Next billing date recalculated

**Check:**
- [ ] Edit form pre-filled with current values
- [ ] Changes saved successfully
- [ ] Analytics update correctly

### 2.6 Cancel/Delete Subscription

**Steps:**
1. Click "Delete" or "Cancel" on a subscription
2. Confirm deletion

**Expected Results:**
- ✅ Subscription removed from list
- ✅ Analytics updated (decremented)
- ✅ Success toast shown

**Check:**
- [ ] Confirmation dialog appears
- [ ] Subscription deleted after confirmation
- [ ] Analytics recalculate correctly

---

## 3. AI Optimizer & Smart Downgrade Alerts

### 3.1 Connect Spotify (OAuth)

**Steps:**
1. Add a Spotify subscription first (manually)
2. Click "Connect Spotify" or "Optimize" button
3. Authenticate with Spotify
4. Grant permissions

**Expected Results:**
- ✅ Redirected to Spotify OAuth
- ✅ After auth, redirected back to dashboard
- ✅ Success toast: "Spotify connected successfully"
- ✅ OAuth token saved (encrypted in `oauth_tokens` table)

**Check:**
- [ ] Spotify OAuth flow works
- [ ] Token saved securely
- [ ] Can fetch usage data

### 3.2 Fetch Usage Data

**Steps:**
1. After connecting Spotify, trigger usage sync
2. Or wait for automatic sync (if implemented)

**Expected Results:**
- ✅ Spotify listening data fetched:
  - Total listening hours (last 4 weeks)
  - Top artists, tracks
  - Listening patterns
- ✅ Data saved in `service_usage` table
- ✅ Shows in dashboard: "X hours listened"

**Check:**
- [ ] Usage data fetched successfully
- [ ] Data persisted in database
- [ ] Displayed in UI

### 3.3 Generate AI Recommendations

**Steps:**
1. With Spotify connected and usage data fetched
2. Click "Get Recommendations" or similar button
3. Wait for AI analysis

**Expected Results:**
- ✅ AI recommendations generated:
  - **Type**: "downgrade" (if low usage)
  - **Confidence**: 0.75-0.95
  - **Potential Savings**: ₹X/month
  - **Reasoning**: Detailed explanation
  - **Recommendation**: Specific action to take
- ✅ Saved in `optimization_recommendations` table
- ✅ Displayed as cards in dashboard

**Check:**
- [ ] Recommendations generated
- [ ] Logic makes sense (downgrade for low usage)
- [ ] Savings calculated correctly
- [ ] Reasoning is clear and helpful

### 3.4 View Recommendation Details

**Steps:**
1. Click on a recommendation card
2. View full details

**Expected Results:**
- ✅ Shows:
  - Current plan vs recommended plan
  - Usage statistics
  - Potential monthly/yearly savings
  - Confidence score
  - Detailed reasoning
- ✅ Action buttons:
  - "Implement" (mark as implemented)
  - "Dismiss" (not interested)

**Check:**
- [ ] All details visible
- [ ] Savings calculation clear
- [ ] Action buttons work

### 3.5 Implement Recommendation

**Steps:**
1. Click "Implement" on a recommendation
2. Confirm action

**Expected Results:**
- ✅ Recommendation marked as "implemented"
- ✅ Subscription updated (if applicable)
- ✅ Analytics updated with new savings
- ✅ Success toast: "Recommendation implemented!"

**Check:**
- [ ] Status changes to "implemented"
- [ ] Subscription plan updated
- [ ] Cost reduced in analytics

### 3.6 Dismiss Recommendation

**Steps:**
1. Click "Dismiss" on a recommendation
2. Optionally provide reason

**Expected Results:**
- ✅ Recommendation hidden
- ✅ Status changed to "dismissed"
- ✅ No longer shows in active recommendations

**Check:**
- [ ] Recommendation removed from view
- [ ] Status updated in database

---

## 4. Settings Page

### 4.1 Profile Settings

**Steps:**
1. Navigate to `/settings` or `/dashboard/settings`
2. Go to "Profile" tab

**Expected Results:**
- ✅ Shows current profile:
  - Full name
  - Email (read-only)
  - Phone number (if set)
  - Avatar
- ✅ Can edit name and phone

**Test Edit:**
1. Change name to "Updated Name"
2. Save changes

**Check:**
- [ ] Profile loads correctly
- [ ] Can edit and save name
- [ ] Changes reflected in dashboard header
- [ ] Validation works (e.g., invalid phone rejected)

### 4.2 Preferences

**Steps:**
1. Go to "Preferences" tab
2. View available settings

**Expected Results:**
- ✅ Budget settings:
  - Monthly budget limit
  - Currency preference (₹ INR)
- ✅ Timezone: Asia/Kolkata
- ✅ Language: English

**Test Changes:**
1. Set monthly budget: ₹5,000
2. Save changes
3. Check if dashboard shows budget warning (if over budget)

**Check:**
- [ ] Preferences load
- [ ] Can modify and save
- [ ] Budget alerts work

### 4.3 Notification Preferences

**Steps:**
1. Go to "Notifications" tab
2. View notification settings

**Expected Results:**
- ✅ Email notifications toggle
- ✅ SMS notifications toggle (future)
- ✅ Push notifications toggle (future)
- ✅ Notification types:
  - Renewal reminders
  - Price changes
  - Recommendations
  - Monthly summaries

**Test:**
1. Enable/disable email notifications
2. Save changes

**Check:**
- [ ] Toggles work
- [ ] Changes saved to database
- [ ] Preferences respected (test by checking notification_preferences table)

### 4.4 Category Preferences

**Steps:**
1. Go to "Categories" or "Interests" section
2. View subscription categories

**Expected Results:**
- ✅ Shows categories:
  - Streaming (Netflix, Prime Video)
  - Music (Spotify, Apple Music)
  - Cloud Storage (Google Drive, Dropbox)
  - News & Magazines
  - Productivity
  - Gaming
  - Education
  - Fitness & Health

**Test:**
1. Select interested categories
2. Save preferences

**Check:**
- [ ] Categories displayed
- [ ] Can select multiple
- [ ] Saved to `user_category_preferences` table

### 4.5 Connected Accounts

**Steps:**
1. Go to "Connected Accounts" or "Integrations"
2. View OAuth connections

**Expected Results:**
- ✅ Shows connected services:
  - Spotify (if connected)
  - Netflix (future)
  - Other services
- ✅ Shows connection status
- ✅ "Disconnect" button for each

**Test Disconnect:**
1. Click "Disconnect" on Spotify
2. Confirm

**Expected Results:**
- ✅ OAuth token deleted
- ✅ Usage data retained (historical)
- ✅ Recommendations marked as outdated

**Check:**
- [ ] Connected accounts listed
- [ ] Can disconnect
- [ ] Status updated correctly

### 4.6 Security Settings

**Steps:**
1. Go to "Security" tab
2. View security options

**Expected Results:**
- ✅ Change password option
- ✅ Two-factor authentication (future)
- ✅ Active sessions list
- ✅ Security event log

**Test Change Password:**
1. Enter current password
2. Enter new password: "NewSecure@789"
3. Confirm new password
4. Save
5. Log out and log in with new password

**Check:**
- [ ] Password change form works
- [ ] Old password validated
- [ ] New password requirements enforced
- [ ] Can log in with new password

### 4.7 Danger Zone (Delete Account)

**Steps:**
1. Scroll to "Danger Zone"
2. View "Delete Account" option

**Test (Optional - use test account):**
1. Click "Delete Account"
2. Confirm with password
3. Confirm deletion

**Expected Results:**
- ✅ Account deleted
- ✅ All data removed (subscriptions, profile, tokens)
- ✅ Logged out
- ✅ Cannot log in again

**Check:**
- [ ] Delete button has warning styling
- [ ] Confirmation dialog appears
- [ ] Requires password confirmation
- [ ] Account fully deleted

---

## 5. Email System

### 5.1 Welcome Email (Already tested in Auth)

**Steps:**
- Sign up with new account

**Check:**
- [ ] Received within 1 minute
- [ ] Personalized with user's name
- [ ] SubSavvyAI branding visible
- [ ] "Get Started" button works
- [ ] Footer links work
- [ ] No "Made with ❤️ in India" text

### 5.2 Verification Email (Already tested in Auth)

**Steps:**
- Sign up with email/password

**Check:**
- [ ] Received within 1 minute
- [ ] "Verify My Email" button works
- [ ] Fallback URL displayed correctly (not {{ .ConfirmationURL }})
- [ ] Link works only once (second click shows error)
- [ ] Branding consistent

### 5.3 Password Reset Email (Already tested in Auth)

**Steps:**
- Request password reset

**Check:**
- [ ] Received within 1 minute
- [ ] "Reset Password" button works
- [ ] Password tips shown
- [ ] Warning for non-requesters visible
- [ ] Link expires after 30 minutes (optional test)

### 5.4 Email Rendering Across Clients

**Test in multiple email clients:**
1. Gmail (Web)
2. Outlook (Web)
3. Apple Mail (Desktop)
4. Gmail (Mobile)

**Check:**
- [ ] Logo displays correctly
- [ ] Buttons styled properly
- [ ] Links work
- [ ] Responsive on mobile
- [ ] No broken images

---

## 6. Middleware & Route Protection

### 6.1 Protected Routes (Logged Out)

**Steps:**
1. Log out completely
2. Try accessing:
   - `/dashboard`
   - `/settings`
   - `/onboarding`

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ After login, redirected back to original route

**Check:**
- [ ] Cannot access protected routes
- [ ] Redirected to login
- [ ] Return URL preserved

### 6.2 Public Routes (Logged In)

**Steps:**
1. Log in
2. Try accessing:
   - `/login`
   - `/signup`
   - `/verify-email`

**Expected Results:**
- ✅ Redirected to `/dashboard`
- ✅ Message: "You're already logged in"

**Check:**
- [ ] Cannot access auth pages when logged in
- [ ] Redirected to dashboard

### 6.3 Middleware Security Headers

**Steps:**
1. Open browser DevTools
2. Go to Network tab
3. Load any page
4. Check response headers

**Expected Headers:**
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: geolocation=(), microphone=(), camera=()`

**Check:**
- [ ] Security headers present
- [ ] CSP configured (if applicable)

---

## 7. Database & Data Persistence

### 7.1 User Profile Creation

**Steps:**
1. Sign up with new account
2. Check Supabase `profiles` table

**Expected Results:**
- ✅ New row created with:
  - `id` (matches auth.users.id)
  - `full_name`
  - `created_at`
  - `updated_at`

**Check:**
- [ ] Profile created automatically (migration 003)
- [ ] ID matches auth.users
- [ ] Timestamps set correctly

### 7.2 Subscription CRUD

**Steps:**
1. Add subscription
2. Check `subscriptions` table in Supabase
3. Edit subscription
4. Check table again
5. Delete subscription

**Expected Results:**
- ✅ Insert: New row with all fields
- ✅ Update: `updated_at` timestamp changed
- ✅ Delete: Row removed

**Check:**
- [ ] Data persisted correctly
- [ ] Foreign keys intact (user_id, service_id)
- [ ] Timestamps update on edit

### 7.3 Analytics Cache

**Steps:**
1. Add/edit/delete subscriptions
2. Check `user_analytics_cache` table

**Expected Results:**
- ✅ Cache refreshes automatically (trigger)
- ✅ Shows correct:
  - `total_subscriptions`
  - `monthly_spend`
  - `yearly_spend`
  - `category_breakdown` (JSON)

**Check:**
- [ ] Cache updates in real-time
- [ ] Calculations accurate
- [ ] Category breakdown correct

### 7.4 RLS Policies

**Test:**
1. Try accessing another user's data via API/SQL
2. Or use Supabase SQL Editor:
   ```sql
   -- This should return only YOUR subscriptions
   SELECT * FROM subscriptions;
   ```

**Expected Results:**
- ✅ Can only see own data
- ✅ Cannot query other users' rows
- ✅ RLS enforced on all tables

**Check:**
- [ ] RLS blocks unauthorized access
- [ ] Users isolated from each other

---

## 8. Error Handling & Edge Cases

### 8.1 Network Errors

**Test:**
1. Disconnect internet
2. Try adding subscription
3. Reconnect internet

**Expected Results:**
- ✅ Error toast: "Network error"
- ✅ Form doesn't submit
- ✅ No partial data saved

**Check:**
- [ ] Graceful error handling
- [ ] User notified clearly

### 8.2 Invalid Input

**Test:**
1. Try adding subscription with:
   - Negative cost
   - Empty service name
   - Invalid date (future date for last billing)

**Expected Results:**
- ✅ Validation errors shown
- ✅ Form doesn't submit
- ✅ Error messages clear

**Check:**
- [ ] Client-side validation works
- [ ] Server-side validation works
- [ ] No invalid data saved

### 8.3 Session Expiry

**Test:**
1. Log in
2. Wait for session to expire (or manually expire in Supabase)
3. Try performing an action

**Expected Results:**
- ✅ Redirected to login
- ✅ Error message: "Session expired"
- ✅ Can log in again

**Check:**
- [ ] Expired session detected
- [ ] Redirected gracefully

### 8.4 Duplicate Subscriptions

**Test:**
1. Add Netflix subscription
2. Try adding another Netflix subscription with same plan

**Expected Results:**
- ✅ Warning: "You already have this subscription"
- ✅ Or allow but show duplicate indicator

**Check:**
- [ ] Duplicate detection works
- [ ] User warned appropriately

---

## 9. Performance

### 9.1 Page Load Times

**Test:**
1. Open DevTools → Performance tab
2. Load dashboard
3. Check metrics

**Expected:**
- ✅ First Contentful Paint: < 1s
- ✅ Time to Interactive: < 2s
- ✅ Total page load: < 3s

**Check:**
- [ ] Pages load quickly
- [ ] No unnecessary re-renders
- [ ] Images optimized

### 9.2 Database Query Performance

**Test:**
1. Add 50+ subscriptions (bulk insert via SQL if needed)
2. Load dashboard
3. Check query times in Supabase logs

**Expected:**
- ✅ Dashboard query: < 100ms
- ✅ Analytics calculation: < 50ms
- ✅ No N+1 queries

**Check:**
- [ ] Queries optimized
- [ ] Indexes used
- [ ] No slow queries

---

## 10. UI/UX & Responsiveness

### 10.1 Desktop View (1920x1080)

**Check:**
- [ ] Layout looks professional
- [ ] No content overflow
- [ ] Proper spacing and alignment
- [ ] Logo and branding visible

### 10.2 Tablet View (768x1024)

**Check:**
- [ ] Layout adapts properly
- [ ] Navigation accessible
- [ ] Forms usable
- [ ] Cards stack correctly

### 10.3 Mobile View (375x667)

**Check:**
- [ ] Mobile-friendly navigation (hamburger menu?)
- [ ] Forms fit screen
- [ ] Buttons large enough to tap
- [ ] Text readable (not too small)

### 10.4 Dark Mode (if implemented)

**Test:**
1. Toggle dark mode
2. Navigate through app

**Check:**
- [ ] All pages support dark mode
- [ ] Contrast sufficient
- [ ] No white flashes on page load

---

## 11. Accessibility

### 11.1 Keyboard Navigation

**Test:**
1. Use only keyboard (Tab, Enter, Esc)
2. Navigate through:
   - Login form
   - Dashboard
   - Add subscription dialog
   - Settings

**Check:**
- [ ] All interactive elements reachable
- [ ] Focus indicators visible
- [ ] Can submit forms with Enter
- [ ] Can close dialogs with Esc

### 11.2 Screen Reader (Optional)

**Test with NVDA/JAWS/VoiceOver:**
1. Navigate dashboard
2. Add subscription
3. Read analytics

**Check:**
- [ ] Labels announced correctly
- [ ] Form fields describable
- [ ] Buttons have proper ARIA labels

---

## 12. Production Readiness

### 12.1 Environment Variables

**Check `.env.local`:**
- [ ] All required variables set
- [ ] No sensitive data in git
- [ ] `.env.example` up to date

### 12.2 Build & Deploy

**Test:**
```bash
# Build production
npm run build

# Check for errors
npm start
```

**Check:**
- [ ] Build succeeds without errors
- [ ] No console warnings
- [ ] Production build runs

### 12.3 Error Boundaries

**Test:**
1. Force an error (e.g., throw new Error in component)
2. See if error boundary catches it

**Check:**
- [ ] Error boundary shows friendly message
- [ ] App doesn't crash completely
- [ ] User can recover

---

## Summary Checklist

### Authentication ✅
- [ ] Email/password signup
- [ ] Email verification
- [ ] Email/password login
- [ ] Google OAuth
- [ ] Password reset
- [ ] Session persistence
- [ ] Logout

### Dashboard ✅
- [ ] View analytics
- [ ] Add subscription
- [ ] Edit subscription
- [ ] Delete subscription
- [ ] Analytics update correctly

### AI Optimizer ✅
- [ ] Connect Spotify OAuth
- [ ] Fetch usage data
- [ ] Generate recommendations
- [ ] Implement recommendations
- [ ] Dismiss recommendations

### Settings ✅
- [ ] Edit profile
- [ ] Update preferences
- [ ] Notification settings
- [ ] Connected accounts
- [ ] Change password
- [ ] Delete account

### Email System ✅
- [ ] Welcome email
- [ ] Verification email
- [ ] Password reset email
- [ ] Emails render correctly

### Security ✅
- [ ] Route protection
- [ ] RLS policies
- [ ] Middleware security headers
- [ ] Data isolation

### Performance ✅
- [ ] Fast page loads
- [ ] Optimized queries
- [ ] Responsive UI

### Accessibility ✅
- [ ] Keyboard navigation
- [ ] Screen reader friendly

### Production ✅
- [ ] Build succeeds
- [ ] Environment variables
- [ ] Error handling

---

## Bug Reporting Template

If you find bugs during testing:

```markdown
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Logs:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 131
- OS: macOS Sonoma
- Node: v20.11.0
- Branch: feature/email-system
```

---

## Testing Priority

**High Priority (Must Test):**
1. Authentication flows
2. Add/edit/delete subscription
3. Analytics calculations
4. Email delivery
5. Route protection

**Medium Priority (Should Test):**
1. AI recommendations
2. Settings page
3. Responsive design
4. Error handling

**Low Priority (Nice to Test):**
1. Dark mode
2. Accessibility
3. Performance metrics
4. Edge cases

---

**Happy Testing! 🚀**

For questions or issues, check:
- `CLAUDE.md` for project overview
- `SUPABASE_SETUP_GUIDE.md` for email setup
- `EMAIL_SETUP.md` for email development
