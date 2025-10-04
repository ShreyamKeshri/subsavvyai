# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Unsubscribr AI** is an AI-powered subscription optimizer for the Indian market. Built with Next.js 15.5.4, TypeScript, Tailwind CSS v4, Supabase, and Firebase.

**Goal:** Use AI to help Indian users optimize subscriptions and save ₹10,000/year through intelligent recommendations.

> **🚨 PIVOT IN PROGRESS:** We evolved from a basic tracker to an AI-powered optimizer. See PIVOT_PLAN.md for details.

## Development Commands

```bash
# Development server with Turbopack (runs on localhost:3000 or :3001)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Add shadcn/ui component
npx shadcn@latest add [component-name]
```

## Architecture

### Framework & Routing
- **Next.js 15.5.4 App Router** with App Directory
- Route groups: `(auth)` for auth pages, `(dashboard)` for protected pages
- Server Components by default; Client Components marked with `'use client'`
- **Turbopack** enabled for faster builds

### Authentication Flow
Multi-method authentication via Supabase Auth:
1. **Email/Password** (FREE) - Primary for MVP
2. **Google OAuth** (FREE) - Secondary option
3. **Phone OTP** (PAID, deferred) - SMS via MSG91/Twilio

**Auth Architecture:**
- `lib/auth/auth-helpers.ts` - Reusable auth functions (signUp, signIn, sendOTP, etc.)
- `middleware.ts` - Route protection, redirects unauthenticated users to `/login`
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/middleware.ts` - Middleware Supabase client

**Protected Routes:**
- `/dashboard`, `/onboarding` - Require authentication
- `/login`, `/signup`, `/auth/*` - Public routes
- Middleware redirects authenticated users from auth pages to `/dashboard`

### Database (Supabase/PostgreSQL)
- **Complete schema in:** `DATABASE_SCHEMA.md`
- Row-Level Security (RLS) enabled on all tables
- **Normalized schema with 4 migrations applied:**
  - `001_initial_schema.sql` - Core tables
  - `002_security_events.sql` - Audit logging
  - `003_auto_create_profile.sql` - Auto-create profile trigger
  - `004_proper_schema.sql` - User preferences & category preferences
- **Key tables (Current):**
  - `profiles` - User identity (name, avatar, phone, timezone, currency)
  - `user_preferences` - App settings (budget, onboarding, theme, language)
  - `user_category_preferences` - Subscription category interests
  - `notification_preferences` - Email/SMS/push settings
  - `services` - 52 Indian services pre-populated
  - `subscriptions` - User subscriptions
  - `payment_methods`, `payment_history` - Payment tracking
  - `security_events` - Security audit log
  - `user_analytics_cache` - Pre-calculated analytics
- **New AI Optimizer Tables (Planned - see PIVOT_PLAN.md):**
  - `service_usage` - OAuth-based usage tracking (Spotify, Netflix, etc.)
  - `telecom_bundles` - Jio/Airtel/Vi bundle database
  - `content_catalog` - OTT content for overlap detection
  - `price_history` - Price monitoring for alerts
  - `optimization_recommendations` - AI-generated savings recommendations

**Supabase Clients:**
```typescript
// Browser (client components)
import { createClient } from '@/lib/supabase/client'

// Server (server components, API routes)
import { createClient } from '@/lib/supabase/server'

// Middleware
import { createServerClient } from '@supabase/ssr'
```

### Styling System
- **Tailwind CSS v4** - Uses new `@import "tailwindcss"` syntax (not `@tailwind` directives)
- **Neo-minimalist design** - Indigo accents (#4F46E5), gray-50 backgrounds
- **Component style patterns:**
  - Buttons: `h-12 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700`
  - Inputs: `h-12 rounded-xl border-gray-200 focus:border-indigo-500`
  - Cards: `rounded-xl shadow-xl bg-white p-8`

**Important:** After modifying `app/globals.css`, restart dev server if styles don't update.

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured:
  - `@/*` → root
  - `@/components/*` → `./components/*`
  - `@/lib/*` → `./lib/*`
  - `@/types/*` → `./types/*`
  - `@/hooks/*` → `./hooks/*`

### Error Handling Pattern
Always use type-safe error handling:
```typescript
try {
  // code
} catch (err) {
  // Use type guard instead of 'any'
  const message = err instanceof Error ? err.message : 'Something went wrong'
  setError(message)
}
```

## File Structure

```
unsubscribr/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Auth route group (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages (future)
│   ├── api/               # API routes
│   │   └── test-db/       # Database connection test
│   ├── auth/              # Auth callback handlers
│   ├── onboarding/        # User onboarding flow
│   └── dashboard/         # Protected landing page
├── lib/                   # Utilities
│   ├── auth/              # Auth helper functions
│   ├── supabase/          # Supabase clients (browser, server, middleware)
│   ├── firebase/          # Firebase config & messaging
│   └── utils.ts           # Utility functions (cn, etc.)
├── components/            # React components (future)
│   └── ui/                # shadcn/ui components
├── types/                 # TypeScript definitions (future)
├── middleware.ts          # Next.js middleware for auth
└── app/globals.css        # Global styles (Tailwind v4)
```

## Development Phases

**Current Status:** Foundation Complete (40%) | AI Optimizer Pivot 🚀

### Completed (Foundation):
- ✅ Phase 1-2: Project setup (Next.js 15.5.4, TypeScript, Tailwind v4, Supabase)
- ✅ Phase 3: Authentication (Email/password, Google OAuth, onboarding flow)
- ✅ Phase 4: Subscription CRUD (Add/edit/delete subscriptions, dashboard with real data)

### AI Optimizer Roadmap (See PIVOT_PLAN.md):
- 🔄 **Week 1 (Current):** Smart Downgrade Alerts
  - OAuth integration (Spotify, Netflix)
  - Usage tracking system
  - AI recommendation engine
- ⏳ **Week 2:** India Bundle Optimizer
  - Telecom bundles database
  - Bundle matching algorithm
  - Affiliate integration
  - **Soft launch to friends/family**
- ⏳ **Week 3-4:** Content Overlap Detector
  - JustWatch API integration
  - Content matching algorithm
  - Overlap visualization
  - **Public launch on Product Hunt**
- ⏳ **Month 2:** Price Monitoring & Alerts

## Git Workflow

**Current Branch:** `feature/ai-optimizer-pivot`
**Main Branch:** `main`

**Workflow:**
1. Create feature branch for each major feature: `feature/{name}`
2. Commit changes to feature branch with descriptive messages
3. Create PR when feature is complete
4. Merge to `main` after review

**Recent Branches:**
- `feature/subscription-crud` - Subscription management (merged)
- `feature/ai-optimizer-pivot` - Current pivot work

## Environment Variables

Required in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... (see README.md for full list)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Authentication Implementation

### Sign Up Flow
1. User enters credentials (email/password or Google OAuth)
2. `lib/auth/auth-helpers.ts` handles authentication
3. Database trigger auto-creates:
   - `profiles` entry
   - `user_preferences` entry (with onboarding_completed: false)
   - `notification_preferences` entry (with defaults)
4. Email confirmation sent (for email/password)
5. After confirmation, callback route checks onboarding status
6. Redirect to `/onboarding` for 3-step data collection:
   - Step 1: Full name
   - Step 2: Monthly budget + category preferences
   - Step 3: Notification settings (email/SMS)
7. Data saved to normalized tables (profiles, user_preferences, user_category_preferences, notification_preferences)
8. Redirect to `/dashboard`

### Login Flow
1. User authenticates via email/password or Google
2. Session stored in httpOnly cookie
3. Middleware validates session on protected routes
4. Redirect to `/dashboard`

### Validation Functions
Available in `lib/auth/auth-helpers.ts`:
- `validateEmail()` - Email format validation
- `validatePhoneNumber()` - Indian mobile number (10 digits, starts with 6-9)
- `validatePassword()` - Min 8 chars, uppercase, lowercase, numbers

## Design System

### Colors
- Primary: Indigo-600 (#4F46E5)
- Background: Gray-50
- Text: Gray-900
- Borders: Gray-200
- Hover: Indigo-700

### Component Standards
- Button height: `h-12`
- Input height: `h-12`
- Border radius: `rounded-xl`
- Shadow: `shadow-lg` or `shadow-xl`

### Responsive Design
Mobile-first approach. All pages must be responsive.

## Key Concepts

### Supabase Row-Level Security (RLS)
All database tables have RLS policies. Users can only access their own data via `auth.uid() = user_id`.

### Server vs Client Components
- Use Server Components by default (faster, no JS to client)
- Use Client Components only when needed (`'use client'`):
  - Event handlers (onClick, onChange)
  - React hooks (useState, useEffect)
  - Browser APIs

### Protected Routes
Middleware (`middleware.ts`) automatically:
- Redirects unauthenticated users to `/login?redirectTo={pathname}`
- Redirects authenticated users from `/login` or `/signup` to `/dashboard`

## Common Patterns

### Fetching User Data
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Client-Side Auth State
```typescript
// Client Component
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
```

## Testing Authentication

Test routes to verify:
- `/login` - Accessible when not logged in
- `/signup` - Accessible when not logged in
- `/dashboard` - Redirects to `/login` if not authenticated
- `/onboarding` - Redirects to `/login` if not authenticated

## Documentation Files

- **README.md** - Project overview, setup, AI optimizer features
- **PIVOT_PLAN.md** - AI optimizer pivot strategy, roadmap, database schema
- **CLAUDE.md** - AI assistant guidelines (this file)
- **BUGS.md** - Known issues and fixes
- **DATABASE_SCHEMA.md** - Complete database structure and RLS policies
- **PHASE_3_AUTH_SETUP.md** - Supabase authentication provider setup guide
- **Thoughts.md** - Developer notes and observations

## Important Notes

1. **Tailwind CSS v4 Syntax:** Use `@import "tailwindcss"` in globals.css, NOT `@tailwind` directives
2. **TypeScript Errors:** Never use `any` type. Use `unknown` with type guards
3. **JSX Entities:** Use `&apos;` instead of `'` in JSX text
4. **Native Elements:** Use native `<button>` and `<input>` with full Tailwind classes for better control
5. **Phone OTP:** Deferred to post-MVP due to SMS costs (requires MSG91/Twilio setup)
6. **Supabase Auth Providers:** Email/Password is FREE and already enabled; Google OAuth is FREE but needs Google Cloud setup
7. **AI Optimizer Focus:** We're building AI-powered optimization, not just a tracker. Every feature should provide actionable savings recommendations.
8. **India-First Features:** Prioritize India-specific optimizations (telecom bundles, local OTT platforms, INR pricing)
