# Fix "Failed to Save Product" Error

## Problem
You're getting an error: **"null value in column \"quantity\" of relation \"products\" violates not-null constraint"**

This happens because your `products` table has a `quantity` column with a NOT NULL constraint, but this column shouldn't exist in the products table. The `quantity` column belongs in `cart_items` and `checkout_items` tables only.

## Solution
You need to remove the `quantity` column from the `products` table.

## Steps to Fix

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL Command
Copy and paste this SQL into the editor:

```sql
-- Remove the quantity column from products table
ALTER TABLE products DROP COLUMN IF EXISTS quantity;
```

### Step 3: Execute the Query
1. Click the "Run" button (or press Cmd+Enter / Ctrl+Enter)
2. You should see a success message

### Step 4: Test Your App
1. Go back to your app
2. Try scanning and saving a product again
3. The error should now be resolved!

## What This Does
- Removes the incorrect `quantity` column from the `products` table
- Products will still save with their name, brand, QR code, and image
- Quantities are properly tracked in the `cart_items` table instead

## Expected Products Table Structure
After the fix, your `products` table should have these columns:
- `id` (UUID)
- `qr_code` (text)
- `name` (text)
- `brand` (text, nullable)
- `image_url` (text, nullable)
- `created_at` (timestamp)

## Still Having Issues?
If you still see errors after running this SQL:
1. Check the error message in your app
2. Verify the SQL ran successfully in Supabase (no error messages)
3. Try restarting your app completely
