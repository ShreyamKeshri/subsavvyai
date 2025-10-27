# Analytics Events & Funnels

**Last Updated:** October 27, 2025
**Analytics Platform:** PostHog
**Total Events:** 41 unique events
**Critical Revenue Events:** 3 (affiliate tracking)

---

## Table of Contents

1. [Event Categories](#event-categories)
2. [All Events Reference](#all-events-reference)
3. [Key Funnels](#key-funnels)
4. [PostHog Dashboard Setup](#posthog-dashboard-setup)
5. [Revenue Tracking](#revenue-tracking)
6. [Implementation Guide](#implementation-guide)

---

## Event Categories

### 🎯 North Star Metric
- **savings_delivered** - Total savings delivered to users (Monthly tracked)

### 👤 User Lifecycle (6 events)
- user_signup
- user_login
- onboarding_step_completed
- onboarding_completed
- user_activated
- session_started

### 💳 Subscription Management (5 events)
- subscription_added
- subscription_edited
- subscription_deleted
- subscription_cancelled
- subscription_reactivated

### 🔗 OAuth & Data Collection (6 events)
- spotify_connected
- spotify_disconnected
- oauth_started
- oauth_failed
- usage_data_collected
- time_to_first_subscription

### 🤖 AI Recommendations (5 events)
- recommendation_viewed
- recommendation_dismissed
- recommendation_action_taken
- downgrade_recommendation_generated
- bundle_recommendation_generated

### 💰 Revenue & Affiliates (4 events)
- affiliate_viewed
- affiliate_clicked
- paywall_viewed
- upgrade_clicked

### 💵 Savings Tracking (2 events)
- savings_dashboard_viewed
- savings_shared

### 💬 Feedback & Engagement (1 event)
- feedback_modal_opened

### 🎨 UX & Engagement (8 events)
- dashboard_viewed
- dashboard_interaction
- feature_used
- cta_clicked
- empty_state_viewed
- form_abandoned
- search_performed
- $pageview (auto-tracked)

### 🔔 Monetization (3 events)
- subscription_purchased
- subscription_cancelled
- savings_delivered

### ⚠️ Error Tracking (3 events)
- error_occurred
- feature_error
- api_performance

---

## All Events Reference

### 1. User Signup & Onboarding

#### `user_signup`
**Trigger:** User completes signup flow
**Properties:**
```typescript
{
  method: 'email' | 'google' | 'phone',
  userId: string
}
```
**Importance:** 🔴 Critical (Funnel start)

---

#### `user_login`
**Trigger:** User logs in
**Properties:**
```typescript
{
  method: 'email' | 'google' | 'phone',
  userId: string
}
```
**Importance:** 🟡 Medium

---

#### `onboarding_step_completed`
**Trigger:** User completes each onboarding step
**Properties:**
```typescript
{
  step: string,
  userId: string,
  ...metadata
}
```
**Importance:** 🔴 Critical (Activation funnel)

---

#### `onboarding_completed`
**Trigger:** User finishes entire onboarding
**Properties:**
```typescript
{
  userId: string
}
```
**Importance:** 🔴 Critical (Activation milestone)

---

#### `user_activated`
**Trigger:** User reaches activation criteria
**Properties:**
```typescript
{
  userId: string,
  subscriptionsAdded: number,
  oauthConnected: boolean,
  firstRecommendationViewed: boolean,
  timeToActivation: number // seconds from signup
}
```
**Importance:** 🔴 Critical (North Star)
**Activation Criteria:**
- Added ≥1 subscription
- OR connected OAuth
- OR viewed first recommendation

---

#### `session_started`
**Trigger:** User starts a new session
**Properties:**
```typescript
{
  userId: string,
  isReturningUser: boolean,
  daysSinceLastVisit?: number,
  sessionNumber: number
}
```
**Importance:** 🟢 High (Retention)

---

### 2. Subscription Management

#### `subscription_added`
**Trigger:** User adds a subscription
**Properties:**
```typescript
{
  subscriptionId: string,
  serviceName: string,
  cost: number,
  billingCycle: string,
  isCustom: boolean
}
```
**Importance:** 🔴 Critical (Activation signal)

---

#### `subscription_edited`
**Trigger:** User edits a subscription
**Properties:**
```typescript
{
  subscriptionId: string
}
```
**Importance:** 🟡 Medium

---

#### `subscription_deleted`
**Trigger:** User deletes a subscription
**Properties:**
```typescript
{
  subscriptionId: string
}
```
**Importance:** 🟡 Medium (Churn signal if all deleted)

---

#### `subscription_cancelled`
**Trigger:** User cancels a subscription with reason (starts savings tracking)
**Properties:**
```typescript
{
  subscriptionId: string,
  serviceName: string,
  reason: 'not_using' | 'too_expensive' | 'found_alternative' | 'downgraded' | 'temporary' | 'other',
  monthlyCost: number,
  billingCycle: string
}
```
**Importance:** 🔴 Critical (Savings tracking start, engagement signal)

---

#### `subscription_reactivated`
**Trigger:** User reactivates a previously cancelled subscription
**Properties:**
```typescript
{
  subscriptionId: string,
  serviceName: string
}
```
**Importance:** 🟡 Medium (User behavior insight)

---

### 3. OAuth & Usage Tracking

#### `spotify_connected`
**Trigger:** User successfully connects Spotify
**Properties:**
```typescript
{
  userId: string
}
```
**Importance:** 🔴 Critical (Data collection)

---

#### `spotify_disconnected`
**Trigger:** User disconnects Spotify
**Properties:**
```typescript
{
  userId: string
}
```
**Importance:** 🟡 Medium (Churn signal)

---

#### `oauth_started`
**Trigger:** User initiates OAuth flow
**Properties:**
```typescript
{
  service: string,
  userId: string
}
```
**Importance:** 🟢 High (Funnel tracking)

---

#### `oauth_failed`
**Trigger:** OAuth flow fails
**Properties:**
```typescript
{
  service: string,
  error: string,
  stage: 'authorization' | 'callback' | 'token_refresh',
  userId?: string
}
```
**Importance:** 🔴 Critical (Error monitoring)

---

#### `usage_data_collected`
**Trigger:** Usage data successfully fetched
**Properties:**
```typescript
{
  serviceId: string,
  serviceName: string,
  method: 'oauth' | 'manual',
  usageHours: number,
  userId: string
}
```
**Importance:** 🟢 High (Data quality)

---

#### `time_to_first_subscription`
**Trigger:** User adds first subscription
**Properties:**
```typescript
{
  userId: string,
  timeInSeconds: number,
  timeInMinutes: number
}
```
**Importance:** 🔴 Critical (Onboarding optimization)

---

### 4. AI Recommendations

#### `recommendation_viewed`
**Trigger:** User views a recommendation
**Properties:**
```typescript
{
  recommendationType: 'downgrade' | 'cancel' | 'bundle' | 'overlap',
  recommendationId: string,
  potentialSavings: number
}
```
**Importance:** 🔴 Critical (Value delivery)

---

#### `recommendation_dismissed`
**Trigger:** User dismisses a recommendation
**Properties:**
```typescript
{
  recommendationId: string,
  type: string
}
```
**Importance:** 🟢 High (ML feedback)

---

#### `recommendation_action_taken`
**Trigger:** User acts on recommendation
**Properties:**
```typescript
{
  recommendationId: string,
  recommendationType: 'downgrade' | 'cancel' | 'bundle' | 'overlap',
  action: 'accepted' | 'dismissed' | 'snoozed',
  savingsRealized?: number
}
```
**Importance:** 🔴 Critical (Value delivered)

---

#### `downgrade_recommendation_generated`
**Trigger:** AI generates downgrade recommendation
**Properties:**
```typescript
{
  serviceName: string,
  currentPlan: string,
  recommendedPlan: string,
  potentialSavings: number,
  usageHours: number,
  confidence: number
}
```
**Importance:** 🟢 High (Algorithm monitoring)

---

#### `bundle_recommendation_generated`
**Trigger:** AI generates bundle recommendation
**Properties:**
```typescript
{
  userId: string,
  bundlesFound: number,
  totalSavings: number
}
```
**Importance:** 🟢 High (Revenue opportunity)

---

### 5. Revenue & Affiliate Tracking

#### `affiliate_viewed`
**Trigger:** Bundle recommendation displayed
**Properties:**
```typescript
{
  bundleId: string,
  bundleName: string,
  position: number,
  potentialSavings: number
}
```
**Importance:** 🔴 Critical (Revenue funnel)

---

#### `affiliate_clicked`
**Trigger:** User clicks affiliate link
**Properties:**
```typescript
{
  bundleId: string,
  bundleName: string,
  provider: string,
  cost: number,
  estimatedSavings: number,
  affiliateUrl: string
}
```
**Importance:** 🔴 CRITICAL (Revenue tracking)
**Revenue Impact:** ₹500-1,000 per conversion

---

#### `paywall_viewed`
**Trigger:** Free user hits paywall
**Properties:**
```typescript
{
  feature: string,
  userId: string,
  ...metadata
}
```
**Importance:** 🔴 Critical (Monetization funnel)

---

#### `upgrade_clicked`
**Trigger:** User clicks upgrade button
**Properties:**
```typescript
{
  source: string,
  plan: 'monthly' | 'yearly',
  userId: string
}
```
**Importance:** 🔴 Critical (Revenue funnel)

---

### 6. Feedback System

#### `feedback_modal_opened`
**Trigger:** User opens Canny feedback modal
**Properties:**
```typescript
{
  source: 'floating_button',
  has_user: boolean,
  user_id: string
}
```
**Importance:** 🟢 High (Product iteration)

---

### 7. Savings Tracking

#### `savings_dashboard_viewed`
**Trigger:** User views the savings dashboard
**Properties:**
```typescript
{
  totalLifetimeSavings: number,
  totalYearToDateSavings: number,
  cancelledCount: number,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}
```
**Importance:** 🟢 High (Feature engagement, retention)

---

#### `savings_shared`
**Trigger:** User shares their savings achievement
**Properties:**
```typescript
{
  method: 'clipboard' | 'whatsapp' | 'native',
  yearToDateSavings: number,
  lifetimeSavings: number
}
```
**Importance:** 🔴 Critical (Viral growth loop)

---

### 8. Engagement & UX

#### `dashboard_viewed`
**Trigger:** User views dashboard
**Properties:** None
**Importance:** 🟢 High (Engagement)

---

#### `dashboard_interaction`
**Trigger:** User interacts with dashboard
**Properties:**
```typescript
{
  action: string,
  ...metadata
}
```
**Importance:** 🟡 Medium

---

#### `feature_used`
**Trigger:** User uses a feature
**Properties:**
```typescript
{
  featureName: string,
  ...metadata
}
```
**Importance:** 🟡 Medium

---

#### `cta_clicked`
**Trigger:** User clicks a CTA
**Properties:**
```typescript
{
  cta: string,
  location: string,
  destination: string
}
```
**Importance:** 🟢 High (Conversion optimization)

---

#### `empty_state_viewed`
**Trigger:** User sees empty state
**Properties:**
```typescript
{
  location: string,
  cta: string
}
```
**Importance:** 🟡 Medium (UX optimization)

---

#### `form_abandoned`
**Trigger:** User leaves form incomplete
**Properties:**
```typescript
{
  formName: string,
  step: string,
  userId?: string
}
```
**Importance:** 🟢 High (UX friction)

---

#### `search_performed`
**Trigger:** User searches for service
**Properties:**
```typescript
{
  query: string,
  results: number,
  userId?: string
}
```
**Importance:** 🟡 Medium (Feature discovery)

---

### 8. Monetization

#### `subscription_purchased`
**Trigger:** User purchases Pro plan
**Properties:**
```typescript
{
  plan: 'monthly' | 'yearly',
  amount: number,
  userId: string,
  paymentMethod?: string
}
```
**Importance:** 🔴 CRITICAL (Revenue)

---

#### `subscription_cancelled`
**Trigger:** User cancels Pro plan
**Properties:**
```typescript
{
  userId: string,
  reason: string,
  ...metadata
}
```
**Importance:** 🔴 Critical (Churn)

---

#### `savings_delivered`
**Trigger:** Tracked monthly (batch job)
**Properties:**
```typescript
{
  userId: string,
  totalPotentialSavings: number,
  realizedSavings: number,
  savingsByType: {
    downgrade: number,
    cancel: number,
    bundle: number,
    overlap: number
  }
}
```
**Importance:** 🔴 CRITICAL (North Star Metric)

---

### 9. Error Tracking

#### `error_occurred`
**Trigger:** General error happens
**Properties:**
```typescript
{
  errorName: string,
  errorMessage: string,
  ...context
}
```
**Importance:** 🟢 High

---

#### `feature_error`
**Trigger:** Specific feature error
**Properties:**
```typescript
{
  feature: string,
  errorType: string,
  errorMessage: string,
  userId?: string,
  context?: Record<string, unknown>
}
```
**Importance:** 🟢 High

---

#### `api_performance`
**Trigger:** API call completes
**Properties:**
```typescript
{
  endpoint: string,
  duration: number,
  statusCode: number,
  method?: string
}
```
**Importance:** 🟡 Medium (Performance monitoring)

---

## Key Funnels

### 1. 🎯 Activation Funnel (CRITICAL)

**Goal:** Get users to activated state
**Target:** 60% activation rate

```
user_signup
  ↓
onboarding_step_completed (step: "welcome")
  ↓
onboarding_step_completed (step: "add_subscription")
  ↓
subscription_added
  ↓
onboarding_step_completed (step: "connect_spotify")
  ↓ (Optional)
spotify_connected
  ↓
onboarding_completed
  ↓
user_activated
```

**PostHog Setup:**
1. Go to **Insights** → **New Insight** → **Funnel**
2. Add events in order (above)
3. Set conversion window: **7 days**
4. Group by: `method` (email vs Google)
5. Save as: **"Activation Funnel"**

**Key Metrics:**
- Overall conversion rate
- Drop-off at each step
- Time to complete each step
- Breakdown by signup method

---

### 2. 💰 Affiliate Revenue Funnel (REVENUE CRITICAL)

**Goal:** Track affiliate link clicks to conversions
**Target:** 5% click-to-conversion rate

```
bundle_recommendation_generated
  ↓
affiliate_viewed
  ↓
affiliate_clicked
  ↓
[External: User signs up on provider site]
  ↓
[Revenue: ₹500-1,000 per conversion]
```

**PostHog Setup:**
1. **Insights** → **Funnel**
2. Events: `affiliate_viewed` → `affiliate_clicked`
3. Filter by: `provider` (Jio, Airtel, Vi)
4. Conversion window: **30 days**
5. Save as: **"Affiliate Conversion Funnel"**

**Additional Tracking:**
1. Create **Action**: "Affiliate Click" (revenue critical)
2. Tag with `$revenue` property when conversion confirmed
3. Set up **Webhook** to affiliate network (if available)

**Key Metrics:**
- Views-to-clicks rate (target: 15%)
- Click-to-conversion (external tracking needed)
- Revenue per bundle type
- Best performing providers

---

### 3. 🤖 AI Recommendation Engagement Funnel

**Goal:** Users act on AI recommendations
**Target:** 25% action rate

```
downgrade_recommendation_generated
  ↓
recommendation_viewed
  ↓
recommendation_action_taken (action: "accepted")
  ↓
savings_delivered
```

**PostHog Setup:**
1. **Insights** → **Funnel**
2. Events: (above sequence)
3. Filter by: `recommendationType`
4. Conversion window: **30 days**
5. Save as: **"Recommendation Action Funnel"**

**Key Metrics:**
- View rate (% who see recommendations)
- Action rate (% who act)
- Savings realized
- Breakdown by recommendation type

---

### 4. 🎵 Spotify OAuth Connection Funnel

**Goal:** Maximize OAuth connections
**Target:** 40% connection rate

```
subscription_added (serviceName: "Spotify")
  ↓
oauth_started (service: "spotify")
  ↓
spotify_connected
  ↓
usage_data_collected (method: "oauth")
  ↓
downgrade_recommendation_generated
```

**PostHog Setup:**
1. **Insights** → **Funnel**
2. Events: (above sequence)
3. Include: `oauth_failed` as drop-off point
4. Conversion window: **7 days**
5. Save as: **"Spotify OAuth Funnel"**

**Key Metrics:**
- Connection rate
- Failure rate and reasons
- Time to first recommendation after connection

---

### 5. 💵 Freemium-to-Pro Conversion Funnel (Month 2)

**Goal:** Convert free users to Pro
**Target:** 3% monthly conversion

```
user_activated
  ↓
paywall_viewed
  ↓
upgrade_clicked
  ↓
subscription_purchased
```

**PostHog Setup:**
1. **Insights** → **Funnel**
2. Events: (above sequence)
3. Filter by: `plan` (monthly vs yearly)
4. Conversion window: **30 days**
5. Save as: **"Pro Upgrade Funnel"**

**Key Metrics:**
- Paywall view rate
- Click-through rate
- Purchase completion rate
- Monthly vs yearly preference

---

### 6. 📊 Retention & Engagement Funnel

**Goal:** Keep users engaged
**Target:** 40% Day 7 retention

```
user_signup
  ↓
session_started (sessionNumber: 2) [Day 1]
  ↓
session_started (sessionNumber: 3+) [Day 3]
  ↓
session_started (sessionNumber: 5+) [Day 7]
  ↓
dashboard_viewed [Day 30]
```

**PostHog Setup:**
1. **Insights** → **Retention**
2. Initial event: `user_signup`
3. Return event: `session_started`
4. Retention type: **Unbounded**
5. Group by: Cohort week
6. Save as: **"User Retention"**

**Key Metrics:**
- Day 1, 3, 7, 14, 30 retention
- Average sessions per user
- Average session length

---

### 7. 💬 Feedback Engagement Funnel

**Goal:** Collect user feedback
**Target:** 10% users provide feedback

```
user_activated
  ↓
dashboard_viewed
  ↓
feedback_modal_opened
  ↓
[External: Canny post created]
```

**PostHog Setup:**
1. **Insights** → **Funnel**
2. Events: `dashboard_viewed` → `feedback_modal_opened`
3. Conversion window: **30 days**
4. Save as: **"Feedback Engagement"**

**Key Metrics:**
- Modal open rate
- Conversion to post (track externally via Canny)
- Feedback quality (manual review)

---

## PostHog Dashboard Setup

### Dashboard 1: Executive Overview

**Widgets:**

1. **Total Users** (Trend)
   - Metric: Unique users (all time)
   - Breakdown: By signup method

2. **Monthly Active Users** (Trend)
   - Metric: Unique users with `session_started` (last 30 days)

3. **Activation Rate** (Number)
   - Formula: `user_activated` / `user_signup` × 100
   - Target: 60%

4. **Total Savings Delivered** (Number)
   - Metric: Sum of `savings_delivered.totalPotentialSavings`
   - Period: All time
   - **North Star Metric**

5. **Affiliate Clicks** (Trend)
   - Event: `affiliate_clicked`
   - Period: Last 90 days
   - **Revenue Critical**

6. **Recommendation Action Rate** (Number)
   - Formula: `recommendation_action_taken` / `recommendation_viewed` × 100
   - Target: 25%

---

### Dashboard 2: Activation & Onboarding

**Widgets:**

1. **Activation Funnel** (Funnel)
   - [Use Funnel 1 setup]

2. **Time to First Subscription** (Distribution)
   - Event: `time_to_first_subscription`
   - Property: `timeInMinutes`
   - Target median: <5 minutes

3. **Onboarding Completion Rate** (Number)
   - Formula: `onboarding_completed` / `user_signup` × 100

4. **Drop-off by Step** (Funnel breakdown)
   - Show conversion rate at each onboarding step

5. **Spotify Connection Rate** (Number)
   - Formula: `spotify_connected` / `subscription_added` (where serviceName = "Spotify") × 100

---

### Dashboard 3: Revenue & Monetization

**Widgets:**

1. **Affiliate Revenue Funnel** (Funnel)
   - [Use Funnel 2 setup]

2. **Affiliate Clicks by Provider** (Bar chart)
   - Event: `affiliate_clicked`
   - Breakdown: `provider`

3. **Average Potential Savings per Click** (Number)
   - Event: `affiliate_clicked`
   - Property: Average `estimatedSavings`

4. **Pro Upgrade Funnel** (Funnel)
   - [Use Funnel 5 setup]

5. **Monthly Recurring Revenue** (Trend)
   - Event: `subscription_purchased`
   - Property: Sum of `amount`
   - Period: Monthly

6. **Churn Rate** (Number)
   - Formula: `subscription_cancelled` / Total Pro users × 100

---

### Dashboard 4: AI & Recommendations

**Widgets:**

1. **Recommendation Engagement Funnel** (Funnel)
   - [Use Funnel 3 setup]

2. **Recommendations by Type** (Pie chart)
   - Event: `recommendation_viewed`
   - Breakdown: `recommendationType`

3. **Average Savings per Recommendation** (Number)
   - Event: `recommendation_viewed`
   - Property: Average `potentialSavings`

4. **Recommendation Acceptance Rate** (Number)
   - Formula: `recommendation_action_taken` (action="accepted") / `recommendation_viewed` × 100

5. **Downgrade Confidence Distribution** (Histogram)
   - Event: `downgrade_recommendation_generated`
   - Property: `confidence`

---

### Dashboard 5: Engagement & Retention

**Widgets:**

1. **Retention Cohorts** (Retention table)
   - [Use Funnel 6 setup]

2. **Daily/Weekly Active Users** (Trend)
   - Event: `session_started`
   - Period: Last 90 days

3. **Average Sessions per User** (Number)
   - Event: `session_started`
   - Aggregation: Average by user

4. **Feature Usage** (Bar chart)
   - Event: `feature_used`
   - Breakdown: `featureName`

5. **Dashboard Interactions** (Trend)
   - Event: `dashboard_interaction`
   - Period: Last 30 days

---

### Dashboard 6: Product Quality

**Widgets:**

1. **Error Rate** (Trend)
   - Events: `error_occurred`, `feature_error`
   - Period: Last 30 days

2. **OAuth Failure Rate** (Number)
   - Formula: `oauth_failed` / `oauth_started` × 100

3. **API Performance** (Line chart)
   - Event: `api_performance`
   - Property: Average `duration` by `endpoint`

4. **Form Abandonment Rate** (Bar chart)
   - Event: `form_abandoned`
   - Breakdown: `formName`

5. **Empty States Viewed** (List)
   - Event: `empty_state_viewed`
   - Top 10 by `location`

---

## Revenue Tracking

### Critical Revenue Events

#### 1. Affiliate Clicks (Primary Revenue - Month 1-3)

**Event:** `affiliate_clicked`

**Revenue Calculation:**
```typescript
// Expected commission: ₹500-1,000 per signup
// Conversion rate: 5% (estimated)
// Revenue per click: ₹25-50

Monthly Revenue = Affiliate Clicks × Conversion Rate × Avg Commission
Example: 1000 clicks × 5% × ₹750 = ₹37,500/month
```

**Tracking Setup:**
1. PostHog Action: "Affiliate Click"
2. Tag with provider for attribution
3. External tracking via affiliate network dashboard
4. Reconcile monthly with actual payouts

---

#### 2. Pro Subscriptions (Month 2+)

**Event:** `subscription_purchased`

**Revenue Calculation:**
```typescript
// Pro Monthly: ₹99/month
// Pro Yearly: ₹999/year (₹83/month effective)

MRR = (Monthly subscribers × ₹99) + (Yearly subscribers × ₹83)
ARR = MRR × 12
```

**Tracking Setup:**
1. Set `amount` property on purchase
2. Track monthly vs yearly preference
3. Monitor churn rate via `subscription_cancelled`

---

#### 3. Savings Delivered (Value Metric - Not Revenue)

**Event:** `savings_delivered`

**Value Calculation:**
```typescript
// North Star Metric: Total savings delivered to users
// Target: ₹10,000/year per user

Total Value Delivered = Σ(savings_delivered.totalPotentialSavings)
Average per User = Total Value / Active Users
```

**Tracking Setup:**
1. Monthly batch job to calculate
2. Separate by savings type (downgrade, cancel, bundle, overlap)
3. Use for marketing ("₹5 crore saved for users!")

---

## Implementation Guide

### Step 1: Verify Event Tracking

All events are implemented in:
- **Client-side:** `lib/analytics/events.ts`
- **Server-side:** `lib/analytics/server-events.ts`

**Test Events:**
```typescript
// In browser console on localhost
posthog.capture('test_event', { test: true })

// Verify in PostHog → Live Events
```

---

### Step 2: Create Dashboards

1. Log into PostHog: https://app.posthog.com
2. Navigate to **Dashboards** → **New Dashboard**
3. Create 6 dashboards (Executive, Activation, Revenue, AI, Engagement, Quality)
4. Add widgets as described above
5. Share dashboard links with team

---

### Step 3: Set Up Funnels

For each of the 7 funnels:
1. **Insights** → **New Insight** → **Funnel**
2. Add events in sequence
3. Set conversion window
4. Configure filters
5. Save to appropriate dashboard
6. Set up alerts for drop-offs >50%

---

### Step 4: Configure Alerts

**Critical Alerts:**

1. **Activation Drop**: Activation rate <40% (daily check)
2. **Affiliate Clicks Drop**: 20% decrease week-over-week
3. **Error Spike**: Error rate >5% (hourly check)
4. **OAuth Failures**: Failure rate >10%

**Setup:**
1. **Project Settings** → **Alerts**
2. Configure Slack/Email notifications
3. Set thresholds based on historical data

---

### Step 5: Weekly Review

**Monday Review Checklist:**
- [ ] Activation rate (target: 60%)
- [ ] MAU growth (target: 20% MoM)
- [ ] Affiliate clicks (target: 100/week initially)
- [ ] Recommendation action rate (target: 25%)
- [ ] Day 7 retention (target: 40%)
- [ ] Error rate (target: <2%)

---

## Event Naming Convention

**Pattern:** `{object}_{action}`

**Examples:**
- ✅ `user_signup` (object: user, action: signup)
- ✅ `subscription_added` (object: subscription, action: added)
- ✅ `recommendation_viewed` (object: recommendation, action: viewed)
- ❌ `signup` (missing object)
- ❌ `new_user` (unclear action)

**Properties:** camelCase
**Values:** lowercase with underscores

---

## Migration & Versioning

**Current Version:** v1.0 (October 2025)

**Future Additions (Month 2):**
- `content_overlap_detected`
- `price_hike_detected`
- `notification_sent`
- `notification_clicked`
- `export_data_requested`
- `account_deleted`

**Deprecation Policy:**
- Events are never deleted, only deprecated
- Mark deprecated events in code comments
- Keep tracking for 6 months after deprecation
- Archive after 6 months

---

## Resources

**PostHog Documentation:**
- Funnels: https://posthog.com/docs/user-guides/funnels
- Dashboards: https://posthog.com/docs/user-guides/dashboards
- Actions: https://posthog.com/docs/user-guides/actions

**Internal Resources:**
- Implementation: `lib/analytics/events.ts`
- Server tracking: `lib/analytics/server-events.ts`
- Provider setup: `lib/analytics/posthog-provider.tsx`

**Contact:** analytics@subsavvyai.com

---

**Last Review:** October 19, 2025
**Next Review:** November 1, 2025 (post-launch)
**Owner:** Shreyam Keshri
