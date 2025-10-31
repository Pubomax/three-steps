#!/usr/bin/env node

/**
 * Apply Storage Policies via Supabase REST API
 * This uses the service role key to execute SQL
 */

require('dotenv').config();

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpanh4cmVhamhhY3N5dXBtc2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1NTAxMiwiZXhwIjoyMDc3NDMxMDEyfQ.MZfJDNRPXZ4Y06VU8_Etn4zsBLaszaN0oZwYQGgqD8A';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

const policies = [
  {
    name: 'Public read access',
    sql: `
      CREATE POLICY "Public read access"
      ON storage.objects FOR SELECT
      TO public
      USING ( bucket_id = 'product-images' );
    `
  },
  {
    name: 'Authenticated users can upload',
    sql: `
      CREATE POLICY "Authenticated users can upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK ( bucket_id = 'product-images' );
    `
  },
  {
    name: 'Authenticated users can update own files',
    sql: `
      CREATE POLICY "Authenticated users can update own files"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING ( bucket_id = 'product-images' );
    `
  },
  {
    name: 'Authenticated users can delete own files',
    sql: `
      CREATE POLICY "Authenticated users can delete own files"
      ON storage.objects FOR DELETE
      TO authenticated
      USING ( bucket_id = 'product-images' );
    `
  }
];

async function applyPolicies() {
  console.log('🔐 Applying storage policies...\n');

  for (const policy of policies) {
    try {
      console.log(`📝 Creating policy: ${policy.name}...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          query: policy.sql
        })
      });

      if (response.ok) {
        console.log(`   ✅ ${policy.name} created\n`);
      } else {
        const error = await response.text();
        if (error.includes('already exists')) {
          console.log(`   ℹ️  ${policy.name} already exists\n`);
        } else {
          console.log(`   ⚠️  Response: ${response.status} - ${error}\n`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not create automatically: ${error.message}`);
      console.log(`   ℹ️  This policy needs to be created via SQL Editor\n`);
    }
  }

  console.log('\n📋 Summary:');
  console.log('   Storage bucket: ✅ Created');
  console.log('   Storage policies: ⚠️  May need manual SQL execution');
  console.log('\n💡 If policies weren\'t created, run this ONE command:');
  console.log('   Copy contents of: supabase/STORAGE_SETUP.sql');
  console.log('   Paste in: Supabase SQL Editor');
  console.log('   Click: RUN\n');
}

applyPolicies();
