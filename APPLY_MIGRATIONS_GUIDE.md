# Apply Database Migrations to Supabase

## Critical Migrations Needed

You have **two migrations** that need to be applied to your Supabase database:

1. `20251029000000_add_store_to_checkout_sessions.sql` - Adds `grocery_session_id` column
2. `20251030000000_add_account_deletion.sql` - Adds account deletion functionality

## Step-by-Step Instructions

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `bebrakqpymztgjpiisrn`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Apply First Migration (Store Info)**
   - Copy the contents of `supabase/migrations/20251029000000_add_store_to_checkout_sessions.sql`
   - Paste into the SQL editor
   - Click "Run" button
   - Wait for success message

4. **Apply Second Migration (Account Deletion)**
   - Click "+ New query" again
   - Copy the contents of `supabase/migrations/20251030000000_add_account_deletion.sql`
   - Paste into the SQL editor
   - Click "Run" button
   - Wait for success message

5. **Verify Migrations**
   - Go to "Table Editor" in the left sidebar
   - Click on `checkout_sessions` table
   - Verify these columns exist:
     - `grocery_session_id`
     - `store_name`
     - `store_location`
   - Click on `profiles` table
   - Verify the `delete_account` function exists

### Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref bebrakqpymztgjpiisrn

# Push migrations
supabase db push
```

## Migration Contents

### Migration 1: Add Store to Checkout Sessions

```sql
-- Add store fields to checkout_sessions
ALTER TABLE checkout_sessions
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_location text,
  ADD COLUMN IF NOT EXISTS grocery_session_id uuid REFERENCES grocery_sessions(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_store_name ON checkout_sessions(store_name);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_grocery_session_id ON checkout_sessions(grocery_session_id);
```

### Migration 2: Account Deletion

```sql
-- Create function to delete user account and all related data
CREATE OR REPLACE FUNCTION delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's data (CASCADE will handle related records)
  DELETE FROM grocery_sessions WHERE user_id = user_uuid;
  DELETE FROM checkout_sessions WHERE user_id = user_uuid;
  DELETE FROM products WHERE user_id = user_uuid;
  DELETE FROM profiles WHERE id = user_uuid;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_account() TO authenticated;
```

## Verification

After applying migrations, test in your app:

1. **Test Checkout** - Should work without errors
2. **Test Account Deletion** - Go to Settings → Delete Account

## Troubleshooting

### "relation already exists" error
- This means the migration was partially applied
- Check which columns/functions exist
- Apply only the missing parts

### "column already exists" error
- Migration was already applied
- Skip to next migration

### Permission errors
- Make sure you're logged in as the project owner
- Check that RLS policies are correctly set

## When to Apply

**Apply these migrations NOW before:**
- Testing the app in Expo Go
- Submitting to App Store
- Allowing users to test

## Rollback (if needed)

If you need to rollback:

```sql
-- Rollback migration 1
ALTER TABLE checkout_sessions
  DROP COLUMN IF EXISTS grocery_session_id,
  DROP COLUMN IF EXISTS store_name,
  DROP COLUMN IF EXISTS store_location;

-- Rollback migration 2
DROP FUNCTION IF EXISTS delete_account();
```

---

**After applying migrations:**
1. Reload your app in Expo Go
2. Test checkout functionality
3. Test account deletion
4. Proceed with App Store submission
