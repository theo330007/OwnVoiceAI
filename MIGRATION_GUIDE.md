# Database Migration Guide - User Collaboration Features

## What's Being Added

This migration adds collaborative strategy features to the admin user view:

1. **`user_id` column to `trends` table** - Enables user-specific niche trends
2. **`collaboration_notes` table** - Admin notes for user strategy
3. **`content_strategy` table** - Planned content tracking
4. **Helper functions** - `get_user_niche_trends()` and `get_strategic_insights()`

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy the entire content of `supabase/migrations/003_user_collaboration.sql`
6. Paste it into the SQL editor
7. Click **Run** button

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd C:\Users\Theo.le.Corre\Desktop\Repository\OwnVoiceAI

# Run the migration
supabase db push
```

## Verification

After running the migration, verify it worked:

1. Go to **Database** → **Tables** in Supabase Dashboard
2. Check that `collaboration_notes` and `content_strategy` tables exist
3. Check that `trends` table has a new `user_id` column
4. Go to **Database** → **Functions** and verify `get_user_niche_trends` and `get_strategic_insights` functions exist

## What Happens After Migration

Once the migration is complete:

1. **Admin User Detail Page** will show:
   - User's niche trends (user-specific)
   - Strategic insights (macro + niche alignment)
   - Collaboration notes
   - Enhanced validation details

2. **Admin Can**:
   - Add niche trends for specific users
   - Leave strategic notes for collaboration
   - See how user's niche interests align with macro trends
   - View detailed validation history

3. **No Data Loss**:
   - All existing trends remain unchanged
   - All existing validations remain unchanged
   - New columns are nullable/optional

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove new tables
DROP TABLE IF EXISTS content_strategy;
DROP TABLE IF EXISTS collaboration_notes;

-- Remove new column
ALTER TABLE trends DROP COLUMN IF EXISTS user_id;

-- Remove functions
DROP FUNCTION IF EXISTS get_user_niche_trends(UUID, int);
DROP FUNCTION IF EXISTS get_strategic_insights(UUID);
```

## Next Steps

After the migration is complete:

1. Refresh your browser
2. Navigate to Admin → Users
3. Click on any user
4. You should see the new collaborative workspace layout!

---

**Need Help?**

If you encounter any errors, check:
- Supabase connection is active
- You have admin permissions on your Supabase project
- The SQL syntax is compatible with PostgreSQL 13+
