const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qijxxreajhacsyupmskd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpanh4cmVhamhhY3N5dXBtc2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTUwMTIsImV4cCI6MjA3NzQzMTAxMn0.VXy7mdRg6cVjy13CK4x3nWHma_ySjxpDNm9Y-k4hwDg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function clearAllSessions() {
  console.log('🧹 Clearing all sessions...\n');

  try {
    // Check for ALL grocery sessions (active or not)
    const { data: allSessions, error: fetchError } = await supabase
      .from('grocery_sessions')
      .select('id, name, user_id, is_active, status');

    if (fetchError) {
      console.error('❌ Error fetching sessions:', fetchError.message);
      return;
    }

    if (!allSessions || allSessions.length === 0) {
      console.log('✅ No sessions found in database');
    } else {
      console.log(`Found ${allSessions.length} session(s) in database:\n`);
      allSessions.forEach(s => {
        console.log(`   - ${s.name || 'Unnamed'} (${s.status}) ${s.is_active ? '🟢 ACTIVE' : '⚪ inactive'}`);
      });

      // Set all sessions to inactive
      const { error: updateError } = await supabase
        .from('grocery_sessions')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (updateError) {
        console.error('\n❌ Error updating sessions:', updateError.message);
      } else {
        console.log('\n✅ All database sessions set to inactive');
      }
    }

    console.log('\n📱 To clear local storage (AsyncStorage):');
    console.log('   1. In the iOS simulator, shake the device (Cmd+Ctrl+Z)');
    console.log('   2. Tap "Reload" to restart the app fresh');
    console.log('   3. OR: Close the app, press Ctrl+C in terminal, then run: yarn expo start --ios --clear\n');
    
    console.log('💡 After clearing, you should be able to start a new session without the error.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearAllSessions();
