const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qijxxreajhacsyupmskd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpanh4cmVhamhhY3N5dXBtc2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTUwMTIsImV4cCI6MjA3NzQzMTAxMn0.VXy7mdRg6cVjy13CK4x3nWHma_ySjxpDNm9Y-k4hwDg';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
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
