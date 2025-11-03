-- Fix products table - remove quantity column
-- The quantity column shouldn't be in products table as it belongs to cart_items and checkout_items
-- Run this in Supabase SQL Editor

-- Remove quantity column from products table if it exists
ALTER TABLE products DROP COLUMN IF EXISTS quantity;

-- Verify the fix by checking the products table structure
-- The products table should only have: id, qr_code, name, brand, image_url, created_at
