-- Copy everything below this line and paste into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd/sql/new

ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE grocery_sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz;
ALTER TABLE grocery_sessions DROP CONSTRAINT IF EXISTS grocery_sessions_status_check;
ALTER TABLE grocery_sessions ADD CONSTRAINT grocery_sessions_status_check CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled'));

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES grocery_sessions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0) DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own cart items" ON cart_items;
CREATE POLICY "Users can read own cart items" ON cart_items FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own cart items" ON cart_items;
CREATE POLICY "Users can create own cart items" ON cart_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_grocery_sessions_is_active ON grocery_sessions(is_active);
