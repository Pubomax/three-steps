/*
  # Add Start and End Times to Grocery Sessions

  1. Changes
    - Add `started_at` timestamp column to track when shopping begins
    - Add `ended_at` timestamp column to track when shopping completes
    - Add `status` enum to track session state (created, in_progress, completed)
  
  2. Purpose
    - Track the complete lifecycle of a grocery shopping session
    - Know when a user starts shopping vs when they created the session
    - Calculate actual shopping duration
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN started_at timestamptz DEFAULT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'ended_at'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN ended_at timestamptz DEFAULT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'session_status'
  ) THEN
    CREATE TYPE session_status AS ENUM ('created', 'in_progress', 'completed');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_sessions' AND column_name = 'status'
  ) THEN
    ALTER TABLE grocery_sessions ADD COLUMN status session_status DEFAULT 'created';
  END IF;
END $$;
