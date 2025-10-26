/*
  # Grocery Tracker Schema

  ## Overview
  Creates the complete database schema for a grocery price tracking and comparison app.
  Users can scan products, track prices across stores, set spending limits, and analyze their shopping habits.

  ## New Tables

  ### stores
  - `id` (uuid, primary key) - Unique store identifier
  - `name` (text) - Store name (e.g., "Walmart", "Target")
  - `latitude` (numeric) - Store latitude
  - `longitude` (numeric) - Store longitude
  - `address` (text) - Store address
  - `created_at` (timestamptz) - Record creation timestamp

  ### products
  - `id` (uuid, primary key) - Unique product identifier
  - `qr_code` (text, unique) - QR code from product
  - `name` (text) - Product name
  - `image_url` (text) - URL to product photo
  - `created_at` (timestamptz) - Record creation timestamp

  ### scans
  - `id` (uuid, primary key) - Unique scan identifier
  - `user_id` (uuid) - References auth.users
  - `product_id` (uuid) - References products table
  - `store_id` (uuid) - References stores table
  - `price` (numeric) - Product price at time of scan
  - `latitude` (numeric) - Location where scan occurred
  - `longitude` (numeric) - Location where scan occurred
  - `scanned_at` (timestamptz) - Scan timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### user_settings
  - `user_id` (uuid, primary key) - References auth.users
  - `spending_limit` (numeric) - Monthly spending limit
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### cart_items
  - `id` (uuid, primary key) - Unique cart item identifier
  - `user_id` (uuid) - References auth.users
  - `product_id` (uuid) - References products table
  - `price` (numeric) - Current price
  - `quantity` (integer) - Quantity in cart
  - `added_at` (timestamptz) - When added to cart
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own scans, settings, and cart items
  - All users can read stores and products (public data)
  - Users can insert products and stores (community-driven data)
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude numeric,
  longitude numeric,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code text UNIQUE NOT NULL,
  name text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  latitude numeric,
  longitude numeric,
  scanned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY,
  spending_limit numeric DEFAULT 0 CHECK (spending_limit >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  added_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Stores policies (public read, authenticated insert)
CREATE POLICY "Anyone can read stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Products policies (public read, authenticated insert)
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Scans policies (users can only access their own scans)
CREATE POLICY "Users can read own scans"
  ON scans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own scans"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- User settings policies (users can only access their own settings)
CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Cart items policies (users can only access their own cart)
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
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_product_id ON scans(product_id);
CREATE INDEX IF NOT EXISTS idx_scans_store_id ON scans(store_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_products_qr_code ON products(qr_code);