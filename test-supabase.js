const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Try to query tables
    const { data, error } = await supabase.from('products').select('count');

    if (error) {
      console.log('\n❌ Database Error:', error.message);
      console.log('\n🔍 This means the Supabase project either:');
      console.log('   1. Doesn\'t exist anymore (was deleted)');
      console.log('   2. Tables haven\'t been created yet');
      console.log('   3. Credentials are invalid');
      return false;
    }

    console.log('\n✅ Database connection works!');
    console.log('✅ Tables exist!');
    console.log('\nYou can access the dashboard at:');
    console.log('https://supabase.com/dashboard');
    console.log('\nTry signing in with different emails you might have used.');
    return true;

  } catch (err) {
    console.log('\n❌ Connection failed:', err.message);
    return false;
  }
}

testConnection();
