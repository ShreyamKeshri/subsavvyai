# MVP Roadmap - SubSavvyAI
**Goal: AI-powered subscription optimizer that saves Indians ₹10,000+/year**

**Last Updated:** October 11, 2025

---

## 🎯 The Vision

### From Basic Tracker to AI Optimizer

**Old Hypothesis:**
> "Do Indians struggle with managing subscriptions and want a simple tool to track them?"

**New Value Proposition:**
> "AI finds ₹10,000/year hidden in your subscriptions"

### Why AI Optimizer Wins:
1. **10x better value prop** - "Save ₹10k/year" vs "See subscriptions"
2. **AI = Fundable** - VCs love AI + fintech combo
3. **Multiple revenue streams** - Subscriptions + Affiliates + B2B
4. **Viral potential** - Users share their savings
5. **India-specific edge** - Telecom bundles, OTT overlap

---

## 🚀 Core AI Features (The "AI Four")

### 1. Smart Downgrade Alerts ⭐⭐⭐⭐⭐
**Status:** ✅ Complete (Week 1)

**What it does:**
```
📊 Your Spotify usage: 4.2 hours/month
💡 You're on Premium (₹119/mo)
   → Downgrade to Free, save ₹1,428/year
   You'll hear 2 ads/hour (worth it!)
```

**How it works:**
- Integrates with service APIs (Spotify OAuth)
- Tracks actual usage
- Compares with plan pricing
- Suggests optimal tier

**Revenue:** Freemium feature for Pro tier

---

### 2. India Bundle Optimizer ⭐⭐⭐⭐⭐
**Status:** ✅ Complete (Week 2-3)

**What it does:**
```
🇮🇳 Better Bundle Found!
┌────────────────────────────────┐
│ Current: Hotstar (₹1499)       │
│         + Zee5 (₹699)           │
│         = ₹2198/month           │
│                                 │
│ Switch to: Vi Bundle            │
│         Hotstar + Zee5 + SonyLIV│
│         = ₹999/month ✅         │
│         SAVE ₹14,388/year       │
└────────────────────────────────┘
```

**How it works:**
- Database of 20 telecom bundles (Jio, Airtel, Vi)
- Maps user subscriptions to available bundles
- Calculates savings
- **Affiliate revenue**: ₹500-1000 per signup!

**Revenue:** Affiliate commissions

---

### 3. Content Overlap Detector ⭐⭐⭐⭐⭐
**Status:** 🔄 Planned (Week 3-4)

**What it does:**
```
🎬 You have Netflix, Prime Video, AND Hotstar
┌─────────────────────────────────┐
│ 47 movies are on ALL 3 platforms │
│ You're wasting ₹800/month        │
│ → Cancel Hotstar, save ₹1499/mo │
└─────────────────────────────────┘
```

**How it works:**
- Scrape content catalogs (or use JustWatch API)
- AI matching algorithm for shows/movies
- Calculate overlap percentage
- Recommend which to cancel

**Revenue:** Pro tier feature

---

### 4. Price Hike Alerts + Alternatives ⭐⭐⭐⭐
**Status:** 📅 Planned (Month 2)

**What it does:**
```
⚠️ Netflix just increased prices!
Old: ₹649/mo → New: ₹799/mo (+23%)

Similar alternatives:
• Prime Video: ₹299/mo (63% cheaper!)
• Apple TV+: ₹99/mo (88% cheaper!)
• Keep Netflix: You watch 40hrs/mo
              (worth keeping)
```

**How it works:**
- Monitor service pricing (web scraping)
- Alert users on price changes
- AI suggests alternatives based on viewing habits

**Revenue:** Freemium + affiliate

---

## 📅 Development Timeline

### Phase 1: Foundation (Completed ✅)
**Duration:** Week 1-2

- [x] Authentication system (email, Google OAuth, phone)
- [x] Database schema (subscriptions, services, users, profiles)
- [x] Dashboard UI foundation
- [x] Subscription CRUD operations
- [x] 52 Indian services database
- [x] Email system (Resend integration)
- [x] Landing page with SubSavvyAI branding

**Status:** ✅ Complete

---

### Phase 2: Smart Downgrade Alerts (Completed ✅)
**Duration:** Week 3-4 (October 4-10, 2025)

- [x] Database schema (oauth_tokens, service_usage, optimization_recommendations)
- [x] Spotify OAuth integration
- [x] Usage tracking system
- [x] AI recommendation engine
- [x] Dashboard integration with beautiful UI
- [x] Testing guide updated

**Status:** ✅ Complete (PR #7 merged)

---

### Phase 3: India Bundle Optimizer (Completed ✅)
**Duration:** Week 4-5 (October 7-11, 2025)

- [x] Telecom bundles database (20 bundles: Jio, Airtel, Vi)
- [x] Bundle matching algorithm with service name normalization
- [x] Confidence scoring system (match % + savings + value score)
- [x] Savings calculator (monthly + annual)
- [x] UI components (bundle cards, recommendations list)
- [x] Dashboard integration
- [x] Testing guide updated

**Status:** ✅ Complete (PR #11 merged)

---

### Phase 4: Content Overlap Detector (Planned 🔄)
**Duration:** Week 6-7 (Target: October 14-21, 2025)

**Goal:** Detect overlapping content across OTT platforms

**Tasks:**
- [ ] Integrate JustWatch API or implement scraping
- [ ] Build content catalog database
- [ ] Implement AI matching algorithm for shows/movies
- [ ] Calculate overlap percentage
- [ ] Create overlap visualization UI
- [ ] Recommend which services to cancel
- [ ] Add to dashboard

**Success Criteria:**
- Detect overlap for Netflix, Prime Video, Hotstar, Zee5
- Show percentage of overlapping content
- Calculate savings from canceling redundant services

---

### Phase 5: Price Monitoring & Alerts (Planned 📅)
**Duration:** Month 2 (Target: October 21 - November 4, 2025)

**Goal:** Monitor price changes and alert users

**Tasks:**
- [ ] Build price history tracking system
- [ ] Implement web scraping for service pricing
- [ ] Create price change detection algorithm
- [ ] Email/WhatsApp alerts for price changes
- [ ] Suggest alternatives based on usage
- [ ] Negotiate deals (Honey-style)

**Success Criteria:**
- Track prices for all 52 services
- Alert users within 24 hours of price change
- Suggest 2-3 alternatives with savings calculation

---

## ✅ Current Feature Set

### Core Features (Built ✅)

1. **Authentication**
   - ✅ Email/password signup & login
   - ✅ Google OAuth
   - ✅ Phone OTP (deferred)
   - ✅ Email verification
   - ✅ Password reset

2. **Subscription Management**
   - ✅ Smart catalog of 52 Indian services
   - ✅ Quick-add with pre-filled price
   - ✅ Add/Edit/Delete subscriptions
   - ✅ Mark as cancelled
   - ✅ Billing cycle tracking
   - ✅ Payment method management

3. **Dashboard**
   - ✅ Total monthly/yearly cost
   - ✅ Active subscriptions list
   - ✅ Category breakdown
   - ✅ Analytics cache with charts
   - ✅ Upcoming renewals

4. **AI Features**
   - ✅ Smart Downgrade Alerts (Spotify OAuth + usage tracking)
   - ✅ India Bundle Optimizer (20 bundles with matching algorithm)
   - 🔄 Content Overlap Detector (planned)
   - 📅 Price Hike Alerts (planned)

5. **Email System**
   - ✅ Welcome emails
   - ✅ Reminder emails (3 days before renewal)
   - ✅ Professional templates with branding

### Next Priority Features

- **Content Overlap Detector** (Week 6-7)
- **Price Monitoring** (Month 2)
- **WhatsApp/SMS Alerts** (Month 2)
- **Referral Program** (Month 2)
- **B2B Corporate Package** (Month 3)

---

## 💰 Revenue Model

### 1. Freemium SaaS
**Free Tier:**
- Track up to 5 subscriptions
- Basic downgrade alerts
- Monthly optimization report

**Pro Tier (₹99/month or ₹999/year):**
- Unlimited subscriptions
- Real-time AI optimization (all 4 AI features)
- Content overlap detection
- Priority support
- WhatsApp alerts

### 2. Affiliate Revenue
- **Telecom bundles:** ₹500-1000 per signup
- **Alternative services:** 10-20% commission
- **Credit cards with OTT benefits:** ₹1000+ per approval
- **Target:** ₹50k/month from affiliates by Month 3

### 3. B2B SaaS (Future)
- Corporate employee benefits
- ₹99/employee/year
- Bulk pricing for 100+ employees
- **Target:** ₹1L/month by Month 6

---

## 📊 Success Metrics

### Current Status (Post-Phase 3):
- ✅ 2 AI features complete (Smart Downgrade + Bundle Optimizer)
- ✅ 6 database migrations applied
- ✅ 17 tables with RLS
- ✅ 20+ reusable components
- ✅ ~8,500 lines of TypeScript

### Month 1 Goals (Phase 1-3 Complete):
- [x] Build core foundation
- [x] Implement Smart Downgrade Alerts
- [x] Implement Bundle Optimizer
- [ ] 50 signups
- [ ] 10 active users
- [ ] ₹5000+ total savings shown

### Month 2 Goals (Phase 4-5):
- [ ] Complete Content Overlap Detector
- [ ] Complete Price Monitoring
- [ ] 500 signups
- [ ] 100 active users
- [ ] 10 paid subscribers
- [ ] ₹1,00,000+ total savings shown

### Month 3 Goals (Product-Market Fit):
- [ ] 2000 users
- [ ] 100 paid subscribers (₹10k MRR)
- [ ] ₹50k/month affiliate revenue
- [ ] 50% week-over-week growth
- [ ] <10% churn rate

**Key Questions to Answer:**
1. Do people actually sign up? (Activation)
2. Do they connect services and see savings? (Value realization)
3. Do they come back? (Retention)
4. Do they upgrade to Pro? (Monetization)
5. Do they click affiliate links? (Affiliate conversion)

---

## 🚫 Development Best Practices

### What NOT to Do:
❌ **Don't** over-engineer (ship fast, iterate)
❌ **Don't** build features without user validation
❌ **Don't** optimize prematurely (performance can wait)
❌ **Don't** skip testing (manual testing critical flows)
❌ **Don't** ignore security (RLS on all tables)

### What TO Do:
✅ **Do** ship small, frequent updates
✅ **Do** talk to users daily
✅ **Do** fix bugs within 24 hours
✅ **Do** maintain documentation (8 core files)
✅ **Do** write tests for critical flows

---

## 🎯 Go-to-Market Strategy

### Phase 1: Build in Public (Weeks 1-2)
- ✅ Twitter threads: "Building AI to save ₹10k/year"
- ✅ Daily progress updates
- 🔄 Building small following

### Phase 2: Beta Launch (Week 3-4)
- [ ] Friends & family testing (target: 20-50 users)
- [ ] Collect testimonials and feedback
- [ ] Fix critical bugs
- [ ] Prepare marketing materials

### Phase 3: Public Launch (Week 5-6)
- [ ] Product Hunt launch
- [ ] Reddit: r/IndiaInvestments, r/India
- [ ] Twitter: "I saved ₹847/month in subscription overlap"
- [ ] LinkedIn: B2B angle for corporate benefits
- [ ] Finance YouTubers partnerships

### Phase 4: Growth (Month 2-3)
- [ ] Referral program (Save ₹500, friend saves ₹500)
- [ ] Content marketing (blog posts on saving money)
- [ ] SEO for "cancel subscription India", "subscription optimizer"
- [ ] Partnerships with finance influencers
- [ ] WhatsApp community for power users

---

## 📝 Current Status

**Phase:** MVP Final Sprint (Days 7-16) - In Progress 🚀
**Security Status:** 🟢 Production-Ready
**Overall Progress:** 72% → Target 95%
**Target Launch:** November 5, 2025

**Completed:**
- ✅ Phase 1: Foundation (Auth, Dashboard, Subscriptions)
- ✅ Phase 2: Smart Downgrade Alerts (Spotify OAuth + AI recommendations)
- ✅ Phase 3: India Bundle Optimizer (20 bundles + matching algorithm)
- ✅ Analytics & Error Tracking (PostHog + Sentry)
- ✅ Dark Mode Implementation
- ✅ Manual Usage Tracking System (Migration 007)
- ✅ Currency Conversion + UX Improvements (Migration 008)
- ✅ Critical Security Audit & Fixes (PR #25)
- ✅ Canny Feedback Integration (PR #26)
- ✅ **Day 7:** Gmail OAuth Integration (PR #27) - Auto-detect subscriptions!

**Day 5 Security Achievements:**
- ✅ Fixed useAuth infinite re-render (memory leak prevention)
- ✅ Added comprehensive input validation (Zod schemas)
- ✅ Implemented CSRF protection (Spotify OAuth)
- ✅ Added rate limiting (API abuse prevention)
- ✅ Implemented debounced updates (race condition prevention)
- ✅ OAuth token encryption (AES-256-GCM)
- ✅ Fixed Supabase client memory leak
- ✅ Comprehensive security documentation in SECURITY.md
- ✅ **Security Posture:** 🟡 Moderate → 🟢 Production-Ready

## 🚀 MVP Final Sprint (Days 7-16)

After completing Gmail OAuth integration (PR #27), we are now in the **Final Sprint** to complete 4 critical features before MVP launch on November 5, 2025:

### Sprint Phases (10 days / 80 hours)

**Phase 1: Savings Tracker (Days 7-8)** ⏳ Current Focus
- Use existing `cancelled_at`, `cancellation_reason` fields (already in migration 001!)
- Cancel subscription dialog with reason selection
- Savings progress card (total saved, monthly savings rate)
- Cancelled subscriptions timeline
- Dedicated `/dashboard/savings` page

**Phase 2: Razorpay Payment System (Days 9-10)** 📅 Next
- Migration 011: Add `tier` field to profiles, `payment_transactions` table
- Free tier: 5 subscriptions max
- Pro tier: ₹99/month or ₹999/year (7-day trial)
- Premium feature gating middleware
- Razorpay checkout integration
- Webhook handlers for payment events
- Upgrade prompts and paywall UI

**Phase 3: Cancellation Guides (Days 11-13)** 📅 Planned
- Use existing `cancellation_guides` table (already in migration 001!)
- Populate guides for 20 services (10 deep + 10 basic)
- Deep guides: Netflix, Prime, Hotstar, Spotify, YouTube Premium, Zee5, SonyLIV, Zomato Pro, Swiggy One, JioSaavn
- Basic guides: Voot, Gaana, MakeMyTrip, BookMyShow, etc.
- UPI mandate cancellation instructions
- Dedicated `/dashboard/guides` page (Pro feature)

**Phase 4: Email Notification System (Days 14-15)** 📅 Planned
- React Email templates (billing reminders, unused alerts, welcome emails)
- Resend API integration
- Vercel Cron jobs (daily billing reminders, monthly unused alerts)
- Email preference management

**Day 16: Testing & Polish** 🎯 Final Day
- End-to-end testing
- Bug fixes
- Launch preparation

**Previous Gaps:** ALL RESOLVED ✅
- ✅ ~~Spotify OAuth `service_not_found` bug~~ → Fixed with validation
- ✅ ~~Manual usage tracking not wired to recommendation engine~~ → Wired with debouncing
- ✅ ~~No onboarding checklist~~ → Added in Day 4
- ✅ ~~No usage tracking prompts on subscriptions~~ → Added in Day 4
- ✅ ~~Migration 007/008/009/010 not executed~~ → Applied

**POST-MVP Features (Deferred):**
- 📅 Content Overlap Detector (JustWatch API)
- 📅 Price Monitoring & Alerts
- 📅 WhatsApp/SMS notifications
- 📅 Bundle optimizer enhancements

**What We've Built:**
- **Database:** 17 tables, 10 migrations (all applied), full RLS
- **Components:** 25+ reusable UI components
- **Lines of Code:** ~11,000+ TypeScript
- **AI Features:** 2/4 complete (Smart Downgrade + Bundle Optimizer)
- **Gmail Auto-Detection:** Full OAuth integration with encrypted token storage
- **Revenue Streams:** Freemium SaaS (in progress) + Affiliates ready
- **Security:** Production-ready (all critical/high-priority issues fixed)

**Documentation:** See `MVP_FINAL_SPRINT.md` for implementation guide, `SECURITY.md` for security documentation

---

## 🔥 The Philosophy

**"Ship Fast, Learn Fast, Iterate Fast"**

- ✅ Real user feedback > Perfect code
- ✅ Build → Measure → Learn → Repeat
- ✅ 2 weeks per feature, not 2 months
- ✅ AI-first approach to stand out

**Next Milestone:** Content Overlap Detector (Week 6-7)

---

## 🎯 MVP Launch Sprint: Day 4-7 Action Plan

### Critical Path to Beta Launch (Oct 14-17)

**Goal:** Fix 5 critical gaps → Beta launch by Oct 17

---

#### **Day 4 (Mon Oct 14) - 6 hours**

**🔴 CRITICAL FIXES**

**Morning (3 hours):**
- [ ] **Fix Spotify OAuth Bug** (30 min)
  - File: `app/api/oauth/spotify/callback/route.ts`
  - Issue: `service_not_found` error
  - Solution: Use case-insensitive service lookup with `.ilike('name', 'spotify')`

- [ ] **Run Migration 007** (5 min)
  - Action: Execute `supabase/migrations/007_manual_usage_tracking.sql` in Supabase SQL Editor
  - Then: `NOTIFY pgrst, 'reload schema';`

- [ ] **Wire Manual Usage to Recommendations** (2 hours)
  - File: `lib/recommendations/recommendation-engine.ts`
  - Add: `generateManualUsageRecommendation()` function
  - Test: Recommendations work with manual usage data

- [ ] **Test Spotify OAuth End-to-End** (15 min)

**Afternoon (3 hours):**
- [ ] **Test Google OAuth** (15 min)
- [ ] **Run Type Check & Fix Errors** (1 hour)
  - Command: `npm run type-check`
- [ ] **Add Onboarding Checklist** (1 hour)
  - File: `app/dashboard/page.tsx`
  - Component: Collapsible checklist card with progress bar
- [ ] **Test Checklist Flow** (15 min)
- [ ] **Commit & Push** (15 min)

**Success Criteria:** OAuth working, recommendations complete, checklist added

---

#### **Day 5 (Tue Oct 15) - 4 hours**

**🟡 UX IMPROVEMENTS**

- [ ] **Add Usage Tracking Prompts** (30 min)
  - File: `app/dashboard/page.tsx` (subscription cards)
  - Add: Yellow badge prompting users to add usage data

- [ ] **Improve Empty States** (1 hour)
  - Files: `app/dashboard/page.tsx` (recommendations, subscriptions)
  - Add: Contextual CTAs based on user state

- [ ] **Add Error Boundaries** (1 hour)
  - Files: `app/error.tsx`, `app/dashboard/error.tsx`
  - Add: Graceful error handling UI

- [ ] **Test All Error Scenarios** (30 min)

- [ ] **End-to-End Testing** (1 hour)
  - Test: Complete user journey (signup → add subscription → connect Spotify → view recommendation)

**Success Criteria:** Better UX, error handling, all flows tested

---

#### **Day 6 (Wed Oct 16) - 3 hours**

**🟡 POLISH & VALIDATION**

- [ ] **Add Zod Validation to Server Actions** (1.5 hours)
  - Files: `lib/subscriptions/subscription-actions.ts`, `lib/recommendations/recommendation-actions.ts`
  - Add: Input validation with Zod schemas

- [ ] **Fix Landing Page** (1 hour)
  - Add: Pricing section (#pricing)
  - Add: FAQ section
  - Improve: Hero section with clearer CTAs

- [ ] **Mobile Responsiveness Check** (30 min)
  - Test: Dashboard, landing page, onboarding on mobile devices

**Success Criteria:** Better validation, landing page complete

---

#### **Day 7 (Thu Oct 17) - 4 hours**

**🚀 BETA LAUNCH DAY!**

- [ ] **Final Smoke Testing** (1 hour)
  - Test all critical flows
  - Check analytics tracking
  - Verify email sending

- [ ] **Fix Critical Bugs** (1 hour)
  - Address any blockers found in testing

- [ ] **Deploy to Vercel Production** (30 min)
  - Update environment variables
  - Deploy to production
  - Verify deployment

- [ ] **Beta Launch Activities** (1.5 hours)
  - Send invites to 20-30 beta testers
  - Create feedback form (Google Forms or TypeForm)
  - Post to Twitter/LinkedIn announcing beta
  - Monitor PostHog for errors/issues

**Success Criteria:** BETA LIVE! 🚀

---

### Quick Wins (COMPLETED ✅)

**Highest ROI tasks completed in Day 4-5:**

1. ✅ Fix Spotify OAuth (30 min) → Unblocked key feature with validation
2. ✅ Run Migration 007/008 (5 min) → Enabled manual tracking + currency conversion
3. ✅ Wire manual usage to recommendations (2 hours) → Completed AI feature with debouncing
4. ✅ Add onboarding checklist (1 hour) → +20-30% activation improvement
5. ✅ Add usage prompts (30 min) → Makes recommendations work
6. ✅ **BONUS:** Comprehensive security audit (6 hours) → Production-ready security

**Impact:** 85% → 95% MVP ready! 🎉

---

### Week 2: Beta Testing & Iteration (Oct 21-25)

**Mon-Wed (6 hours):**
- Monitor PostHog analytics (funnels, drop-offs, user behavior)
- Fix bugs reported by beta testers
- Iterate on UX based on feedback
- Add rate limiting for production security

**Thu-Fri (4 hours):**
- Add demo video to landing page
- Performance optimizations (lazy loading, React.memo)
- Final polish based on beta feedback
- Prepare Product Hunt launch materials

---

### Technical Debt to Address Post-Beta

**MEDIUM Priority (1-2 weeks after launch):**
- [ ] Add rate limiting to API routes
- [ ] Optimize dashboard with lazy loading
- [ ] Add comprehensive error logging with Sentry contexts
- [ ] Sync theme preference to database
- [ ] Add request caching for frequently accessed data

**LOW Priority (Month 2):**
- [ ] Add pagination for subscriptions (when users have 50+)
- [ ] Optimize bundle matching algorithm performance
- [ ] Add comprehensive test suite (Jest + Playwright)
- [ ] Improve email templates with better branding

---

**Last Updated:** October 26, 2025
**Status:** 🚀 72% Complete - Final Sprint In Progress! Days 7-16 to Launch 🎯
