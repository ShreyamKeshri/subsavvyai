# Unsubscribr 🎯

A web-based subscription management platform built for the Indian market. Track, manage, and cancel your recurring subscriptions all in one place.

## 🚀 Project Overview

Unsubscribr helps Indian consumers discover, track, and manage all their recurring subscriptions - from OTT platforms to SaaS tools. Get visibility into your monthly spending, receive renewal reminders, and access guided cancellation flows.

**Target:** Save users ₹500-1000/month by helping them identify and eliminate unwanted subscriptions.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Backend:** Next.js API Routes (Serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Phone OTP + OAuth)
- **Notifications:** Firebase Cloud Messaging
- **Payments:** Razorpay (India) + Stripe (future)
- **Charts:** Recharts
- **Forms:** react-hook-form + Zod
- **Hosting:** Vercel

## 📁 Project Structure

```
unsubscribr/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn)
│   ├── auth/             # Authentication components
│   ├── subscriptions/    # Subscription management
│   ├── dashboard/        # Dashboard & analytics
│   ├── notifications/    # Notification components
│   ├── cancellation/     # Cancellation guides
│   └── onboarding/       # Welcome flow
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase clients (browser, server, middleware)
│   ├── firebase/         # Firebase config & messaging
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
├── constants/             # App constants (Indian services list)
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Firebase account and project (for notifications)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ShreyamKeshri/unsubscribr.git
cd unsubscribr
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your credentials to `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📊 Development Progress

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1:** Project Setup & Architecture | ✅ Complete | 100% |
| **Phase 2:** Database Design & Schema | ✅ Complete | 100% |
| **Phase 3:** Authentication System | 🔄 In Progress | 90% |
| **Phase 4:** Core Subscription Management | ⏳ Pending | 0% |
| **Phase 5:** Dashboard & Analytics | ⏳ Pending | 0% |
| **Phase 6:** Notifications System | ⏳ Pending | 0% |
| **Phase 7:** Cancellation Guides | ⏳ Pending | 0% |
| **Phase 8:** Polish & Testing | ⏳ Pending | 0% |

**Current Status:** Phase 3 - Authentication UI complete, Supabase provider setup pending

See [PROGRESS.md](./PROGRESS.md) for detailed development tracking and milestones.

## 🎯 Key Features (MVP)

- **Manual Subscription Entry:** Add subscriptions with service name, cost, billing cycle, and date
- **Dashboard:** View total monthly/yearly spending with upcoming renewals
- **Renewal Reminders:** Push notifications 3 days and 1 day before renewal
- **Cancellation Guides:** Step-by-step instructions for popular Indian services
- **Analytics:** Spending breakdown by category with trend charts
- **50+ Indian Services:** Pre-loaded list of popular subscriptions (OTT, Music, SaaS, etc.)

## 🇮🇳 Supported Indian Services

The app includes 50+ popular Indian subscription services across categories:

- **OTT:** Netflix, Prime Video, Disney+ Hotstar, SonyLIV, ZEE5, Voot, and more
- **Music:** Spotify, Apple Music, JioSaavn, Gaana, YouTube Music
- **Food Delivery:** Zomato Gold, Swiggy One, Dineout Passport
- **SaaS:** Microsoft 365, Google Workspace, Adobe Creative Cloud, Canva Pro
- **Fitness:** Cult.fit, HealthifyMe, Fitpass
- **News:** Times Prime, The Hindu, Economic Times
- **Gaming:** Xbox Game Pass, PlayStation Plus, Apple Arcade
- **Education:** Coursera, Udemy, Unacademy, BYJU'S

## 🔧 Available Scripts

```bash
# Development with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Add shadcn component
npx shadcn@latest add [component-name]
```

## 🤝 Contributing

This is a personal project by Shreyam Keshri. Contributions are welcome after MVP launch!

## 📄 License

This project is private and not yet licensed for public use.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database and Auth by [Supabase](https://supabase.com)
- Notifications by [Firebase](https://firebase.google.com)

---

## 📚 Documentation

- **[PROGRESS.md](./PROGRESS.md)** - Development plan, progress tracking, and milestones
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database structure and RLS policies
- **[PHASE_3_AUTH_SETUP.md](./PHASE_3_AUTH_SETUP.md)** - Authentication setup guide (Supabase providers)

---

**Status:** 🚧 In Active Development | **Phase 3:** 90% Complete | **Overall:** 60%
