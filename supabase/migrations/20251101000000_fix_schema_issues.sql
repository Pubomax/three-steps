-- Migration: Fix Schema Issues
-- Date: 2025-11-01
-- Description: Add missing cart_items table and is_active column, fix session status field

-- Add is_active column to grocery_sessions if it doesn't exist
ALTER TABLE grocery_sessions 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;

-- Update status check constraint to match what the app expects
ALTER TABLE grocery_sessions 
  DROP CONSTRAINT IF EXISTS grocery_sessions_status_check;

ALTER TABLE grocery_sessions 
  ADD CONSTRAINT grocery_sessions_status_check 
  CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled'));

-- Add name column to grocery_sessions if it doesn't exist
ALTER TABLE grocery_sessions 
  ADD COLUMN IF NOT EXISTS name text;

-- Add ended_at column to grocery_sessions if it doesn't exist  
ALTER TABLE grocery_sessions 
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- Create cart_items table
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

-- Cart items policies
CREATE POLICY "Users can read own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Create index for is_active
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_is_active ON grocery_sessions(is_active);

COMMENT ON TABLE cart_items IS 'Items in users shopping carts during active grocery sessions';
COMMENT ON COLUMN cart_items.session_id IS 'Reference to the grocery session this item belongs to';
COMMENT ON COLUMN cart_items.product_id IS 'Reference to the product being added to cart';
COMMENT ON COLUMN cart_items.user_id IS 'User who owns this cart item';
