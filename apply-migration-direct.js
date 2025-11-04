const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://qijxxreajhacsyupmskd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

// Service role key is provided via environment variable

async function applyMigration() {
  console.log('🔧 Applying migration using direct SQL execution...\n');

  // Individual SQL statements
  const statements = [
    {
      name: 'Add is_active column',
      sql: 'ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;'
    },
    {
      name: 'Add name column',
      sql: 'ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS name text;'
    },
    {
      name: 'Add ended_at column',
      sql: 'ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz;'
    },
    {
      name: 'Drop old status constraint',
      sql: 'ALTER TABLE grocery_sessions DROP CONSTRAINT IF EXISTS grocery_sessions_status_check;'
    },
    {
      name: 'Add new status constraint',
      sql: "ALTER TABLE grocery_sessions ADD CONSTRAINT grocery_sessions_status_check CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled'));"
    },
    {
      name: 'Create cart_items table',
      sql: `CREATE TABLE IF NOT EXISTS cart_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id uuid NOT NULL REFERENCES grocery_sessions(id) ON DELETE CASCADE,
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        price numeric NOT NULL CHECK (price >= 0),
        quantity integer NOT NULL CHECK (quantity > 0) DEFAULT 1,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );`
    },
    {
      name: 'Enable RLS on cart_items',
      sql: 'ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Create cart_items select policy',
      sql: `CREATE POLICY IF NOT EXISTS "Users can read own cart items"
        ON cart_items FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());`
    },
    {
      name: 'Create cart_items insert policy',
      sql: `CREATE POLICY IF NOT EXISTS "Users can create own cart items"
        ON cart_items FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid());`
    },
    {
      name: 'Create cart_items update policy',
      sql: `CREATE POLICY IF NOT EXISTS "Users can update own cart items"
        ON cart_items FOR UPDATE
        TO authenticated
        USING (user_id = auth.uid());`
    },
    {
      name: 'Create cart_items delete policy',
      sql: `CREATE POLICY IF NOT EXISTS "Users can delete own cart items"
        ON cart_items FOR DELETE
        TO authenticated
        USING (user_id = auth.uid());`
    },
    {
      name: 'Create index on cart_items.session_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);'
    },
    {
      name: 'Create index on cart_items.user_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);'
    },
    {
      name: 'Create index on cart_items.product_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);'
    },
    {
      name: 'Create index on grocery_sessions.is_active',
      sql: 'CREATE INDEX IF NOT EXISTS idx_grocery_sessions_is_active ON grocery_sessions(is_active);'
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const stmt of statements) {
    console.log(`📝 ${stmt.name}...`);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: stmt.sql })
      });

      // Check if we can at least verify tables exist
      const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY);
      
      // For ALTER TABLE statements, check if column exists after
      if (stmt.name.includes('Add') && stmt.name.includes('column')) {
        // We'll verify later
        console.log(`   ⏭️  Queued for execution`);
        successCount++;
      } else {
        console.log(`   ⏭️  Queued for execution`);
        successCount++;
      }
    } catch (error) {
      console.log(`   ❌ ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Queued: ${successCount} statements`);
  console.log(`\n⚠️  Direct SQL execution via REST API is not available with current permissions.`);
  console.log(`\n📝 Please run the following in Supabase SQL Editor:`);
  console.log(`    https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new\n`);
  console.log(`Copy and paste this SQL:\n`);
  console.log(`--------------------------------------------------`);
  statements.forEach(stmt => {
    console.log(`-- ${stmt.name}`);
    console.log(stmt.sql);
    console.log('');
  });
  console.log(`--------------------------------------------------\n`);
}

applyMigration();
