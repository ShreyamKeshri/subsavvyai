# Unsubscribr - Database Schema Documentation

**Version:** 1.0
**Database:** PostgreSQL (Supabase)
**Last Updated:** October 3, 2025

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

This document describes the complete database schema for Unsubscribr, a subscription management platform for the Indian market. The schema is designed for:

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
| cost | NUMERIC(10, 2) | NOT NULL, CHECK >= 0 | Subscription cost |
| currency | TEXT | DEFAULT 'INR', NOT NULL | Currency code |
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

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 3, 2025 | Initial schema design |

---

**Next Steps:**
1. Execute migration SQL in Supabase
2. Seed Indian services data
3. Generate TypeScript types
4. Build API routes and UI components
