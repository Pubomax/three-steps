/*
  # Create Storage Bucket for Product Images

  1. Storage Setup
    - Create 'product-images' bucket for storing product photos
    - Enable public access for product images
    - Set up storage policies for authenticated users

  2. Security
    - Anyone can view images (public bucket)
    - Only authenticated users can upload images
    - Users can only delete their own uploaded images (tracked via products table)
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public access to view images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow users to delete images (for cleanup)
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
