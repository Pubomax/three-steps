const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://qijxxreajhacsyupmskd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY);

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
