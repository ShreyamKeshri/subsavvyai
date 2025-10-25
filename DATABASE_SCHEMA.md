# SubSavvyAI - Database Schema Documentation

**Version:** 1.1
**Database:** PostgreSQL (Supabase)
**Last Updated:** October 25, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Database Tables](#database-tables)
4. [Enums and Custom Types](#enums-and-custom-types)
5. [Indexes and Performance](#indexes-and-performance)
6. [Row-Level Security (RLS)](#row-level-security-rls)
7. [Helper Functions](#helper-functions)
8. [Scalability Considerations](#scalability-considerations)
9. [Migration Instructions](#migration-instructions)

---

## Overview

This document describes the complete database schema for SubSavvyAI, a subscription management platform for the Indian market. The schema is designed for:

- **Multi-tenancy:** Each user's data is isolated via Row-Level Security
- **Scalability:** Optimized indexes, materialized views, and caching
- **Data Integrity:** Foreign keys, constraints, and triggers
- **Analytics:** Pre-calculated aggregates for fast dashboard loading
- **Auditability:** Timestamps on all tables, soft deletes where appropriate

### Key Design Principles

1. **Normalized 3NF schema** to minimize data redundancy
2. **Soft deletes** for subscriptions (preserves historical data)
3. **Audit columns** (`created_at`, `updated_at`) on all tables
4. **Enum types** for status fields to ensure data consistency
5. **JSONB columns** for flexible semi-structured data (analytics, cancellation steps)
6. **Comprehensive indexing** for common query patterns
7. **RLS policies** to secure user data at the database level

---

## Entity-Relationship Diagram

```
┌─────────────────┐
│  auth.users     │ (Supabase Auth - managed by Supabase)
│  - id (UUID)    │
│  - email        │
│  - phone        │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌──────────────────────────┐
│  profiles                │
│  - id (UUID, PK)         │◄─────────┐
│  - user_id (FK)          │          │
│  - full_name             │          │
│  - phone_number          │          │ 1:N
│  - avatar_url            │          │
│  - timezone              │          │
│  - currency_preference   │          │
│  - created_at            │          │
│  - updated_at            │          │
└────────┬─────────────────┘          │
         │                            │
         │ 1:N                        │
         ▼                            │
┌──────────────────────────┐          │
│  subscriptions           │          │
│  - id (UUID, PK)         │          │
│  - user_id (FK)          │──────────┘
│  - service_id (FK)       │────┐
│  - custom_service_name   │    │
│  - cost                  │    │
│  - currency              │    │ N:1
│  - billing_cycle         │    │
│  - billing_date          │    │
│  - next_billing_date     │    │
│  - status                │    │
│  - payment_method_id (FK)│────┼────┐
│  - notes                 │    │    │
│  - cancellation_reason   │    │    │
│  - cancelled_at          │    │    │
│  - created_at            │    │    │
│  - updated_at            │    │    │
│  - deleted_at (soft del) │    │    │
└────────┬─────────────────┘    │    │
         │                      │    │
         │ 1:N                  │    │
         ▼                      │    │
┌──────────────────────────┐    │    │
│  payment_history         │    │    │
│  - id (UUID, PK)         │    │    │
│  - subscription_id (FK)  │────┘    │
│  - payment_method_id (FK)│─────────┤
│  - amount                │         │
│  - currency              │         │ N:1
│  - status                │         │
│  - payment_provider      │         │
│  - provider_payment_id   │         │
│  - payment_date          │         │
│  - failure_reason        │         │
│  - created_at            │         │
└──────────────────────────┘         │
                                     │
┌──────────────────────────┐         │
│  payment_methods         │         │
│  - id (UUID, PK)         │◄────────┘
│  - user_id (FK)          │
│  - provider (enum)       │
│  - type (enum)           │
│  - last_four_digits      │
│  - card_brand            │
│  - upi_id                │
│  - provider_customer_id  │
│  - provider_method_id    │
│  - is_default            │
│  - is_active             │
│  - expires_at            │
│  - created_at            │
│  - updated_at            │
└──────────────────────────┘

┌──────────────────────────┐
│  services                │◄────┐
│  - id (UUID, PK)         │     │
│  - name                  │     │
│  - category              │     │ N:1
│  - typical_price_inr     │     │
│  - logo_url              │     │
│  - website_url           │     │
│  - cancellation_url      │     │
│  - is_active             │     │
│  - created_at            │     │
│  - updated_at            │     │
└────────┬─────────────────┘     │
         │                       │
         │ 1:1                   │
         ▼                       │
┌──────────────────────────┐     │
│  cancellation_guides     │     │
│  - id (UUID, PK)         │     │
│  - service_id (FK)       │─────┘
│  - steps (JSONB)         │
│  - estimated_time        │
│  - difficulty_level      │
│  - last_verified_at      │
│  - created_at            │
│  - updated_at            │
└──────────────────────────┘

┌──────────────────────────┐
│  notifications           │
│  - id (UUID, PK)         │
│  - user_id (FK)          │
│  - subscription_id (FK)  │
│  - type (enum)           │
│  - title                 │
│  - message               │
│  - scheduled_for         │
│  - sent_at               │
│  - read_at               │
│  - delivery_status       │
│  - fcm_token             │
│  - created_at            │
└──────────────────────────┘

┌──────────────────────────┐
│  notification_preferences│
│  - id (UUID, PK)         │
│  - user_id (FK, unique)  │
│  - fcm_token             │
│  - email_enabled         │
│  - push_enabled          │
│  - reminder_3_days       │
│  - reminder_1_day        │
│  - reminder_same_day     │
│  - weekly_summary        │
│  - created_at            │
│  - updated_at            │
└──────────────────────────┘

┌──────────────────────────┐
│  user_analytics_cache    │
│  - id (UUID, PK)         │
│  - user_id (FK, unique)  │
│  - total_monthly_spend   │
│  - total_yearly_spend    │
│  - active_subscriptions  │
│  - category_breakdown    │
│  - spending_trend        │
│  - last_calculated_at    │
│  - created_at            │
│  - updated_at            │
└──────────────────────────┘
```

---

## Database Tables

### 1. `profiles`

Extends Supabase's `auth.users` with additional user profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FK to auth.users(id) | User ID (same as auth.users) |
| full_name | TEXT | | User's full name |
| phone_number | TEXT | | User's phone number |
| avatar_url | TEXT | | Profile picture URL |
| timezone | TEXT | DEFAULT 'Asia/Kolkata' | User's timezone |
| currency_preference | TEXT | DEFAULT 'INR' | Preferred currency |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Relationships:**
- 1:1 with `auth.users` (id → auth.users.id)
- 1:N with `subscriptions` (id → subscriptions.user_id)

**Indexes:**
- Primary key on `id`
- Index on `phone_number`

---

### 2. `services`

Reference table containing popular subscription services (Netflix, Spotify, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Service ID |
| name | TEXT | NOT NULL, UNIQUE | Service name |
| category | subscription_category | NOT NULL | Service category enum |
| typical_price_inr | NUMERIC(10, 2) | | Typical monthly price in INR |
| logo_url | TEXT | | Service logo URL |
| website_url | TEXT | | Official website |
| cancellation_url | TEXT | | Cancellation page URL |
| is_active | BOOLEAN | DEFAULT true | Whether service is active |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Relationships:**
- 1:N with `subscriptions` (id → subscriptions.service_id)
- 1:1 with `cancellation_guides` (id → cancellation_guides.service_id)

**Indexes:**
- Primary key on `id`
- Unique index on `name`
- Index on `category`
- Partial index on `is_active` (where is_active = true)
- GIN trigram index on `name` (for fuzzy search)

---

### 3. `payment_methods`

Stores user payment methods (cards, UPI, etc.) for tracking subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Payment method ID |
| user_id | UUID | NOT NULL, FK to auth.users(id) | Owner user ID |
| provider | payment_provider | NOT NULL | Payment provider enum |
| type | payment_method_type | NOT NULL | Payment method type enum |
| last_four_digits | TEXT | | Last 4 digits (for cards) |
| card_brand | TEXT | | Card brand (Visa, Mastercard, etc.) |
| upi_id | TEXT | | UPI ID (for UPI payments) |
| provider_customer_id | TEXT | | Razorpay/Stripe customer ID |
| provider_method_id | TEXT | | Razorpay/Stripe payment method ID |
| is_default | BOOLEAN | DEFAULT false | Whether this is the default method |
| is_active | BOOLEAN | DEFAULT true | Whether method is active |
| expires_at | DATE | | Expiration date (for cards) |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Relationships:**
- N:1 with `auth.users` (user_id → auth.users.id)
- 1:N with `subscriptions` (id → subscriptions.payment_method_id)
- 1:N with `payment_history` (id → payment_history.payment_method_id)

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Partial index on `(user_id, is_active)` where is_active = true

**Constraints:**
- Only one default payment method per user

---

### 4. `subscriptions` ⭐ (Core Table)

Main table storing user subscription records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Subscription ID |
| user_id | UUID | NOT NULL, FK to auth.users(id) | Owner user ID |
| service_id | UUID | FK to services(id) | Service reference (nullable) |
| custom_service_name | TEXT | | Custom service name (if not in services table) |
| cost | NUMERIC(10, 2) | NOT NULL, CHECK >= 0 | Subscription cost (always in INR after migration 008) |
| currency | TEXT | DEFAULT 'INR', NOT NULL | Currency code (always 'INR' after migration 008) |
| original_cost | NUMERIC(10, 2) | | Original cost entered by user in their selected currency |
| original_currency | TEXT | | Original currency code selected by user (USD, EUR, GBP, etc.) |
| billing_cycle | billing_cycle | NOT NULL | Billing cycle enum |
| billing_date | DATE | NOT NULL | Billing day of month/year |
| next_billing_date | DATE | NOT NULL | Next billing date |
| status | subscription_status | DEFAULT 'active' | Subscription status enum |
| payment_method_id | UUID | FK to payment_methods(id) | Payment method used |
| notes | TEXT | | User notes |
| cancellation_reason | TEXT | | Reason for cancellation |
| cancelled_at | TIMESTAMPTZ | | Cancellation timestamp |
| paused_at | TIMESTAMPTZ | | Pause timestamp |
| paused_until | DATE | | Resume date if paused |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |

**Relationships:**
- N:1 with `auth.users` (user_id → auth.users.id)
- N:1 with `services` (service_id → services.id)
- N:1 with `payment_methods` (payment_method_id → payment_methods.id)
- 1:N with `payment_history` (id → payment_history.subscription_id)
- 1:N with `notifications` (id → notifications.subscription_id)

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `status`
- Composite index on `(user_id, status)` where deleted_at IS NULL
- Index on `next_billing_date` where deleted_at IS NULL AND status = 'active'
- Index on `service_id`
- Partial index on `deleted_at` where deleted_at IS NOT NULL

**Constraints:**
- Either `service_id` OR `custom_service_name` must be provided
- `cost >= 0`
- `next_billing_date >= billing_date`
- `currency` must match ISO 4217 format (3 uppercase letters)

---

### 5. `payment_history`

Transaction log for subscription payments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Payment record ID |
| subscription_id | UUID | NOT NULL, FK to subscriptions(id) | Related subscription |
| payment_method_id | UUID | FK to payment_methods(id) | Payment method used |
| amount | NUMERIC(10, 2) | NOT NULL, CHECK >= 0 | Payment amount |
| currency | TEXT | DEFAULT 'INR' | Currency code |
| status | payment_status | DEFAULT 'pending' | Payment status enum |
| payment_provider | payment_provider | | Provider used |
| provider_payment_id | TEXT | | Razorpay/Stripe payment ID |
| payment_date | TIMESTAMPTZ | | Actual payment date |
| failure_reason | TEXT | | Reason for failure |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |

**Relationships:**
- N:1 with `subscriptions` (subscription_id → subscriptions.id)
- N:1 with `payment_methods` (payment_method_id → payment_methods.id)

**Indexes:**
- Primary key on `id`
- Index on `subscription_id`
- Index on `status`
- Index on `payment_date DESC`
- Index on `provider_payment_id` (where not null)

---

### 6. `notifications`

User notifications for renewal reminders and updates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Notification ID |
| user_id | UUID | NOT NULL, FK to auth.users(id) | Recipient user ID |
| subscription_id | UUID | FK to subscriptions(id) | Related subscription |
| type | notification_type | NOT NULL | Notification type enum |
| title | TEXT | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| scheduled_for | TIMESTAMPTZ | NOT NULL | Scheduled send time |
| sent_at | TIMESTAMPTZ | | Actual send time |
| read_at | TIMESTAMPTZ | | Read timestamp |
| delivery_status | notification_delivery_status | DEFAULT 'pending' | Delivery status enum |
| fcm_token | TEXT | | FCM token used |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |

**Relationships:**
- N:1 with `auth.users` (user_id → auth.users.id)
- N:1 with `subscriptions` (subscription_id → subscriptions.id)

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `scheduled_for` where delivery_status = 'pending'
- Index on `(user_id, read_at)` where read_at IS NULL (unread)
- Index on `subscription_id`

---

### 7. `notification_preferences`

User notification settings and FCM tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Preference ID |
| user_id | UUID | UNIQUE, NOT NULL, FK to auth.users(id) | User ID |
| fcm_token | TEXT | | Firebase Cloud Messaging token |
| email_enabled | BOOLEAN | DEFAULT true | Email notifications enabled |
| push_enabled | BOOLEAN | DEFAULT true | Push notifications enabled |
| reminder_3_days | BOOLEAN | DEFAULT true | 3-day reminder enabled |
| reminder_1_day | BOOLEAN | DEFAULT true | 1-day reminder enabled |
| reminder_same_day | BOOLEAN | DEFAULT true | Same-day reminder enabled |
| weekly_summary | BOOLEAN | DEFAULT true | Weekly summary enabled |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Relationships:**
- 1:1 with `auth.users` (user_id → auth.users.id)

**Indexes:**
- Primary key on `id`
- Unique index on `user_id`

---

### 8. `cancellation_guides`

Step-by-step cancellation instructions for services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Guide ID |
| service_id | UUID | UNIQUE, NOT NULL, FK to services(id) | Related service |
| steps | JSONB | NOT NULL | Array of step objects |
| estimated_time_minutes | INTEGER | | Estimated completion time |
| difficulty_level | difficulty_level | | Difficulty enum |
| last_verified_at | TIMESTAMPTZ | | Last verification date |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Steps JSONB Structure:**
```json
[
  {
    "step": 1,
    "title": "Go to Settings",
    "description": "Navigate to your account settings page",
    "image_url": "https://..."
  },
  {
    "step": 2,
    "title": "Select Subscription",
    "description": "Click on 'Manage Subscription'",
    "image_url": "https://..."
  }
]
```

**Relationships:**
- 1:1 with `services` (service_id → services.id)

**Indexes:**
- Primary key on `id`
- Unique index on `service_id`

---

### 9. `user_analytics_cache`

Pre-calculated analytics for fast dashboard performance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Cache record ID |
| user_id | UUID | UNIQUE, NOT NULL, FK to auth.users(id) | User ID |
| total_monthly_spend | NUMERIC(12, 2) | DEFAULT 0 | Total monthly spend |
| total_yearly_spend | NUMERIC(12, 2) | DEFAULT 0 | Total yearly spend |
| active_subscriptions_count | INTEGER | DEFAULT 0 | Count of active subscriptions |
| category_breakdown | JSONB | | Spending by category |
| spending_trend | JSONB | | Monthly trend data |
| last_calculated_at | TIMESTAMPTZ | NOT NULL | Last calculation time |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Category Breakdown JSONB Structure:**
```json
{
  "OTT": 1500,
  "Music": 300,
  "SaaS": 2000,
  "Fitness": 800
}
```

**Relationships:**
- 1:1 with `auth.users` (user_id → auth.users.id)

**Indexes:**
- Primary key on `id`
- Unique index on `user_id`
- Index on `last_calculated_at`

**Auto-Refresh:**
- Automatically updated via trigger when subscriptions change
- Can also be refreshed on-demand via `refresh_user_analytics(user_id)` function

---

## Enums and Custom Types

### `subscription_category`
```sql
CREATE TYPE subscription_category AS ENUM (
  'OTT',
  'Music',
  'Food Delivery',
  'SaaS',
  'Fitness',
  'News',
  'Gaming',
  'Education',
  'Other'
);
```

### `billing_cycle`
```sql
CREATE TYPE billing_cycle AS ENUM (
  'monthly',
  'quarterly',
  'yearly',
  'custom'
);
```

### `subscription_status`
```sql
CREATE TYPE subscription_status AS ENUM (
  'active',
  'cancellation_initiated',
  'cancelled',
  'paused',
  'expired'
);
```

### `payment_provider`
```sql
CREATE TYPE payment_provider AS ENUM (
  'razorpay',
  'stripe',
  'upi',
  'manual'
);
```

### `payment_method_type`
```sql
CREATE TYPE payment_method_type AS ENUM (
  'card',
  'upi',
  'netbanking',
  'wallet',
  'other'
);
```

### `payment_status`
```sql
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);
```

### `notification_type`
```sql
CREATE TYPE notification_type AS ENUM (
  'renewal_reminder',
  'payment_success',
  'payment_failed',
  'subscription_cancelled',
  'weekly_summary',
  'custom'
);
```

### `notification_delivery_status`
```sql
CREATE TYPE notification_delivery_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'cancelled'
);
```

### `difficulty_level`
```sql
CREATE TYPE difficulty_level AS ENUM (
  'easy',
  'medium',
  'hard'
);
```

---

## Indexes and Performance

### Indexing Strategy

1. **Primary Keys:** Automatic B-tree indexes on all `id` columns
2. **Foreign Keys:** Indexes on all FK columns for join performance
3. **Composite Indexes:** For common query patterns (e.g., `user_id + status`)
4. **Partial Indexes:** For filtered queries (e.g., active subscriptions only)
5. **GIN Indexes:** For JSONB columns and full-text search
6. **Trigram Indexes:** For fuzzy search on service names

### Query Optimization Examples

**Fast Dashboard Loading:**
```sql
-- Uses: user_analytics_cache(user_id)
SELECT * FROM user_analytics_cache WHERE user_id = $1;
```

**Active Subscriptions List:**
```sql
-- Uses: idx_subscriptions_user_active
SELECT * FROM subscriptions
WHERE user_id = $1 AND status = 'active' AND deleted_at IS NULL;
```

**Upcoming Renewals (Next 7 Days):**
```sql
-- Uses: idx_subscriptions_next_billing
SELECT * FROM subscriptions
WHERE deleted_at IS NULL
  AND status = 'active'
  AND next_billing_date BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

**Service Search (Fuzzy):**
```sql
-- Uses: idx_services_name_trgm
SELECT * FROM services
WHERE name % 'netflx'  -- Matches "Netflix"
ORDER BY similarity(name, 'netflx') DESC;
```

---

## Row-Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data.

### Key RLS Policies

#### `profiles`
- Users can view/update/insert their own profile only

#### `subscriptions`
- Users can CRUD their own subscriptions only
- Enforced via `auth.uid() = user_id`

#### `payment_methods`
- Users can CRUD their own payment methods only

#### `payment_history`
- Users can view payment history for their own subscriptions

#### `notifications`
- Users can view/update their own notifications

#### `services` (Public)
- All authenticated users can view services
- Only admins can modify (via service role)

#### `cancellation_guides` (Public)
- All authenticated users can view guides

### Example RLS Policy

```sql
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### Bypassing RLS (Admin Operations)

Use the service role key for admin operations:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS
)
```

---

## Helper Functions

### `calculate_monthly_cost(cost, cycle)`

Normalizes subscription costs to monthly amounts for analytics.

```sql
SELECT calculate_monthly_cost(999, 'yearly') -- Returns 83.25
```

### `refresh_user_analytics(user_id)`

Recalculates and updates the analytics cache for a user.

```sql
SELECT refresh_user_analytics('user-uuid-here');
```

**Auto-triggered when:**
- Subscriptions are inserted/updated/deleted
- Subscription status changes

### `update_updated_at_column()`

Trigger function that automatically updates `updated_at` timestamp.

Applied to all tables with `updated_at` columns.

### `auto_set_cancellation_timestamp()`

Automatically sets `cancelled_at` when subscription status changes to 'cancelled'.

### `protect_audit_columns()`

Prevents manual modification of `created_at` timestamp.

---

## Scalability Considerations

### 1. Caching Strategy

- **User Analytics Cache:** Pre-calculated dashboard metrics
- **Materialized View:** Popular services (refresh daily)
- **Application Cache:** Redis for session data (future)

### 2. Partitioning (Future)

When `payment_history` exceeds 10M rows, partition by month:

```sql
CREATE TABLE payment_history_2025_01 PARTITION OF payment_history
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### 3. Archiving

Archive cancelled subscriptions older than 2 years:

```sql
-- Run monthly via cron job
INSERT INTO subscriptions_archive
SELECT * FROM subscriptions
WHERE status = 'cancelled'
  AND cancelled_at < NOW() - INTERVAL '2 years';

DELETE FROM subscriptions
WHERE status = 'cancelled'
  AND cancelled_at < NOW() - INTERVAL '2 years';
```

### 4. Read Replicas

- Use Supabase read replicas for analytics queries
- Route writes to primary, reads to replica

### 5. Connection Pooling

- Supabase uses PgBouncer for connection pooling
- Max connections handled automatically

---

## Migration Instructions

### Step 1: Create Migration File

The complete SQL migration is in: `supabase/migrations/001_initial_schema.sql`

### Step 2: Execute in Supabase

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `001_initial_schema.sql`
3. Click "Run"

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### Step 3: Verify Schema

```sql
-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public';
```

### Step 4: Seed Reference Data

Run the seed SQL to populate the `services` table with 50+ Indian services.

```bash
# Execute seed file
psql -f supabase/seeds/001_indian_services.sql
```

### Step 5: Generate TypeScript Types

```bash
# Generate types from database schema
supabase gen types typescript --local > types/database.ts
```

---

## Backup and Recovery

### Automated Backups

Supabase provides automatic daily backups for Pro plan and above.

### Manual Backup

```bash
# Backup entire database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Point-in-Time Recovery (PITR)

Available on Supabase Pro plan and above.

---

## Security Best Practices

1. ✅ **RLS enabled on all tables**
2. ✅ **Foreign key constraints** prevent orphaned records
3. ✅ **Check constraints** validate data integrity
4. ✅ **Enum types** prevent invalid status values
5. ✅ **Soft deletes** preserve historical data
6. ✅ **Audit timestamps** on all tables
7. ✅ **Service role key** kept server-side only
8. ✅ **Anon key** safe for client-side (RLS enforced)

---

## Performance Monitoring

### Query Performance

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Usage

```sql
-- Check if indexes are being used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## Bundle Optimizer Tables (Migration 006)

### 10. `telecom_bundles`

Stores Indian telecom bundles (Jio, Airtel, Vi) that include OTT services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Bundle ID |
| provider | TEXT | NOT NULL, CHECK IN ('Jio', 'Airtel', 'Vi', 'BSNL') | Telecom provider |
| plan_name | TEXT | NOT NULL | Bundle plan name |
| plan_type | TEXT | NOT NULL, CHECK IN ('fiber', 'prepaid', 'postpaid', 'mobile') | Plan type |
| monthly_price | NUMERIC | NOT NULL, CHECK > 0 | Monthly cost |
| billing_cycle | TEXT | NOT NULL | Billing cycle ('monthly', '28 days', '84 days', 'yearly') |
| total_price | NUMERIC | NOT NULL, CHECK > 0 | Total price for billing cycle |
| included_ott_services | TEXT[] | NOT NULL, DEFAULT '{}' | Array of OTT service names |
| ott_service_count | INTEGER | GENERATED ALWAYS AS (array_length(included_ott_services, 1)) STORED | Count of OTT services |
| ott_plan_details | JSONB | NOT NULL, DEFAULT '{}' | Detailed OTT plan info |
| data_benefits | TEXT | | Data benefits (e.g., "Unlimited @100Mbps") |
| validity | TEXT | | Validity period (e.g., "30 days") |
| other_benefits | TEXT[] | DEFAULT '{}' | Additional benefits array |
| target_audience | TEXT | | Target audience description |
| official_url | TEXT | | Provider plan URL |
| is_currently_active | BOOLEAN | DEFAULT true | Whether bundle is active |
| last_verified | DATE | DEFAULT CURRENT_DATE | Last verification date |
| notes | TEXT | | Additional notes |
| value_score | NUMERIC | GENERATED ALWAYS AS (CASE WHEN monthly_price > 0 THEN CAST(array_length(included_ott_services, 1) AS NUMERIC) / (monthly_price / 1000.0) ELSE 0 END) STORED | Value score (OTTs per ₹1000) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**OTT Plan Details JSONB Structure:**
```json
{
  "Netflix": "Premium (4K, 4 screens)",
  "Disney+ Hotstar": "Premium",
  "Amazon Prime Video": "Yes",
  "Zee5": "Premium"
}
```

**Relationships:**
- 1:N with `bundle_recommendations` (id → bundle_recommendations.bundle_id)

**Indexes:**
- Primary key on `id`
- Index on `provider`
- Index on `monthly_price`
- Index on `plan_type`
- Partial index on `is_currently_active` where is_currently_active = true
- Index on `value_score DESC`
- Index on `ott_service_count DESC`
- GIN index on `included_ott_services` (for array searches)

**Constraints:**
- Unique constraint on `(provider, plan_name)`

**Sample Data:**
20 bundles pre-populated:
- 6 Jio plans (JioFiber 30Mbps to 300Mbps)
- 9 Airtel plans (Prepaid + Fiber)
- 2 Vi plans (REDX Postpaid)
- 3 Vi plans (Fiber/Mobile)

---

### 11. `bundle_recommendations`

Stores AI-generated bundle recommendations for users based on their subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Recommendation ID |
| user_id | UUID | NOT NULL, FK to auth.users(id) | User ID |
| bundle_id | UUID | NOT NULL, FK to telecom_bundles(id) | Recommended bundle |
| matched_subscription_ids | UUID[] | NOT NULL, DEFAULT '{}' | UUIDs of matched subscriptions |
| matched_subscription_count | INTEGER | GENERATED ALWAYS AS (array_length(matched_subscription_ids, 1)) STORED | Count of matched subscriptions |
| current_monthly_cost | NUMERIC | NOT NULL, CHECK >= 0 | Current cost of matched subscriptions |
| bundle_monthly_cost | NUMERIC | NOT NULL, CHECK >= 0 | Bundle monthly cost |
| monthly_savings | NUMERIC | GENERATED ALWAYS AS (current_monthly_cost - bundle_monthly_cost) STORED | Monthly savings |
| annual_savings | NUMERIC | GENERATED ALWAYS AS ((current_monthly_cost - bundle_monthly_cost) * 12) STORED | Annual savings |
| match_percentage | NUMERIC | CHECK >= 0 AND <= 100 | Percentage of user's subscriptions matched |
| recommendation_type | TEXT | NOT NULL, DEFAULT 'bundle', CHECK IN ('bundle', 'upgrade', 'switch') | Recommendation type |
| confidence_score | NUMERIC | DEFAULT 0.75, CHECK >= 0 AND <= 1 | AI confidence score (0-1) |
| reasoning | TEXT | | Human-readable reasoning |
| status | TEXT | DEFAULT 'pending', CHECK IN ('pending', 'viewed', 'accepted', 'dismissed', 'expired') | Recommendation status |
| viewed_at | TIMESTAMPTZ | | When user viewed recommendation |
| status_updated_at | TIMESTAMPTZ | | When status last changed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Relationships:**
- N:1 with `auth.users` (user_id → auth.users.id)
- N:1 with `telecom_bundles` (bundle_id → telecom_bundles.id)

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `bundle_id`
- Index on `status`
- Index on `annual_savings DESC`
- Composite index on `(user_id, status)`

**Constraints:**
- Unique constraint on `(user_id, bundle_id)` - One recommendation per bundle per user

**RLS Policies:**
- Users can view/insert/update/delete own recommendations only
- Enforced via `auth.uid() = user_id`

---

---

## Manual Usage Tracking (Migration 007)

### 12. `service_usage` - Extended for Manual Tracking

The `service_usage` table (from migration 005) has been extended to support **manual usage tracking** for services without OAuth APIs.

**New Columns Added:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| usage_frequency | TEXT | CHECK IN ('daily', 'weekly', 'monthly', 'rarely', 'never') | User-reported usage frequency |
| last_used_date | DATE | | User-reported last use date |
| is_manual | BOOLEAN | DEFAULT FALSE, NOT NULL | TRUE if manually reported, FALSE if from OAuth API |
| manual_usage_note | TEXT | | Optional user notes about usage |

**Estimated Hours Conversion:**
- `daily` → 60 hours/month (~2 hours/day)
- `weekly` → 20 hours/month (~5 hours/week)
- `monthly` → 5 hours/month
- `rarely` → 2 hours/month
- `never` → 0 hours/month

**New Indexes:**
- `idx_service_usage_is_manual` on `is_manual`
- `idx_service_usage_last_used` on `last_used_date` where `is_manual = TRUE`

**New RLS Policies:**
- Users can insert their own manual usage (`is_manual = TRUE`)
- Users can update their own manual usage
- Enforced via `auth.uid() = user_id`

**Trigger:**
- `update_service_usage_updated_at()` - Auto-updates `updated_at` timestamp on changes

**Use Cases:**
1. **Netflix, Hotstar, Prime Video** - No public APIs, users self-report usage
2. **YouTube Premium** - API doesn't distinguish Premium users
3. **Any custom subscription** - User reports how often they use it

**Benefits:**
- Works for **all services**, not just OAuth-enabled ones
- Simple UX: 5-option frequency scale
- AI recommendations use same logic for OAuth + manual data
- Context-aware: only asks about user's active subscriptions

---

## Currency Conversion (Migration 008)

### 13. `subscriptions` - Extended for Currency Conversion

The `subscriptions` table has been extended to support **automatic currency conversion to INR** while preserving original currency information for transparency.

**New Columns Added:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| original_cost | NUMERIC(10, 2) | | User-entered amount in their selected currency |
| original_currency | TEXT | | User-selected currency code (USD, EUR, GBP, etc.) |

**Changes to Existing Columns:**

- `cost` - Now always stores INR-converted amount for consistent calculations
- `currency` - Now always stores 'INR' for all subscriptions

**Supported Currencies:**
- INR (Indian Rupee) - 1:1 conversion
- USD (US Dollar) - ₹83.12 per $1
- EUR (Euro) - ₹90.45 per €1
- GBP (British Pound) - ₹105.30 per £1
- AUD (Australian Dollar) - ₹54.20 per A$1
- CAD (Canadian Dollar) - ₹61.35 per C$1
- SGD (Singapore Dollar) - ₹61.80 per S$1
- AED (UAE Dirham) - ₹22.63 per د.إ1

**Conversion Logic:**
```typescript
// User enters: USD $200
// System stores:
{
  cost: 16624.00,           // Converted to INR (200 × 83.12)
  currency: 'INR',          // Always INR
  original_cost: 200.00,    // Original amount
  original_currency: 'USD'  // Original currency
}

// Display: "₹16,624.00/month (was USD 200.00)"
```

**Benefits:**
1. **Consistent Calculations** - All analytics use INR
2. **Transparency** - Users see what they entered
3. **International Support** - Users can enter costs in local currency
4. **Accurate Reporting** - No currency mixing in calculations
5. **Historical Context** - Original values preserved for reference

**Migration Notes:**
- Existing subscriptions: `original_cost` and `original_currency` copied from current values
- New subscriptions: Automatic conversion applied on creation/update
- Exchange rates: Hardcoded initially, can be replaced with API later

---

---

## Gmail OAuth Integration (Migration 009)

### 14. `gmail_tokens`

Stores encrypted Gmail OAuth tokens for subscription auto-detection.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Token record ID |
| user_id | UUID | UNIQUE, NOT NULL, FK to auth.users(id) | User ID |
| access_token | TEXT | NOT NULL | Encrypted Gmail access token |
| refresh_token | TEXT | NOT NULL | Encrypted Gmail refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | Token expiration timestamp |
| scope | TEXT | NOT NULL | OAuth scopes granted |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Security:**
- Tokens encrypted using AES-256-GCM (via `lib/crypto/encryption.ts`)
- Graceful fallback if `ENCRYPTION_KEY` not configured
- Separate from Google OAuth (in case user uses email/password auth)

**Relationships:**
- 1:1 with `auth.users` (user_id → auth.users.id)

**Indexes:**
- Primary key on `id`
- Unique index on `user_id`
- Index on `expires_at`

**RLS Policies:**
- Users can insert/select/update/delete own tokens only
- Enforced via `auth.uid() = user_id`

**Use Cases:**
1. **Gmail Subscription Scanning** - Auto-detect subscriptions from emails
2. **OAuth Token Refresh** - Automatic token renewal before expiry
3. **Multi-Auth Support** - Works with email/password or Google OAuth

---

## Gmail Scan Tracking (Migration 010)

### Extended: `user_preferences` - Gmail Scan Completion

The `user_preferences` table has been extended to track Gmail scan completion for onboarding checklist.

**New Column Added:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| gmail_scan_completed | BOOLEAN | DEFAULT FALSE, NOT NULL | Whether user has completed at least one Gmail scan |

**Use Cases:**
1. **Onboarding Checklist** - Track if user has scanned Gmail for subscriptions
2. **Progress Tracking** - Show completion status on dashboard
3. **User Engagement** - Encourage users to complete initial setup

**Updated By:**
- `bulkImportSubscriptions()` in `lib/gmail/import-actions.ts` sets to `true` when subscriptions imported
- Dashboard reads value to display checklist completion

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 3, 2025 | Initial schema design |
| 1.1 | Oct 11, 2025 | Added Bundle Optimizer tables (migration 006) |
| 1.2 | Oct 11, 2025 | Extended service_usage for manual tracking (migration 007) |
| 1.3 | Oct 17, 2025 | Extended subscriptions for currency conversion (migration 008) |
| 1.4 | Oct 25, 2025 | Added Gmail OAuth tables (migration 009) |
| 1.5 | Oct 25, 2025 | Added Gmail scan tracking (migration 010) |

---

**Next Steps:**
1. ✅ Execute migrations 009 and 010 SQL in Supabase
2. ✅ Reload PostgREST schema: `NOTIFY pgrst, 'reload schema';`
3. Test Gmail OAuth flow end-to-end
4. Test onboarding checklist completion tracking
