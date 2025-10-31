# How to Find Your Supabase Project

## The Issue

You mentioned you can't find the Supabase project, but your app is actually working and connected to Supabase! The checkout error you're experiencing confirms that the database exists - it just needs a migration applied.

## Step 1: Find Your Supabase URL

### Option A: Check Your Running App
Since your app is working, your `.env` file has the correct Supabase URL. Run:

```bash
cat .env | grep SUPABASE_URL
```

This will show you the URL like: `https://xxxxxxxxxxxxx.supabase.co`

### Option B: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in with the account that created the project
3. You should see your project listed
4. The project reference is part of the URL

## Step 2: Access Your Project

Once you have the URL (e.g., `https://bebrakqpymztgjpiisrn.supabase.co`):

1. **Extract the project reference:** The part before `.supabase.co` (e.g., `bebrakqpymztgjpiisrn`)
2. **Go to dashboard:** https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]
3. **Or find in project list:** https://supabase.com/dashboard

## Step 3: Apply the Migration

Once you're in your Supabase project:

### 3.1 Open SQL Editor
- Click "SQL Editor" in the left sidebar
- Click "+ New query"

### 3.2 Run This SQL

```sql
-- Add missing columns to checkout_sessions table
ALTER TABLE checkout_sessions
  ADD COLUMN IF NOT EXISTS grocery_session_id uuid REFERENCES grocery_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_location text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_grocery_session_id 
  ON checkout_sessions(grocery_session_id);
  
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_store_name 
  ON checkout_sessions(store_name);
```

### 3.3 Click "Run"

Wait for "Success. No rows returned" message.

## Step 4: Verify

After running the migration:

1. Go to "Table Editor" in the left sidebar
2. Click on `checkout_sessions` table
3. Verify these columns now exist:
   - `grocery_session_id`
   - `store_name`
   - `store_location`

## Step 5: Test in Your App

1. Reload your app in Expo Go
2. Try completing a checkout
3. The error should be gone!

## Troubleshooting

### "Can't find my account/project"
- Check if you used a different email to create the Supabase project
- Try logging in with GitHub, Google, or other OAuth providers you might have used
- Check your email for Supabase welcome messages

### "Wrong project reference"
The project reference I mentioned (`bebrakqpymztgjpiisrn`) was extracted from documentation. Your actual project URL is in your `.env` file. Use that one instead.

### "Migration fails"
If you get an error like "column already exists", it means the migration was already applied. You can skip it.

### "Still getting checkout error"
Make sure you:
1. Applied the migration successfully
2. Reloaded your app (close and reopen Expo Go)
3. Are using the correct Supabase project

## Quick Test Script

Want to quickly check your Supabase connection? Run:

```bash
node -e "require('dotenv').config(); console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)"
```

This will show your Supabase URL from the `.env` file.

---

**Need Help?**

If you still can't find your project, you might need to:
1. Create a new Supabase project
2. Update your `.env` file with the new credentials
3. Run all migrations from the `supabase/migrations/` folder
