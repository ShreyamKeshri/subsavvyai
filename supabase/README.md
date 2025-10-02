# Supabase Database Migration Guide

This directory contains SQL migration files and seed data for the Unsubscribr database.

## Directory Structure

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Complete database schema
├── seeds/
│   └── 001_indian_services.sql   # 50+ Indian subscription services
└── README.md                      # This file
```

## Migration Files

### `001_initial_schema.sql`

Complete PostgreSQL schema including:
- 9 database tables
- 9 custom enum types
- Row-Level Security (RLS) policies for all tables
- Indexes for performance optimization
- Triggers for auto-updating timestamps
- Helper functions for analytics
- Materialized view for popular services

**Tables created:**
1. `profiles` - User profile data
2. `services` - Reference data for subscription services
3. `payment_methods` - User payment methods
4. `subscriptions` - Core subscription records
5. `payment_history` - Payment transaction log
6. `notifications` - User notifications
7. `notification_preferences` - Notification settings
8. `cancellation_guides` - Service cancellation instructions
9. `user_analytics_cache` - Pre-calculated analytics

### `001_indian_services.sql`

Seeds the `services` table with 50+ popular Indian subscription services across 8 categories:
- OTT (12 services)
- Music (7 services)
- Food Delivery (3 services)
- SaaS (9 services)
- Fitness (4 services)
- News (5 services)
- Gaming (3 services)
- Education (6 services)

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration
6. Wait for confirmation (should take ~10-15 seconds)
7. Repeat steps 3-6 for `seeds/001_indian_services.sql`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Or run specific migration
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
psql $DATABASE_URL -f supabase/seeds/001_indian_services.sql
```

### Option 3: Using Direct PostgreSQL Connection

```bash
# Get connection string from Supabase Dashboard > Settings > Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Run migration
psql "postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres" \
  -f supabase/migrations/001_initial_schema.sql

# Run seed
psql "postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres" \
  -f supabase/seeds/001_indian_services.sql
```

## Post-Migration Verification

After running the migration, verify the schema was created correctly:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected output:
-- cancellation_guides
-- notifications
-- notification_preferences
-- payment_history
-- payment_methods
-- profiles
-- services
-- subscriptions
-- user_analytics_cache

-- Check RLS policies are enabled
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check custom types
SELECT typname
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e'
ORDER BY typname;

-- Expected enums:
-- billing_cycle
-- difficulty_level
-- notification_delivery_status
-- notification_type
-- payment_method_type
-- payment_provider
-- payment_status
-- subscription_category
-- subscription_status

-- Verify services were seeded
SELECT COUNT(*) as total_services FROM public.services;
-- Expected: 49 services

-- Check services by category
SELECT category, COUNT(*) as count
FROM public.services
GROUP BY category
ORDER BY category;
```

## Rollback Instructions

If you need to rollback the migration:

```sql
-- WARNING: This will delete all data!

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS public.mv_popular_services CASCADE;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.user_analytics_cache CASCADE;
DROP TABLE IF EXISTS public.cancellation_guides CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS trigger_refresh_user_analytics() CASCADE;
DROP FUNCTION IF EXISTS refresh_user_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_monthly_cost(NUMERIC, billing_cycle) CASCADE;
DROP FUNCTION IF EXISTS protect_audit_columns() CASCADE;
DROP FUNCTION IF EXISTS auto_set_cancellation_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS notification_delivery_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS payment_provider CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS billing_cycle CASCADE;
DROP TYPE IF EXISTS subscription_category CASCADE;
```

## Next Steps After Migration

1. **Generate TypeScript Types**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Generate types
   supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts
   ```

2. **Verify RLS Policies**
   - Test that users can only access their own data
   - Verify public read access for `services` and `cancellation_guides`

3. **Set up Database Backups**
   - Supabase Pro: Automatic daily backups enabled
   - Free tier: Manual backups recommended

4. **Configure Webhooks (Optional)**
   - Set up webhooks for real-time subscription updates
   - Useful for syncing with external payment providers

## Troubleshooting

### Error: "relation already exists"

The migration has already been run. Either:
- Skip this migration
- Rollback and re-run
- Use `IF NOT EXISTS` clauses (already included in the SQL)

### Error: "permission denied"

Make sure you're using the correct credentials:
- For dashboard: Must be project owner
- For CLI/psql: Use the service role key or database password

### Error: "extension does not exist"

Some extensions may need to be enabled manually:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## Migration Checklist

- [ ] Review `DATABASE_SCHEMA.md` for understanding
- [ ] Run `001_initial_schema.sql` in Supabase SQL Editor
- [ ] Verify all 9 tables created
- [ ] Verify all RLS policies enabled
- [ ] Run `001_indian_services.sql` to seed services
- [ ] Verify 49 services inserted
- [ ] Generate TypeScript types
- [ ] Update `types/database.ts` in codebase
- [ ] Test database access from Next.js app
- [ ] Commit migration files to git

## Support

For issues with the migration, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project `DATABASE_SCHEMA.md` for schema details
