# Apply Database Schema Fix

## Issue
The app is showing errors because the database schema is missing the `cart_items` table and several columns in the `grocery_sessions` table.

## Solution
Apply the migration manually through Supabase dashboard.

## Steps

### 1. Go to Supabase SQL Editor
1. Open your browser
2. Navigate to: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new
3. You'll see the SQL Editor

### 2. Copy and Run the Migration
1. Open the file: `supabase/migrations/20251101000000_fix_schema_issues.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click "Run" button

### 3. Verify the Fix
After running the migration, refresh your app on the iOS simulator. The errors should be gone.

## What the Migration Does
- Adds `cart_items` table for shopping cart functionality
- Adds `is_active` column to `grocery_sessions`
- Adds `name` column to `grocery_sessions`
- Adds `ended_at` column to `grocery_sessions`
- Updates status constraints to match app expectations
- Creates necessary indexes and RLS policies

## Note About Guest Sessions
Guest sessions are stored locally in AsyncStorage and won't appear in the database. This is by design - only authenticated users' data is stored in Supabase.
