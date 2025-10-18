# Sleekplan Feedback Integration Setup

## Quick Setup (5 minutes)

### Step 1: Create Sleekplan Account
1. Go to [https://sleekplan.com](https://sleekplan.com)
2. Sign up with your email (free tier available)
3. Create a new project for "SubSavvyAI"

### Step 2: Get Your Project ID
1. In Sleekplan dashboard, go to **Settings** → **Installation**
2. Copy your **Project ID** (looks like: `123456789`)
3. You'll see installation code - we've already integrated it!

### Step 3: Add to Environment Variables
Add this to your `.env.local` file:

```bash
# Sleekplan Feedback Widget
NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID=your_project_id_here
```

Replace `your_project_id_here` with the actual Project ID from Step 2.

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Verify Integration
1. Open your dashboard at http://127.0.0.1:3000/dashboard
2. Look for the Sleekplan widget (usually appears as a floating button or tab)
3. Click it to open the feedback form
4. Submit test feedback

---

## Features You Get

### 1. Feedback Collection
- **Bug Reports** - Users can report bugs with screenshots
- **Feature Requests** - Collect product ideas from users
- **General Feedback** - Open-ended feedback

### 2. Community Engagement
- **Upvoting** - Users vote on features they want
- **Comments** - Discussion threads on feedback items
- **Status Updates** - Mark feedback as "Planned", "In Progress", "Completed"

### 3. Roadmap
- **Public Roadmap** - Show users what you're building
- **Transparency** - Builds trust with users

### 4. Changelog
- **Release Notes** - Announce new features
- **User Notifications** - Automatically notify users of updates

---

## Configuration (Optional)

### Customize Widget Appearance
1. In Sleekplan dashboard: **Settings** → **Appearance**
2. Options:
   - Widget position (bottom-right, bottom-left, etc.)
   - Primary color (match SubSavvyAI brand)
   - Custom labels
   - Language

### Set Up Categories
1. **Settings** → **Categories**
2. Add categories:
   - 🐛 Bug
   - ✨ Feature Request
   - 🚀 Improvement
   - 💡 General

### Enable Notifications
1. **Settings** → **Notifications**
2. Get email alerts when users submit feedback
3. Connect to Slack (optional)

---

## User Identification

The integration automatically identifies logged-in users with:
- **User ID** - Supabase user ID
- **Name** - User's name or email prefix
- **Email** - User's email address

This helps you:
- Track who submitted feedback
- Reply directly to users
- See usage patterns

---

## Analytics Integration

Sleekplan events are automatically tracked in PostHog:
- `sleekplan_loaded` - Widget initialized
- Track feedback submissions via Sleekplan's webhook (advanced)

---

## Pricing

- **Free** - Up to 100 feedback items, 1 admin
- **Starter** - $19/month - Unlimited feedback, 3 admins
- **Pro** - $49/month - Advanced features, SSO, custom domain

**Recommendation**: Start with free tier, upgrade when you hit 100 feedback items.

---

## Alternative Options

If you want to explore other tools:
- **Canny** - Similar features, nicer UI, starts at $50/month
- **Frill** - Budget-friendly, starts at $25/month
- **Upvoty** - One-time payment option
- **ProductBoard** - Enterprise-level, expensive

**Why Sleekplan?** Best value for early-stage startups, generous free tier.

---

## Troubleshooting

### Widget Not Appearing?
1. Check `.env.local` has correct `NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID`
2. Restart dev server: `npm run dev`
3. Check browser console for errors
4. Verify Project ID in Sleekplan dashboard

### Widget Appears But Errors?
1. Check network tab for failed requests
2. Verify Sleekplan account is active
3. Check CORS settings in Sleekplan dashboard

### Want to Disable Temporarily?
1. Comment out `NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID` in `.env.local`
2. Restart dev server

---

## Next Steps

1. ✅ Set up Sleekplan account
2. ✅ Add Project ID to `.env.local`
3. ✅ Test widget on dashboard
4. 📋 Configure categories and appearance
5. 📋 Enable email notifications
6. 📋 Share roadmap link with beta testers
7. 📋 Monitor feedback and respond to users

---

**Last Updated:** October 18, 2025
**Status:** Ready for Integration 🚀
