const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigration() {
  console.log('🔍 Checking if store analytics migration is needed...\n');

  try {
    // Try to query checkout_sessions with the new store fields
    const { data, error } = await supabase
      .from('checkout_sessions')
      .select('id, store_name, store_location, grocery_session_id')
      .limit(1);

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Store fields are missing from checkout_sessions table');
        console.log('\n📝 Migration needed! The store analytics columns don\'t exist yet.');
        console.log('\n🔧 To fix this, you need dashboard access to run the SQL migration.');
        console.log('\nThe migration will add:');
        console.log('  - store_name');
        console.log('  - store_location');
        console.log('  - grocery_session_id');
        console.log('\n💡 For now, the app will work, but store analytics won\'t show data.');
        return false;
      } else {
        console.log('❌ Error:', error.message);
        return false;
      }
    }

    console.log('✅ Store analytics migration already applied!');
    console.log('✅ All required fields exist:');
    console.log('   - store_name');
    console.log('   - store_location');
    console.log('   - grocery_session_id');
    console.log('\n🎯 Store comparison analytics will work perfectly!');
    return true;

  } catch (err) {
    console.log('❌ Check failed:', err.message);
    return false;
  }
}

checkMigration();
