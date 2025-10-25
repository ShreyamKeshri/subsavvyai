# SubSavvyAI - MVP Final Sprint Implementation Guide

**Status:** 🚀 Ready to Build
**Timeline:** 10 days
**Target Launch:** November 5, 2025
**Current Completion:** 72% → Target: 95%

---

## 🎯 Sprint Overview

This document outlines the implementation plan for the 4 critical features needed to launch SubSavvyAI MVP:

1. **Savings Tracker** - Show users their actual savings (Days 1-2)
2. **Razorpay Payment System** - Enable revenue with free/pro tiers (Days 3-4)
3. **Cancellation Guides** - Help users cancel subscriptions (Days 5-7)
4. **Email Notification System** - Retention through reminders (Days 8-9)

---

## Phase 1: Savings Tracker (Days 1-2)

### Overview
Build the retention loop that shows users their actual savings after cancelling subscriptions.

### User Flow
1. User clicks "Cancel" button on subscription card
2. Modal opens: Select cancellation date + reason
3. Subscription marked as cancelled in database
4. Savings automatically calculated
5. User redirected to /dashboard/savings
6. Dashboard shows total savings, timeline, and annual projection

### Files to Create

#### Day 1 Morning: Database & Backend Logic

**1. Migration File**
```
📁 supabase/migrations/011_savings_tracking.sql
```
- Add index on `cancelled_at` field
- Add index on `(user_id, cancelled_at)` for faster queries
- Add computed column for monthly savings

**2. Server Actions**
```
📁 lib/savings/savings-actions.ts
```

Functions to implement:
- `calculateSavings(userId: string)` - Calculate total savings
- `getSavingsTimeline(userId: string)` - Get chronological list of cancelled subs
- `getAnnualProjection(userId: string)` - Project savings for full year
- `getSavingsByCategory(userId: string)` - Category-wise breakdown

Calculation Logic:
```typescript
// For each cancelled subscription:
const monthsSinceCancellation = differenceInMonths(now, cancelledAt)
const savings = cost * monthsSinceCancellation

// Total savings:
const totalSavings = cancelledSubscriptions.reduce((sum, sub) => {
  const months = differenceInMonths(now, sub.cancelled_at)
  const monthlyCost = calculateMonthlyCost(sub.cost, sub.billing_cycle)
  return sum + (monthlyCost * months)
}, 0)
```

#### Day 1 Afternoon: Cancel Subscription UI

**3. Cancel Subscription Dialog**
```
📁 components/subscriptions/cancel-subscription-dialog.tsx
```

UI Elements:
- Date picker for cancellation date (default: today)
- Reason dropdown:
  - "Too expensive"
  - "Not using enough"
  - "Found better alternative"
  - "Temporary pause"
  - "Other"
- Optional notes textarea
- Preview of savings: "You'll save ₹649/month (₹7,788/year)"
- Confirm button

Server Action Call:
```typescript
const result = await cancelSubscription({
  subscriptionId,
  cancelledAt: selectedDate,
  cancellationReason: selectedReason,
  notes: optionalNotes
})
```

**4. Update Subscription Cards**
```
📁 components/subscriptions/subscription-card.tsx (modify)
```

Add "Cancel" button:
- Icon: X or Trash
- Opens CancelSubscriptionDialog
- Red color to indicate destructive action
- Show only for active subscriptions

#### Day 2 Morning: Savings Dashboard Page

**5. Savings Dashboard Page**
```
📁 app/dashboard/savings/page.tsx
```

Layout:
```
┌─────────────────────────────────────┐
│  Savings Hero Card                  │
│  ₹8,420 saved this year             │
│  ━━━━━━━━━━━━━ 84% ━━━              │
│  Annual goal: ₹10,000               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Savings Breakdown                  │
│  OTT: ₹5,192 (62%)                  │
│  Music: ₹1,428 (17%)                │
│  Food: ₹1,800 (21%)                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Cancelled Subscriptions Timeline   │
│  [Timeline component]               │
└─────────────────────────────────────┘
```

**6. Savings Progress Card**
```
📁 components/savings/savings-progress-card.tsx
```

Features:
- Large total savings number with ₹ symbol
- Progress bar toward ₹10,000 goal
- "Share" button for social proof
- Category breakdown pie chart (optional)

**7. Cancelled Timeline Component**
```
📁 components/savings/cancelled-timeline.tsx
```

Display:
- Reverse chronological order (newest first)
- Each item shows:
  - Service logo + name
  - Cancellation date
  - Monthly savings
  - Total saved since cancellation
  - Reason for cancellation

Example:
```
🔴 Netflix
Cancelled Oct 15, 2024
Saving ₹649/month • Total saved: ₹5,192
Reason: Not using enough
```

#### Day 2 Afternoon: Polish & Testing

**8. Share Functionality**
```
📁 components/savings/share-button.tsx
```

Share options:
- Twitter: "I saved ₹8,420 this year with @SubSavvyAI! 🎉"
- LinkedIn: Professional post
- WhatsApp: Share with friends
- Copy link

**9. Empty State**
```
📁 components/savings/savings-empty-state.tsx
```

Message: "No cancelled subscriptions yet. Review your subscriptions to start saving!"
CTA: "View Recommendations"

### Testing Checklist
- ✅ Cancel subscription flow works end-to-end
- ✅ Savings calculation is accurate
- ✅ Timeline displays correctly
- ✅ Share button generates correct text
- ✅ Empty state shows when no cancellations
- ✅ Mobile responsive

---

## Phase 2: Razorpay Payment System (Days 3-4)

### Overview
Enable revenue with free tier limit (5 subscriptions) and Pro tier (₹99/month or ₹999/year).

### Pricing Structure

| Feature | Free | Pro |
|---------|------|-----|
| Subscriptions | 5 max | Unlimited |
| Manual entry | ✅ | ✅ |
| Gmail auto-detection | ✅ | ✅ |
| AI recommendations | ❌ | ✅ |
| Savings tracker | ❌ | ✅ |
| Cancellation guides | ❌ | ✅ |
| Email reminders | ❌ | ✅ |
| Priority support | ❌ | ✅ |

### Files to Create

#### Day 3 Morning: Razorpay Setup & Backend

**1. Razorpay SDK Wrapper**
```
📁 lib/payments/razorpay.ts
```

Functions:
- `createCustomer(user)` - Create Razorpay customer
- `createSubscription(plan, customerId)` - Create subscription
- `cancelSubscription(subscriptionId)` - Cancel subscription
- `verifyWebhookSignature(body, signature)` - Verify webhook
- `getSubscriptionDetails(subscriptionId)` - Fetch subscription info

**2. Database Migration**
```
📁 supabase/migrations/012_payment_system.sql
```

New table: `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  razorpay_customer_id TEXT NOT NULL,
  razorpay_subscription_id TEXT,
  plan_id TEXT NOT NULL, -- 'free', 'pro_monthly', 'pro_yearly'
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  trial_end_date TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
```

Add column to profiles:
```sql
ALTER TABLE profiles ADD COLUMN tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro'));
```

**3. Create Subscription API Route**
```
📁 app/api/payments/create-subscription/route.ts
```

Flow:
1. Verify user is authenticated
2. Check if user already has subscription
3. Create Razorpay customer if doesn't exist
4. Create Razorpay subscription with 7-day trial
5. Store subscription details in database
6. Return checkout URL

**4. Webhook Handler**
```
📁 app/api/payments/webhook/route.ts
```

Events to handle:
- `subscription.activated` - Update user tier to 'pro'
- `subscription.charged` - Record successful payment
- `subscription.cancelled` - Downgrade user to 'free'
- `subscription.expired` - Downgrade user to 'free'
- `payment.failed` - Send notification

#### Day 3 Afternoon: Upgrade Page UI

**5. Upgrade Page**
```
📁 app/upgrade/page.tsx
```

Layout:
```
┌──────────────────────────────────────────┐
│  Choose Your Plan                        │
│                                          │
│  ┌─────────┐      ┌─────────┐           │
│  │  Free   │      │   Pro   │ ⭐        │
│  │  ₹0     │      │  ₹99/mo │           │
│  │ 5 subs  │      │ Unlimited│           │
│  └─────────┘      └─────────┘           │
│                      ↓                   │
│              [Start 7-Day Trial]         │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │  Pro Annual: ₹999/year          │    │
│  │  Save ₹189 (16% off)            │    │
│  │  [Choose Annual]                │    │
│  └─────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

**6. Pricing Cards Component**
```
📁 components/pricing/pricing-card.tsx
```

Props:
- `plan`: 'free' | 'pro_monthly' | 'pro_yearly'
- `isCurrentPlan`: boolean
- `onSelect`: () => void

Features list for each plan shown as checkmarks/crosses.

**7. Payment Actions**
```
📁 lib/payments/payment-actions.ts
```

Server actions:
- `createCheckoutSession(plan)` - Create Razorpay checkout
- `cancelUserSubscription()` - Cancel user's subscription
- `getUserSubscription()` - Get current subscription details
- `upgradeToAnnual()` - Switch monthly to annual

#### Day 4 Morning: Free Tier Gating

**8. Middleware Update**
```
📁 middleware.ts (modify)
```

Add premium route protection:
```typescript
const premiumRoutes = [
  '/dashboard/savings',
  '/dashboard/subscriptions/*/cancel'
]

if (premiumRoutes.some(route => path.includes(route))) {
  const userTier = await getUserTier(userId)
  if (userTier === 'free') {
    return NextResponse.redirect(new URL('/upgrade', request.url))
  }
}
```

**9. Subscription Limit Check**
```
📁 lib/subscriptions/subscription-actions.ts (modify)
```

Update `createSubscription()`:
```typescript
// Before creating subscription:
const userTier = await getUserTier(userId)
const subscriptionCount = await getSubscriptionCount(userId)

if (userTier === 'free' && subscriptionCount >= 5) {
  return {
    success: false,
    error: 'Free tier limited to 5 subscriptions. Upgrade to Pro for unlimited.',
    upgradeRequired: true
  }
}
```

**10. Upgrade Banner Component**
```
📁 components/dashboard/upgrade-banner.tsx
```

Show when:
- User has 4/5 subscriptions
- User tries to access premium feature

Message: "1 subscription slot left. Upgrade to Pro for unlimited subscriptions."
CTA: "Upgrade Now"

#### Day 4 Afternoon: Testing & Polish

**11. Premium Feature Gates**

Add gates to:
- AI Recommendations page
- Savings tracker page
- Cancellation guides
- Email reminders (backend)

Component wrapper:
```typescript
function PremiumFeature({ children, fallback }) {
  const { user } = useAuth()

  if (user?.tier !== 'pro') {
    return fallback || <UpgradePrompt />
  }

  return children
}
```

### Testing Checklist
- ✅ Free tier limited to 5 subscriptions
- ✅ Upgrade banner shows at 4/5 subscriptions
- ✅ Razorpay checkout flow works
- ✅ 7-day trial activates correctly
- ✅ Payment success upgrades user tier
- ✅ Premium features gated properly
- ✅ Webhook handler processes all events
- ✅ Cancel subscription downgrades to free

---

## Phase 3: Cancellation Guides (Days 5-7)

### Overview
Hybrid approach: Deep guides for top 10 services + Basic guides for next 10 services.

### Guide Structure

**Deep Guide (Top 10):**
- 5-7 step-by-step instructions
- Screenshots for each step
- UPI mandate cancellation instructions
- Deep link to cancellation page
- Estimated time (5-10 minutes)
- Difficulty badge

**Basic Guide (Next 10):**
- 3-4 text-based steps
- No screenshots
- UPI instructions (if applicable)
- Link to help page
- Estimated time

### Top 20 Services Priority

**Deep Guides (Top 10):**
1. Netflix
2. Amazon Prime Video
3. Disney+ Hotstar
4. Spotify
5. YouTube Premium
6. Zee5
7. SonyLIV
8. Zomato Pro
9. Swiggy One
10. JioSaavn

**Basic Guides (Next 10):**
11. Voot
12. Gaana
13. MakeMyTrip
14. BookMyShow
15. Times Prime
16. Ola Money
17. TATA Play Binge
18. Audible
19. Kindle Unlimited
20. Cult.fit

### Files to Create

#### Day 5: Research & Documentation (Top 10)

**1. Guide Data File**
```
📁 lib/guides/guide-data.ts
```

Structure:
```typescript
export interface CancellationStep {
  step: number
  title: string
  description: string
  imageUrl?: string
  deepLink?: string
}

export interface UPIMandateInstructions {
  provider: 'gpay' | 'phonepe' | 'paytm'
  steps: string[]
}

export interface CancellationGuide {
  serviceId: string
  serviceName: string
  steps: CancellationStep[]
  upiMandateInstructions?: UPIMandateInstructions[]
  estimatedTimeMinutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  lastVerified: string
  notes?: string
}
```

Example guide:
```typescript
{
  serviceId: 'netflix',
  serviceName: 'Netflix',
  steps: [
    {
      step: 1,
      title: 'Open Netflix Account Settings',
      description: 'Go to www.netflix.com and sign in. Click on your profile icon in the top right corner and select "Account".',
      imageUrl: '/guides/netflix/step1.png',
      deepLink: 'https://www.netflix.com/account'
    },
    {
      step: 2,
      title: 'Find Membership & Billing',
      description: 'Scroll down to the "Membership & Billing" section.',
      imageUrl: '/guides/netflix/step2.png'
    },
    {
      step: 3,
      title: 'Click "Cancel Membership"',
      description: 'Click on the "Cancel Membership" button.',
      imageUrl: '/guides/netflix/step3.png'
    },
    {
      step: 4,
      title: 'Confirm Cancellation',
      description: 'Click "Finish Cancellation" to confirm. You\'ll have access until your current billing period ends.',
      imageUrl: '/guides/netflix/step4.png'
    },
    {
      step: 5,
      title: 'Cancel UPI Auto-Pay',
      description: 'IMPORTANT: Also cancel your UPI mandate to stop future charges.',
      deepLink: '#upi-instructions'
    }
  ],
  upiMandateInstructions: [
    {
      provider: 'gpay',
      steps: [
        'Open Google Pay app',
        'Tap on your profile picture',
        'Select "Autopay"',
        'Find "Netflix" in the list',
        'Tap "Cancel autopay"',
        'Confirm cancellation'
      ]
    },
    {
      provider: 'phonepe',
      steps: [
        'Open PhonePe app',
        'Go to "My Account"',
        'Select "AutoPay"',
        'Find "Netflix"',
        'Tap "Disable"'
      ]
    }
  ],
  estimatedTimeMinutes: 8,
  difficulty: 'easy',
  lastVerified: '2025-10-26'
}
```

**Research Process (Day 5):**
1. Sign up for each service (if not already subscribed)
2. Document cancellation flow with screenshots
3. Test UPI mandate cancellation
4. Verify all deep links work
5. Time the process
6. Write clear instructions

#### Day 6: Research & Documentation (Next 10)

Continue research for services 11-20 (basic guides).

#### Day 7: UI Implementation

**2. Cancellation Guide Page**
```
📁 app/dashboard/subscriptions/[id]/cancel/page.tsx
```

Layout:
```
┌─────────────────────────────────────────┐
│  Cancel Netflix                         │
│  ⏱ ~8 minutes • ✨ Easy                │
│                                         │
│  [Progress: Step 2 of 5]                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━          │
│                                         │
│  📋 Step 2: Find Membership & Billing   │
│                                         │
│  Scroll down to the "Membership &       │
│  Billing" section.                      │
│                                         │
│  [Screenshot]                           │
│                                         │
│  [← Previous]  [Next Step →]            │
│                                         │
│  🔗 UPI Mandate Instructions ↓          │
└─────────────────────────────────────────┘
```

**3. Cancellation Step Component**
```
📁 components/guides/cancellation-step.tsx
```

Features:
- Step number indicator
- Title and description
- Screenshot (if available)
- "Copy URL" button for deep links
- Navigation buttons

**4. UPI Mandate Instructions**
```
📁 components/guides/upi-mandate-instructions.tsx
```

Tabs for different UPI providers:
- Google Pay
- PhonePe
- Paytm

Each tab shows numbered steps.

**5. Guide Actions**
```
📁 lib/guides/guide-actions.ts
```

Server actions:
- `getCancellationGuide(serviceId)` - Fetch guide data
- `trackGuideView(serviceId)` - Analytics
- `trackGuideCompletion(serviceId)` - Track successful cancellation

**6. Update Subscription Actions**

Add "View Cancellation Guide" button to subscription cards (Pro feature).

### Testing Checklist
- ✅ All 20 guides documented
- ✅ Screenshots uploaded (for top 10)
- ✅ Deep links work correctly
- ✅ UPI instructions are accurate
- ✅ Guide UI is intuitive
- ✅ Navigation works smoothly
- ✅ Mobile responsive
- ✅ "Mark as Cancelled" at end works

---

## Phase 4: Email Notification System (Days 8-9)

### Overview
Retention hooks through automated emails: Billing reminders (3 days before renewal) + Unused subscription alerts (monthly).

### Email Templates

#### Template 1: Billing Reminder

**Subject:** Your [Service Name] subscription renews in 3 days (₹[Amount])

**Content:**
```
Hi {name},

Just a heads up - your {serviceName} subscription will auto-renew on {renewalDate} for ₹{amount}.

💡 Still using it regularly? Keep it active.
💸 Haven't used it in a while? Cancel now and save ₹{annualSavings}/year.

┌─────────────────────────────────────┐
│  View Usage Stats    Cancel Now     │
└─────────────────────────────────────┘

Questions? Reply to this email.

Best,
SubSavvyAI Team

Unsubscribe from billing reminders
```

#### Template 2: Unused Subscription Alert

**Subject:** You haven't used [Service Name] in 30 days

**Content:**
```
Hi {name},

We noticed you haven't used {serviceName} in the past {unusedDays} days, but you're still paying ₹{monthlyCost}/month.

📊 Your usage: 0 hours in the last 30 days
💰 Potential savings: ₹{annualCost}/year if you cancel

Cancel now and save, or keep it if you plan to use it soon.

┌─────────────────────────────────────┐
│  View Details    Cancel    Dismiss  │
└─────────────────────────────────────┘

Best,
SubSavvyAI Team

Manage email preferences
```

### Files to Create

#### Day 8 Morning: Email Templates

**1. Install React Email**
```bash
npm install react-email @react-email/components
npm install resend (already installed)
```

**2. Billing Reminder Template**
```
📁 lib/email/templates/billing-reminder.tsx
```

Use `@react-email/components`:
- `<Html>`
- `<Head>`
- `<Body>`
- `<Container>`
- `<Section>`
- `<Button>`
- `<Text>`

Include SubSavvyAI branding (logo, colors).

**3. Unused Subscription Template**
```
📁 lib/email/templates/unused-subscription.tsx
```

Similar structure with different content.

**4. Email Sender Utility**
```
📁 lib/email/send-email.ts
```

Functions:
- `sendBillingReminder(userId, subscription)` - Send reminder email
- `sendUnusedAlert(userId, subscription)` - Send unused alert
- `sendEmail(to, subject, template)` - Generic sender using Resend API

```typescript
import { Resend } from 'resend'
import { BillingReminderEmail } from './templates/billing-reminder'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBillingReminder(user, subscription) {
  const { error } = await resend.emails.send({
    from: 'SubSavvyAI <reminders@subsavvyai.com>',
    to: user.email,
    subject: `Your ${subscription.serviceName} renews in 3 days (₹${subscription.cost})`,
    react: BillingReminderEmail({
      userName: user.full_name,
      serviceName: subscription.serviceName,
      renewalDate: subscription.next_billing_date,
      amount: subscription.cost,
      annualSavings: subscription.cost * 12
    })
  })

  if (error) {
    console.error('Failed to send billing reminder:', error)
    return { success: false, error }
  }

  return { success: true }
}
```

#### Day 8 Afternoon: Cron Jobs

**5. Database Migration for Email Tracking**
```
📁 supabase/migrations/013_email_notifications.sql
```

Table: `email_notifications`
```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  type TEXT NOT NULL CHECK (type IN ('billing_reminder', 'unused_alert', 'savings_milestone')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX idx_email_notifications_sent_at ON email_notifications(sent_at);
```

**6. Billing Reminder Cron Job**
```
📁 app/api/cron/billing-reminders/route.ts
```

Logic:
```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get all subscriptions renewing in 3 days
  const threeDaysFromNow = addDays(new Date(), 3)
  const subscriptions = await getSubscriptionsRenewingOn(threeDaysFromNow)

  // Filter: Only send to Pro users
  const proUsers = await filterProUsers(subscriptions)

  // Send emails
  const results = await Promise.all(
    proUsers.map(async ({ user, subscription }) => {
      const sent = await sendBillingReminder(user, subscription)
      if (sent.success) {
        await logEmailNotification(user.id, subscription.id, 'billing_reminder')
      }
      return sent
    })
  )

  return Response.json({
    success: true,
    emailsSent: results.filter(r => r.success).length,
    totalSubscriptions: subscriptions.length
  })
}
```

**7. Unused Subscription Alert Cron**
```
📁 app/api/cron/unused-alerts/route.ts
```

Logic:
```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get all active subscriptions with usage data
  const subscriptions = await getSubscriptionsWithUsage()

  // Filter: Not used in last 30 days
  const unusedSubscriptions = subscriptions.filter(sub => {
    const daysSinceLastUse = differenceInDays(new Date(), sub.last_used_date)
    return daysSinceLastUse >= 30
  })

  // Filter: Only Pro users
  const proUsers = await filterProUsers(unusedSubscriptions)

  // Send emails
  const results = await Promise.all(
    proUsers.map(async ({ user, subscription }) => {
      const sent = await sendUnusedAlert(user, subscription)
      if (sent.success) {
        await logEmailNotification(user.id, subscription.id, 'unused_alert')
      }
      return sent
    })
  )

  return Response.json({
    success: true,
    alertsSent: results.filter(r => r.success).length
  })
}
```

#### Day 9 Morning: Vercel Cron Setup

**8. Vercel Cron Configuration**
```
📁 vercel.json (create or modify)
```

```json
{
  "crons": [
    {
      "path": "/api/cron/billing-reminders",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/unused-alerts",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

Schedules:
- Billing reminders: Daily at 10:00 AM IST
- Unused alerts: 1st of every month at 9:00 AM IST

**9. Cron Secret Setup**

Add to `.env.local`:
```
CRON_SECRET=your_random_secret_here
```

Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Day 9 Afternoon: Email Preferences

**10. Email Preferences Page**
```
📁 app/dashboard/settings/notifications/page.tsx
```

Settings:
- [ ] Billing reminders (3 days before renewal)
- [ ] Unused subscription alerts (monthly)
- [ ] Savings milestones (₹1000, ₹5000, ₹10000)
- [ ] Weekly digest (future)

**11. Unsubscribe Handler**
```
📁 app/unsubscribe/route.ts
```

Query params: `?email=user@example.com&type=billing_reminders`

Update user notification preferences in database.

### Testing Checklist
- ✅ Billing reminder emails send correctly
- ✅ Unused alerts send monthly
- ✅ Email templates render properly
- ✅ Cron jobs run on schedule
- ✅ Unsubscribe links work
- ✅ Email tracking records properly
- ✅ Only Pro users receive emails
- ✅ Mobile email rendering

---

## Day 10: Testing & Polish

### End-to-End Testing

**1. Complete User Journey**
```
1. Sign up with email
2. Add 5 subscriptions (hit free tier limit)
3. See upgrade banner at 4/5 subscriptions
4. Try to add 6th subscription → Blocked
5. Click "Upgrade to Pro"
6. Complete payment (test mode)
7. Subscription limit removed
8. Add more subscriptions
9. Connect Gmail → Scan subscriptions
10. View AI recommendations (now accessible)
11. Click "Cancel" on a subscription
12. Follow cancellation guide
13. Mark subscription as cancelled
14. View savings dashboard
15. Receive billing reminder email (test cron)
16. Receive unused alert email (test cron)
```

**2. Payment Flow Testing**

Test scenarios:
- ✅ Free trial activation
- ✅ Trial expiry
- ✅ Monthly payment success
- ✅ Payment failure
- ✅ Subscription cancellation
- ✅ Upgrade from monthly to annual
- ✅ Webhook handling

**3. Edge Cases**

Test:
- User with 0 subscriptions
- User with 50+ subscriptions
- Cancelled subscription with future billing date
- Email with invalid address
- Cron job failure recovery
- Webhook signature verification failure

**4. Performance Testing**

Check:
- Savings calculation for 100+ cancelled subs
- Dashboard load time with 50+ subs
- Email send rate limits
- Database query performance

### Documentation Updates

**5. Update Files**

Update these docs:
- `PROGRESS.md` - Mark all 4 phases complete
- `DATABASE_SCHEMA.md` - Document new migrations 011-013
- `CLAUDE.md` - Update feature list and migration count
- `README.md` - Update completion percentage to 95%
- `TESTING_GUIDE.md` - Add new test cases

### Launch Checklist

**Environment Variables:**
- [ ] `RAZORPAY_KEY_ID` configured
- [ ] `RAZORPAY_KEY_SECRET` configured
- [ ] `RAZORPAY_WEBHOOK_SECRET` configured
- [ ] `RESEND_API_KEY` configured
- [ ] `CRON_SECRET` configured
- [ ] All values set in Vercel production

**Database:**
- [ ] Migrations 011-013 applied in production
- [ ] RLS policies tested
- [ ] Indexes created

**Razorpay Setup:**
- [ ] Account verified
- [ ] Subscription plans created (monthly ₹99, annual ₹999)
- [ ] Webhook endpoint configured
- [ ] Test payments successful

**Email Setup:**
- [ ] Resend domain verified
- [ ] Email templates tested
- [ ] Cron jobs scheduled in Vercel
- [ ] Unsubscribe flow working

**Testing:**
- [ ] End-to-end user journey tested
- [ ] All payment scenarios tested
- [ ] Email delivery tested
- [ ] Mobile responsive checked
- [ ] Cross-browser tested

---

## Success Metrics

### Phase 1: Savings Tracker
- ✅ Users can cancel subscriptions
- ✅ Savings calculated accurately
- ✅ Dashboard shows compelling savings data
- ✅ Timeline displays cancelled subs
- ✅ Share functionality works

**Target:** 40% of users who get recommendations mark at least 1 subscription as cancelled

### Phase 2: Payment System
- ✅ Free tier limited to 5 subscriptions
- ✅ Upgrade flow converts at 15%+ of free users
- ✅ Payment success rate >95%
- ✅ Premium features properly gated
- ✅ Trial-to-paid conversion >30%

**Target:** 10% of signups convert to paid within 7 days

### Phase 3: Cancellation Guides
- ✅ 20 guides complete and accurate
- ✅ Guide completion rate >60%
- ✅ Users report successful cancellations
- ✅ Mobile UX is smooth

**Target:** 50% of users who view a guide complete cancellation

### Phase 4: Email System
- ✅ Billing reminders send 3 days before
- ✅ Email open rate >40%
- ✅ Click-through rate >15%
- ✅ Unsubscribe rate <5%

**Target:** Emails drive 25% of app re-engagement

---

## Timeline Summary

| Day | Phase | Tasks | Hours |
|-----|-------|-------|-------|
| 1 | Savings Tracker | Database, backend logic, cancel UI | 8 |
| 2 | Savings Tracker | Dashboard page, timeline, polish | 8 |
| 3 | Payments | Razorpay setup, backend, checkout | 8 |
| 4 | Payments | Gating logic, upgrade page, testing | 8 |
| 5 | Guides | Research top 10 services (deep) | 8 |
| 6 | Guides | Research next 10 services (basic) | 8 |
| 7 | Guides | Build UI, integrate, test | 8 |
| 8 | Emails | Templates, cron jobs, billing reminders | 8 |
| 9 | Emails | Unused alerts, preferences, Vercel cron | 8 |
| 10 | Polish | E2E testing, docs, launch prep | 8 |

**Total:** 80 hours over 10 days = Launch ready by November 5, 2025

---

## Post-Launch (Month 2)

**Features to add after launch:**
- Price change alerts
- Weekly digest emails
- Savings milestones emails
- Content overlap detector
- Advanced analytics
- Referral program

---

## Notes

**This is a temporary implementation guide. DELETE this file after completing all phases and raising the final PR.**

Per CLAUDE.md documentation policy, only 8 core markdown files should remain in the repository. This guide serves to structure the 10-day implementation sprint.

---

**Ready to build!** Start with Phase 1: Savings Tracker. 🚀
