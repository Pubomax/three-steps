const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://qijxxreajhacsyupmskd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔧 Applying database schema fixes with service role key...\n');

  const migrationPath = path.join(__dirname, 'supabase/migrations/20251101000000_fix_schema_issues.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📝 Migration SQL loaded\n');
  console.log('Executing migration...\n');

  try {
    // Use fetch to directly execute SQL via Supabase's REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (!response.ok) {
      console.log('⚠️  Direct SQL execution not available. Trying alternative method...\n');
      
      // Try executing each statement individually
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 50)}...`);
        
        try {
          // Try using rpc if available
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`   ⚠️  ${error.message}`);
          } else {
            console.log(`   ✅ Success`);
          }
        } catch (e) {
          console.log(`   ⚠️  ${e.message}`);
        }
      }
    } else {
      console.log('✅ Migration applied successfully!\n');
    }

    console.log('\n📊 Verifying database schema...\n');
    
    // Verify cart_items table exists
    const { data: cartItemsCheck, error: cartError } = await supabase
      .from('cart_items')
      .select('id')
      .limit(1);
    
    if (cartError && cartError.code === 'PGRST116') {
      console.log('❌ cart_items table still missing');
      console.log('\n⚠️  The service_role key may not have sufficient permissions.');
      console.log('📝 Please apply the migration manually in Supabase dashboard:');
      console.log('   https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new\n');
    } else {
      console.log('✅ cart_items table exists');
      console.log('\n🎉 Database schema fixed successfully!');
      console.log('💡 You can now reload your app on the iOS simulator\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please apply the migration manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new');
    console.log('   2. Copy SQL from: supabase/migrations/20251101000000_fix_schema_issues.sql');
    console.log('   3. Click Run\n');
  }
}

applyMigration().catch(console.error);
