-- ====================================
-- RUN THESE 3 SQL QUERIES IN SUPABASE
-- ====================================
-- Go to: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new
-- Copy and paste each query one at a time and click "Run"

-- QUERY 1: Remove quantity column from products table
-- This fixes the "failed to save product" error
ALTER TABLE products DROP COLUMN IF EXISTS quantity;

-- QUERY 2: Remove price column from products table (if it exists)
-- Prices should be tracked in scans and cart_items tables, not in products
ALTER TABLE products DROP COLUMN IF EXISTS price;

-- QUERY 3: Verify the products table structure
-- This will show you the final structure of the products table
-- It should only have: id, qr_code, name, brand, image_url, created_at
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'products'
ORDER BY 
    ordinal_position;

-- ====================================
-- EXPECTED RESULT AFTER RUNNING ALL 3:
-- ====================================
-- Your products table should have these columns:
-- 1. id (uuid)
-- 2. qr_code (text)
-- 3. name (text)
-- 4. brand (text, nullable)
-- 5. image_url (text, nullable)
-- 6. created_at (timestamp)
--
-- The quantity and price columns should be REMOVED
-- ====================================
