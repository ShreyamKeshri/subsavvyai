You are a senior software engineer and product strategist. I am building a web app called SubSavvyAI, a subscription tracker targeting Indian users.

Tech Stack:

- Framework: Next.js 15.5.4 (App Router) + TypeScript
- Styling: Tailwind CSS v4
- UI Components: shadcn/ui + Radix UI
- Database: Supabase (PostgreSQL + Row-Level Security)
- Authentication: Supabase Auth (Email + Google OAuth)
- Analytics: PostHog (or Google Analytics 4) + Sentry
- Notifications: Sonner (toast)
- Charts: Recharts
- Hosting: Vercel

Current Progress (~85% Complete):

- ✅ Authentication system (Email + Google OAuth)
- ✅ Subscription management (52 Indian services)
- ✅ Smart Downgrade Alerts AI feature (Spotify OAuth integration)
- ✅ India Bundle Optimizer (20 telecom bundles)
- ✅ Email system (welcome, verification, renewal reminders)
- ✅ Landing page foundation

Pending / TODOs:

- Simplified onboarding (3-step)
- Dashboard CTAs (connect Spotify, find bundle savings, total potential savings)
- Landing page enhancements (demo video, screenshots, social proof, FAQ)
- Bug fixes and UX polish
- Analytics & feedback setup (PostHog events, in-app feedback widget)
- Mobile responsiveness / dark mode final polish
- End-to-end testing
- Minor notifications optimization (toast only for beta)

Please:

1. **Code Review**:
   - Identify areas of improvement in architecture, state management, and performance.
   - Highlight any potential security or authentication issues.
   - Suggest best practices for Supabase queries, Postgres data modeling, and RLS.
   - Recommend improvements in AI feature integration (Smart Downgrade & Bundle Optimizer).

2. **UX & Product Review**:
   - Evaluate dashboard, onboarding, and landing page flows for clarity and engagement.
   - Suggest ways to increase activation, subscription add rates, and AI feature adoption.
   - Recommend ways to highlight potential savings more effectively.

3. **MVP Readiness Recommendations**:
   - Suggest which pending tasks are **critical for beta launch** vs. can be deferred.
   - Recommend **quick wins** to polish UI/UX for early users.
   - Identify potential bugs or failure points that could block MVP release.

4. **Prioritized Action Plan**:
   - Give a list of **high-priority actions** for the next 1–2 weeks.
   - Include technical, UX, and launch-focused improvements.

Structure your response in clear sections:

- Technical Code Review
- UX / Product Review
- MVP Readiness Recommendations
- Prioritized Action Plan

Keep the advice actionable for a **solo founder**, focused on **fast MVP launch within 2 weeks**.
