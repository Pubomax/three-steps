import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param imageUri - Local URI of the image (from camera or file picker)
 * @param bucket - Storage bucket name (default: 'product-images')
 * @returns Public URL of the uploaded image
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < base64.length; i++) {
    const c = chars.indexOf(base64.charAt(i));
    if (c === -1) continue; // ignore invalid chars (including newlines)
    buffer = (buffer << 6) | c;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(output);
}

export async function uploadImage(imageUri: string, bucket: string = 'product-images'): Promise<string> {
  try {
    // First compress to a small thumbnail (max width 512px, strong compression)
    const compressed = await manipulateAsync(
      imageUri,
      [{ resize: { width: 512 } }],
      { compress: 0.2, format: SaveFormat.JPEG }
    );

    const uploadUri = compressed.uri;
    const fileExtension = 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `products/${fileName}`;
    const mimeType = 'image/jpeg';

    // Upload via REST endpoint using Expo FileSystem (reliable for file:// URIs)
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;

    const result = await FileSystem.uploadAsync(uploadUrl, uploadUri, {
      httpMethod: 'POST',
      uploadType: (FileSystem as any).FileSystemUploadType?.BINARY_CONTENT ?? 0,
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': mimeType,
        'x-upsert': 'false',
      },
    });

    if (result.status !== 200 && result.status !== 201) {
      throw new Error(`Upload failed with status ${result.status}: ${result.body}`);
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
