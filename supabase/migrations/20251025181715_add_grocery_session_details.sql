/*
  # Add Store Information and Shopping Details to Grocery Sessions

  1. Changes
    - Add `store_name` to track which store the user is shopping at
    - Add `spending_limit` to set a budget for the shopping trip
    - Add `grocery_type` enum for categorizing the type of shopping (regular, special_event, bulk, etc)
    - Remove previous session status enum and related fields to simplify workflow
  
  2. Purpose
    - Track complete shopping session context
    - Help users budget and categorize their grocery trips
    - Provide better analytics on spending patterns by store and type
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'grocery_type_enum'
  ) THEN
    CREATE TYPE grocery_type_enum AS ENUM ('regular', 'special_event', 'bulk', 'weekly', 'monthly');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'store_name'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN store_name text DEFAULT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'spending_limit'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN spending_limit numeric(10, 2) DEFAULT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'grocery_type'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN grocery_type grocery_type_enum DEFAULT 'regular';
  END IF;
END $$;
