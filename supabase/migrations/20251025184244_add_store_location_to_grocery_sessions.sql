/*
  # Add store location to grocery sessions

  1. Changes
    - Add `store_location` column to `grocery_sessions` table
      - Stores the location/address of the store (e.g., "Downtown", "5th Ave")
      - Optional text field for additional context about where the store is located
  
  2. Notes
    - Non-breaking change - existing sessions will have NULL store_location
    - Enhances session data with more specific store information
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'store_location'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN store_location text;
  END IF;
END $$;