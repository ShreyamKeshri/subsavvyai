# Analytics Setup Guide

**Last Updated:** October 12, 2025

This document contains instructions for setting up PostHog analytics and Sentry error tracking.

---

## 1. PostHog Setup

### Step 1: Create PostHog Account
1. Go to [https://app.posthog.com/signup](https://app.posthog.com/signup)
2. Sign up with your email
3. Create a new project: "SubSavvyAI"

### Step 2: Get API Keys
1. Go to **Settings** → **Project** → **Project API Key**
2. Copy your **Project API Key** (starts with `phc_`)
3. Your PostHog host URL is: `https://app.posthog.com`

### Step 3: Add Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Step 4: Verify Installation
1. Start dev server: `npm run dev`
2. Open browser console
3. Check for PostHog initialization logs (if in dev mode)
4. Go to PostHog dashboard → **Live Events** to see events in real-time

---

## 2. Sentry Setup

### Step 1: Create Sentry Account
1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up with your email
3. Create a new project: "SubSavvyAI" (Next.js)

### Step 2: Get DSN
1. Go to **Settings** → **Projects** → **SubSavvyAI**
2. Go to **Client Keys (DSN)**
3. Copy your **DSN** (starts with `https://`)

### Step 3: Get Auth Token
1. Go to **Settings** → **Auth Tokens**
2. Click **Create New Token**
3. Give it scopes: `project:read`, `project:write`
4. Copy the token

### Step 4: Add Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

### Step 5: Verify Installation
1. Restart dev server
2. Trigger an error to test
3. Go to Sentry dashboard → **Issues** to see captured errors

---

## 3. Tracked Events

### User Events
- **user_signup** - When user completes registration
  - Properties: `method` (email/google/phone), `userId`
- **user_login** - When user logs in
  - Properties: `method`, `userId`

### Subscription Events
- **subscription_added** - When user adds a subscription
  - Properties: `subscriptionId`, `serviceName`, `cost`, `billingCycle`, `isCustom`
- **subscription_edited** - When user edits a subscription
  - Properties: `subscriptionId`
- **subscription_deleted** - When user deletes a subscription
  - Properties: `subscriptionId`

### OAuth Events
- **spotify_connected** - When user connects Spotify account
  - Properties: `userId`

### Recommendation Events
- **bundle_recommendation_generated** - When bundle recommendations are generated
  - Properties: `userId`, `bundlesFound`, `totalSavings`

### Revenue Events (CRITICAL)
- **affiliate_clicked** - When user clicks bundle affiliate link
  - Properties: `bundleId`, `bundleName`, `provider`, `cost`, `estimatedSavings`, `affiliateUrl`

### Dashboard Events
- **dashboard_viewed** - When user views dashboard
- **onboarding_completed** - When user completes onboarding
  - Properties: `userId`

---

## 4. PostHog Funnels Setup

### Funnel 1: Signup → Activation → Revenue
**Purpose:** Track conversion from signup to revenue

1. Go to PostHog → **Insights** → **New Insight** → **Funnel**
2. Add steps:
   - Step 1: `user_signup`
   - Step 2: `subscription_added`
   - Step 3: `bundle_recommendation_generated`
   - Step 4: `affiliate_clicked`
3. Name: "Signup to Revenue"
4. Save to dashboard

**Target Metrics:**
- Signup → Add Subscription: >50%
- Add Subscription → View Recommendation: >30%
- View Recommendation → Click Affiliate: >5%

### Funnel 2: Spotify OAuth Flow
**Purpose:** Track Spotify connection rate

1. Create new funnel
2. Add steps:
   - Step 1: `user_signup`
   - Step 2: `spotify_connected`
3. Name: "Spotify Connection Rate"
4. Save to dashboard

**Target Metrics:**
- Signup → Spotify Connected: >20%

### Funnel 3: Bundle Discovery to Action
**Purpose:** Track bundle recommendation effectiveness

1. Create new funnel
2. Add steps:
   - Step 1: `bundle_recommendation_generated`
   - Step 2: `affiliate_clicked`
3. Name: "Bundle Recommendation Conversion"
4. Save to dashboard

**Target Metrics:**
- Recommendations Generated → Affiliate Clicked: >10%

---

## 5. PostHog Dashboard Setup

### Create Main Dashboard
1. Go to PostHog → **Dashboards** → **New Dashboard**
2. Name: "SubSavvyAI - Launch Metrics"
3. Add tiles:

#### Tile 1: Total Signups (Trend)
- Insight Type: Trend
- Event: `user_signup`
- Display: Line chart
- Time range: Last 30 days

#### Tile 2: Daily Active Users (Trend)
- Insight Type: Trend
- Event: `$pageview`
- Unique users
- Display: Line chart
- Time range: Last 30 days

#### Tile 3: Signup Method Breakdown (Pie)
- Insight Type: Trend
- Event: `user_signup`
- Breakdown by: `method`
- Display: Pie chart
- Time range: Last 30 days

#### Tile 4: Affiliate Clicks (Number)
- Insight Type: Trend
- Event: `affiliate_clicked`
- Display: Number
- Time range: Last 30 days

#### Tile 5: Total Estimated Savings (Number)
- Insight Type: SQL Insights (if available)
- Custom calculation: Sum of `estimatedSavings` from `affiliate_clicked`
- Display: Number
- Time range: Last 30 days

#### Tile 6: Signup to Revenue Funnel
- Add the funnel created in Step 4
- Display: Funnel visualization

#### Tile 7: Top Providers Clicked (Bar)
- Insight Type: Trend
- Event: `affiliate_clicked`
- Breakdown by: `provider`
- Display: Bar chart
- Time range: Last 30 days

---

## 6. Key Metrics to Monitor

### Acquisition Metrics
- **Landing page visitors** - Track with `$pageview` on `/`
- **Signup conversion rate** - Visitors who become users
- **Signup method distribution** - Email vs Google vs Phone

### Activation Metrics
- **% users who add subscriptions** - Target: >50%
- **% users who connect Spotify** - Target: >20%
- **% users who view bundle recommendations** - Target: >30%

### Revenue Metrics (CRITICAL)
- **Affiliate clicks** - Target: >5% of active users
- **Estimated conversions** - 1-2% of clicks (external tracking)
- **Revenue per user** - ₹50-200 average (based on commissions)

### Engagement Metrics
- **DAU/MAU ratio** - Target: >15%
- **Average potential savings shown** - Target: >₹5,000
- **Return rate D1, D7** - Target: >25%, >10%

---

## 7. Error Monitoring with Sentry

### Error Categories to Monitor
1. **Critical Errors** (Alert immediately)
   - Database connection failures
   - Auth failures
   - Payment processing errors

2. **High Priority Errors**
   - API call failures (Spotify, bundle providers)
   - Data sync issues
   - Recommendation generation failures

3. **Medium Priority Errors**
   - UI component errors
   - Form validation failures
   - Browser compatibility issues

### Alert Rules
1. Go to Sentry → **Alerts** → **Create Alert Rule**
2. Set conditions:
   - If error count > 10 in 5 minutes → Send alert
   - If new error type appears → Send alert
3. Configure notifications (email, Slack)

---

## 8. Testing Checklist

### PostHog Events to Test:
- [ ] Sign up with email → Check `user_signup` event
- [ ] Sign up with Google → Check `user_signup` event
- [ ] Add subscription → Check `subscription_added` event
- [ ] Connect Spotify → Check `spotify_connected` event
- [ ] Generate bundle recommendations → Check `bundle_recommendation_generated` event
- [ ] Click affiliate link → Check `affiliate_clicked` event (REVENUE-CRITICAL)
- [ ] View dashboard → Check `dashboard_viewed` event

### Sentry Errors to Test:
- [ ] Trigger a test error → Check Sentry dashboard
- [ ] Check error grouping works
- [ ] Check alert emails/notifications work

---

## 9. Post-Launch Monitoring

### Daily (First 7 Days)
- Check **Live Events** in PostHog
- Monitor **Signup to Revenue** funnel conversion rates
- Check **affiliate_clicked** event count
- Review Sentry errors (should be <5 errors/day)

### Weekly (First Month)
- Review **DAU/MAU** ratio
- Analyze **Signup method** performance
- Track **Total estimated savings** from affiliate clicks
- Review **Top providers** clicked
- Check **funnel drop-off** points

### Monthly (Ongoing)
- Compare metrics to previous month
- Identify trends and patterns
- A/B test improvements
- Update conversion rate targets

---

## 10. Troubleshooting

### PostHog Events Not Showing
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
3. Check PostHog dashboard → **Live Events** (real-time)
4. Verify network tab shows requests to `app.posthog.com`

### Sentry Not Capturing Errors
1. Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify instrumentation.ts is being loaded
3. Check Sentry dashboard → **Issues**
4. Test with intentional error

### Events Tracked But Not in Funnels
1. Wait 5-10 minutes for processing
2. Check event names match exactly
3. Verify time range in funnel settings
4. Check user identification is working

---

## 11. Privacy & GDPR Compliance

### PostHog Configuration
- PostHog is GDPR-compliant by default
- No PII is captured automatically
- User emails are NOT sent to PostHog
- Only user IDs are used for identification

### Sentry Configuration
- Cookies are removed before sending errors
- Sensitive data is filtered in `lib/analytics/sentry.ts`
- Session replay is limited (10% sample rate)

### User Privacy
- Users can opt-out of analytics in Settings (future feature)
- Data retention: 90 days (PostHog free tier)
- No cross-site tracking

---

## 12. Cost Estimates

### PostHog Free Tier
- 1 million events/month (should be sufficient for beta)
- 90-day data retention
- Unlimited funnels & insights

### Sentry Free Tier
- 5,000 errors/month
- 30-day data retention

### Upgrade Thresholds
- PostHog: Upgrade when >1M events/month (expect ~Month 3-4)
- Sentry: Upgrade when >5K errors/month (indicates serious issues)

---

## 13. Next Steps

After setup is complete:
1. ✅ Install PostHog & Sentry
2. ✅ Add tracking to all key events
3. 🔄 Create funnels in PostHog dashboard (YOU ARE HERE)
4. ⏳ Test all events work correctly
5. ⏳ Set up Sentry alerts
6. ⏳ Create main monitoring dashboard
7. ⏳ Document baseline metrics before launch

---

**Questions?** Check PostHog docs: https://posthog.com/docs
**Questions?** Check Sentry docs: https://docs.sentry.io/

**Last Updated:** October 12, 2025
**Owner:** SubSavvyAI Team
