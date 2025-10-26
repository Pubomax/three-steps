# MVP Testing Checklist

## Pre-Testing Setup

### Developer Setup (Before Inviting Testers)
- [ ] Supabase project is created and all 8 migrations are run
- [ ] Storage bucket "product-images" is created and public
- [ ] .env file contains correct Supabase URL and anon key
- [ ] App runs successfully on at least one device (iOS or Android)
- [ ] Test account can be created successfully
- [ ] At least one complete flow tested end-to-end

### Tester Onboarding
- [ ] Share repository or deployment link with testers
- [ ] Provide Supabase credentials (via secure channel)
- [ ] Send README.md setup instructions
- [ ] Set up feedback collection channel (email/Slack/Discord)
- [ ] Communicate testing timeframe and expectations

## Core User Flows to Test

### 1. Authentication Flow
- [ ] Sign up with new email/password works
- [ ] Sign in with existing credentials works
- [ ] Invalid credentials show appropriate error
- [ ] User stays logged in after closing app
- [ ] Logout works correctly

### 2. Create Grocery Session
- [ ] Open app and tap "Start Grocery" from home
- [ ] Step 1: Enter session name (e.g., "Weekly Shopping")
- [ ] Step 2: Enter store information
- [ ] Step 3: Set spending limit
- [ ] Step 4: Select grocery type
- [ ] Session appears as active in Cart tab
- [ ] Only one session can be active at a time

### 3. Scan and Add Products
- [ ] Camera permission is requested and granted
- [ ] QR code scanning works with barcodes
- [ ] Manual QR code entry works
- [ ] Photo capture works
- [ ] All product fields can be filled (brand, name, price, store)
- [ ] "Add to cart" checkbox works
- [ ] Product saves successfully
- [ ] Price comparison alert shows when scanning same product again

### 4. Cart Management
- [ ] Cart shows all added items
- [ ] Quantities can be increased/decreased
- [ ] Items can be removed
- [ ] Cart total calculates correctly
- [ ] Over-budget warning appears when limit exceeded
- [ ] Spending limit can be edited
- [ ] Clear cart works

### 5. Checkout Process
- [ ] "Complete Checkout" button is enabled when items in cart
- [ ] Confirmation dialog shows correct total and item count
- [ ] "Processing..." loading state shows during checkout
- [ ] Checkout completes successfully
- [ ] Cart is cleared after checkout
- [ ] Active session is ended

### 6. History View
- [ ] Completed checkout sessions appear in history
- [ ] Sessions are grouped by month
- [ ] Expanding session shows item details
- [ ] All-time statistics (trips, items, total) are accurate
- [ ] Can navigate to session details

### 7. Analytics
- [ ] Total spending displays correctly
- [ ] Average price and scan count are accurate
- [ ] Most/least expensive products show correctly
- [ ] Top 5 purchased products list is accurate
- [ ] Price trends show increases/decreases
- [ ] Recommendations appear (products to keep/avoid)

## Edge Cases to Test

### Session Management
- [ ] Try creating second session while one is active (should prompt to end first)
- [ ] End session without items in cart
- [ ] End session with items in cart (should checkout or warn)

### Product Scanning
- [ ] Scan same QR code twice in different stores
- [ ] Scan product without taking photo
- [ ] Enter very long product names
- [ ] Enter extreme prices (0.01, 9999.99)
- [ ] Try to save without filling required fields

### Cart Behavior
- [ ] Add 50+ items to cart (performance test)
- [ ] Set spending limit to $0
- [ ] Set spending limit lower than current cart total
- [ ] Add item with $0 price

### Network Issues
- [ ] Turn off WiFi during product save
- [ ] Turn off WiFi during checkout
- [ ] Slow connection behavior
- [ ] App behavior when Supabase is down

### UI/UX
- [ ] App works on different screen sizes
- [ ] Scrolling works smoothly in all screens
- [ ] Pull-to-refresh works where available
- [ ] Navigation between tabs is smooth
- [ ] Back button behavior is intuitive

## Known Issues to Monitor

### TypeScript Warnings
- App has TypeScript type checking warnings (non-blocking)
- These don't affect runtime functionality
- Will be fixed post-MVP

### Missing Features (By Design)
- [ ] No offline mode (requires internet)
- [ ] No data export functionality
- [ ] No multi-store price comparison view
- [ ] No product search/filter in analytics
- [ ] No edit/delete for historical data
- [ ] No barcode database integration (manual entry required)

## Bug Reporting Template

When testers find issues, ask them to provide:

```
**Issue Title:** Brief description

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Device Info:**
- Device: iPhone 14 / Samsung Galaxy S23 / etc.
- OS Version: iOS 17 / Android 13 / etc.
- App Version: 1.0.0

**Screenshots:**
[Attach screenshots]

**Additional Context:**
Any other relevant information
```

## Post-Testing Debrief Questions

Ask testers:
1. What was confusing or unclear?
2. What features would you want most?
3. Did any workflow feel tedious or slow?
4. Would you use this app for your actual grocery shopping?
5. Any features you expected but didn't find?
6. How does it compare to how you currently track groceries?

## Success Criteria for MVP

- [ ] 80%+ of testers can complete full workflow without help
- [ ] No critical bugs that prevent core functionality
- [ ] Average session doesn't crash
- [ ] Positive feedback on core concept
- [ ] Testers express interest in continued use

## Next Steps After Testing

Based on feedback:
1. Fix critical bugs identified
2. Prioritize most requested features
3. Improve confusing UX flows
4. Optimize performance bottlenecks
5. Plan v1.1 feature set

---

**Testing Period:** [START DATE] to [END DATE]
**Number of Testers:** [X] users
**Feedback Channel:** [Email/Slack/Discord]
**Point of Contact:** [Your Name/Email]
