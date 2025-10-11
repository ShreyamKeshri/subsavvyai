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
❌ **Don't** skip testing (use TESTING_GUIDE.md)
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

**Phase:** AI Features Phase 3 - Bundle Optimizer Complete! ✅

**Overall Progress:** 60% Complete

**Completed:**
- ✅ Phase 1: Foundation (Auth, Dashboard, Subscriptions)
- ✅ Phase 2: Smart Downgrade Alerts (Spotify OAuth + AI recommendations)
- ✅ Phase 3: India Bundle Optimizer (20 bundles + matching algorithm)

**Next Up:**
- 🔄 Phase 4: Content Overlap Detector (Week 6-7)
- 📅 Phase 5: Price Monitoring & Alerts (Month 2)

**What We've Built:**
- **Database:** 17 tables, 6 migrations, full RLS
- **Components:** 20+ reusable UI components
- **Lines of Code:** ~8,500 TypeScript
- **AI Features:** 2/4 complete (Smart Downgrade + Bundle Optimizer)
- **Revenue Streams:** Freemium SaaS + Affiliates ready

---

## 🔥 The Philosophy

**"Ship Fast, Learn Fast, Iterate Fast"**

- ✅ Real user feedback > Perfect code
- ✅ Build → Measure → Learn → Repeat
- ✅ 2 weeks per feature, not 2 months
- ✅ AI-first approach to stand out

**Next Milestone:** Content Overlap Detector (Week 6-7)

---

**Last Updated:** October 11, 2025
**Status:** 🚀 On Track
