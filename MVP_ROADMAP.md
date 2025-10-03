# MVP Roadmap - Unsubscribr
**Goal: Ship in 2-3 weeks and validate the idea with real users**

---

## 🎯 MVP Philosophy

**"Perfect is the enemy of done"**

- Ship fast, learn fast, iterate fast
- Build only what's needed to test the core hypothesis
- No fancy features - just solve the core problem
- Real user feedback > Perfect code

**Core Hypothesis to Test:**
> "Do Indians struggle with managing subscriptions and want a simple tool to track them?"

---

## ✅ MVP Feature List (Absolute Essentials Only)

### **Must Have** (Blocking MVP launch)

1. **Authentication**
   - [ ] Email/password signup
   - [ ] Email/password login
   - [ ] Email verification
   - [ ] Password reset
   - ❌ **NO** Google OAuth (add after MVP)

2. **Subscription Management** (Core Value!)
   - [ ] **Smart catalog of common Indian subscriptions**
     - Pre-populated list (Netflix, Prime, Spotify, Hotstar, etc.)
     - Quick-add with pre-filled price
   - [ ] Add subscription manually
     - Name, cost (₹), billing cycle (monthly/yearly), next billing date
   - [ ] View all subscriptions (simple list/cards)
   - [ ] Edit subscription
   - [ ] Delete subscription
   - [ ] Mark as cancelled
   - ❌ **NO** categories/tags yet
   - ❌ **NO** file uploads yet
   - ❌ **NO** email/bank auto-detection (Phase 2)

3. **Dashboard**
   - [ ] Total monthly cost
   - [ ] Total yearly cost
   - [ ] List of active subscriptions
   - [ ] Upcoming renewals (next 7 days)
   - ❌ **NO** fancy charts yet

4. **Basic Reminders**
   - [ ] Email reminder 3 days before renewal
   - ❌ **NO** push notifications yet
   - ❌ **NO** custom reminder timing yet

5. **Landing Page**
   - [ ] Hero section with value prop
   - [ ] 3-4 key features
   - [ ] Pricing (Free tier only for MVP)
   - [ ] CTA to sign up
   - ❌ **NO** fancy animations yet

### **Should Have** (Nice to have, add after core works)

- Google OAuth
- Push notifications
- Custom reminder timing
- Subscription categories
- Charts/visualizations
- Export data
- Dark mode

### **Won't Have in MVP** (Post-MVP, after validation)

- Payment integration (launch with free tier only)
- Auto-detection of subscriptions
- Receipt/bill uploads
- Mobile app
- Cancellation assistance
- Price tracking
- Sharing/collaboration
- AI features

---

## 📅 2-Week Sprint Plan

### **Week 1: Core Features**

**Day 1-2: Authentication** ✅ (90% done)
- [x] Email/password flows
- [ ] Test thoroughly
- [ ] Fix any bugs

**Day 3-5: Subscription CRUD**
- [ ] Database schema (subscriptions table)
- [ ] Create subscription form
- [ ] List subscriptions
- [ ] Edit/Delete functionality
- [ ] Basic validation

**Day 6-7: Dashboard**
- [ ] Calculate total costs
- [ ] Show upcoming renewals
- [ ] Simple, clean UI

### **Week 2: Polish & Launch**

**Day 8-9: Email System**
- [ ] Set up email service (Resend/SendGrid)
- [ ] Welcome email
- [ ] Reminder email (3 days before renewal)
- [ ] Test deliverability

**Day 10-11: Landing Page**
- [ ] Build landing page (simple, 1-page)
- [ ] Clear value proposition
- [ ] 2-3 screenshots
- [ ] Sign up CTA

**Day 12: Testing & Bug Fixes**
- [ ] Test all flows end-to-end
- [ ] Fix critical bugs
- [ ] Mobile responsive check
- [ ] Cross-browser check (Chrome, Safari)

**Day 13: Deploy & Soft Launch**
- [ ] Deploy to Vercel production
- [ ] Configure custom domain
- [ ] Set up analytics (PostHog/GA4)
- [ ] Soft launch to friends/family (10-20 people)

**Day 14: Public Launch**
- [ ] Post on Twitter/LinkedIn
- [ ] Post on relevant Indian communities
- [ ] Email waitlist (if you have one)
- [ ] Monitor for bugs

---

## 🎨 MVP Design Principles

**Keep it SIMPLE:**

1. **No fancy animations** - Basic transitions only
2. **No custom illustrations** - Use Lucide icons
3. **Standard UI components** - Stick to shadcn/ui components
4. **Mobile-first** - But don't obsess over pixel-perfect
5. **Consistent spacing** - Use Tailwind's default spacing
6. **One primary color** - Indigo (already using)

**Speed over perfection:**
- Use forms directly, no multi-step wizards
- Simple list view, no fancy grid/kanban
- Basic date picker, no custom calendar
- Standard alerts/toasts, no custom notifications

---

## 💾 MVP Database Schema (Minimal)

```sql
-- Users (handled by Supabase Auth)

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date DATE NOT NULL,
  is_cancelled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📊 MVP Success Metrics

**Week 1 Goals:**
- [ ] 20 signups
- [ ] 10 users add at least 1 subscription
- [ ] 5 users return on Day 2

**Week 2 Goals:**
- [ ] 50 signups
- [ ] 25 active users (added subscriptions)
- [ ] 10 users using product for 7+ days

**Key Questions to Answer:**
1. Do people actually sign up?
2. Do they add subscriptions after signing up? (Activation)
3. Do they come back? (Retention)
4. What features do they ask for? (Feedback)

**If YES to above → Iterate and add features**
**If NO → Pivot or improve core value prop**

---

## 🚫 What NOT to Do (Anti-Patterns)

❌ **Don't** build payment integration yet (test with free tier first)
❌ **Don't** build for scale (100 users is fine for MVP)
❌ **Don't** optimize performance obsessively (good enough is enough)
❌ **Don't** write extensive documentation (README is enough)
❌ **Don't** build admin dashboard (use Supabase dashboard)
❌ **Don't** implement every suggestion (validate first)
❌ **Don't** wait for perfect design (ship, then iterate)
❌ **Don't** overthink architecture (monolith is fine)

---

## 🎯 Launch Strategy (Lean)

### **Pre-Launch (Day 13 - Soft Launch)**
- Share with 10-20 friends/family
- Ask for honest feedback
- Fix critical bugs
- Validate core flows work

### **Launch Day (Day 14)**
- Post on Twitter with demo video
- Post on LinkedIn
- Post on r/IndiaInvestments or r/IndiaTech
- Email any waitlist
- Ask users for feedback

### **Post-Launch (Week 3+)**
- Talk to users daily
- Fix bugs within 24 hours
- Ship small improvements weekly
- Decide: Iterate or Pivot?

---

## 📝 Current Status

**Phase 3: Authentication** (90% complete)
- ✅ Security implementation
- ✅ Project structure
- ✅ Auth routes consolidated
- 🔄 Testing auth flows

**Next Steps:**
1. Finish Phase 3 (authentication testing)
2. Build subscription CRUD (3-4 days)
3. Build dashboard (2 days)
4. Set up email reminders (2 days)
5. Build landing page (2 days)
6. Test & launch! (2 days)

**Total: ~2 weeks from now**

---

## 🔥 The ONE Rule

**Ship something users can use in 2 weeks, even if it's ugly.**

Real feedback from 10 users > 100 hours of solo development

---

**Let's build! 🚀**
