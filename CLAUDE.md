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

**Migrations Applied (5 total):**
1. `001_initial_schema.sql` - Core tables, RLS policies, triggers, seed data (52 Indian services)
2. `002_security_events.sql` - Security audit logging
3. `003_auto_create_profile.sql` - Auto-create profile on signup
4. `004_proper_schema.sql` - User preferences & category preferences
5. `005_smart_downgrade_alerts.sql` - AI optimizer tables (oauth_tokens, service_usage, optimization_recommendations) + analytics fix

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

- **AI Optimizer (NEW):**
  - `oauth_tokens` - Encrypted OAuth tokens for Spotify, Netflix APIs
  - `service_usage` - Usage data from external APIs (listening hours, watch time)
  - `optimization_recommendations` - AI-generated savings recommendations (downgrade, cancel, bundle, overlap alerts)

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
│   ├── auth/                     # Auth helpers
│   ├── config/                   # Theme & branding
│   │   ├── theme.ts              # Centralized theme config
│   │   └── branding.ts           # SubSavvyAI branding
│   ├── oauth/                    # OAuth integrations
│   │   └── spotify.ts            # Spotify OAuth & usage fetch
│   ├── recommendations/          # AI recommendation engine
│   │   ├── recommendation-engine.ts  # Core AI logic
│   │   └── recommendation-actions.ts # Server actions
│   ├── subscriptions/            # Subscription CRUD
│   │   └── subscription-actions.ts  # Server actions
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── usage/                    # Usage tracking
│   │   └── usage-actions.ts      # Server actions
│   └── validators.ts             # Zod schemas
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── subscriptions/            # Subscription components
│   │   └── add-subscription-dialog.tsx
│   └── recommendations/          # Recommendation components
│       └── recommendations-list.tsx
├── supabase/migrations/          # Database migrations (5 total)
├── middleware.ts                 # Next.js middleware (auth + security)
├── tsconfig.json                 # TypeScript config
└── CLAUDE.md                     # This file
```

## Current Status

**Phase:** Smart Downgrade Alerts Implementation ✅ COMPLETE

**Completed:**
- ✅ Database schema for AI optimizer (oauth_tokens, service_usage, optimization_recommendations)
- ✅ Spotify OAuth integration (`lib/oauth/spotify.ts`)
- ✅ Usage tracking system (`lib/usage/usage-actions.ts`)
- ✅ AI recommendation engine (`lib/recommendations/recommendation-engine.ts`)
- ✅ Dashboard integration with beautiful v0-inspired UI
- ✅ SubSavvyAI rebranding (logo, theme, branding config)
- ✅ Fixed nested aggregate error in analytics function
- ✅ Fixed RLS policy for analytics cache
- ✅ Subscription creation working
- ✅ Form UX improvements (cost step, billing date clarity)

**Known Issues:**
- Migration 005 must be run in Supabase to enable AI features
- PostgREST schema cache must be reloaded after migration: `NOTIFY pgrst, 'reload schema';`

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
```

## Environment Variables

Required in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Spotify OAuth (for Smart Downgrade Alerts)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/oauth/spotify/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
9. **Migration 005:** Contains analytics fix - must be applied
10. **Subscription Form:** "Last/Current Billing Date" calculates next billing automatically

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

## Documentation Files

- **README.md** - Project overview, setup instructions
- **CLAUDE.md** - AI assistant guidelines (this file)
- **PIVOT_PLAN.md** - AI optimizer pivot strategy
- **DATABASE_SCHEMA.md** - Complete database structure
- **Thoughts.md** - Developer notes
