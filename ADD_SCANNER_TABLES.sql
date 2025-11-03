-- Add tables needed for grocery scanner
-- Run this in Supabase SQL Editor

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code text UNIQUE NOT NULL,
  brand text NOT NULL,
  name text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  scanned_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
DROP POLICY IF EXISTS "Anyone can read stores" ON stores;
CREATE POLICY "Anyone can read stores" ON stores FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can create stores" ON stores;
CREATE POLICY "Authenticated users can create stores" ON stores FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for products
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products" ON products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
CREATE POLICY "Authenticated users can create products" ON products FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for scans
DROP POLICY IF EXISTS "Users can read own scans" ON scans;
CREATE POLICY "Users can read own scans" ON scans FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own scans" ON scans;
CREATE POLICY "Users can create own scans" ON scans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_products_qr_code ON products(qr_code);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_product_id ON scans(product_id);
CREATE INDEX IF NOT EXISTS idx_scans_store_id ON scans(store_id);
