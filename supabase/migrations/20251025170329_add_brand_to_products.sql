/*
  # Add Brand Field to Products

  ## Overview
  Adds a brand field to the products table to store both brand and product name separately.

  ## Changes
  1. Add `brand` column to products table
  2. The brand field is optional to support products without clear brands

  ## Notes
  - Existing products will have NULL brand values until updated
  - Both brand and name together provide the full product description
*/

-- Add brand column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products ADD COLUMN brand text;
  END IF;
END $$;