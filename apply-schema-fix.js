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
  console.log('🔧 Applying database schema fixes...\n');

  const migrationPath = path.join(__dirname, 'supabase/migrations/20251101000000_fix_schema_issues.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Split the SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`[${i + 1}/${statements.length}] Executing...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Exception: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. This is expected if using anon key.');
    console.log('📝 You need to apply the migration manually:');
    console.log('   1. Go to: ' + supabaseUrl.replace('.supabase.co', '.supabase.co/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new'));
    console.log('   2. Copy SQL from: supabase/migrations/20251101000000_fix_schema_issues.sql');
    console.log('   3. Click Run');
  } else {
    console.log('\n🎉 All migrations applied successfully!');
  }
}

applyMigration().catch(console.error);
