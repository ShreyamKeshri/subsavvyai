# Telecom Bundle Research Prompt for ChatGPT

Copy and paste this entire prompt to ChatGPT to gather telecom bundle data for SubSavvyAI.

---

## PROMPT START

I'm building **SubSavvyAI**, an AI-powered subscription optimizer for Indian users. We help users save money by identifying cheaper alternatives to their current subscriptions.

### What We're Building

We're implementing an **"India Bundle Optimizer"** feature that:
1. Analyzes a user's current OTT subscriptions (Netflix, Hotstar, Zee5, SonyLIV, etc.)
2. Compares them with telecom bundles that include multiple OTT services
3. Recommends the most cost-effective bundle to save money

### Example Use Case

```
User currently pays:
- Hotstar Premium: ₹1,499/year
- Zee5 Premium: ₹699/year
- SonyLIV Premium: ₹999/year
Total: ₹3,197/year

We recommend:
- Vi RedX Plan: ₹1,099/month (includes Hotstar, Zee5, SonyLIV + unlimited data)
- Annual cost: ₹13,188
- User saves: Access to more services at lower effective cost per OTT service
```

### What I Need From You

Please research and provide a **comprehensive, structured database** of all current (October 2025) telecom bundles in India from the following providers:

**Telecom Providers to Research:**
1. **Jio** (Reliance Jio)
2. **Airtel** (Bharti Airtel)
3. **Vi** (Vodafone Idea)
4. **BSNL** (if they have OTT bundles)

### Required Information for Each Bundle

For each bundle, I need the following data in a structured format:

```json
{
  "provider": "Jio/Airtel/Vi/BSNL",
  "plan_name": "Exact plan name (e.g., 'Jio Fiber Gold', 'Airtel Black')",
  "plan_type": "prepaid/postpaid/fiber/mobile",
  "monthly_price": "Price in INR (if annual, convert to monthly equivalent)",
  "billing_cycle": "monthly/quarterly/yearly",
  "total_price": "Total price for the billing cycle",
  "included_ott_services": [
    "List of ALL OTT services included (Netflix, Hotstar, Prime Video, etc.)"
  ],
  "ott_plan_details": {
    "Netflix": "Premium/Standard/Mobile (if specified)",
    "Hotstar": "Premium/Super (if specified)",
    "Zee5": "Premium (if specified)",
    "etc": "..."
  },
  "data_benefits": "Data allowance (e.g., '3.5GB/day', 'Unlimited')",
  "validity": "Plan validity in days",
  "other_benefits": [
    "Any other benefits (calls, SMS, roaming, etc.)"
  ],
  "target_audience": "Who this plan is best for (families, individuals, content lovers)",
  "official_url": "Link to official plan page",
  "is_currently_active": true/false,
  "last_verified": "October 2025"
}
```

### Specific Instructions

1. **Focus on OTT-heavy bundles**: Prioritize plans that include 3+ OTT services
2. **Be comprehensive**: Include all tiers (budget, mid-range, premium)
3. **Verify pricing**: Use official websites only (jio.com, airtel.in, myvi.in, bsnl.co.in)
4. **Include hidden gems**: Look for lesser-known plans that offer great value
5. **Note expiry dates**: Some promotional bundles have end dates
6. **Check geographic availability**: Note if a plan is region-specific

### OTT Services to Track

Common OTT services included in Indian telecom bundles:
- Disney+ Hotstar
- Netflix
- Amazon Prime Video
- Zee5
- SonyLIV
- Voot
- JioCinema
- JioSaavn
- Airtel Xstream
- Apple TV+ (rare)
- YouTube Premium (rare)
- Eros Now
- ALTBalaji
- MX Player
- Discovery+
- Sony Liv
- Lionsgate Play

### Output Format

Please provide the data in **TWO formats**:

#### Format 1: JSON Array (for direct database import)
```json
[
  {
    "provider": "Jio",
    "plan_name": "...",
    "monthly_price": 999,
    "included_ott_services": ["Netflix", "Hotstar", "Prime Video"],
    ...
  },
  {
    "provider": "Airtel",
    ...
  }
]
```

#### Format 2: Markdown Table (for human review)
```markdown
| Provider | Plan Name | Monthly Price | OTT Services Included | Data Benefits | Best For |
|----------|-----------|---------------|----------------------|---------------|----------|
| Jio | Fiber Gold | ₹999 | Netflix, Hotstar, Prime | Unlimited | Families |
| Airtel | Black | ₹1,099 | Netflix, Prime, Disney+ | Unlimited | Premium users |
```

### Additional Context Questions

Also answer these strategic questions:

1. **Bundle Trends**: What's the average number of OTT services per bundle in October 2025?
2. **Best Value**: Which bundle offers the most OTT services for the lowest price?
3. **Netflix Plans**: Which bundles include Netflix Premium vs Mobile?
4. **Hotstar Plans**: Which bundles include Hotstar Premium (with Premier League)?
5. **Fiber vs Mobile**: Are fiber/broadband bundles better value than mobile prepaid for OTT services?
6. **Postpaid vs Prepaid**: Which has better OTT bundles?
7. **Family Plans**: Which bundles are best for families (4+ members)?
8. **Student Plans**: Are there any student-specific bundles with OTT services?
9. **Promotional Offers**: Any limited-time offers running in October 2025?
10. **Affiliate Programs**: Do these telecom providers have affiliate programs for referrals?

### Verification Requirements

For each piece of data, please:
- ✅ Verify from official source (link the source)
- ✅ Check that the plan is currently active (October 2025)
- ✅ Note if pricing varies by region
- ✅ Indicate if it's a promotional/limited-time offer

### Example of Perfect Output

```json
{
  "provider": "Airtel",
  "plan_name": "Airtel Black",
  "plan_type": "postpaid",
  "monthly_price": 1099,
  "billing_cycle": "monthly",
  "total_price": 1099,
  "included_ott_services": [
    "Netflix Premium",
    "Amazon Prime Video",
    "Disney+ Hotstar Premium",
    "Airtel Xstream Premium"
  ],
  "ott_plan_details": {
    "Netflix": "Premium (4 screens, 4K)",
    "Amazon Prime": "Prime Video included with Prime membership",
    "Hotstar": "Premium (includes sports, Premier League)",
    "Airtel Xstream": "Premium access"
  },
  "data_benefits": "Unlimited calls + 200GB shared data",
  "validity": "30 days",
  "other_benefits": [
    "Unlimited calling (local + STD)",
    "Free national roaming",
    "One year Disney+ Hotstar Premium",
    "One year Amazon Prime membership",
    "Handset protection (optional)"
  ],
  "target_audience": "Premium users, families with multiple streaming needs",
  "official_url": "https://www.airtel.in/black/",
  "is_currently_active": true,
  "last_verified": "October 2025",
  "notes": "Best value for Netflix Premium users. Effective OTT cost: ₹275/service/month"
}
```

### Important Notes

- Focus on **value for money** - we want to recommend bundles that genuinely save users money
- Include **both mobile and fiber** plans - many users have both
- Note **family plans** separately - these are very relevant for our audience
- Check **activation requirements** - some bundles require porting or new connections
- Look for **hidden costs** - installation charges, router rental, etc.

### Deliverables Summary

Please provide:
1. ✅ Complete JSON array of all bundles (ready for database import)
2. ✅ Markdown comparison table (for human review)
3. ✅ Strategic insights (answering the 10 questions above)
4. ✅ Top 5 recommendations for different user profiles:
   - Budget-conscious users
   - Premium content lovers
   - Families (4+ members)
   - Sports fans (cricket, football)
   - Movie/series bingers
5. ✅ Sources list (all URLs used for verification)

### Timeline

This is for a production app launching in January 2026, so please prioritize:
- **Accuracy** > Comprehensiveness
- **Current data** (October 2025) over historical data
- **Official sources** over third-party blogs

---

Thank you! This research will directly help thousands of Indian users save money on their subscriptions. 🇮🇳💰

## PROMPT END

---

## Instructions for Using ChatGPT's Output

After ChatGPT provides the research:

1. **Copy the JSON array** into a file called `telecom-bundles-data.json`
2. **Copy the markdown table** into a file called `TELECOM_BUNDLES_REVIEW.md`
3. **Share both files with Claude Code** with this message:

```
I've researched Indian telecom bundles. Here's the data:

[Paste JSON array]

[Paste markdown table]

[Paste strategic insights]

Please:
1. Create a database migration for the telecom_bundles table
2. Seed the database with this data
3. Build a bundle matching algorithm that compares user subscriptions with available bundles
4. Create UI components to display bundle recommendations
5. Integrate into the dashboard

Start with the database migration and let me review before proceeding.
```

---

## What Claude Code Will Do Next

Once you provide the research data, Claude Code will:

1. **Create Migration** (`006_telecom_bundles.sql`):
   - Create `telecom_bundles` table
   - Create `bundle_recommendations` table for tracking recommendations
   - Insert seed data from research

2. **Build Bundle Matcher** (`lib/bundles/bundle-matcher.ts`):
   - Algorithm to match user subscriptions with bundles
   - Calculate savings for each bundle
   - Rank bundles by value

3. **Create Server Actions** (`lib/bundles/bundle-actions.ts`):
   - `getBundleRecommendations(userId)` - Get personalized bundle recommendations
   - `dismissBundleRecommendation(recommendationId)` - User dismisses a recommendation
   - `trackBundleClick(bundleId)` - Track when user clicks affiliate link

4. **Build UI Components**:
   - `components/bundles/bundle-card.tsx` - Display individual bundle
   - `components/bundles/bundle-comparison.tsx` - Compare current vs recommended
   - `components/bundles/bundle-recommendations.tsx` - List all recommendations

5. **Integrate into Dashboard**:
   - Add "Bundle Optimizer" section
   - Show top 3 bundle recommendations
   - Display potential savings

---

## Expected Timeline

- **Research (You + ChatGPT)**: 30-60 minutes
- **Implementation (Claude Code)**: 2-3 hours
- **Testing**: 30 minutes
- **Total**: ~4 hours to complete India Bundle Optimizer feature

---

## Success Criteria

After implementation, you should be able to:
- ✅ See bundle recommendations on dashboard
- ✅ Click to view bundle details
- ✅ See exact savings calculation
- ✅ Click affiliate link to purchase bundle
- ✅ Dismiss recommendations you're not interested in

---

**Ready to start research!** Copy the prompt above and paste it into ChatGPT.
