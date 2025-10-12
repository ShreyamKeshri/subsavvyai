# SubSavvyAI 🤖

**India's first AI-powered subscription optimizer** - AI finds ₹10,000/year hidden in your subscriptions.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)

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

1. **✅ Smart Downgrade Alerts** - "You use Spotify 4 hours/month. Downgrade to Free, save ₹1,428/year"
2. **✅ Bundle Optimizer** - "Switch to Jio bundle: Netflix + Hotstar + 14 OTTs for ₹999 instead of ₹2,198"
3. **⏳ Content Overlap Detector** - "47 movies are on all 3 platforms you pay for. Cancel one." (Coming soon)
4. **⏳ Price Hike Alerts** - "Netflix increased 23%. Here are cheaper alternatives." (Coming soon)

---

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.4 (App Router) + TypeScript
- **Build Tool:** Turbopack (faster dev builds)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **Database:** Supabase (PostgreSQL + Row-Level Security)
- **Authentication:** Supabase Auth (Email + Google OAuth)
- **Analytics:** PostHog (product analytics) + Sentry (error tracking)
- **Theme:** next-themes (dark mode support)
- **AI/ML:** Custom recommendation algorithms
- **OAuth:** Spotify API (usage tracking)
- **Forms:** react-hook-form + Zod validation
- **Notifications:** Sonner (toast notifications)
- **Charts:** Recharts (coming soon)
- **Hosting:** Vercel

---

## 📁 Project Structure

```
subsavvyai/
├── app/                          # Next.js 15 app directory
│   ├── (auth)/                   # Auth pages (login, signup, verify-email)
│   ├── dashboard/                # Protected dashboard
│   ├── api/                      # API routes
│   │   ├── oauth/spotify/        # Spotify OAuth endpoints
│   │   └── recommendations/      # AI recommendation API
│   └── layout.tsx                # Root layout with theme provider
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── subscriptions/            # Subscription CRUD components
│   ├── bundles/                  # Bundle optimizer components
│   ├── recommendations/          # AI recommendation components
│   └── usage/                    # Usage tracking components
├── lib/
│   ├── analytics/                # PostHog & Sentry tracking
│   ├── auth/                     # Authentication helpers
│   ├── bundles/                  # Bundle matching logic
│   ├── oauth/                    # Spotify OAuth integration
│   ├── recommendations/          # AI recommendation engine
│   ├── subscriptions/            # Subscription server actions
│   ├── supabase/                 # Supabase clients (client/server)
│   └── usage/                    # Usage tracking (OAuth + Manual)
├── supabase/
│   └── migrations/               # 7 database migrations
│       ├── 001_initial_schema.sql
│       ├── 002_security_events.sql
│       ├── 003_auto_create_profile.sql
│       ├── 004_proper_schema.sql
│       ├── 005_smart_downgrade_alerts.sql
│       ├── 006_telecom_bundles.sql
│       └── 007_manual_usage_tracking.sql
└── docs/                         # Core documentation (8 files)
    ├── BUGS.md
    ├── CLAUDE.md
    ├── DATABASE_SCHEMA.md
    ├── EMAIL_TEMPLATES.md
    ├── MVP_ROADMAP.md
    ├── PROGRESS.md
    ├── SECURITY.md
    ├── TESTING_GUIDE.md
    └── Thoughts.md
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([sign up free](https://supabase.com))
- Spotify Developer account (optional, for usage tracking)

### Installation

```bash
# Clone
git clone https://github.com/ShreyamKeshri/subsavvyai.git
cd subsavvyai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SPOTIFY_CLIENT_ID (optional)
# - SPOTIFY_CLIENT_SECRET (optional)
# - NEXT_PUBLIC_POSTHOG_KEY (optional)
# - NEXT_PUBLIC_SENTRY_DSN (optional)

# Run database migrations in Supabase SQL Editor
# Execute each file in supabase/migrations/ in order (001 → 007)

# Start development server
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

> **Note:** Use `127.0.0.1` instead of `localhost` for Spotify OAuth compatibility

---

## 📊 Development Progress

### Current Status: **MVP LAUNCH SPRINT - DAY 2 COMPLETE!** 🚀

**Launch Date:** October 31, 2025 (19 days remaining)

| Phase | Status | Progress |
|-------|--------|----------|
| **Foundation** (Auth + DB + UI) | ✅ Complete | 100% |
| **Subscription CRUD** | ✅ Complete | 100% |
| **Smart Downgrade Alerts** (AI) | ✅ Complete | 100% |
| **Bundle Optimizer** (AI) | ✅ Complete | 100% |
| **Manual Usage Tracking** | ✅ Complete | 100% |
| **Analytics Setup** | ✅ Complete | 100% |
| **Dark Mode** | ✅ Complete | 100% |
| **Content Overlap Detector** | ⏳ Week 4 | 0% |
| **Price Monitoring** | ⏳ Month 2 | 0% |

**Overall Progress:** 65% → 85% MVP features complete

---

## ✨ Completed Features

### 🔐 Authentication System
- ✅ Email/Password with verification
- ✅ Google OAuth
- ✅ Phone OTP (deferred to Month 2)
- ✅ Secure session management
- ✅ Password reset flow
- ✅ Email verification page
- ✅ Welcome emails via Resend

### 📊 Subscription Management
- ✅ Add/Edit/Delete subscriptions
- ✅ 52 pre-seeded Indian services
- ✅ Custom service support
- ✅ Multi-currency (INR, USD, EUR, GBP)
- ✅ Multiple billing cycles (monthly, quarterly, yearly)
- ✅ Auto-calculate next billing date
- ✅ Analytics dashboard (monthly/yearly spend)

### 🎨 UI/UX
- ✅ Savings-first dashboard design
- ✅ Dark/Light/System theme with next-themes
- ✅ Mobile responsive
- ✅ Toast notifications (Sonner)
- ✅ Loading states and empty states
- ✅ Beautiful v0-inspired components

### 🤖 AI Optimizer - Smart Downgrade Alerts
- ✅ Spotify OAuth integration
- ✅ Real usage tracking (listening hours)
- ✅ AI recommendation engine
  - Downgrade recommendations (low usage)
  - Cancel recommendations (zero usage)
  - Bundle recommendations (multi-service)
  - Overlap alerts (duplicate content)
- ✅ Confidence scoring (0-100%)
- ✅ Savings calculator
- ✅ Dashboard integration

### 📦 India Bundle Optimizer
- ✅ 20 telecom bundles (Jio, Airtel, Vi)
- ✅ AI matching algorithm
- ✅ Service name normalization
- ✅ Confidence scoring
- ✅ Savings calculator (monthly + annual)
- ✅ Beautiful bundle cards with expand/collapse
- ✅ Provider branding (🔵 Jio, 🔴 Airtel, 🟣 Vi)
- ✅ Click tracking for affiliate links

### 📈 Manual Usage Tracking (Hybrid System)
- ✅ Usage survey dialog
- ✅ Frequency selection (Daily/Weekly/Monthly/Rarely/Never)
- ✅ Frequency-to-hours conversion
- ✅ Works for non-OAuth services (Netflix, Hotstar, Prime Video, etc.)
- ✅ Hybrid system: OAuth (Spotify) + Manual (all others)

### 📊 Analytics & Monitoring
- ✅ PostHog integration (13 event types)
  - Signup tracking (email/Google)
  - Subscription CRUD events
  - Spotify connection tracking
  - Recommendation views/implementations
  - **Revenue-critical:** Affiliate click tracking
- ✅ Sentry error tracking
  - Privacy filters (PII scrubbing)
  - Release tracking
  - Breadcrumb tracking

### 🔒 Security
- ✅ Row-Level Security (RLS) on all tables
- ✅ Encrypted OAuth tokens
- ✅ Secure password hashing
- ✅ Security event logging
- ✅ HTTPS-only in production
- ✅ CSP headers configured

### 🗄️ Database
- ✅ 7 migrations applied
- ✅ 17 tables with RLS policies
- ✅ Auto-triggers for analytics cache
- ✅ Materialized views for performance
- ✅ 52 Indian services seeded
- ✅ 20 telecom bundles seeded

---

## 🎯 Recent Accomplishments (Day 2 - Oct 12, 2025)

### Analytics Infrastructure ✅
- PostHog client & server-side tracking
- Sentry error tracking with privacy filters
- Revenue-critical affiliate click tracking
- CSP headers updated for analytics domains

### Critical Bug Fixes ✅
- **RESEND_API_KEY:** Lazy initialization prevents signup blocking
- **Settings page:** Fixed database column errors (user_id → id)
- **Edit/Delete subscription:** Wired up existing components
- All critical bugs from Thoughts.md resolved!

### Dark Mode Implementation ✅
- Implemented with next-themes (Light/Dark/System)
- Enhanced ThemeToggle with dropdown menu
- Zero-flash dark mode with localStorage persistence

### Spotify OAuth Documentation ✅
- Created comprehensive SPOTIFY_SETUP.md
- Fixed redirect URI security requirement (127.0.0.1 not localhost)
- Updated .env.example with correct values

### Manual Usage Tracking ✅
- Migration 007: Extended service_usage table
- Server actions for CRUD operations
- UsageSurveyDialog component with frequency selection
- Frequency-to-hours conversion (daily→60, weekly→20, etc.)
- Hybrid system works alongside OAuth tracking

---

## 🇮🇳 Supported Indian Services (52+)

We have pre-loaded data for:

- **OTT:** Netflix, Prime Video, Disney+ Hotstar, SonyLIV, ZEE5, Voot, MX Player, ALTBalaji, Eros Now, Hoichoi, Sun NXT
- **Music:** Spotify, Apple Music, YouTube Music, JioSaavn, Gaana, Wynk Music, Hungama Music, Amazon Music
- **Food Delivery:** Zomato Gold, Swiggy One, Dineout Passport, EazyDiner Prime
- **Cloud Storage:** Google Drive, Dropbox, OneDrive, iCloud, pCloud
- **SaaS:** Microsoft 365, Google Workspace, Adobe Creative Cloud, Canva Pro, Notion, Figma
- **Fitness:** Cult.fit, HealthifyMe, Fitpass, Cure.fit
- **News & Magazines:** Times Prime, The Hindu, Economic Times, India Today, Outlook
- **Gaming:** Xbox Game Pass, PlayStation Plus, Nintendo Switch Online, EA Play
- **Education:** Coursera Plus, Udemy, Unacademy, BYJU'S, Vedantu

Full list in `supabase/migrations/001_initial_schema.sql`

---

## 📦 Telecom Bundles (20)

Pre-loaded bundles from:

- **Jio** (6 bundles): JioFiber plans with OTT bundles
- **Airtel** (9 bundles): Xstream Fiber + Black plans
- **Vi** (5 bundles): Vi Movies & TV bundles

Each bundle includes:
- Multiple OTT services (Netflix, Hotstar, Prime Video, etc.)
- High-speed internet
- Pricing (monthly/yearly)
- Data benefits
- Additional perks

---

## 💰 Revenue Model

### 1. Affiliate Revenue (Primary - Month 1)
- **Telecom bundles:** ₹500-1,000 per signup
- **Alternative services:** 10-20% commission
- **Target:** ₹50,000/month by Month 3

### 2. Freemium SaaS (Month 2)
- **Free:** Track 5 subscriptions, basic alerts
- **Pro (₹99/mo):** Unlimited + AI optimization + priority support
- **Target:** 1,000 paying users by Month 6

### 3. B2B SaaS (Month 6+)
- Corporate employee benefits
- ₹99/employee/year
- Bulk licensing for 100+ employees

---

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack (fast!)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Utilities
npm run format       # Format code with Prettier (if configured)
```

---

## 📚 Documentation

### Core Documentation (Always maintained):
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidelines & architecture
- **[PROGRESS.md](./PROGRESS.md)** - Detailed development log & sprint status
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database schema
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive test plan
- **[BUGS.md](./BUGS.md)** - Known issues tracker (0 critical bugs!)
- **[SECURITY.md](./SECURITY.md)** - Security measures & policies
- **[EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md)** - Email templates
- **[MVP_ROADMAP.md](./MVP_ROADMAP.md)** - Product roadmap & milestones
- **[Thoughts.md](./Thoughts.md)** - Developer notes & observations

### Feature Documentation:
- **[SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md)** - Spotify OAuth setup guide

---

## 🧪 Testing

Comprehensive testing guide available in [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Test Coverage:
- ✅ Authentication flows (Email, Google OAuth)
- ✅ Subscription CRUD operations
- ✅ Dashboard analytics calculations
- ✅ AI recommendation generation
- ✅ Bundle matching algorithm
- ✅ Manual usage tracking
- ✅ OAuth integration (Spotify)
- ⏳ End-to-end user journeys (pending)

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables (Vercel)
Add these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI` (use production URL)
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

---

## 🗓️ Roadmap

### Month 1 (October 2025) - MVP Launch
- ✅ Week 1: Foundation (Auth, DB, UI)
- ✅ Week 2: Smart Downgrade Alerts (AI)
- ✅ Week 3: Bundle Optimizer (AI)
- ⏳ Week 4: Beta testing + Bug fixes
- 🎯 **Launch:** October 31, 2025 (Product Hunt + Reddit + Twitter)

### Month 2 (November 2025) - Growth
- Content Overlap Detector
- Price monitoring & alerts
- Freemium tier introduction
- Email automation improvements
- User onboarding optimization

### Month 3+ (December 2025 onwards)
- Mobile app (React Native)
- Chrome extension
- Advanced AI recommendations
- B2B SaaS features
- International expansion

---

## 🤝 Contributing

This is a personal project by **Shreyam Keshri**.

Contributions welcome after MVP launch! For now:
- 🐛 Report bugs in [BUGS.md](./BUGS.md)
- 💡 Share feature ideas in GitHub Issues
- 📧 Contact: [your-email@example.com]

---

## 📄 License

Private project - Not yet licensed for public use.

© 2025 Shreyam Keshri. All rights reserved.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Next.js](https://nextjs.org) - The React Framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [PostHog](https://posthog.com) - Product analytics
- [Sentry](https://sentry.io) - Error tracking
- [Vercel](https://vercel.com) - Deployment platform

Special thanks to Claude Code for development assistance! 🤖

---

## 📞 Contact

- **Developer:** Shreyam Keshri
- **Email:** [your-email@example.com]
- **GitHub:** [@ShreyamKeshri](https://github.com/ShreyamKeshri)
- **Project:** [SubSavvyAI](https://github.com/ShreyamKeshri/subsavvyai)

---

**Status:** 🚀 MVP Launch Sprint (Day 2/21 Complete) | **Branch:** `feature/day2-analytics-setup` | **Progress:** 65% → 85%

**Next Milestone:** Day 3 - Landing Page Optimization (Oct 13, 2025)

**Critical Bugs:** 0 🎉 | **Open Issues:** 5 (2 medium, 3 low)

---

Made with ❤️ in India 🇮🇳
