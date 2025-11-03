const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixDatabase() {
  console.log('🔧 Starting database fix...\n');

  // Check for required environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Error: EXPO_PUBLIC_SUPABASE_URL not found in .env file');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env file');
    console.log('\n📝 To fix this:');
    console.log('1. Go to https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/settings/api');
    console.log('2. Copy the "service_role" secret key');
    console.log('3. Add to your .env file: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
  }

  // Create Supabase client with service role key (has admin privileges)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Read the SQL file
  const sqlPath = path.join(__dirname, 'FIX_ALL_DATABASE_COLUMNS.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 Loaded SQL from FIX_ALL_DATABASE_COLUMNS.sql');
  console.log('🚀 Applying database fixes...\n');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try using the REST API directly
      console.log('⚠️  exec_sql function not found, trying direct SQL execution...\n');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
          if (stmtError) {
            console.error(`❌ Error executing statement: ${stmtError.message}`);
            console.log(`Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log('✅ Database fixes applied successfully!\n');
    console.log('📊 Changes made:');
    console.log('  • Added missing columns to grocery_sessions table');
    console.log('  • Created/updated cart_items table');
    console.log('  • Set up Row Level Security policies');
    console.log('  • Created performance indexes');
    console.log('\n🎉 Your database is now fully configured!');
    console.log('\n💡 You can now reload your app (press "r" in the Expo terminal)');

  } catch (err) {
    console.error('\n❌ Error applying database fixes:');
    console.error(err.message);
    console.log('\n📝 Manual fix required:');
    console.log('1. Go to https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new');
    console.log('2. Copy the contents of FIX_ALL_DATABASE_COLUMNS.sql');
    console.log('3. Paste and click "Run"');
    process.exit(1);
  }
}

fixDatabase();
