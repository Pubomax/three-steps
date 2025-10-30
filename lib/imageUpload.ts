import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param imageUri - Local URI of the image (from camera or file picker)
 * @param bucket - Storage bucket name (default: 'product-images')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(imageUri: string, bucket: string = 'product-images'): Promise<string> {
  try {
    // Generate unique filename
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Convert base64 to blob
    const blob = base64ToBlob(base64, `image/${fileExtension}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: `image/${fileExtension}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 * @param bucket - Storage bucket name (default: 'product-images')
 */
export async function deleteImage(imageUrl: string, bucket: string = 'product-images'): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`${bucket}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format');
    }
    const filePath = urlParts[1];

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
