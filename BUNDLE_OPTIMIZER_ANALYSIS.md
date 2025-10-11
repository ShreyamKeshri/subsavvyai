# India Bundle Optimizer - Analysis & Implementation Plan

**Date:** October 11, 2025
**Status:** Ready for Implementation
**Branch:** `feature/india-bundle-optimizer`

---

## 📊 Research Data Analysis

### Data Quality: ✅ Excellent

**Total Bundles Researched:** 24 plans
- **Jio:** 6 fiber plans (₹499 - ₹1499)
- **Airtel:** 10 plans (3 prepaid + 7 fiber) (₹279 - ₹3999)
- **Vi:** 2 postpaid plans (₹1201 - ₹1601)
- **BSNL:** 4 fiber plans (₹599 - ₹1799) *[Less detailed OTT info]*

### Key Insights

#### 1. **Best Value Plans** (Most OTT per ₹)
1. **JioFiber ₹999** - 15 OTTs @ ₹66/OTT ⭐ **BEST VALUE**
2. **JioFiber ₹899** - 14 OTTs @ ₹64/OTT
3. **Airtel ₹598 Prepaid** - 4 OTTs @ ₹150/OTT (mobile)

#### 2. **Premium Netflix Plans** (4K)
- **Airtel Xstream Fiber ₹3999** - Only plan with Netflix Premium (4K, 4 screens)
- **JioFiber ₹999** - Netflix Premium 4K
- **JioFiber ₹1499** - Netflix Premium 4K

#### 3. **Sports Fans** (Hotstar Premium with Premier League)
- All major plans include Hotstar Premium/Super
- Best: **Airtel ₹999 Fiber** - Hotstar Super + Netflix + Prime + Apple TV+

#### 4. **Family Plans**
- **Vi REDX Family ₹1601** - 2 lines, shared OTT
- **Airtel Fiber ₹1599** - High-speed + 6 OTTs for families

#### 5. **Budget Users**
- **Airtel ₹279 Prepaid** - 4 OTTs (entry-level)
- **Airtel ₹598 Prepaid** - 4 OTTs + unlimited 5G data
- **BSNL ₹599 Fiber** - Basic fiber + bundled OTT

---

## 🎯 Implementation Strategy

### Phase 1: Database & Data Model (2-3 hours)

#### A. Database Schema

**Create `telecom_bundles` table:**
```sql
CREATE TABLE telecom_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'Jio', 'Airtel', 'Vi', 'BSNL'
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- 'fiber', 'prepaid', 'postpaid'
  monthly_price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL, -- 'monthly', '28 days', '84 days'
  total_price NUMERIC NOT NULL,

  -- OTT Services (array of service names)
  included_ott_services TEXT[] NOT NULL,

  -- Detailed OTT info (JSONB)
  ott_plan_details JSONB NOT NULL DEFAULT '{}',

  -- Data & Benefits
  data_benefits TEXT,
  validity TEXT,
  other_benefits TEXT[],

  -- Metadata
  target_audience TEXT,
  official_url TEXT,
  is_currently_active BOOLEAN DEFAULT true,
  last_verified DATE DEFAULT CURRENT_DATE,
  notes TEXT,

  -- For ranking
  value_score NUMERIC, -- OTT count divided by (price/1000)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_telecom_bundles_provider ON telecom_bundles(provider);
CREATE INDEX idx_telecom_bundles_price ON telecom_bundles(monthly_price);
CREATE INDEX idx_telecom_bundles_plan_type ON telecom_bundles(plan_type);
CREATE INDEX idx_telecom_bundles_active ON telecom_bundles(is_currently_active);
CREATE INDEX idx_telecom_bundles_value_score ON telecom_bundles(value_score DESC);

-- GIN index for array searches
CREATE INDEX idx_telecom_bundles_ott_services ON telecom_bundles USING GIN(included_ott_services);
```

**Create `bundle_recommendations` table** (to track recommendations):
```sql
CREATE TABLE bundle_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES telecom_bundles(id) ON DELETE CASCADE,

  -- User's current subscriptions that match this bundle
  matched_subscriptions UUID[] NOT NULL, -- array of subscription IDs

  -- Savings calculation
  current_monthly_cost NUMERIC NOT NULL,
  bundle_monthly_cost NUMERIC NOT NULL,
  monthly_savings NUMERIC NOT NULL,
  annual_savings NUMERIC NOT NULL,

  -- Recommendation details
  recommendation_type TEXT NOT NULL, -- 'bundle', 'upgrade', 'switch'
  confidence_score NUMERIC DEFAULT 0.75, -- 0-1
  reasoning TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'viewed', 'accepted', 'dismissed'
  viewed_at TIMESTAMPTZ,
  status_updated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, bundle_id) -- One recommendation per bundle per user
);

-- Indexes
CREATE INDEX idx_bundle_recommendations_user ON bundle_recommendations(user_id);
CREATE INDEX idx_bundle_recommendations_status ON bundle_recommendations(status);
CREATE INDEX idx_bundle_recommendations_savings ON bundle_recommendations(annual_savings DESC);

-- RLS Policies
ALTER TABLE bundle_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON bundle_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON bundle_recommendations FOR UPDATE
  USING (auth.uid() = user_id);
```

#### B. Data Normalization Issues to Fix

**Problems in Research Data:**
1. **BSNL bundles** - No specific OTT service details (just "Bundled OTT (unspecified)")
2. **Inconsistent OTT service names:**
   - "Disney+ Hotstar" vs "Hotstar Premium" vs "JioHotstar"
   - "Amazon Prime" vs "Amazon Prime Video"
   - Need to normalize to our existing `services` table

**Solution:** Create a mapping table or normalize during import.

---

### Phase 2: Bundle Matching Algorithm (2-3 hours)

#### Algorithm Logic:

```typescript
interface BundleMatch {
  bundle: TelecomBundle
  matchedSubscriptions: Subscription[]
  currentCost: number
  bundleCost: number
  savings: number
  matchPercentage: number
  reasoning: string
}

function findBundleMatches(userSubscriptions: Subscription[]): BundleMatch[] {
  // 1. Get all active bundles
  const bundles = await getBundles()

  // 2. For each bundle, calculate match
  const matches = bundles.map(bundle => {
    // Find which user subscriptions are in this bundle
    const matched = userSubscriptions.filter(sub =>
      bundle.included_ott_services.includes(sub.service.name)
    )

    // Calculate current cost for matched subscriptions
    const currentCost = matched.reduce((sum, sub) =>
      sum + calculateMonthlyCost(sub.cost, sub.billing_cycle), 0
    )

    // Calculate savings
    const savings = currentCost - bundle.monthly_price
    const matchPercentage = (matched.length / userSubscriptions.length) * 100

    return {
      bundle,
      matchedSubscriptions: matched,
      currentCost,
      bundleCost: bundle.monthly_price,
      savings,
      matchPercentage,
      reasoning: generateReasoning(matched, bundle, savings)
    }
  })

  // 3. Filter to only positive savings and good matches
  return matches.filter(m =>
    m.savings > 0 && // Must save money
    m.matchedSubscriptions.length >= 2 && // Must match at least 2 services
    m.matchPercentage >= 40 // Must match 40%+ of subscriptions
  ).sort((a, b) => b.savings - a.savings) // Sort by savings
}
```

#### Edge Cases to Handle:

1. **User has Netflix Premium, bundle has Netflix Basic**
   - Should we still recommend? (Probably not - downgrade warning)
   - Need to check plan tiers

2. **User has fiber + mobile subscriptions**
   - May need both fiber and mobile bundles
   - Don't double-count savings

3. **User already has a telecom bundle**
   - Check if they're paying separately for OTTs
   - Recommend better bundle if exists

4. **Overlap detection:**
   - User pays Netflix ₹649/mo separately
   - Bundle includes Netflix for ₹999/mo total with 14 other OTTs
   - Savings = ₹649 - (₹999/15 services) = ₹649 - ₹66 = ₹583/mo

---

### Phase 3: UI Components (2-3 hours)

#### A. Bundle Recommendation Card Component

```tsx
<BundleRecommendationCard
  bundle={bundle}
  matchedSubscriptions={matched}
  currentCost={currentCost}
  savings={savings}
  onAccept={() => handleAccept(bundle.id)}
  onDismiss={() => handleDismiss(bundle.id)}
/>
```

**Features:**
- Shows bundle provider logo (Jio/Airtel/Vi)
- Lists matched OTT services with checkmarks
- Shows current vs bundle cost comparison
- Displays monthly + annual savings
- "View Details" button → Modal with full bundle info
- "Switch to This Bundle" CTA (affiliate link)
- "Not Interested" dismiss button

#### B. Bundle Comparison Table

```tsx
<BundleComparisonTable
  currentServices={userSubscriptions}
  recommendedBundle={bundle}
  showSavingsHighlight
/>
```

#### C. Bundle Optimizer Dashboard Section

```tsx
<section className="bundle-optimizer">
  <h2>💰 Switch to a Bundle & Save</h2>
  <p>We found {recommendations.length} telecom bundles that include your current subscriptions</p>

  <div className="recommendations-grid">
    {recommendations.map(rec => (
      <BundleRecommendationCard key={rec.id} {...rec} />
    ))}
  </div>
</section>
```

---

### Phase 4: Integration (1 hour)

1. Add "Bundle Optimizer" section to dashboard below Smart Downgrade Alerts
2. Show top 3 bundle recommendations
3. Add "View All Bundles" link to dedicated page
4. Track clicks on affiliate links

---

## 🗂️ Data Import Plan

### Step 1: Clean & Normalize JSON

**Issues to fix:**
1. Remove BSNL bundles with unspecified OTT (or mark as "not recommended")
2. Normalize OTT service names to match our `services` table:
   - "Disney+ Hotstar" → "Hotstar"
   - "Amazon Prime" → "Amazon Prime Video"
   - "Netflix Basic/Premium" → Store tier in `ott_plan_details`

3. Calculate `value_score` for each bundle:
   ```javascript
   value_score = ott_count / (monthly_price / 1000)
   ```

4. Extract OTT service names from `ott_plan_details` into `included_ott_services` array

### Step 2: Create SQL Insert Statements

Convert JSON to SQL `INSERT` statements in migration file.

### Step 3: Add to Migration

Create `006_telecom_bundles.sql` with:
- Table creation
- Indexes
- RLS policies
- Data inserts (all 20 usable bundles)

---

## 📈 Success Metrics

### MVP (Week 1):
- [ ] 24 bundles imported to database
- [ ] Bundle matching algorithm working
- [ ] Show 3 bundle recommendations on dashboard
- [ ] Users can click through to provider websites

### Week 2:
- [ ] Track recommendation acceptance rate
- [ ] Track affiliate link clicks
- [ ] A/B test recommendation sorting (savings vs value score)
- [ ] Add "Why this bundle?" explainer

### Month 1:
- [ ] 10% of users view bundle recommendations
- [ ] 5% click through to providers
- [ ] 1% actually switch (tracked via follow-up survey)

---

## 🎨 UI Mockup (Text)

```
┌─────────────────────────────────────────────────────┐
│ 💰 Switch to a Bundle & Save ₹8,388/year           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔵 JioFiber 150Mbps + 15 OTT Pack            │ │
│  │ ₹999/month • Save ₹699/month (₹8,388/year)  │ │
│  │                                                │ │
│  │ Includes your current subscriptions:          │ │
│  │ ✓ Netflix Premium (₹649)                     │ │
│  │ ✓ Hotstar Premium (₹1,499/year)              │ │
│  │ ✓ Amazon Prime (₹1,499/year)                 │ │
│  │                                                │ │
│  │ Plus 12 more OTT services!                    │ │
│  │                                                │ │
│  │ [Switch to This Bundle]  [Not Interested]    │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  [View 2 More Recommendations]                      │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Considerations

### 1. **Service Name Mapping**

Our `services` table has:
- "Netflix" (not "Netflix Basic" or "Netflix Premium")
- "Disney+ Hotstar" (not "JioHotstar")
- "Amazon Prime Video" (not "Amazon Prime")

**Solution:** Create a mapping layer in the matching algorithm.

### 2. **Plan Tier Matching**

User has "Netflix Premium" (₹649/mo), bundle has "Netflix Basic" (SD, 1 screen).

**Decision:**
- ❌ Don't recommend bundles with lower-tier plans
- ✅ Only recommend if same tier or higher
- ⚠️ Show warning if tier mismatch

### 3. **Affiliate Links**

Need to add affiliate tracking parameters to URLs:
```
https://www.jio.com/fiber?ref=subsavvyai&utm_source=subsavvyai
```

Get affiliate IDs from Jio/Airtel/Vi partner programs.

### 4. **Regional Availability**

BSNL plans are region-specific (Kolkata URL).
**Solution:** Add `availability` field to bundles, filter by user location (if available).

---

## 📝 Next Steps

1. ✅ Research Complete
2. ⏳ Clean & normalize JSON data
3. ⏳ Create database migration (006_telecom_bundles.sql)
4. ⏳ Import data
5. ⏳ Build matching algorithm
6. ⏳ Create UI components
7. ⏳ Integrate into dashboard
8. ⏳ Test with real user data
9. ⏳ Commit & PR

**Estimated Total Time:** 8-10 hours (1-2 days)

---

## 🚀 Ready to Implement!

**Start with:** Database migration & data import
**Then:** Build matching algorithm
**Finally:** UI components & integration

Let's build this! 💪
