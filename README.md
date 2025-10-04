# Unsubscribr AI 🤖

**India's first AI-powered subscription optimizer** - AI finds ₹10,000/year hidden in your subscriptions.

> **🚨 PIVOT IN PROGRESS:** We're evolving from a basic tracker to an AI optimizer. See [PIVOT_PLAN.md](./PIVOT_PLAN.md) for details.

---

## 🎯 What We Do

We don't just track subscriptions - **we optimize them using AI**.

### The Problem:
- Indians waste ₹800-1500/month on overlapping OTT subscriptions
- People pay for Premium plans but use Free-tier features
- Telecom bundles offer better deals but nobody knows about them
- Subscription prices increase and nobody notices

### Our Solution:
**AI-powered optimization** that actually saves you money:

1. **Smart Downgrade Alerts** - "You use Spotify 4 hours/month. Downgrade to Free, save ₹1,428/year"
2. **Bundle Optimizer** - "Switch to Vi bundle: Hotstar + Zee5 + SonyLIV for ₹999 instead of ₹2,198"
3. **Content Overlap Detector** - "47 movies are on all 3 platforms you pay for. Cancel one."
4. **Price Hike Alerts** - "Netflix increased 23%. Here are cheaper alternatives."

---

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.4 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Phone OTP + Google OAuth)
- **AI/ML:** Custom optimization algorithms (future: OpenAI API)
- **Notifications:** Firebase Cloud Messaging
- **Payments:** Razorpay (India)
- **Charts:** Recharts
- **Forms:** react-hook-form + Zod validation
- **Hosting:** Vercel

---

## 📁 Project Structure

```
unsubscribr/
├── app/                    # Next.js 15 app directory
│   ├── (auth)/            # Auth pages (login, signup, verify-email)
│   ├── (dashboard)/       # Protected dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── subscriptions/     # Subscription CRUD components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── subscriptions/     # Subscription server actions
│   └── auth/              # Authentication helpers
├── supabase/
│   ├── migrations/        # Database migrations
│   └── seeds/             # Seed data (52 Indian services)
└── docs/                  # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Firebase account (for push notifications)

### Installation

```bash
# Clone
git clone https://github.com/ShreyamKeshri/unsubscribr.git
cd unsubscribr

# Install
npm install

# Setup environment
cp .env.example .env.local
# Add your Supabase and Firebase credentials

# Run migrations
npm run db:push

# Seed database (52 Indian services)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Development Progress

### Current Status: **PIVOTING TO AI OPTIMIZER** 🚀

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1-3:** Foundation (Auth + DB + UI) | ✅ Complete | 100% |
| **Phase 4:** Subscription CRUD | ✅ Complete | 100% |
| **Phase 5:** Smart Downgrade Alerts (AI) | 🔄 In Progress | 0% |
| **Phase 6:** India Bundle Optimizer (AI) | ⏳ Next | 0% |
| **Phase 7:** Content Overlap Detector (AI) | ⏳ Planned | 0% |
| **Phase 8:** Price Monitoring & Alerts | ⏳ Future | 0% |

**Overall Progress:** 40% (Foundation solid, AI features upcoming)

---

## ✨ What's Built (Foundation)

### ✅ Completed Features:

1. **Authentication System**
   - Email/Password with verification
   - Phone OTP (India: +91)
   - Google OAuth
   - Proper verification flow (no more alerts!)

2. **Subscription Management**
   - Add/Edit/Delete subscriptions
   - Choose from 52 pre-seeded Indian services
   - Custom service support
   - Multi-currency (INR, USD, EUR, GBP)
   - Multiple billing cycles (monthly, quarterly, yearly)

3. **Dashboard**
   - Real-time stats (active subs, monthly spend, upcoming renewals)
   - Subscription table with actions
   - Empty states and loading states
   - Mobile responsive

4. **Database**
   - Normalized schema (4 migrations applied)
   - Row Level Security (RLS)
   - Auto-triggers for profile creation
   - 52 Indian services seeded

---

## 🎯 AI Features (Coming Soon)

See [PIVOT_PLAN.md](./PIVOT_PLAN.md) for detailed roadmap.

### Week 1: Smart Downgrade Alerts
- OAuth integration with Spotify, Netflix
- Usage tracking
- AI recommendation engine

### Week 2: India Bundle Optimizer
- Telecom bundles database (Jio, Airtel, Vi)
- Matching algorithm
- Savings calculator
- **Soft launch to friends/family**

### Week 3-4: Content Overlap Detector
- Content catalog integration
- AI matching algorithm
- Overlap visualization
- **Public launch on Product Hunt**

---

## 🇮🇳 Supported Indian Services (52+)

We have pre-loaded data for:

- **OTT:** Netflix, Prime Video, Hotstar, SonyLIV, ZEE5, Voot, etc.
- **Music:** Spotify, Apple Music, JioSaavn, Gaana, YouTube Music
- **Food:** Zomato Gold, Swiggy One, Dineout Passport
- **SaaS:** Microsoft 365, Google Workspace, Adobe, Canva Pro
- **Fitness:** Cult.fit, HealthifyMe, Fitpass
- **News:** Times Prime, The Hindu, Economic Times
- **Gaming:** Xbox Game Pass, PlayStation Plus
- **Education:** Coursera, Udemy, Unacademy, BYJU'S

Full list in `supabase/seeds/001_indian_services.sql`

---

## 💰 Revenue Model (Planned)

1. **Freemium SaaS**
   - Free: Track 5 subscriptions, basic alerts
   - Pro (₹99/mo): Unlimited + AI optimization + priority support

2. **Affiliate Revenue**
   - Telecom bundles: ₹500-1000/signup
   - Alternative services: 10-20% commission

3. **B2B SaaS**
   - Corporate employee benefits
   - ₹99/employee/year

---

## 🔧 Scripts

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

---

## 📚 Documentation

- **[PIVOT_PLAN.md](./PIVOT_PLAN.md)** - AI optimizer pivot strategy & roadmap
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidelines
- **[BUGS.md](./BUGS.md)** - Known issues & fixes
- **[PROGRESS.md](./PROGRESS.md)** - Detailed development log

---

## 🤝 Contributing

Personal project by **Shreyam Keshri**. Open to contributions after MVP launch!

---

## 🙏 Built With

- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Supabase](https://supabase.com) - Database & Auth
- [Firebase](https://firebase.google.com) - Push notifications
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

## 📄 License

Private project - Not yet licensed for public use.

---

**Status:** 🚀 Pivoting to AI | **Branch:** `feature/ai-optimizer-pivot` | **Progress:** 40%

**Next Milestone:** Smart Downgrade Alerts (Week 1) - Target: Oct 11, 2025
