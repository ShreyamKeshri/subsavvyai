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
- **Security:** AES-256-GCM encryption, CSRF protection, rate limiting
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
│   │   └── feedback/             # Dedicated feedback page (NEW)
│   ├── api/                      # API routes
│   │   ├── canny/sso/            # Canny SSO token generation (NEW)
│   │   ├── oauth/spotify/        # Spotify OAuth endpoints
│   │   └── recommendations/      # AI recommendation API
│   └── layout.tsx                # Root layout with theme provider + FloatingFeedbackButton
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   └── notification-bell.tsx # Notification bell with localStorage persistence
│   ├── feedback/                 # Feedback system (NEW)
│   │   ├── CannyModal.tsx        # Canny feedback modal with SSO
│   │   └── FloatingFeedbackButton.tsx  # Floating feedback button
│   ├── subscriptions/            # Subscription CRUD components
│   ├── bundles/                  # Bundle optimizer components
│   ├── recommendations/          # AI recommendation components
│   └── usage/                    # Usage tracking components
├── lib/
│   ├── analytics/                # PostHog & Sentry tracking
│   ├── auth/                     # Authentication helpers
│   ├── bundles/                  # Bundle matching logic
│   ├── crypto/                   # AES-256-GCM encryption (NEW)
│   ├── currency/                 # Currency conversion utilities
│   ├── oauth/                    # Spotify OAuth integration
│   ├── recommendations/          # AI recommendation engine
│   ├── subscriptions/            # Subscription server actions
│   ├── supabase/                 # Supabase clients (client/server)
│   ├── usage/                    # Usage tracking (OAuth + Manual)
│   ├── utils/                    # Debounce & race condition prevention (NEW)
│   └── validators.ts             # Zod validation schemas (NEW)
├── supabase/
│   └── migrations/               # 10 database migrations (ALL APPLIED)
│       ├── 001_initial_schema.sql
│       ├── 002_security_events.sql
│       ├── 003_auto_create_profile.sql
│       ├── 004_proper_schema.sql
│       ├── 005_smart_downgrade_alerts.sql
│       ├── 006_telecom_bundles.sql
│       ├── 007_manual_usage_tracking.sql
│       ├── 008_currency_conversion.sql
│       ├── 009_gmail_tokens.sql
│       └── 010_gmail_scan_tracking.sql
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
# Execute each file in supabase/migrations/ in order (001 → 010)

# Start development server
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

> **Note:** Use `127.0.0.1` instead of `localhost` for Spotify OAuth compatibility

---

## 📊 Development Progress

### Current Status: **MVP LAUNCH SPRINT - DAY 7 COMPLETE!** 🚀

**Security Status:** 🟢 Production-Ready

**Launch Date:** October 31, 2025 (6 days remaining)

| Phase | Status | Progress |
|-------|--------|----------|
| **Foundation** (Auth + DB + UI) | ✅ Complete | 100% |
| **Subscription CRUD** | ✅ Complete | 100% |
| **Smart Downgrade Alerts** (AI) | ✅ Complete | 100% |
| **Bundle Optimizer** (AI) | ✅ Complete | 100% |
| **Manual Usage Tracking** | ✅ Complete | 100% |
| **Analytics Setup** | ✅ Complete | 100% |
| **Dark Mode** | ✅ Complete | 100% |
| **Currency Conversion** | ✅ Complete | 100% |
| **Edit/Delete Subscriptions** | ✅ Complete | 100% |
| **Error Boundaries** | ✅ Complete | 100% |
| **Security Audit & Fixes** | ✅ Complete | 100% |
| **Canny Feedback Integration** | ✅ Complete | 100% |
| **Notification Persistence** | ✅ Complete | 100% |
| **Gmail OAuth Integration** | ✅ Complete | 100% |
| **Onboarding Tracking** | ✅ Complete | 100% |
| **Content Overlap Detector** | ⏳ POST-MVP | 0% |
| **Price Monitoring** | ⏳ POST-MVP | 0% |

**Overall Progress:** 65% → 97% MVP features complete

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

### 💬 Feedback System
- ✅ Canny feedback integration with JWT-based SSO
- ✅ Floating feedback button with SubSavvyAI branding
- ✅ Seamless user authentication (auto-login)
- ✅ PostHog analytics tracking for feedback interactions
- ✅ Dedicated feedback page at /dashboard/feedback
- ✅ Public board configuration for free tier

### 🔔 Notification System
- ✅ Notification bell with read/unread indicators
- ✅ localStorage persistence across page navigation
- ✅ Savings opportunity alerts
- ✅ Billing reminder notifications
- ✅ Manual mark as read/unread functionality

### 💱 Currency Conversion System
- ✅ Automatic conversion to INR for all subscriptions
- ✅ Support for 8 currencies with real-time rates
- ✅ Preserves original currency information
- ✅ Transparent display: "₹16,624.00/month (was USD 200.00)"
- ✅ Consistent calculations across all analytics
- ✅ International user support

### 🎨 UX Improvements
- ✅ Toast-based delete confirmation (replaces browser alerts)
- ✅ Edit/Delete action buttons on subscription cards
- ✅ Usage tracking prompts for missing data
- ✅ Contextual empty states with actionable CTAs
- ✅ Error boundaries (root + dashboard levels)
- ✅ Improved responsive design

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

### 🔒 Security (🟢 Production-Ready)
- ✅ Row-Level Security (RLS) on all tables
- ✅ **OAuth Token Encryption** (AES-256-GCM)
- ✅ **Comprehensive Input Validation** (Zod schemas)
- ✅ **CSRF Protection** (OAuth flows)
- ✅ **Rate Limiting** (API abuse prevention)
- ✅ **Memory Leak Fixes** (client caching, debouncing)
- ✅ Secure password hashing
- ✅ Security event logging
- ✅ HTTPS-only in production
- ✅ CSP headers configured

### 🗄️ Database
- ✅ 10 migrations applied
- ✅ 18 tables with RLS policies
- ✅ Auto-triggers for analytics cache
- ✅ Materialized views for performance
- ✅ 52 Indian services seeded
- ✅ 20 telecom bundles seeded
- ✅ Gmail OAuth token storage (encrypted)

---

## 🎯 Recent Accomplishments

### Day 7 (Oct 25, 2025): Gmail OAuth Integration + Onboarding Tracking ✅

**Status:** ✅ Gmail integration and onboarding tracking complete

**Gmail OAuth Fixes:**
- ✅ **Fixed Gmail OAuth Flow** - Resolved authentication and redirect issues
- ✅ **Migration 009: gmail_tokens table** - Encrypted token storage (AES-256-GCM)
- ✅ **Google OAuth compatibility** - Fixed "redirect_uri_mismatch" errors
- ✅ **Multi-auth support** - Works with email/password + Gmail OAuth
- ✅ **Tested end-to-end** - Connection and disconnection flows working

**Onboarding Checklist Tracking:**
- ✅ **Migration 010: gmail_scan_completed** - Dynamic checklist tracking
- ✅ **Automatic status updates** - Marks complete when subscriptions imported
- ✅ **Dashboard integration** - Fetches and displays actual completion status
- ✅ **Fixed hardcoded values** - No more static `completed: false`
- ✅ **RLS-compliant queries** - UPDATE instead of UPSERT to avoid policy issues

**Calendar UX Improvements:**
- ✅ **Auto-close on date selection** - Better user experience
- ✅ **Fixed position bouncing** - Stable popover positioning
- ✅ **State management** - Proper open/close handling

**Database Query Fixes:**
- ✅ **Removed non-existent columns** - Fixed console errors
  - Removed `currency` from user_preferences
  - Removed `sms_enabled` from notification_preferences
- ✅ **TypeScript compilation** - All errors resolved

**SMS/Phone Cleanup:**
- ✅ **Removed SMS notification UI** - Cleaner interface
- ✅ **Removed phone_number field** - From profile settings
- ✅ **Database schema preserved** - Kept for minimal disruption

**Files Modified:**
- `supabase/migrations/010_gmail_scan_tracking.sql` - New migration
- `lib/gmail/import-actions.ts` - Mark scan as completed
- `lib/settings/settings-actions.ts` - Fixed column errors, removed phone/SMS
- `app/dashboard/page.tsx` - Fetch and display scan completion
- `components/usage/usage-survey-dialog.tsx` - Calendar auto-close
- `components/settings/*` - Removed SMS/phone references

**Impact:**
- Onboarding checklist now accurately tracks progress
- Gmail OAuth ready for subscription auto-detection
- Better UX with calendar auto-close
- Cleaner codebase without unused features
- No more console errors

---

### Day 6 (Oct 19, 2025): Canny Feedback Integration + Notification Persistence ✅

**Status:** ✅ Feedback system fully operational

**Canny Feedback Integration (PR #26):**
- ✅ **JWT-based SSO authentication** - Seamless single sign-on using jsonwebtoken
- ✅ **Canny modal component** - Full-screen modal with aggressive storage cleanup
- ✅ **Floating feedback button** - SubSavvyAI branded (#2a9d8f Persian Green)
- ✅ **User identity management** - Auto-populates name, email, avatar from Supabase
- ✅ **PostHog tracking** - Analytics for feedback modal interactions
- ✅ **Public board configuration** - Free tier setup (no Custom plan needed)
- ✅ **Dedicated feedback page** - Available at `/dashboard/feedback`

**Notification Persistence Fix:**
- ✅ **localStorage state management** - Read/unread status persists across sessions
- ✅ **Multi-user support** - Aggressive Canny storage cleanup prevents user caching
- ✅ **Error handling** - Graceful fallback for localStorage failures

**Files Created:**
- `app/api/canny/sso/route.ts` - Server-side JWT token generation
- `components/feedback/CannyModal.tsx` - Feedback modal with SSO
- `components/feedback/FloatingFeedbackButton.tsx` - Floating action button
- `app/dashboard/feedback/page.tsx` - Dedicated feedback page

**Files Modified:**
- `components/ui/notification-bell.tsx` - Added localStorage persistence
- `app/layout.tsx` - Added FloatingFeedbackButton
- `package.json` - Added jsonwebtoken dependency
- `.env.example` - Added Canny environment variables

**Dependencies Added:**
- `jsonwebtoken` v9.0.2 - JWT generation for Canny SSO

**Impact:**
- Users can now submit feedback without creating separate Canny account
- Read/unread notification state persists across page navigation and browser sessions
- Seamless user experience with auto-authentication
- Foundation for user feedback-driven product iteration

---

### Day 5 (Oct 17, 2025): Critical Security Audit & Fixes ✅

**Status:** 🟢 Production-Ready Security Posture

**Security Improvements (PR #25):**
- ✅ **Fixed useAuth infinite re-render** - Prevents memory leaks and browser freezing
- ✅ **Comprehensive input validation** - Zod schemas for all server actions (subscriptions, usage, recommendations, bundles)
- ✅ **CSRF protection** - State tokens for OAuth flows with httpOnly cookies
- ✅ **Rate limiting** - IP-based API abuse prevention
- ✅ **Debounced updates** - Fire-and-forget pattern prevents race conditions
- ✅ **OAuth token encryption** - AES-256-GCM with graceful fallback, backward compatible
- ✅ **Supabase client memory leak fix** - Client caching prevents unbounded WebSocket connections
- ✅ **Security documentation** - Created comprehensive SECURITY_AUDIT.md

**Files Created:**
- `lib/crypto/encryption.ts` - AES-256-GCM encryption utilities
- `lib/utils/debounce.ts` - Race condition prevention
- `lib/validators.ts` - Zod validation schemas
- `SECURITY_AUDIT.md` - Complete security audit (23 issues reviewed)

**Security Posture:**
- **Before:** 🟡 Moderate (5 critical, 2 high-priority issues)
- **After:** 🟢 Production-Ready (0 critical, 0 high-priority issues)

**Impact:**
- All critical vulnerabilities fixed
- OAuth tokens now encrypted in database
- Memory leaks eliminated (stable long-running sessions)
- Input validation prevents injection attacks
- Ready for production deployment

---

### Day 4 (Oct 17, 2025): Currency Conversion + UX Polish ✅

**Currency Conversion System:**
- Automatic conversion of all costs to INR
- Support for 8 major currencies (USD, EUR, GBP, AUD, CAD, SGD, AED)
- Preserves original currency for transparency
- Display format: "₹16,624.00/month (was USD 200.00)"
- Migration 008: Added original_cost and original_currency columns
- Consistent analytics with INR normalization

**UX Improvements:**
- **Toast-based delete confirmation** - Replaced browser alerts with modern toast notifications
- **Edit/Delete buttons** - Added action buttons to subscription cards
- **Usage tracking prompts** - Visual indicators for subscriptions needing usage data
- **Contextual empty states** - Different prompts based on user state
- **Error boundaries** - Graceful error handling with retry options

**Impact:**
- International users can now enter costs in their local currency
- Better UX with non-blocking confirmations
- Improved onboarding with contextual guidance
- Error resilience across the app

---

### Day 2 (Oct 12, 2025): Analytics + Bug Fixes ✅

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
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database schema (10 migrations)
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive test plan
- **[BUGS.md](./BUGS.md)** - Known issues tracker (0 critical bugs!)
- **[SECURITY.md](./SECURITY.md)** - Security measures & policies (v1.2)
- **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** - Complete security audit (NEW - Day 5)
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
- `ENCRYPTION_KEY` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `NEXT_PUBLIC_CANNY_APP_ID`
- `NEXT_PUBLIC_CANNY_BOARD_TOKEN`
- `CANNY_SSO_SECRET`
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

**Status:** 🚀 MVP Launch Sprint (Day 7/21 Complete) | **Branch:** `main` | **Progress:** 97%

**Security:** 🟢 Production-Ready | **Next Milestone:** Final Polish & Pre-Launch Testing

**Critical Bugs:** 0 🎉 | **Critical Security Issues:** 0 🔒 | **Lines of Code:** 10,500+

---

Made with ❤️ in India 🇮🇳
