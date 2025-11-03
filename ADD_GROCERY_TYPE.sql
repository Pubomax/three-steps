-- Add missing grocery_type column to grocery_sessions
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS grocery_type text DEFAULT 'regular';

-- Add store_location if it doesn't exist  
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS store_location text;
