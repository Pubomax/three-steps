/*
  # Add Grocery Sessions

  ## Overview
  Creates a system for managing multiple active grocery shopping sessions.
  Users can create separate grocery trips and add items to specific sessions.

  ## New Tables

  ### grocery_sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - References auth.users
  - `name` (text) - Session name (e.g., "Weekly Shopping", "Walmart Trip")
  - `is_active` (boolean) - Whether this is the currently active session
  - `created_at` (timestamptz) - When session was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Changes to Existing Tables
  1. Add `session_id` to cart_items table
  2. Users can have multiple sessions, but only one active at a time

  ## Security
  - RLS enabled on grocery_sessions table
  - Users can only access their own sessions
*/

-- Create grocery_sessions table
CREATE TABLE IF NOT EXISTS grocery_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE grocery_sessions ENABLE ROW LEVEL SECURITY;

-- Grocery sessions policies
CREATE POLICY "Users can read own sessions"
  ON grocery_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON grocery_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON grocery_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON grocery_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add session_id to cart_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN session_id uuid REFERENCES grocery_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_user_id ON grocery_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_active ON grocery_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);