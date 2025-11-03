# STRAGO - MVP Context Document

**App Name:** Strago  
**Tagline:** Scan. Track. Save.  
**Version:** 1.0 MVP  
**Last Updated:** November 2, 2025

---

## 🎯 CORE PROMISE

Strago helps shoppers stay within budget by scanning products in real-time while shopping. Simple, honest budget tracking with no gimmicks.

---

## 👥 TARGET USERS

### Primary: Budget-Conscious Parents
- Stay within monthly/weekly grocery budget
- Track spending across shopping trips
- Compare prices between stores over time
- Need simple, fast tracking while kids are with them

### Secondary: College Students
- Limited budget with no room for error
- Want to try app without creating account (Guest mode)
- Need to know running total before checkout
- Quick and easy to use

### Tertiary: Deal Hunters
- Track prices across stores and time
- Want historical data to know when getting good deals
- Prefer simple interface, not overwhelmed by features

---

## 🏗️ APP ARCHITECTURE

### Technology Stack
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Camera:** Expo Camera (barcode scanning)
- **Local Storage:** AsyncStorage (for guest users)

### Navigation Structure
```
Login Screen
    ↓
Home Tab ─┬─ Scan Tab ─┬─ Cart Tab ─┬─ History Tab
          │             │            │
          │             │            └─ Analytics Tab
          │             │
          │             └─ (Camera for scanning)
          │
          └─ (Start Session, View Active Session)
```

---

## 🔄 COMPLETE USER FLOW

### 1. AUTHENTICATION
**Options:**
- Sign up with email/password
- Sign in with email/password
- **Continue as Guest** (prominent option)

**Guest Mode:**
- All data stored locally in AsyncStorage
- Can use full scanning and cart features
- Cannot access History or Analytics
- No data saved to database
- Prompted to create account after first checkout

### 2. START GROCERY SESSION
**Required Fields:**
- Session Name (e.g., "Weekly Shop")
- Store Name (e.g., "Walmart")
- Spending Limit/Budget (e.g., $150.00)
- Grocery Type (dropdown: Weekly, Monthly, Special, Bulk)

**Rules:**
- Only ONE active session at a time
- Budget is set once and **CANNOT be edited** during session
- This enforces honest budgeting

**What Happens:**
- **Authenticated:** Creates row in `grocery_sessions` table with `is_active: true`
- **Guest:** Saves to AsyncStorage key `guest_sessions`

### 3. SCAN PRODUCTS
**Flow:**
1. Open Scan tab (camera opens automatically)
2. Scan barcode (UPC-A, UPC-E, EAN-13, EAN-8, QR codes)
3. Camera switches to photo mode
4. Take product photo
5. Enter product details:
   - Brand (required)
   - Product Name (required)
   - Price (required, $0.00 format)
   - Quantity (default: 1, can adjust with +/- buttons)
6. Tap "Add to Cart"

**What Gets Saved (Authenticated):**
- `products` table: Product info (if new product)
- `stores` table: Store info (if new store)
- `scans` table: Price record for this scan
- `cart_items` table: Item added to active session

**What Gets Saved (Guest):**
- AsyncStorage key `guest_cart_{sessionId}`: Array of cart items

**Special Features:**
- Price comparison alert if product was scanned before at different price
- Manual entry option if barcode unreadable
- Image upload to Supabase Storage (authenticated) or local (guest)

### 4. VIEW CART
**Display:**
- Active session info (name, store, budget)
- Budget progress bar:
  - Green: 0-89% of budget
  - Yellow: 90-99% of budget
  - Red: 100%+ (over budget)
- Current total
- Remaining budget (or overage amount)
- All cart items with:
  - Product photo
  - Brand - Product Name
  - Price × Quantity
  - Subtotal
  - +/- buttons to adjust quantity
  - Delete button (swipe left)

**Actions Available:**
- Update quantity (+ / - buttons)
- Delete items (swipe left)
- Clear entire cart
- **Complete Checkout**
- **End Session**

### 5A. COMPLETE CHECKOUT ✅
**This is the CORRECT way to finish shopping**

**What Happens (Authenticated):**
1. Creates record in `checkout_sessions` table:
   - Total amount
   - Item count
   - Store name & location
   - Session name
   - Grocery type
   - Timestamp
2. Copies all items from `cart_items` to `checkout_items` table
3. Deletes all records from `cart_items` table
4. **DELETES** the record from `grocery_sessions` table
5. Shows success message with confetti
6. User can view in History tab

**What Happens (Guest):**
1. Saves checkout to AsyncStorage key `guest_checkouts`
2. Clears cart from AsyncStorage
3. Marks session as complete
4. Shows success message
5. **NO history is saved to database**

**Result:** Shopping trip is SAVED and can be viewed in History/Analytics

### 5B. END SESSION ❌
**This is for CANCELING shopping**

**What Happens (Authenticated):**
1. Deletes all records from `cart_items` table
2. Updates `grocery_sessions` record:
   - Sets `is_active: false`
   - Sets `ended_at: timestamp`
3. Shows "Session ended" message
4. Returns to Home screen

**What Happens (Guest):**
1. Clears cart from AsyncStorage
2. Marks session as inactive in AsyncStorage
3. Returns to Home screen

**Result:** Shopping trip is CANCELLED - NO history saved

### 6. VIEW HISTORY
**Authenticated Users Only**
- List of all completed checkouts from `checkout_sessions`
- Sorted by date (newest first)
- Each shows: Date, Store, Total, Item count
- Tap to view detailed breakdown with all items

**Guest Users:**
- See message: "Sign up to save your shopping history"
- No access to history data

### 7. VIEW ANALYTICS
**Authenticated Users Only**
- Total spent (this month, last month, all-time)
- Average basket size
- Most frequent store
- Spending trend chart (last 6 months)
- Top 10 most purchased products

**Guest Users:**
- See message: "Sign up to unlock analytics"

---

## 🗄️ DATABASE SCHEMA

### For Authenticated Users (Supabase PostgreSQL)

#### grocery_sessions
Active shopping sessions
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- name: TEXT (session name)
- store_name: TEXT
- store_location: TEXT
- spending_limit: DECIMAL(10,2)
- grocery_type: TEXT (Weekly, Monthly, Special, Bulk)
- is_active: BOOLEAN (default true)
- started_at: TIMESTAMP
- ended_at: TIMESTAMP
- status: TEXT (created, in_progress, completed)
```

#### cart_items
Items in active shopping cart
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- session_id: UUID (foreign key to grocery_sessions)
- product_id: UUID (foreign key to products)
- price: DECIMAL(10,2)
- quantity: INTEGER
- added_at: TIMESTAMP
```

#### products
Product catalog
```sql
- id: UUID (primary key)
- qr_code: TEXT (unique - barcode/QR code)
- name: TEXT
- brand: TEXT
- image_url: TEXT (Supabase Storage URL)
- created_at: TIMESTAMP
```

#### stores
Store information
```sql
- id: UUID (primary key)
- name: TEXT (unique)
- address: TEXT
- latitude: DECIMAL
- longitude: DECIMAL
- created_at: TIMESTAMP
```

#### scans
Historical price data
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- product_id: UUID (foreign key to products)
- store_id: UUID (foreign key to stores)
- price: DECIMAL(10,2)
- scanned_at: TIMESTAMP
```

#### checkout_sessions
Completed shopping trips
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- total_amount: DECIMAL(10,2)
- item_count: INTEGER
- store_name: TEXT
- store_location: TEXT
- grocery_session_id: UUID
- completed_at: TIMESTAMP
```

#### checkout_items
Items from completed trips
```sql
- id: UUID (primary key)
- session_id: UUID (foreign key to checkout_sessions)
- product_id: UUID (foreign key to products)
- price: DECIMAL(10,2)
- quantity: INTEGER
```

### For Guest Users (AsyncStorage)

#### guest_sessions
```javascript
{
  id: "guest-{uuid}",
  name: "Weekly Shop",
  store_name: "Walmart",
  store_location: "123 Main St",
  spending_limit: 150.00,
  grocery_type: "weekly",
  is_active: true,
  created_at: "2025-11-02T10:00:00Z"
}
```

#### guest_cart_{sessionId}
```javascript
[
  {
    id: "cart-item-{uuid}",
    product_id: "product-{uuid}",
    barcode: "012345678905",
    brand: "Coca-Cola",
    name: "Coke Zero 12pk",
    price: 5.99,
    quantity: 2,
    image_uri: "file:///local/path/image.jpg",
    added_at: "2025-11-02T10:15:00Z"
  }
]
```

#### guest_checkouts
```javascript
[
  {
    id: "checkout-{uuid}",
    session_name: "Weekly Shop",
    store_name: "Walmart",
    total_amount: 130.45,
    item_count: 12,
    grocery_type: "weekly",
    checked_out_at: "2025-11-02T11:30:00Z",
    items: [...]
  }
]
```

---

## 🔐 SECURITY & DATA ACCESS

### Row-Level Security (RLS)
All database tables have RLS policies enforcing:
- Users can only access their own data
- Users cannot read/modify other users' sessions, carts, or checkouts
- Product and store tables are shared (all users can read, insert creates if not exists)

### Guest Mode Privacy
- No data sent to server
- All data stored locally on device
- Data deleted if app uninstalled
- Data can be migrated when user creates account

---

## ❌ MVP EXCLUSIONS

The following features are **NOT** in MVP (saved for future versions):

1. **Edit Spending Limit** - Budget is set once, cannot be changed mid-session
   - Reason: Enforces honest budgeting, users must stick to initial budget
   
2. **Social Features** - Sharing lists, split costs, family budgets
   - Deferred to v1.1+
   
3. **Export Receipts** - PDF/CSV export
   - Deferred to v1.1
   
4. **Dark Mode** - App uses light mode only
   - Deferred to v1.1
   
5. **Onboarding Tutorial** - No first-run tutorial
   - App should be self-explanatory
   
6. **Search/Filter** - In history or products
   - Deferred to v1.1

---

## 🎨 UI/UX PRINCIPLES

### Design Philosophy
- **Simplicity First:** Minimal cognitive load, clear visual hierarchy
- **Speed:** Every action should feel instant
- **Honesty:** No tricks to encourage overspending
- **Transparency:** Always show running total and remaining budget

### Key UI Elements

**Budget Progress Bar:**
- Large, prominent at top of cart
- Color changes based on percentage:
  - Green: 0-89% of budget used
  - Yellow: 90-99% of budget used  
  - Red: 100%+ (over budget)
- Shows exact remaining amount (or overage)

**Cart Items:**
- Product photo (if available)
- Brand - Product Name
- "$X.XX × Qty" format
- Subtotal shown clearly
- +/- buttons for quantity
- Swipe left to delete

**Buttons:**
- **Primary Action (Complete Checkout):** Large, prominent, bottom of screen
- **Destructive Action (End Session):** Secondary style, requires confirmation
- **Scan Button:** Opens camera immediately when tapped

**Empty States:**
- Clear messaging: "Your cart is empty. Start scanning!"
- Call-to-action button
- Helpful icon

---

## 📱 KEY SCREENS

### Home Tab
- **No Active Session:** "Start Grocery Session" button, recent trips
- **Active Session:** Session card showing name, store, budget, current total, progress bar

### Scan Tab
- Camera view with scan frame overlay
- Manual entry option
- After scan: Product details form
- Auto-adds to cart on save

### Cart Tab (Main Screen)
- Session info at top
- Budget progress bar
- Running total
- Item list
- "Complete Checkout" button (primary)
- "End Session" button (secondary)

### History Tab
- List of completed checkouts
- Each shows date, store, total, item count
- Tap to view details
- Guest users see signup prompt

### Analytics Tab
- Charts and stats
- Spending trends
- Top products
- Store comparison
- Guest users see signup prompt

---

## 🚀 SUCCESS CRITERIA

### User Behavior Goals
- 70% of sessions end in "Complete Checkout" (not "End Session")
- Average 15 items scanned per session
- 85% of scans successful on first try
- Average session duration: 15-20 minutes
- 60% retention at 30 days

### Technical Goals
- App launch: < 2 seconds
- Barcode scan recognition: < 1 second
- Screen transitions: < 300ms
- Image upload: < 3 seconds
- 99.5% uptime

---

## 🔑 KEY DIFFERENCES

### Complete Checkout vs End Session

| Action | Complete Checkout ✅ | End Session ❌ |
|--------|---------------------|----------------|
| **Purpose** | Finish shopping, save trip | Cancel shopping |
| **Data Saved** | YES - to checkout_sessions & checkout_items | NO - data deleted |
| **History** | YES - appears in History tab | NO - no record |
| **Analytics** | YES - contributes to analytics | NO - not counted |
| **Cart** | Cleared | Cleared |
| **Session** | Deleted | Marked inactive |
| **Use When** | You completed your shopping | You're canceling the trip |

### Authenticated vs Guest

| Feature | Authenticated | Guest |
|---------|--------------|-------|
| **Data Storage** | Supabase database | AsyncStorage (local) |
| **History** | ✅ Full history | ❌ No history |
| **Analytics** | ✅ Full analytics | ❌ No analytics |
| **Cross-device** | ✅ Syncs | ❌ Local only |
| **Price History** | ✅ Tracks over time | ❌ Not tracked |
| **Product Catalog** | ✅ Contributes | ❌ Local only |

---

## 🎯 MVP SCOPE SUMMARY

**INCLUDED in MVP:**
✅ Email/password authentication  
✅ Guest mode (full scanning & cart features)  
✅ Start/end grocery sessions  
✅ Barcode scanning (multiple formats)  
✅ Product photo capture  
✅ Manual product entry  
✅ Real-time cart with running total  
✅ Budget progress indicator  
✅ Update quantities & delete items  
✅ Complete Checkout (saves to history)  
✅ End Session (cancels without saving)  
✅ Shopping history (authenticated only)  
✅ Basic analytics (authenticated only)  
✅ Price comparison alerts  

**EXCLUDED from MVP:**
❌ Edit spending limit mid-session  
❌ Social features (sharing, family budgets)  
❌ Export receipts (PDF/CSV)  
❌ Dark mode  
❌ Onboarding tutorial  
❌ Search/filter in history  
❌ Advanced analytics (ML insights)  
❌ Shopping lists  
❌ Budget alerts/notifications  
❌ Multi-user sessions  

---

## 📝 IMPORTANT NOTES

1. **Budget Philosophy:** Once set, budget CANNOT be edited. This enforces honest budgeting and prevents users from constantly adjusting to justify overspending.

2. **Two Buttons, Two Purposes:**
   - "Complete Checkout" = I finished shopping, save my trip ✅
   - "End Session" = I'm canceling this trip, don't save ❌

3. **Guest Mode Strategy:** Let users try the app without friction, then convert after they see value. No pressure, no tricks.

4. **Simplicity is Key:** Every feature must justify its existence. If it adds complexity without clear value, it's out.

5. **Data Integrity:** For authenticated users, all shopping data flows through proper checkout process. For guests, data stays local and is never sent to database unless they create account.

---

**Document Version:** 1.0  
**Created:** November 2, 2025  
**App Status:** MVP Development  
**Next Review:** After MVP Launch
