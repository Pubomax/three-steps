const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv/config');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📦 Applying store fields migration to checkout_sessions...\n');

  const migrationPath = path.join(__dirname, 'supabase/migrations/20251029000000_add_store_to_checkout_sessions.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n📝 Manual migration required:');
      console.log('1. Go to https://supabase.com/dashboard/project/bebrakqpymztgjpiisrn/editor');
      console.log('2. Run the SQL from: supabase/migrations/20251029000000_add_store_to_checkout_sessions.sql\n');
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📊 Store analytics is now enabled:');
    console.log('   - checkout_sessions.store_name added');
    console.log('   - checkout_sessions.store_location added');
    console.log('   - checkout_sessions.grocery_session_id added');
    console.log('\n🎯 Next: Complete a checkout to see store analytics!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please apply the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bebrakqpymztgjpiisrn/sql');
    console.log('2. Copy and run the SQL from:');
    console.log('   supabase/migrations/20251029000000_add_store_to_checkout_sessions.sql\n');
  }
}

applyMigration();
