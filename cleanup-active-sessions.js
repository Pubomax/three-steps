const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

async function cleanupActiveSessions() {
  console.log('🧹 Cleaning up active sessions...\n');

  try {
    // Check for active sessions
    const { data: activeSessions, error: fetchError } = await supabase
      .from('grocery_sessions')
      .select('id, name, user_id, is_active')
      .eq('is_active', true);

    if (fetchError) {
      console.error('❌ Error checking active sessions:', fetchError.message);
      return;
    }

    if (!activeSessions || activeSessions.length === 0) {
      console.log('✅ No active sessions found in database');
      console.log('\n📱 The issue might be with local storage (guest sessions)');
      console.log('💡 To fix: In your app, go to Settings and clear app data, or:');
      console.log('   1. Shake the device in simulator');
      console.log('   2. Tap "Reload"');
      console.log('   This will clear AsyncStorage cache\n');
      return;
    }

    console.log(`Found ${activeSessions.length} active session(s):\n`);
    activeSessions.forEach(s => {
      console.log(`   - ID: ${s.id}`);
      console.log(`     Name: ${s.name}`);
      console.log(`     User: ${s.user_id}\n`);
    });

    // Set all sessions to inactive
    const { error: updateError } = await supabase
      .from('grocery_sessions')
      .update({ is_active: false })
      .eq('is_active', true);

    if (updateError) {
      console.error('❌ Error updating sessions:', updateError.message);
      return;
    }

    console.log('✅ All active sessions have been set to inactive\n');
    console.log('💡 You can now reload your app and start a new session\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanupActiveSessions();
