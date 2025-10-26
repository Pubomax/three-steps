/*
  # Add Checkout Sessions Table

  ## Overview
  Creates a table to store completed grocery shopping sessions (past groceries).
  When users complete checkout, their cart items are saved to this table before the cart is cleared.

  ## New Tables

  ### checkout_sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - References auth.users
  - `total_amount` (numeric) - Total amount spent
  - `item_count` (integer) - Number of items purchased
  - `completed_at` (timestamptz) - When checkout was completed
  - `created_at` (timestamptz) - Record creation timestamp

  ### checkout_items
  - `id` (uuid, primary key) - Unique item identifier
  - `session_id` (uuid) - References checkout_sessions
  - `product_id` (uuid) - References products table
  - `price` (numeric) - Price at time of purchase
  - `quantity` (integer) - Quantity purchased
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on both tables
  - Users can only access their own checkout sessions and items
*/

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_completed_at ON checkout_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_items_session_id ON checkout_items(session_id);