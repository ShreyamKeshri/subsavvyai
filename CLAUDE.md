# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SubSavvyAI** (formerly Unsubscribr) is India's first AI-powered subscription optimizer. Built with Next.js 15.5.4, TypeScript, Tailwind CSS v4, Supabase, and Turbopack.

**Goal:** Use AI to help Indian users optimize subscriptions and save ₹10,000+/year through intelligent recommendations.

**Brand Identity:**
- **Name:** SubSavvyAI
- **Tagline:** "India's First AI-Powered Subscription Optimizer"
- **Value Prop:** "AI finds ₹10,000/year hidden in your subscriptions"
- **Logo:** `/public/logo-full.png` (full logo), `/public/logo-icon.png` (icon)
- **Branding Config:** `lib/config/branding.ts`
- **Theme Config:** `lib/config/theme.ts`

## Development Commands

```bash
# Development server with Turbopack (runs on localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check

# Add shadcn/ui component
npx shadcn@latest add [component-name]
```

## Architecture

### Framework & Routing
- **Next.js 15.5.4 App Router** with App Directory
- Route groups: `(auth)` for auth pages
- Server Components by default; Client Components marked with `'use client'`
- **Turbopack** enabled for faster dev builds
- Server Actions pattern for data mutations

### Authentication Flow
Multi-method authentication via Supabase Auth:
1. **Email/Password** - Primary method
2. **Google OAuth** - Secondary option
3. **Phone OTP** (deferred) - Future enhancement

**Auth Architecture:**
- `lib/auth/auth-helpers.ts` - Reusable auth functions
- `middleware.ts` - Route protection & auth redirects
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client (cookies-based)

**Protected Routes:**
- `/dashboard`, `/onboarding` - Require authentication
- `/login`, `/signup`, `/verify-email`, `/callback` - Public routes
- Middleware redirects authenticated users from auth pages to `/dashboard`

### Database (Supabase/PostgreSQL)

**Migrations Applied (8 total):**
1. `001_initial_schema.sql` - Core tables, RLS policies, triggers, seed data (52 Indian services)
2. `002_security_events.sql` - Security audit logging
3. `003_auto_create_profile.sql` - Auto-create profile on signup
4. `004_proper_schema.sql` - User preferences & category preferences
5. `005_smart_downgrade_alerts.sql` - AI optimizer tables (oauth_tokens, service_usage, optimization_recommendations) + analytics fix
6. `006_telecom_bundles.sql` - Bundle optimizer tables (telecom_bundles, bundle_recommendations) + 20 bundles
7. `007_manual_usage_tracking.sql` - Manual usage fields (usage_frequency, last_used_date, is_manual, manual_usage_note)
8. `008_currency_conversion.sql` - Currency conversion (original_cost, original_currency columns)

**Key Tables:**
- **User Management:**
  - `profiles` - User identity (name, avatar, phone, timezone, currency)
  - `user_preferences` - App settings (budget, onboarding, theme, language)
  - `user_category_preferences` - Subscription category interests
  - `notification_preferences` - Email/SMS/push notification settings

- **Subscription Management:**
  - `services` - 52 pre-populated Indian services (Netflix, Spotify, etc.)
  - `subscriptions` - User subscriptions with billing tracking
  - `payment_methods`, `payment_history` - Payment tracking
  - `user_analytics_cache` - Pre-calculated analytics (monthly/yearly spend, category breakdown)

- **AI Optimizer:**
  - `oauth_tokens` - Encrypted OAuth tokens for Spotify, Netflix APIs
  - `service_usage` - Usage data from external APIs (listening hours, watch time) + manual tracking
  - `optimization_recommendations` - AI-generated savings recommendations (downgrade, cancel, bundle, overlap alerts)

- **Bundle Optimizer:**
  - `telecom_bundles` - 20 pre-populated telecom bundles (Jio, Airtel, Vi)
  - `bundle_recommendations` - AI-matched bundle recommendations for users

- **Security & Analytics:**
  - `security_events` - Security audit log
  - `mv_popular_services` - Materialized view of trending services

**Row-Level Security (RLS):**
- All tables have RLS policies
- Users can only access their own data via `auth.uid() = user_id`
- Exception: `refresh_user_analytics()` function uses `SECURITY DEFINER` to bypass RLS for cache updates

**Important Functions:**
- `calculate_monthly_cost(cost, billing_cycle)` - Normalizes costs to monthly
- `refresh_user_analytics(user_id)` - Recalculates analytics cache (SECURITY DEFINER, fixed nested aggregate error)
- `trigger_refresh_user_analytics()` - Trigger function to auto-refresh analytics on subscription changes

**Supabase Clients:**
```typescript
// Browser (client components)
import { createClient } from '@/lib/supabase/client'

// Server (server components, API routes, server actions)
import { createClient } from '@/lib/supabase/server'
```

### Styling System
- **Tailwind CSS v4** - Uses new `@import "tailwindcss"` syntax
- **Design System:** Centralized in `lib/config/theme.ts`
- **Component Library:** shadcn/ui with customization
- **Toast Notifications:** Sonner (`import { toast } from 'sonner'`)

**Important:** After modifying `app/globals.css`, restart dev server if styles don't update.

### TypeScript Configuration
- Strict mode enabled
- Path aliases:
  - `@/*` → root
  - `@/components/*` → `./components/*`
  - `@/lib/*` → `./lib/*`
  - `@/types/*` → `./types/*`
  - `@/hooks/*` → `./hooks/*`
  - `@/app/*` → `./app/*`

## File Structure

```
unsubscribr/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth routes (login, signup, verify-email)
│   ├── api/                      # API routes
│   │   ├── oauth/spotify/        # Spotify OAuth endpoints
│   │   ├── usage/sync/           # Usage sync endpoint
│   │   └── recommendations/      # Generate recommendations
│   ├── dashboard/                # Main dashboard (protected)
│   ├── onboarding/               # User onboarding flow
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (with Toaster)
│   └── globals.css               # Global styles (Tailwind v4)
├── lib/                          # Core utilities
│   ├── analytics/                # Analytics tracking
│   │   ├── posthog-provider.tsx  # PostHog React provider
│   │   ├── events.ts             # Client-side event tracking
│   │   ├── server-events.ts      # Server-side event tracking
│   │   └── sentry.ts             # Sentry error tracking config
│   ├── auth/                     # Auth helpers
│   ├── bundles/                  # Bundle optimizer
│   │   └── bundle-actions.ts     # Server actions for bundle recommendations
│   ├── config/                   # Theme & branding
│   │   ├── theme.ts              # Centralized theme config
│   │   └── branding.ts           # SubSavvyAI branding
│   ├── oauth/                    # OAuth integrations
│   │   └── spotify.ts            # Spotify OAuth & usage fetch
│   ├── recommendations/          # AI recommendation engine
│   │   ├── recommendation-engine.ts  # Core AI logic
│   │   └── recommendation-actions.ts # Server actions
│   ├── settings/                 # Settings management
│   │   └── settings-actions.ts   # Server actions for user settings
│   ├── subscriptions/            # Subscription CRUD
│   │   └── subscription-actions.ts  # Server actions
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── usage/                    # Usage tracking
│   │   ├── usage-actions.ts      # OAuth-based usage tracking
│   │   └── manual-usage-actions.ts  # Manual usage tracking
│   └── validators.ts             # Zod schemas
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   └── theme-toggle.tsx      # Dark/light theme toggle
│   ├── bundles/                  # Bundle optimizer components
│   │   ├── bundle-recommendation-card.tsx
│   │   └── bundle-recommendations-list.tsx
│   ├── subscriptions/            # Subscription components
│   │   ├── add-subscription-dialog.tsx
│   │   └── edit-subscription-dialog.tsx
│   ├── recommendations/          # Recommendation components
│   │   └── recommendations-list.tsx
│   └── usage/                    # Usage tracking components
│       └── usage-survey-dialog.tsx  # Manual usage survey
├── supabase/migrations/          # Database migrations (8 total)
├── middleware.ts                 # Next.js middleware (auth + security)
├── tsconfig.json                 # TypeScript config
└── CLAUDE.md                     # This file
```

## Current Status

**Phase:** MVP Launch Sprint - Day 4 Complete! ✅

**Recent Completions (Day 4 - Oct 17, 2025):**

**Currency Conversion System:**
- ✅ Automatic conversion to INR for all subscriptions
- ✅ Support for 8 currencies (INR, USD, EUR, GBP, AUD, CAD, SGD, AED)
- ✅ Migration 008: Added original_cost and original_currency columns
- ✅ Display format: "₹16,624.00/month (was USD 200.00)"
- ✅ Consistent analytics with INR normalization

**UX Improvements:**
- ✅ Toast-based delete confirmation (replaces browser alerts)
- ✅ Edit/Delete action buttons on subscription cards
- ✅ Usage tracking prompts for missing data
- ✅ Contextual empty states with actionable CTAs
- ✅ Error boundaries (root + dashboard levels)

**Previous Completions (Day 2 - Oct 12, 2025):**

**Analytics Infrastructure:**
- ✅ PostHog client & server-side tracking (13 event types)
- ✅ Sentry error tracking with privacy filters
- ✅ Revenue-critical affiliate click tracking
- ✅ CSP headers updated

**Critical Bug Fixes:**
- ✅ RESEND_API_KEY: Lazy initialization prevents signup blocking
- ✅ Settings page: Fixed database column errors (user_id → id)
- ✅ Edit/Delete subscription: Wired up existing components

**Dark Mode:**
- ✅ Implemented with next-themes (Light/Dark/System)
- ✅ Enhanced ThemeToggle with dropdown menu
- ✅ Zero-flash dark mode with localStorage persistence

**Manual Usage Tracking (Hybrid Recommendation System):**
- ✅ Migration 007: Extended service_usage table
- ✅ Server actions for CRUD operations
- ✅ UsageSurveyDialog component with frequency selection
- ✅ Frequency-to-hours conversion (daily→60, weekly→20, etc.)
- ✅ Works alongside OAuth tracking (Spotify)

**Previous Completions:**
- ✅ Smart Downgrade Alerts (Spotify OAuth, AI recommendations)
- ✅ India Bundle Optimizer (20 bundles, AI matching)
- ✅ Savings-First Dashboard UX
- ✅ SubSavvyAI rebranding

**Next Steps:**
- Integrate usage survey into dashboard workflow
- Run migration 007 in Supabase
- Test end-to-end recommendation flow with manual data

## Key Implementation Patterns

### Server Actions Pattern
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function myServerAction(data: MyInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Perform database operation
  const { data, error } = await supabase
    .from('table_name')
    .insert({ user_id: user.id, ...data })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
```

### Error Handling Pattern
```typescript
try {
  // code
} catch (err) {
  const message = err instanceof Error ? err.message : 'Something went wrong'
  toast.error(message)
}
```

### Toast Notifications
```typescript
import { toast } from 'sonner'

toast.success('Subscription added!')
toast.error('Failed to add subscription')
toast.info('Processing...')

// Toast with action buttons (for confirmations)
toast.warning('Delete subscription?', {
  description: 'This action cannot be undone.',
  action: {
    label: 'Delete',
    onClick: async () => {
      // perform delete
      toast.success('Deleted successfully')
    },
  },
  cancel: {
    label: 'Cancel',
    onClick: () => {
      toast.info('Deletion cancelled')
    },
  },
  duration: 10000,
})
```

### Currency Conversion Pattern
```typescript
import { convertToINR } from '@/lib/currency/exchange-rates'

// When creating/updating subscription
const selectedCurrency = input.currency || 'INR'
const costInINR = convertToINR(input.cost, selectedCurrency)

await supabase.from('subscriptions').insert({
  cost: costInINR,              // Normalized to INR
  currency: 'INR',              // Always INR
  original_cost: input.cost,    // Original amount
  original_currency: selectedCurrency  // Original currency
})

// Display with original currency reference
{sub.original_currency && sub.original_currency !== 'INR' && (
  <span className="text-xs opacity-70">
    (was {sub.original_currency} {sub.original_cost?.toFixed(2)})
  </span>
)}
```

## Environment Variables

Required in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Spotify OAuth (for Smart Downgrade Alerts)
# IMPORTANT: Use 127.0.0.1 not localhost (Spotify security requirement)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/oauth/spotify/callback

# Analytics (Optional - graceful fallback if not set)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Email (Optional - graceful fallback if not set)
RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=SubSavvyAI <onboarding@subsavvyai.com>

# App (use 127.0.0.1 for Spotify OAuth compatibility)
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

## Common Tasks

### Adding a New Table
1. Create migration file: `supabase/migrations/00X_description.sql`
2. Define table with RLS policies
3. Add TypeScript types in relevant file
4. Create server actions in `lib/*/actions.ts`
5. Update CLAUDE.md with new schema

### Creating a Server Action
1. Create file in `lib/*/actions.ts` with `'use server'` directive
2. Import `createClient` from `@/lib/supabase/server`
3. Always check authentication
4. Return `{ success, data?, error? }` format
5. Use `revalidatePath()` if needed

### Adding a Component
1. Use shadcn/ui: `npx shadcn@latest add [component]`
2. Or create in `components/`
3. Use theme config: `import { theme } from '@/lib/config/theme'`
4. Follow naming convention: `kebab-case.tsx`

## Debugging Tips

### Database Issues
- Check Supabase logs in dashboard
- Verify RLS policies allow the operation
- Check if migration was applied
- Reload PostgREST schema: `NOTIFY pgrst, 'reload schema';`

### Authentication Issues
- Check middleware logs
- Verify Supabase auth settings
- Check cookie settings (httpOnly, secure)
- Test with `createClient()` in browser console

### Styling Issues
- Restart dev server after `globals.css` changes
- Check Tailwind IntelliSense suggestions
- Verify `@import "tailwindcss"` (not `@tailwind`)

## Important Notes

1. **Brand Name:** SubSavvyAI (not Unsubscribr) - update all references
2. **Logo Location:** `/public/logo-full.png` and `/public/logo-icon.png`
3. **Branding:** Use `branding` from `@/lib/config/branding`
4. **Theme:** Use `theme` from `@/lib/config/theme`
5. **Toast:** Always use Sonner for user feedback
6. **Server Actions:** All mutations should be server actions
7. **TypeScript:** Never use `any`, prefer `unknown` with type guards
8. **RLS:** All tables must have RLS enabled
9. **Migrations:** 8 migrations must be applied (001-008)
10. **Subscription Form:** "Last/Current Billing Date" calculates next billing automatically
11. **Spotify OAuth:** Use 127.0.0.1 not localhost (security requirement)
12. **Manual Usage Tracking:** For services without OAuth APIs (Netflix, Hotstar, etc.)
13. **Analytics:** PostHog & Sentry are optional (graceful fallback)
14. **Currency Conversion:** All costs stored in INR, original currency preserved for transparency
15. **Delete Confirmation:** Use toast with action buttons, not native confirm() dialogs

## Next Steps

1. **Week 2:** India Bundle Optimizer
   - Telecom bundles database (Jio, Airtel, Vi)
   - Bundle matching algorithm
   - Affiliate integration

2. **Week 3-4:** Content Overlap Detector
   - JustWatch API integration
   - Content catalog database
   - Overlap visualization

3. **Month 2:** Price Monitoring & Alerts
   - Price history tracking
   - Price change notifications
   - Competitor comparison

## Documentation Management

### Core Documentation Files (MUST MAINTAIN)

SubSavvyAI maintains only **8 essential markdown files** in the repository. These must be actively maintained and kept up-to-date:

1. **BUGS.md** - Known Issues Tracker
   - Bug descriptions with reproduction steps
   - Current status and priority
   - Workarounds (if any)
   - Update when bugs are found or fixed

2. **DATABASE_SCHEMA.md** - Database Documentation
   - Complete schema for all tables
   - Column descriptions and types
   - Relationships and foreign keys
   - RLS policies
   - Sample data examples
   - Update after every migration

3. **EMAIL_TEMPLATES.md** - Email Template Repository
   - All email templates (HTML + text versions)
   - Template variables and usage
   - Update when email designs change
   - Reference for code implementation

4. **MVP_ROADMAP.md** - Project Plan & Timeline
   - MVP feature list and priorities
   - Week-by-week implementation plan
   - Decision-making framework
   - **Should merge PIVOT_PLAN.md into this file**
   - All decisions must align with this plan
   - Update after completing major features

5. **PROGRESS.md** - Development Progress Tracker
   - Weekly progress updates
   - Completed features
   - Current sprint status
   - Blockers and next steps
   - Target: MVP launch by January 2026
   - Update after completing each feature

6. **SECURITY.md** - Security Documentation
   - Security measures implemented
   - Authentication & authorization patterns
   - Data encryption details
   - Known vulnerabilities and mitigations
   - Recommended improvements
   - Update when security changes are made

7. **TESTING_GUIDE.md** - Comprehensive Test Plan
   - Test cases for all features
   - Manual testing procedures
   - Expected results and validation
   - Edge cases and error scenarios
   - Update after implementing new features

8. **Thoughts.md** - Developer Scratchpad
   - Observations and ideas
   - Potential new features
   - Architecture considerations
   - Technical debt notes
   - User's personal notes
   - Review regularly and incorporate into plans

### Temporary Documentation (DELETE AFTER USE)

When working on specific features or tasks, you may create temporary markdown files for guidance:
- Research documents (e.g., `TELECOM_BUNDLES_RESEARCH.md`)
- Implementation guides (e.g., `BUNDLE_OPTIMIZER_IMPLEMENTATION.md`)
- Analysis documents (e.g., `BUNDLE_OPTIMIZER_ANALYSIS.md`)

**IMPORTANT:** These temporary files MUST be deleted before raising a PR. They serve only to guide the current activity and should not clutter the repository long-term.

### Documentation Update Workflow

**Before Raising Any PR:**
1. ✅ Update relevant core documentation files
2. ✅ Merge changes from temporary docs into core files
3. ✅ Delete all temporary markdown files
4. ✅ Verify all 8 core files are current
5. ✅ Ensure PROGRESS.md reflects completed work

**After Completing a Feature:**
1. Update **PROGRESS.md** with completion status
2. Update **DATABASE_SCHEMA.md** if schema changed
3. Update **TESTING_GUIDE.md** with new test cases
4. Update **MVP_ROADMAP.md** if plans changed
5. Add any bugs found to **BUGS.md**
6. Remove temporary docs created during implementation

### Core Files Summary

```
SubSavvyAI Root/
├── BUGS.md              [Known issues tracker]
├── DATABASE_SCHEMA.md   [Complete schema documentation]
├── EMAIL_TEMPLATES.md   [Email template repository]
├── MVP_ROADMAP.md       [Project plan & timeline]
├── PROGRESS.md          [Development progress]
├── SECURITY.md          [Security documentation]
├── TESTING_GUIDE.md     [Comprehensive test plan]
├── Thoughts.md          [Developer scratchpad]
├── CLAUDE.md            [This file - AI guidelines]
└── README.md            [Project overview - not actively maintained]
```

**Rule:** Only these files should exist in the repository root. Any other `.md` files are temporary and must be removed before merging.
