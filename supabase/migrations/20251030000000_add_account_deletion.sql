-- Migration: Add account deletion functionality
-- This migration creates a function to safely delete user accounts and all associated data

-- Function to delete user account and all related data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;

  -- Delete all user data (in order due to foreign key constraints)
  -- These will cascade if ON DELETE CASCADE is properly configured
  
  -- Delete cart items
  DELETE FROM cart_items WHERE user_id = current_user_id;
  
  -- Delete scans
  DELETE FROM scans WHERE user_id = current_user_id;
  
  -- Delete grocery sessions
  DELETE FROM grocery_sessions WHERE user_id = current_user_id;
  
  -- Delete checkout sessions
  DELETE FROM checkout_sessions WHERE user_id = current_user_id;
  
  -- Note: Products and stores are shared resources, so we don't delete them
  -- Note: The auth.users deletion must be done separately via Supabase Auth API
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user_account() IS 'Deletes all data associated with the current user account. Must be called by an authenticated user. The actual auth.users entry must be deleted via Supabase Auth API.';

-- Ensure CASCADE deletes are configured on foreign keys
-- Update existing foreign key constraints to include ON DELETE CASCADE if not already set

-- For cart_items
ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey,
ADD CONSTRAINT cart_items_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_session_id_fkey,
ADD CONSTRAINT cart_items_session_id_fkey 
  FOREIGN KEY (session_id) 
  REFERENCES grocery_sessions(id) 
  ON DELETE CASCADE;

-- For scans
ALTER TABLE scans
DROP CONSTRAINT IF EXISTS scans_user_id_fkey,
ADD CONSTRAINT scans_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- For grocery_sessions
ALTER TABLE grocery_sessions
DROP CONSTRAINT IF EXISTS grocery_sessions_user_id_fkey,
ADD CONSTRAINT grocery_sessions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- For checkout_sessions
ALTER TABLE checkout_sessions
DROP CONSTRAINT IF EXISTS checkout_sessions_user_id_fkey,
ADD CONSTRAINT checkout_sessions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
