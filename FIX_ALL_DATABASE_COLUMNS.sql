-- Complete Database Fix for Grocery Sessions
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new

-- Add all missing columns to grocery_sessions table
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS grocery_type text DEFAULT 'regular';
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS store_location text;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS spending_limit numeric;

-- Update status constraint to match app expectations
ALTER TABLE grocery_sessions DROP CONSTRAINT IF EXISTS grocery_sessions_status_check;
ALTER TABLE grocery_sessions ADD CONSTRAINT grocery_sessions_status_check CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled'));

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES grocery_sessions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0) DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cart_items (drop if exists first)
DROP POLICY IF EXISTS "Users can read own cart items" ON cart_items;
CREATE POLICY "Users can read own cart items" ON cart_items FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own cart items" ON cart_items;
CREATE POLICY "Users can create own cart items" ON cart_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_is_active ON grocery_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_user_id ON grocery_sessions(user_id);
