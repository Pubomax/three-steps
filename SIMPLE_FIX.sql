-- Run each block separately in Supabase SQL Editor
-- Copy and run one block at a time

-- Block 1: Add columns to grocery_sessions
ALTER TABLE grocery_sessions 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS ended_at timestamptz,
ADD COLUMN IF NOT EXISTS grocery_type text DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS store_location text,
ADD COLUMN IF NOT EXISTS spending_limit numeric;
