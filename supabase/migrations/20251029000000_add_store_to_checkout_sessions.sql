/*
  # Add Store Information to Checkout Sessions

  ## Overview
  Adds store information to checkout_sessions table to enable store-based analytics.
  This allows users to compare pricing and shopping patterns across different stores.

  ## Changes
  - Add `store_name` (text, nullable) - Name of the store where checkout occurred
  - Add `store_location` (text, nullable) - Location/branch of the store
  - Add `grocery_session_id` (uuid, nullable) - Reference to the grocery session this checkout came from

  ## Analytics Enabled
  - Total spending per store
  - Most frequented stores
  - Price comparisons across stores
  - Store-specific shopping patterns
*/

-- Add store fields to checkout_sessions
ALTER TABLE checkout_sessions
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_location text,
  ADD COLUMN IF NOT EXISTS grocery_session_id uuid REFERENCES grocery_sessions(id) ON DELETE SET NULL;

-- Create index for store-based queries
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_store_name ON checkout_sessions(store_name);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_grocery_session_id ON checkout_sessions(grocery_session_id);

-- Add comment to table
COMMENT ON COLUMN checkout_sessions.store_name IS 'Name of the store where this checkout occurred';
COMMENT ON COLUMN checkout_sessions.store_location IS 'Location/branch of the store';
COMMENT ON COLUMN checkout_sessions.grocery_session_id IS 'Reference to the grocery session that created this checkout';
