#!/usr/bin/env node

/**
 * Automated Supabase Storage Setup
 * This script uses your service role key to set up the storage bucket
 */

require('dotenv').config();

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpanh4cmVhamhhY3N5dXBtc2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1NTAxMiwiZXhwIjoyMDc3NDMxMDEyfQ.MZfJDNRPXZ4Y06VU8_Etn4zsBLaszaN0oZwYQGgqD8A';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

async function setupStorage() {
  console.log('🚀 Setting up Supabase storage...\n');

  try {
    // Create bucket
    console.log('1️⃣ Creating product-images bucket...');
    const createBucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'product-images',
        name: 'product-images',
        public: true,
        file_size_limit: 52428800,
        allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      })
    });

    if (createBucketResponse.ok) {
      console.log('✅ Bucket created successfully!\n');
    } else if (createBucketResponse.status === 409) {
      console.log('ℹ️  Bucket already exists, skipping...\n');
    } else {
      const error = await createBucketResponse.text();
      console.log(`⚠️  Bucket creation response: ${createBucketResponse.status}`);
      console.log(`   ${error}\n`);
    }

    // Note: Storage policies need to be set via SQL
    console.log('2️⃣ Storage policies (need to be set via SQL Editor):');
    console.log('   - Public read access');
    console.log('   - Authenticated user uploads');
    console.log('   - User can update/delete own files\n');

    console.log('📝 To complete setup, run this SQL in Supabase SQL Editor:');
    console.log('   File: supabase/STORAGE_SETUP.sql\n');

    console.log('✨ Basic storage setup complete!');
    console.log('🔗 View in dashboard: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/storage/buckets\n');

  } catch (error) {
    console.error('❌ Error setting up storage:', error.message);
    process.exit(1);
  }
}

setupStorage();
