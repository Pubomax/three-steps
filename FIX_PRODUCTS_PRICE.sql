-- Fix products table - remove price column or make it nullable
-- Run this in Supabase SQL Editor

-- Make price nullable in products table (if it exists)
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;

-- Or better yet, drop the price column entirely since prices are tracked in scans table
-- ALTER TABLE products DROP COLUMN IF EXISTS price;
