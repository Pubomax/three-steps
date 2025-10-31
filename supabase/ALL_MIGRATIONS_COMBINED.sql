-- ============================================================================
-- ALL MIGRATIONS COMBINED - Run this in one go for new Supabase project
-- ============================================================================
-- This file combines all migrations in the correct order
-- Run this in your Supabase SQL Editor after creating a new project
-- ============================================================================

-- Migration 1: Create Base Schema (20251025162643)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  category text,
  image_url text,
  barcode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Users can read own products"
  ON products FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);


-- Migration 2: Add Checkout Sessions (20251025165012)
-- ============================================================================

-- Create checkout_sessions table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  item_count integer NOT NULL CHECK (item_count > 0),
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create checkout_items table
CREATE TABLE IF NOT EXISTS checkout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_items ENABLE ROW LEVEL SECURITY;

-- Checkout sessions policies
CREATE POLICY "Users can read own checkout sessions"
  ON checkout_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own checkout sessions"
  ON checkout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Checkout items policies
CREATE POLICY "Users can read own checkout items"
  ON checkout_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checkout_sessions
      WHERE checkout_sessions.id = checkout_items.session_id
      AND checkout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checkout items"
  ON checkout_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checkout_sessions
      WHERE checkout_sessions.id = checkout_items.session_id
      AND checkout_sessions.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_completed_at ON checkout_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_items_session_id ON checkout_items(session_id);


-- Migration 3: Add Brand to Products (20251025170329)
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;


-- Migration 4: Add Grocery Sessions (20251025171319)
-- ============================================================================

CREATE TABLE IF NOT EXISTS grocery_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE grocery_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own grocery sessions"
  ON grocery_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own grocery sessions"
  ON grocery_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own grocery sessions"
  ON grocery_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add grocery_session_id to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS grocery_session_id uuid REFERENCES grocery_sessions(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_user_id ON grocery_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_status ON grocery_sessions(status);
CREATE INDEX IF NOT EXISTS idx_products_grocery_session_id ON products(grocery_session_id);


-- Migration 5: Add Start/End Times to Sessions (20251025181019)
-- ============================================================================

ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS started_at timestamptz DEFAULT now();
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS completed_at timestamptz;


-- Migration 6: Add Grocery Session Details (20251025181715)
-- ============================================================================

ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS total_items integer DEFAULT 0;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;


-- Migration 7: Add Store Location to Grocery Sessions (20251025184244)
-- ============================================================================

ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS store_name text;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS store_location text;

CREATE INDEX IF NOT EXISTS idx_grocery_sessions_store_name ON grocery_sessions(store_name);


-- Migration 8: Add Store to Checkout Sessions (20251029000000)
-- ============================================================================

ALTER TABLE checkout_sessions
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_location text,
  ADD COLUMN IF NOT EXISTS grocery_session_id uuid REFERENCES grocery_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_checkout_sessions_store_name ON checkout_sessions(store_name);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_grocery_session_id ON checkout_sessions(grocery_session_id);

COMMENT ON COLUMN checkout_sessions.store_name IS 'Name of the store where this checkout occurred';
COMMENT ON COLUMN checkout_sessions.store_location IS 'Location/branch of the store';
COMMENT ON COLUMN checkout_sessions.grocery_session_id IS 'Reference to the grocery session that created this checkout';


-- Migration 9: Add Account Deletion Function (20251030000000)
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's data (CASCADE will handle related records)
  DELETE FROM grocery_sessions WHERE user_id = user_uuid;
  DELETE FROM checkout_sessions WHERE user_id = user_uuid;
  DELETE FROM products WHERE user_id = user_uuid;
  DELETE FROM profiles WHERE id = user_uuid;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_account() TO authenticated;

COMMENT ON FUNCTION delete_account() IS 'Allows authenticated users to delete their own account and all associated data';


-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Go to Storage section
-- 2. Create bucket named 'product-images' (public)
-- 3. Set up storage policies (see NEW_SUPABASE_PROJECT_GUIDE.md)
-- ============================================================================
