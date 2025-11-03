require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFix() {
  try {
    console.log('🔧 Fixing products table - removing quantity column...\n');

    // Read the SQL file
    const sql = fs.readFileSync('FIX_PRODUCTS_QUANTITY.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If the RPC doesn't exist, try direct SQL execution
      console.log('Trying alternative method...');
      const { error: directError } = await supabase.from('products').select('quantity').limit(1);
      
      if (directError && directError.message.includes('column "quantity" does not exist')) {
        console.log('✅ The quantity column has already been removed or never existed!');
        console.log('✅ Your products table is correctly configured.');
        return;
      }
      
      console.error('❌ Error applying fix:', error.message);
      console.log('\n📋 Please run this SQL manually in your Supabase SQL Editor:');
      console.log('---------------------------------------------------');
      console.log(sql);
      console.log('---------------------------------------------------\n');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new');
      return;
    }

    console.log('✅ Successfully removed quantity column from products table!');
    console.log('✅ Your products table is now correctly configured.');
    console.log('\n📝 Products table should now only have these columns:');
    console.log('   - id');
    console.log('   - qr_code');
    console.log('   - name');
    console.log('   - brand');
    console.log('   - image_url');
    console.log('   - created_at');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📋 Please run the SQL in FIX_PRODUCTS_QUANTITY.sql manually in your Supabase SQL Editor.');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new');
  }
}

applyFix();
