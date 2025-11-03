-- Fix products table - remove user_id constraint or make it nullable
-- Run this in Supabase SQL Editor

-- Make user_id nullable in products table
ALTER TABLE products ALTER COLUMN user_id DROP NOT NULL;
