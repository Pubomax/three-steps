# COMPLETE APP FLOW - Simple Grocery Tracker

## THE SIMPLE PROMISE
**Scan → Track → Save**

---

## 🔐 STEP 0: LOGIN
**Screen:** Login screen
**User Action:** Login or Continue as Guest
**What Gets Saved:** 
- Authenticated: User session in Supabase Auth
- Guest: Nothing saved to database

---

## 🏠 STEP 1: START A GROCERY SESSION
**Screen:** Home tab
**User Action:** Tap "Start Grocery Session"
**What Gets Saved:**
- Authenticated Users: New row in `grocery_sessions` table
  - Session name (e.g., "hausbbd")
  - Store name (e.g., "jhansnd - Bjsnnsi")
  - Budget/spending limit (e.g., $25.00)
  - Grocery type (e.g., "monthly")
  - `is_active: true`
- Guest Users: Same data saved to AsyncStorage `guest_sessions`

**Result:** Session is now ACTIVE and ready for scanning

---

## 📸 STEP 2: SCAN PRODUCTS
**Screen:** Scan tab (grocery.tsx)
**User Action:** 
1. Scan barcode with camera OR enter code manually
2. Take photo of product
3. Enter product details:
   - Brand name
   - Product name
   - Price
   - Quantity

**What Gets Saved:**
- Authenticated Users:
  - `products` table: Product info (brand, name, barcode, image)
  - `stores` table: Store info if new
  - `scans` table: This scan record (price, store, timestamp)
  - `cart_items` table: Item added to active session's cart
- Guest Users: Only added to AsyncStorage `guest_cart_{sessionId}`

**Result:** Product is now in your cart for the active session

---

## 🛒 STEP 3: VIEW CART
**Screen:** Cart tab (index.tsx)
**User sees:**
- Active session info (name, store, budget)
- All scanned items with quantities
- Current total vs spending limit
- Remaining budget

**User can:**
- Update quantities (+/-)
- Delete items
- Edit spending limit
- Clear entire cart

---

## ✅ STEP 4: COMPLETE CHECKOUT
**Screen:** Cart tab
**User Action:** Tap "Complete Checkout" button
**What Gets Saved:**
- Authenticated Users:
  - `checkout_sessions` table: New checkout record with total, item count, store
  - `checkout_items` table: All items from cart copied here
  - `cart_items` table: All items DELETED
  - `grocery_sessions` table: Session record DELETED
- Guest Users: 
  - AsyncStorage: Cart cleared, session marked complete
  - Nothing saved to database

**Result:** Shopping trip is COMPLETE and saved to history

---

## 🚪 ALTERNATIVE STEP 4: END SESSION (WITHOUT SAVING)
**Screen:** Cart tab
**User Action:** Tap "End Session" button
**What Gets Saved:**
- Authenticated Users:
  - `cart_items` table: All items DELETED
  - `grocery_sessions` table: `is_active: false`, `ended_at: timestamp`
- Guest Users:
  - AsyncStorage: Cart cleared, session marked inactive

**Result:** Shopping trip is CANCELLED - NO history saved

---

## 📊 STEP 5: VIEW HISTORY
**Screen:** History tab
**What User Sees:**
- Authenticated Users: All completed checkouts from `checkout_sessions`
- Guest Users: Nothing (no database history)

---

## 📈 STEP 6: VIEW ANALYTICS  
**Screen:** Analytics tab
**What User Sees:**
- Authenticated Users: Charts and stats from saved checkout data
- Guest Users: Limited or no analytics

---

## DATABASE TABLES (For Authenticated Users Only)

### During Shopping:
1. **grocery_sessions** - Active shopping session
2. **cart_items** - Items in current cart
3. **products** - Product catalog
4. **stores** - Store information
5. **scans** - Price history across stores

### After Checkout:
6. **checkout_sessions** - Completed shopping trips
7. **checkout_items** - Items from completed trips

---

## THE KEY PROBLEM

**What you're seeing in your screenshots:**

You're using the "End Session" button which:
- ❌ Does NOT save to `checkout_sessions` table
- ❌ Does NOT save to `checkout_items` table
- ✅ Just marks session inactive and deletes cart

**What you SHOULD use:**

The "Complete Checkout" button which:
- ✅ Saves everything to `checkout_sessions` table
- ✅ Saves all items to `checkout_items` table  
- ✅ Creates proper history for analytics

---

## GUEST vs AUTHENTICATED

| Feature | Guest (AsyncStorage) | Authenticated (Database) |
|---------|---------------------|--------------------------|
| Create Session | ✅ Local only | ✅ Saved to DB |
| Scan Products | ✅ Local only | ✅ Saved to DB |
| View Cart | ✅ | ✅ |
| Complete Checkout | ❌ No history | ✅ Full history |
| View History | ❌ | ✅ |
| View Analytics | ❌ | ✅ |
| Cross-device | ❌ | ✅ |
