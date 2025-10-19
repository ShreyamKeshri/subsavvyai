# PostHog Dashboard Setup Guide

**Complete step-by-step guide to set up all analytics dashboards and funnels**

**Time Required:** 60-90 minutes
**Prerequisite:** PostHog account with project created

---

## Quick Access Links

After setup, bookmark these:
- **Live Events:** https://app.posthog.com/project/{your-project-id}/events
- **Dashboards:** https://app.posthog.com/project/{your-project-id}/dashboard
- **Insights:** https://app.posthog.com/project/{your-project-id}/insights
- **Funnels:** https://app.posthog.com/project/{your-project-id}/insights?insight=FUNNELS

---

## Part 1: Create Dashboards (10 minutes)

### Step 1: Create 6 Dashboards

1. Go to **Dashboards** (left sidebar)
2. Click **New Dashboard** (top right)
3. Create each dashboard:

**Dashboard 1: Executive Overview**
- Name: `📊 Executive Overview`
- Description: `High-level metrics for leadership`
- Tags: `executive`, `metrics`

**Dashboard 2: Activation & Onboarding**
- Name: `🎯 Activation & Onboarding`
- Description: `User onboarding and activation metrics`
- Tags: `activation`, `onboarding`

**Dashboard 3: Revenue & Monetization**
- Name: `💰 Revenue & Monetization`
- Description: `Affiliate clicks, conversions, and Pro subscriptions`
- Tags: `revenue`, `monetization`

**Dashboard 4: AI & Recommendations**
- Name: `🤖 AI & Recommendations`
- Description: `AI recommendation performance and engagement`
- Tags: `ai`, `recommendations`

**Dashboard 5: Engagement & Retention**
- Name: `📈 Engagement & Retention`
- Description: `User retention and feature usage`
- Tags: `engagement`, `retention`

**Dashboard 6: Product Quality**
- Name: `🔧 Product Quality`
- Description: `Errors, performance, and UX friction`
- Tags: `quality`, `errors`

---

## Part 2: Set Up Critical Funnels (30 minutes)

### Funnel 1: Activation Funnel 🎯

**Goal:** Track user activation from signup to first value

1. Go to **Insights** → Click **+ New Insight**
2. Select **Funnels** tab
3. Configure:

**Step 1:** Add Event
- Event: `user_signup`
- Label: "Sign Up"

**Step 2:** Add Event
- Event: `onboarding_step_completed`
- Filter: `step` equals `"welcome"`
- Label: "Welcome Step"

**Step 3:** Add Event
- Event: `onboarding_step_completed`
- Filter: `step` equals `"add_subscription"`
- Label: "Add Subscription Step"

**Step 4:** Add Event
- Event: `subscription_added`
- Label: "First Subscription Added"

**Step 5:** Add Event
- Event: `onboarding_completed`
- Label: "Onboarding Complete"

**Step 6:** Add Event
- Event: `user_activated`
- Label: "User Activated ✅"

**Settings:**
- Conversion window: `7 days`
- Breakdown by: `method` (to compare email vs Google signup)
- Layout: Click **Layout** → Select "Horizontal" for better visualization

**Save:**
- Click **Save** → Add to Dashboard: `🎯 Activation & Onboarding`
- Name: "Activation Funnel"
- Description: "Complete user activation flow from signup to first value"

**Set Alert:**
- Click **⋮** (three dots) → **Create alert**
- Alert when: "Conversion drops below 60%"
- Check: "Daily"
- Notify: Your email

---

### Funnel 2: Affiliate Revenue Funnel 💰

**Goal:** Track affiliate link views to clicks (revenue critical)

1. **Insights** → **+ New Insight** → **Funnels**

**Step 1:** Add Event
- Event: `bundle_recommendation_generated`
- Label: "Bundle Recommended"

**Step 2:** Add Event
- Event: `affiliate_viewed`
- Label: "Affiliate Viewed"

**Step 3:** Add Event
- Event: `affiliate_clicked`
- Label: "Affiliate Clicked 💰"

**Settings:**
- Conversion window: `30 days`
- Breakdown by: `provider` (Jio, Airtel, Vi)
- Layout: Horizontal

**Save:**
- Add to Dashboard: `💰 Revenue & Monetization`
- Name: "Affiliate Conversion Funnel"
- Description: "Critical revenue funnel - tracks affiliate clicks"

**Set Alert:**
- Alert when: "Step 2→3 conversion drops below 10%"
- Check: "Daily"
- Notify: Your email + Slack (if configured)

---

### Funnel 3: AI Recommendation Engagement 🤖

**Goal:** Track recommendation generation to user action

1. **Insights** → **+ New Insight** → **Funnels**

**Step 1:** Add Event
- Event: `downgrade_recommendation_generated`
- Label: "Recommendation Generated"

**Step 2:** Add Event
- Event: `recommendation_viewed`
- Label: "Recommendation Viewed"

**Step 3:** Add Event
- Event: `recommendation_action_taken`
- Filter: `action` equals `"accepted"`
- Label: "Action Taken (Accepted)"

**Step 4:** Add Event
- Event: `savings_delivered`
- Label: "Savings Delivered ✅"

**Settings:**
- Conversion window: `30 days`
- Breakdown by: `recommendationType`
- Layout: Horizontal

**Save:**
- Add to Dashboard: `🤖 AI & Recommendations`
- Name: "Recommendation Action Funnel"
- Description: "User engagement with AI recommendations"

**Set Alert:**
- Alert when: "Step 2→3 conversion drops below 20%"
- Check: "Weekly"

---

### Funnel 4: Spotify OAuth Connection 🎵

**Goal:** Track Spotify connection success rate

1. **Insights** → **+ New Insight** → **Funnels**

**Step 1:** Add Event
- Event: `subscription_added`
- Filter: `serviceName` equals `"Spotify"`
- Label: "Spotify Subscription Added"

**Step 2:** Add Event
- Event: `oauth_started`
- Filter: `service` equals `"spotify"`
- Label: "OAuth Started"

**Step 3:** Add Event
- Event: `spotify_connected`
- Label: "Spotify Connected ✅"

**Step 4:** Add Event
- Event: `usage_data_collected`
- Filter: `method` equals `"oauth"`
- Label: "Usage Data Collected"

**Step 5:** Add Event
- Event: `downgrade_recommendation_generated`
- Label: "First Recommendation"

**Settings:**
- Conversion window: `7 days`
- Exclusion steps: Click **+ Exclusion** → Add `oauth_failed` between steps 2 and 3
- Layout: Horizontal

**Save:**
- Add to Dashboard: `🎯 Activation & Onboarding`
- Name: "Spotify OAuth Funnel"
- Description: "OAuth connection success and data collection"

**Set Alert:**
- Alert when: "Step 2→3 conversion drops below 70%"
- Check: "Daily"

---

### Funnel 5: Freemium-to-Pro Conversion 💵

**Goal:** Track free user upgrade journey (Month 2+)

1. **Insights** → **+ New Insight** → **Funnels**

**Step 1:** Add Event
- Event: `user_activated`
- Label: "User Activated"

**Step 2:** Add Event
- Event: `paywall_viewed`
- Label: "Paywall Viewed"

**Step 3:** Add Event
- Event: `upgrade_clicked`
- Label: "Upgrade Clicked"

**Step 4:** Add Event
- Event: `subscription_purchased`
- Label: "Pro Purchased 💰"

**Settings:**
- Conversion window: `30 days`
- Breakdown by: `plan` (monthly vs yearly)
- Layout: Horizontal

**Save:**
- Add to Dashboard: `💰 Revenue & Monetization`
- Name: "Pro Upgrade Funnel"
- Description: "Free to Pro conversion journey"

**Set Alert:**
- Alert when: "Overall conversion drops below 2%"
- Check: "Weekly"

---

### Funnel 6: Time to First Subscription ⏱️

**Goal:** Optimize onboarding speed

1. **Insights** → **+ New Insight** → **Funnels**

**Step 1:** Add Event
- Event: `user_signup`
- Label: "Sign Up"

**Step 2:** Add Event
- Event: `subscription_added`
- Label: "First Subscription Added"

**Settings:**
- Conversion window: `1 day`
- Show: "Time to convert" (click **⋮** → **Show time to convert**)
- Layout: Horizontal

**Save:**
- Add to Dashboard: `🎯 Activation & Onboarding`
- Name: "Time to First Subscription"
- Description: "How fast do users add their first subscription?"

**Goal:** Median time <5 minutes

---

### Funnel 7: Feedback Engagement 💬

**Goal:** Track user feedback participation

1. **Insights** → **+ New Insight** → **Funnels**

**Step 1:** Add Event
- Event: `user_activated`
- Label: "User Activated"

**Step 2:** Add Event
- Event: `dashboard_viewed`
- Label: "Dashboard Viewed"

**Step 3:** Add Event
- Event: `feedback_modal_opened`
- Label: "Feedback Modal Opened"

**Settings:**
- Conversion window: `30 days`
- Layout: Horizontal

**Save:**
- Add to Dashboard: `📈 Engagement & Retention`
- Name: "Feedback Engagement"
- Description: "User feedback participation rate"

**Goal:** 10% of active users provide feedback

---

## Part 3: Build Dashboard Widgets (30 minutes)

### Dashboard 1: Executive Overview

**Widget 1: Total Users (Trend)**

1. Go to Dashboard: `📊 Executive Overview`
2. Click **+ Add Insight**
3. Select **Trends**
4. Configure:
   - Event: `user_signup`
   - Show: "Unique users"
   - Breakdown by: `method`
   - Date range: "All time"
   - Chart type: Line chart
5. Save as: "Total Users"

---

**Widget 2: Monthly Active Users (Number)**

1. **+ Add Insight** → **Trends**
2. Configure:
   - Event: `session_started`
   - Show: "Unique users"
   - Date range: "Last 30 days"
   - Display: Change to "Number" (big number widget)
3. Save as: "Monthly Active Users (MAU)"

---

**Widget 3: Activation Rate (Number)**

1. **+ Add Insight** → **Trends**
2. Configure:
   - Formula mode: Click **+ Add graph series** → **Formula**
   - Series A: `user_activated` (Unique users)
   - Series B: `user_signup` (Unique users)
   - Formula: `A / B * 100`
   - Date range: "Last 30 days"
   - Display: Number with "%" suffix
3. Save as: "Activation Rate"
4. Add target line: 60%

---

**Widget 4: Total Savings Delivered (Number)**

1. **+ Add Insight** → **Trends**
2. Configure:
   - Event: `savings_delivered`
   - Property: `totalPotentialSavings`
   - Aggregation: "Sum"
   - Date range: "All time"
   - Display: Number with "₹" prefix
3. Save as: "💰 Total Savings Delivered (North Star)"

---

**Widget 5: Affiliate Clicks This Month (Trend)**

1. **+ Add Insight** → **Trends**
2. Configure:
   - Event: `affiliate_clicked`
   - Show: "Total count"
   - Date range: "Last 90 days"
   - Chart type: Bar chart
   - Breakdown by: `provider`
3. Save as: "Affiliate Clicks by Provider"

---

**Widget 6: Recommendation Action Rate (Number)**

1. **+ Add Insight** → **Trends**
2. Configure:
   - Formula mode
   - Series A: `recommendation_action_taken` (filter: `action` = "accepted")
   - Series B: `recommendation_viewed`
   - Formula: `A / B * 100`
   - Date range: "Last 30 days"
   - Display: Number with "%" suffix
3. Save as: "Recommendation Action Rate"
4. Target: 25%

---

### Dashboard 2: Activation & Onboarding

Add these widgets:

1. **Activation Funnel** (already created in Funnel 1)
2. **Spotify OAuth Funnel** (already created in Funnel 4)
3. **Time to First Subscription** (already created in Funnel 6)

**Widget 4: Onboarding Completion Rate**

1. **+ Add Insight** → **Trends**
2. Formula: `onboarding_completed` / `user_signup` × 100
3. Date range: "Last 30 days"
4. Display: Number with "%"

**Widget 5: Signup Method Breakdown (Pie)**

1. **+ Add Insight** → **Trends**
2. Event: `user_signup`
3. Show: "Total count"
4. Breakdown by: `method`
5. Chart type: Pie chart
6. Date range: "Last 30 days"

---

### Dashboard 3: Revenue & Monetization

Add these widgets:

1. **Affiliate Conversion Funnel** (Funnel 2)
2. **Pro Upgrade Funnel** (Funnel 5)

**Widget 3: Affiliate Clicks by Provider (Bar)**

1. Event: `affiliate_clicked`
2. Breakdown: `provider`
3. Chart type: Bar chart (horizontal)
4. Show top 10

**Widget 4: Average Savings per Affiliate Click**

1. Event: `affiliate_clicked`
2. Property: `estimatedSavings`
3. Aggregation: "Average"
4. Display: Number with "₹" prefix

**Widget 5: MRR (Number)** - For Month 2+

1. Event: `subscription_purchased`
2. Property: `amount`
3. Aggregation: "Sum"
4. Date range: "Last 30 days"
5. Display: Number with "₹" prefix

---

### Dashboard 4: AI & Recommendations

Add these widgets:

1. **Recommendation Action Funnel** (Funnel 3)

**Widget 2: Recommendations by Type (Pie)**

1. Event: `recommendation_viewed`
2. Breakdown: `recommendationType`
3. Chart type: Pie chart
4. Date range: "Last 30 days"

**Widget 3: Average Potential Savings (Number)**

1. Event: `recommendation_viewed`
2. Property: `potentialSavings`
3. Aggregation: "Average"
4. Display: Number with "₹" prefix

**Widget 4: Recommendation Volume (Trend)**

1. Event: `recommendation_viewed`
2. Show: "Total count"
3. Chart type: Line chart
4. Date range: "Last 90 days"

---

### Dashboard 5: Engagement & Retention

**Widget 1: Retention Cohorts (Retention Table)**

1. **+ Add Insight** → **Retention**
2. Configure:
   - Target event: `user_signup`
   - Returning event: `session_started`
   - Retention type: "Unbounded"
   - Date range: "Last 8 weeks"
3. Save as: "User Retention by Cohort"

**Widget 2: Daily Active Users (Trend)**

1. Event: `session_started`
2. Show: "Unique users"
3. Date range: "Last 30 days"
4. Chart type: Line chart

**Widget 3: Average Sessions per User**

1. Event: `session_started`
2. Show: "Total count"
3. Aggregation: "Average" (per distinct user)
4. Date range: "Last 30 days"
5. Display: Number

**Widget 4: Feature Usage (Bar)**

1. Event: `feature_used`
2. Breakdown: `featureName`
3. Chart type: Horizontal bar
4. Show top 10
5. Date range: "Last 30 days"

---

### Dashboard 6: Product Quality

**Widget 1: Error Rate (Trend)**

1. Events: `error_occurred` + `feature_error`
2. Show: "Total count"
3. Chart type: Line chart
4. Date range: "Last 30 days"
5. Alert: >100 errors/day

**Widget 2: OAuth Failure Rate**

1. Formula: `oauth_failed` / `oauth_started` × 100
2. Date range: "Last 30 days"
3. Display: Number with "%"
4. Target: <10%

**Widget 3: API Performance (Line)**

1. Event: `api_performance`
2. Property: `duration`
3. Aggregation: "Average"
4. Breakdown: `endpoint`
5. Chart type: Line chart

**Widget 4: Form Abandonment (Bar)**

1. Event: `form_abandoned`
2. Breakdown: `formName`
3. Chart type: Horizontal bar
4. Show top 5

---

## Part 4: Configure Alerts (10 minutes)

### Critical Alerts to Set Up

1. **Activation Rate Drop**
   - Go to: Activation Rate widget → **⋮** → **Create alert**
   - Condition: "Drops below 40%"
   - Frequency: "Daily"
   - Notify: Email

2. **Affiliate Clicks Drop**
   - Widget: Affiliate Clicks → **Create alert**
   - Condition: "Decreases by 20% week-over-week"
   - Frequency: "Weekly (Monday)"
   - Notify: Email + Slack

3. **Error Spike**
   - Widget: Error Rate → **Create alert**
   - Condition: "Increases above 100/day"
   - Frequency: "Hourly"
   - Notify: Email (urgent)

4. **OAuth Failure Rate**
   - Widget: OAuth Failure Rate → **Create alert**
   - Condition: "Goes above 15%"
   - Frequency: "Daily"
   - Notify: Email

5. **MAU Decline**
   - Widget: Monthly Active Users → **Create alert**
   - Condition: "Decreases by 10%"
   - Frequency: "Weekly"
   - Notify: Email

---

## Part 5: Test Events (10 minutes)

### Verify Event Tracking

1. **Open your app** in incognito mode
2. **Open PostHog** → **Live Events** in another tab
3. **Perform actions** and watch events appear:

**Test Checklist:**
```
□ Sign up (user_signup)
□ Add subscription (subscription_added)
□ View dashboard (dashboard_viewed)
□ Open feedback modal (feedback_modal_opened)
□ Click CTA (cta_clicked)
□ Connect Spotify (spotify_connected)
□ View recommendation (recommendation_viewed)
```

**Live Events View:**
- Should see events appear within 1-2 seconds
- Check properties are correctly populated
- Verify user identity (distinct_id)

---

## Part 6: Set Up Actions (Optional but Recommended)

### Actions = Reusable Event Definitions

**Action 1: Affiliate Click (Revenue Critical)**

1. Go to **Data Management** → **Actions**
2. Click **+ New Action**
3. Configure:
   - Name: "Affiliate Click 💰"
   - Match: Event `affiliate_clicked`
   - Tags: `revenue`, `critical`
4. Click **Save**

**Use Case:** Easier to reference in funnels and dashboards

---

**Action 2: User Activated**

1. **+ New Action**
2. Name: "User Activated ✅"
3. Match: Event `user_activated`
4. Tags: `activation`, `milestone`

---

**Action 3: Pro Subscriber**

1. **+ New Action**
2. Name: "Pro Subscriber Acquired 💵"
3. Match: Event `subscription_purchased`
4. Tags: `revenue`, `conversion`

---

## Part 7: Weekly Review Routine

### Every Monday Morning

1. **Open Executive Dashboard**
   - Check MAU trend (growing?)
   - Check activation rate (>60%?)
   - Review total savings delivered

2. **Open Activation Dashboard**
   - Check activation funnel drop-offs
   - Review time to first subscription (getting faster?)
   - Spotify connection rate improving?

3. **Open Revenue Dashboard**
   - Count affiliate clicks (meeting targets?)
   - Check which providers performing best
   - Pro conversions (Month 2+)

4. **Check Alerts**
   - Review any triggered alerts
   - Investigate and fix critical issues
   - Document learnings

5. **Set Weekly Goals**
   - Based on data, pick 1-2 metrics to improve
   - Create action items
   - Track in project management tool

---

## Troubleshooting

### Events Not Appearing

**Check 1: PostHog Initialized?**
```typescript
// In browser console
console.log(posthog)
// Should show PostHog object
```

**Check 2: API Key Correct?**
```bash
# Check .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
```

**Check 3: Network Errors?**
- Open DevTools → Network tab
- Filter: `posthog`
- Look for failed requests (red)

**Check 4: Ad Blocker?**
- Disable ad blockers
- Test in incognito
- PostHog might be blocked

---

### Dashboard Not Loading

**Solution 1: Clear Cache**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Solution 2: Check Date Range**
- Ensure date range includes data
- Try "Last 30 days" if "All time" is slow

**Solution 3: Simplify Query**
- Remove breakdowns temporarily
- Reduce date range
- Split into multiple simpler widgets

---

### Funnel Shows 0% Conversion

**Check 1: Events in Correct Order?**
- Verify event sequence matches user flow
- Check conversion window is long enough

**Check 2: Event Names Correct?**
- Match exact event names from `events.ts`
- Case-sensitive!

**Check 3: Filters Too Restrictive?**
- Remove filters temporarily
- Add back one at a time

---

## Next Steps

After completing this setup:

1. ✅ **Share dashboards** with team
2. ✅ **Schedule weekly review** (Mondays 10am)
3. ✅ **Document baseline metrics** (current activation rate, etc.)
4. ✅ **Set quarterly goals** based on current performance
5. ✅ **Integrate with Slack** for real-time alerts

---

## Resources

- **PostHog Docs:** https://posthog.com/docs
- **Event Reference:** See `EVENTS.md`
- **Event Implementation:** `lib/analytics/events.ts`
- **Support:** PostHog Community Slack

---

**Setup Complete! 🎉**

You now have:
- ✅ 6 comprehensive dashboards
- ✅ 7 critical funnels
- ✅ 30+ widgets tracking KPIs
- ✅ 5 alerts for critical drops
- ✅ Weekly review routine

**Estimated Setup Time:** 60-90 minutes
**Last Updated:** October 19, 2025
**Maintainer:** Shreyam Keshri
