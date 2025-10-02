# Unsubscribr - Development Progress Tracker

**Project:** Subscription Management Platform for Indian Market
**Tech Stack:** Next.js 14 + TypeScript + Tailwind + Supabase + Firebase
**Developer:** Shreyam Keshri
**Started:** October 2025

---

## 📊 Overall Progress: 5% Complete

- **Phase 1:** 🟡 In Progress (25% done)
- **Phase 2:** ⚪ Not Started
- **Phase 3:** ⚪ Not Started
- **Phase 4:** ⚪ Not Started
- **Phase 5:** ⚪ Not Started
- **Phase 6:** ⚪ Not Started
- **Phase 7:** ⚪ Not Started
- **Phase 8:** ⚪ Not Started

---

## PHASE 1: Project Setup & Architecture

### ✅ Checkpoint 1.0: Initial Scaffold (COMPLETED)
- [x] Next.js 14 project initialized
- [x] TypeScript configured
- [x] Tailwind CSS installed
- [x] Basic layout and home page created
- [x] Core dependencies installed (Supabase, Firebase, Razorpay, Stripe)
- **Commit:** `24e9129` - "Initial Next.js 14 + TypeScript + Tailwind + Turbopack scaffold"
- **Date Completed:** Oct 3, 2025

### 🟡 Checkpoint 1.1: Install Additional Dependencies (IN PROGRESS)
**Status:** Not Started
**Tasks:**
- [ ] Install UI libraries (shadcn/ui components)
- [ ] Install Supabase auth helpers: `@supabase/auth-helpers-nextjs`
- [ ] Install chart library: `recharts`
- [ ] Install validation library: `zod`
- [ ] Install date utilities: `date-fns`
- [ ] Install icons: `lucide-react`
- [ ] Install toast notifications: `sonner`
- [ ] Install form handling: `react-hook-form` + `@hookform/resolvers`

**Commands to run:**
```bash
npm install @supabase/auth-helpers-nextjs
npm install recharts zod date-fns lucide-react sonner
npm install react-hook-form @hookform/resolvers
npx shadcn@latest init
```

**Git Commit Message:** `"Setup: Install additional dependencies (shadcn, recharts, zod, etc)"`

---

### ⚪ Checkpoint 1.2: Supabase Project Setup
**Status:** Not Started
**Tasks:**
- [ ] Create Supabase project at supabase.com
- [ ] Get Project URL and Anon Key
- [ ] Get Service Role Key (for admin operations)
- [ ] Create `.env.local` file with Supabase credentials
- [ ] Create `.env.example` template
- [ ] Create `lib/supabase/client.ts` (browser client)
- [ ] Create `lib/supabase/server.ts` (server client)
- [ ] Test connection with a simple query

**Environment Variables Needed:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Git Commit Message:** `"Setup: Configure Supabase connection and environment variables"`

---

### ⚪ Checkpoint 1.3: Firebase Cloud Messaging Setup
**Status:** Not Started
**Tasks:**
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Cloud Messaging in Firebase Console
- [ ] Get Firebase config credentials
- [ ] Add Firebase credentials to `.env.local`
- [ ] Create `lib/firebase/config.ts`
- [ ] Create `lib/firebase/messaging.ts`
- [ ] Add `firebase-messaging-sw.js` to public folder

**Environment Variables Needed:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Git Commit Message:** `"Setup: Configure Firebase Cloud Messaging"`

---

### ⚪ Checkpoint 1.4: Project Folder Structure
**Status:** Not Started
**Tasks:**
- [ ] Create folder structure:
  - `components/ui/` (shadcn components)
  - `components/auth/`
  - `components/subscriptions/`
  - `components/dashboard/`
  - `lib/supabase/`
  - `lib/firebase/`
  - `lib/utils/`
  - `types/`
  - `constants/`
- [ ] Create `constants/indian-services.ts` with popular services
- [ ] Create `types/database.ts` for Supabase types
- [ ] Create `types/subscription.ts` for app types
- [ ] Configure TypeScript path aliases in `tsconfig.json`
- [ ] Create `app/globals.css` with Tailwind imports

**Git Commit Message:** `"Setup: Create project structure and constants"`

---

## PHASE 2: Database Design

### ⚪ Checkpoint 2.1: User & Profile Tables
**Status:** Not Started
**Tasks:**
- [ ] Open Supabase SQL Editor
- [ ] Create `profiles` table extending auth.users
- [ ] Add fields: id, phone, full_name, email, currency, timestamps
- [ ] Enable Row Level Security (RLS)
- [ ] Create RLS policies for user access
- [ ] Test table creation
- [ ] Generate TypeScript types from Supabase

**Git Commit Message:** `"Database: Create profiles table with RLS policies"`

---

### ⚪ Checkpoint 2.2: Subscriptions Table
**Status:** Not Started
**Tasks:**
- [ ] Create enums for: category, billing_cycle, cancellation_status
- [ ] Create `subscriptions` table
- [ ] Add foreign key to auth.users
- [ ] Enable RLS on subscriptions table
- [ ] Create RLS policies (users can only see their own subscriptions)
- [ ] Create indexes for performance
- [ ] Generate updated TypeScript types

**Git Commit Message:** `"Database: Create subscriptions table with relationships"`

---

### ⚪ Checkpoint 2.3: Seed Data for Indian Services
**Status:** Not Started
**Tasks:**
- [ ] Create `constants/indian-services.ts`
- [ ] Add 30+ popular Indian subscription services:
  - OTT: Netflix, Prime Video, Disney+ Hotstar, SonyLIV, ZEE5
  - Music: Spotify, Apple Music, YouTube Music, Gaana, JioSaavn
  - Food: Zomato Gold, Swiggy One, Dineout Passport
  - SaaS: Microsoft 365, Google Workspace, Adobe Creative Cloud
  - Fitness: Cult.fit, HealthifyMe
  - News: Times Prime, The Hindu, Indian Express
- [ ] Add service metadata (logos, categories, typical pricing)
- [ ] Create database seed script (optional)

**Git Commit Message:** `"Database: Add seed data for popular Indian services"`

---

## PHASE 3: Authentication System

### ⚪ Checkpoint 3.1: Supabase Auth Setup
**Status:** Not Started
**Tasks:**
- [ ] Enable Phone authentication in Supabase Dashboard
- [ ] Configure OTP provider (Twilio/MSG91)
- [ ] Set OTP expiry time (default: 60 seconds)
- [ ] Create auth helper functions in `lib/supabase/auth.ts`
- [ ] Create `signInWithPhone()` function
- [ ] Create `verifyOTP()` function
- [ ] Create `signOut()` function
- [ ] Create `getSession()` function

**Git Commit Message:** `"Auth: Configure Supabase phone authentication"`

---

### ⚪ Checkpoint 3.2: Login/Signup UI
**Status:** Not Started
**Tasks:**
- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Create `components/auth/PhoneInput.tsx` (+91 prefix)
- [ ] Create `components/auth/OTPInput.tsx` (6-digit)
- [ ] Add loading states and spinners
- [ ] Add error handling and toast notifications
- [ ] Style with Tailwind CSS
- [ ] Add form validation with Zod
- [ ] Test on mobile screen sizes

**Git Commit Message:** `"Auth: Build login and OTP verification UI"`

---

### ⚪ Checkpoint 3.3: Protected Routes & Middleware
**Status:** Not Started
**Tasks:**
- [ ] Create `middleware.ts` in root
- [ ] Add auth check logic
- [ ] Protect `/dashboard/*` routes
- [ ] Redirect unauthenticated users to `/login`
- [ ] Redirect authenticated users away from `/login`
- [ ] Create auth context provider
- [ ] Create `useAuth()` hook
- [ ] Add logout functionality to UI

**Git Commit Message:** `"Auth: Implement route protection and auth middleware"`

---

## PHASE 4: Core Subscription Management

### ⚪ Checkpoint 4.1: Add Subscription API
**Status:** Not Started
**Tasks:**
- [ ] Create `app/api/subscriptions/route.ts`
- [ ] Implement POST handler
- [ ] Add Zod validation schema
- [ ] Connect to Supabase to insert subscription
- [ ] Add error handling
- [ ] Calculate next_billing_date based on cycle
- [ ] Return created subscription with proper types

**Git Commit Message:** `"Subscriptions: Create add subscription API endpoint"`

---

### ⚪ Checkpoint 4.2: Add Subscription Form UI
**Status:** Not Started
**Tasks:**
- [ ] Create `components/subscriptions/AddSubscriptionForm.tsx`
- [ ] Add searchable service dropdown (Combobox from shadcn)
- [ ] Add category selector
- [ ] Add cost input with INR symbol
- [ ] Add billing cycle selector (monthly/quarterly/yearly)
- [ ] Add date picker for billing date
- [ ] Add optional payment method field
- [ ] Integrate react-hook-form
- [ ] Add form validation
- [ ] Connect to API endpoint

**Git Commit Message:** `"Subscriptions: Build add subscription form"`

---

### ⚪ Checkpoint 4.3: Fetch Subscriptions API
**Status:** Not Started
**Tasks:**
- [ ] Implement GET handler in `app/api/subscriptions/route.ts`
- [ ] Add query parameters for sorting (cost, date, category)
- [ ] Add query parameters for filtering
- [ ] Fetch user's subscriptions from Supabase
- [ ] Return formatted data with proper types
- [ ] Add error handling

**Git Commit Message:** `"Subscriptions: Implement fetch subscriptions API"`

---

### ⚪ Checkpoint 4.4: Subscription List UI
**Status:** Not Started
**Tasks:**
- [ ] Create `components/subscriptions/SubscriptionCard.tsx`
- [ ] Create `app/(dashboard)/subscriptions/page.tsx`
- [ ] Fetch subscriptions on page load
- [ ] Display subscriptions in grid/list layout
- [ ] Add sorting controls (by cost, date, category)
- [ ] Add filter by category
- [ ] Create empty state component
- [ ] Add loading skeleton
- [ ] Make responsive for mobile

**Git Commit Message:** `"Subscriptions: Build subscription list view"`

---

### ⚪ Checkpoint 4.5: Edit & Delete Subscriptions
**Status:** Not Started
**Tasks:**
- [ ] Add PUT handler to API route
- [ ] Add DELETE handler to API route
- [ ] Create `components/subscriptions/EditSubscriptionModal.tsx`
- [ ] Pre-fill form with existing subscription data
- [ ] Create delete confirmation dialog (AlertDialog from shadcn)
- [ ] Add optimistic UI updates
- [ ] Show success/error toasts
- [ ] Refresh list after operations

**Git Commit Message:** `"Subscriptions: Add edit and delete functionality"`

---

## PHASE 5: Dashboard & Analytics

### ⚪ Checkpoint 5.1: Dashboard Statistics API
**Status:** Not Started
**Tasks:**
- [ ] Create `app/api/dashboard/stats/route.ts`
- [ ] Calculate total monthly cost
- [ ] Calculate yearly projection
- [ ] Count active subscriptions
- [ ] Find upcoming renewals (next 7 days)
- [ ] Return aggregated statistics

**Git Commit Message:** `"Dashboard: Create statistics calculation API"`

---

### ⚪ Checkpoint 5.2: Dashboard Overview UI
**Status:** Not Started
**Tasks:**
- [ ] Create `app/(dashboard)/page.tsx`
- [ ] Create stat card component
- [ ] Display total monthly cost (prominent)
- [ ] Display yearly projection
- [ ] Display subscription count
- [ ] Show upcoming renewals section
- [ ] Add icons from lucide-react
- [ ] Responsive grid layout

**Git Commit Message:** `"Dashboard: Build overview with key metrics"`

---

### ⚪ Checkpoint 5.3: Category Breakdown
**Status:** Not Started
**Tasks:**
- [ ] Create `app/api/dashboard/category-breakdown/route.ts`
- [ ] Calculate spending by category
- [ ] Create `components/dashboard/CategoryPieChart.tsx`
- [ ] Use Recharts PieChart component
- [ ] Add color coding for categories
- [ ] Add legend
- [ ] Show percentages

**Git Commit Message:** `"Dashboard: Add category breakdown with pie chart"`

---

### ⚪ Checkpoint 5.4: Spending Trends
**Status:** Not Started
**Tasks:**
- [ ] Create `app/api/dashboard/trends/route.ts`
- [ ] Calculate monthly spending for last 6 months
- [ ] Create `components/dashboard/SpendingTrendChart.tsx`
- [ ] Use Recharts LineChart component
- [ ] Add time period selector (3/6/12 months)
- [ ] Format currency properly
- [ ] Show trend direction (increasing/decreasing)

**Git Commit Message:** `"Dashboard: Implement spending trends chart"`

---

### ⚪ Checkpoint 5.5: Insights & Recommendations
**Status:** Not Started
**Tasks:**
- [ ] Create logic to identify unused subscriptions (no usage data in MVP)
- [ ] Create potential savings calculator
- [ ] Add comparison with average user (mock data for MVP)
- [ ] Create `components/dashboard/InsightsCard.tsx`
- [ ] Display actionable recommendations
- [ ] Add "Quick Actions" buttons

**Git Commit Message:** `"Dashboard: Add insights and savings recommendations"`

---

## PHASE 6: Notifications System

### ⚪ Checkpoint 6.1: FCM Infrastructure
**Status:** Not Started
**Tasks:**
- [ ] Create notification_preferences table in Supabase
- [ ] Create fcm_tokens table for storing device tokens
- [ ] Create `app/api/notifications/register/route.ts`
- [ ] Implement FCM token registration
- [ ] Create notification settings API
- [ ] Add service worker for background notifications

**Git Commit Message:** `"Notifications: Setup FCM infrastructure"`

---

### ⚪ Checkpoint 6.2: Notification Scheduling
**Status:** Not Started
**Tasks:**
- [ ] Create `app/api/cron/send-reminders/route.ts`
- [ ] Configure Vercel Cron in `vercel.json`
- [ ] Implement logic to check upcoming renewals
- [ ] Send notifications 3 days before renewal
- [ ] Send notifications 1 day before renewal
- [ ] Log notification delivery
- [ ] Handle errors gracefully

**Git Commit Message:** `"Notifications: Implement renewal reminder scheduling"`

---

### ⚪ Checkpoint 6.3: In-App Notification Center
**Status:** Not Started
**Tasks:**
- [ ] Create notifications table in Supabase
- [ ] Create `app/api/notifications/route.ts`
- [ ] Create `components/notifications/NotificationCenter.tsx`
- [ ] Display notification list
- [ ] Add unread badge counter
- [ ] Implement mark as read
- [ ] Add notification icon in header

**Git Commit Message:** `"Notifications: Build in-app notification center"`

---

### ⚪ Checkpoint 6.4: Notification Settings UI
**Status:** Not Started
**Tasks:**
- [ ] Create `app/(dashboard)/settings/notifications/page.tsx`
- [ ] Add toggle switches for notification types
- [ ] Add frequency controls
- [ ] Connect to preferences API
- [ ] Show current FCM token status
- [ ] Add test notification button

**Git Commit Message:** `"Notifications: Add notification preferences UI"`

---

## PHASE 7: Cancellation Guides

### ⚪ Checkpoint 7.1: Cancellation Guide Data
**Status:** Not Started
**Tasks:**
- [ ] Create cancellation_guides table in Supabase
- [ ] Design JSON schema for steps
- [ ] Add cancellation data for 20-30 Indian services
- [ ] Include: steps, links, phone numbers, emails
- [ ] Add expected processing time
- [ ] Create admin script to populate data

**Git Commit Message:** `"Cancellation: Create guides table and seed data"`

---

### ⚪ Checkpoint 7.2: Cancellation Guide Viewer
**Status:** Not Started
**Tasks:**
- [ ] Create `app/api/cancellation-guides/[service]/route.ts`
- [ ] Create `components/cancellation/GuideViewer.tsx`
- [ ] Display step-by-step instructions
- [ ] Add direct links to cancellation pages
- [ ] Show contact information
- [ ] Add "Mark as Cancelled" button
- [ ] Make mobile-friendly

**Git Commit Message:** `"Cancellation: Build cancellation guide viewer"`

---

### ⚪ Checkpoint 7.3: Cancellation Status Tracking
**Status:** Not Started
**Tasks:**
- [ ] Add status update to subscriptions API
- [ ] Create status dropdown/buttons in subscription card
- [ ] Add cancellation_date field when marking as cancelled
- [ ] Track cancellation_initiated_date
- [ ] Show status badge on subscription cards
- [ ] Update dashboard stats to exclude cancelled

**Git Commit Message:** `"Cancellation: Implement cancellation status tracking"`

---

### ⚪ Checkpoint 7.4: Cancellation History
**Status:** Not Started
**Tasks:**
- [ ] Create `app/(dashboard)/subscriptions/cancelled/page.tsx`
- [ ] Filter for cancelled subscriptions
- [ ] Display cancellation date
- [ ] Calculate total savings from cancellations
- [ ] Add ability to restore subscription
- [ ] Create archive view

**Git Commit Message:** `"Cancellation: Add cancellation history view"`

---

## PHASE 8: Polish & Testing

### ⚪ Checkpoint 8.1: Profile & Settings
**Status:** Not Started
**Tasks:**
- [ ] Create `app/(dashboard)/settings/profile/page.tsx`
- [ ] Display user information
- [ ] Add edit profile form
- [ ] Add currency selector
- [ ] Add delete account option (with confirmation)
- [ ] Create help/FAQ section
- [ ] Add privacy policy and terms links

**Git Commit Message:** `"Settings: Implement profile and settings pages"`

---

### ⚪ Checkpoint 8.2: Onboarding Flow
**Status:** Not Started
**Tasks:**
- [ ] Create `components/onboarding/WelcomeScreen.tsx`
- [ ] Add 3-4 step tutorial
- [ ] Highlight key features
- [ ] Add skip button
- [ ] Store onboarding completion in user profile
- [ ] Show only on first login

**Git Commit Message:** `"Onboarding: Add welcome flow"`

---

### ⚪ Checkpoint 8.3: Error Handling
**Status:** Not Started
**Tasks:**
- [ ] Create error boundary components
- [ ] Add loading skeletons to all pages
- [ ] Implement Sonner toast notifications
- [ ] Add retry logic for failed requests
- [ ] Create custom error pages (404, 500)
- [ ] Add form field error messages

**Git Commit Message:** `"Polish: Improve error handling and loading states"`

---

### ⚪ Checkpoint 8.4: Mobile Optimization
**Status:** Not Started
**Tasks:**
- [ ] Test all pages on mobile (375px, 414px widths)
- [ ] Fix any responsive issues
- [ ] Optimize touch targets (min 44x44px)
- [ ] Test forms on mobile keyboards
- [ ] Add bottom navigation for mobile (optional)
- [ ] Test on iOS Safari and Android Chrome

**Git Commit Message:** `"Polish: Optimize mobile responsiveness"`

---

### ⚪ Checkpoint 8.5: Performance Optimization
**Status:** Not Started
**Tasks:**
- [ ] Run Lighthouse audit
- [ ] Implement code splitting with dynamic imports
- [ ] Add image optimization (next/image)
- [ ] Add caching headers to API routes
- [ ] Minimize bundle size
- [ ] Add loading priority to critical resources
- [ ] Achieve 90+ Lighthouse score

**Git Commit Message:** `"Polish: Performance optimization"`

---

### ⚪ Checkpoint 8.6: Final Testing
**Status:** Not Started
**Tasks:**
- [ ] Test complete user flow (signup → add subscription → dashboard)
- [ ] Test all CRUD operations
- [ ] Test notifications
- [ ] Test cancellation flow
- [ ] Fix all critical bugs
- [ ] Add error logging (Sentry - optional)
- [ ] Write deployment documentation
- [ ] Deploy to Vercel

**Git Commit Message:** `"Release: Final testing and bug fixes - MVP Ready"`

---

## 📋 Quick Reference

### Tech Stack
- **Frontend:** Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Phone OTP)
- **Payments:** Razorpay (India), Stripe (future)
- **Notifications:** Firebase Cloud Messaging
- **Hosting:** Vercel
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Forms:** react-hook-form + Zod
- **Icons:** Lucide React
- **Toasts:** Sonner

### Environment Variables Template
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Common Commands
```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint

# Install shadcn component
npx shadcn@latest add [component-name]

# Generate Supabase types
npx supabase gen types typescript --project-id [project-id] > types/database.ts
```

---

## 🎯 Current Milestone
**Working on:** Phase 1.1 - Installing Additional Dependencies
**Next up:** Phase 1.2 - Supabase Project Setup
**Blocking issues:** None

---

## 📝 Notes & Decisions

### Architecture Decisions
- **Why Next.js API Routes:** Serverless, easy deployment on Vercel, no separate backend needed
- **Why Supabase:** Managed PostgreSQL, built-in auth, RLS for security, generous free tier
- **Why Firebase for notifications:** Most reliable push notification service for web + mobile
- **Why manual entry first:** MVP constraint, no Account Aggregator license yet

### Future Enhancements (Post-MVP)
- [ ] SMS parsing for automatic detection
- [ ] Account Aggregator integration for bank sync
- [ ] Concierge cancellation service
- [ ] Family/shared subscription management
- [ ] Usage tracking integration
- [ ] Regional language support (Hindi, Tamil, etc.)
- [ ] Premium features with Razorpay integration
- [ ] Browser extension
- [ ] Native mobile apps (React Native)

---

**Last Updated:** Oct 3, 2025
**Document Version:** 1.0
