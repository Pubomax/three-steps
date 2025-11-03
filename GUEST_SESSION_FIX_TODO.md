# Guest Session Support - Remaining Work

## ✅ What's Been Fixed
1. Cart screen (`app/(tabs)/index.tsx`) now loads active session from AsyncStorage for guests
2. Cart screen loads cart items from AsyncStorage for guests (key: `guest_cart_{sessionId}`)
3. `StartGroceryFlow.tsx` creates guest sessions properly with cleanup

## ❌ What Still Needs Fixing

### Critical - Cart Operations for Guests
In `app/(tabs)/index.tsx`, these functions need guest support:

1. **updateQuantity** - Line ~181-193
   - Should update AsyncStorage instead of Supabase for guests
   
2. **deleteItem** - Line ~195-204
   - Should update AsyncStorage instead of Supabase for guests

3. **saveSpendingLimit** - Line ~206-227
   - Should update AsyncStorage instead of Supabase for guests

4. **clearCart** - Line ~230-252
   - Should update AsyncStorage instead of Supabase for guests

5. **completeCheckout** - Line ~254-337
   - Guest checkout should just clear the session and cart from AsyncStorage

6. **endSession** button handler - Line ~382-410
   - Should update AsyncStorage for guests

### Critical - Session Detail Screen
File: `app/grocery-session/[id].tsx`

Needs complete guest support:
- Detect if `id` starts with "guest-"
- Load session from AsyncStorage if guest
- Load items from AsyncStorage if guest
- All operations (delete, update) need AsyncStorage support

### TypeScript Errors
The TypeScript errors in index.tsx are because Supabase calls are typed as `never` when they shouldn't execute. These can be fixed by:
- Adding `// @ts-ignore` comments OR
- Wrapping in `if (!isGuest)` checks

## Quick Fix Pattern

For each function, wrap database calls like this:

```typescript
const someFunction = async () => {
  if (isGuest) {
    // AsyncStorage logic here
    const cartJson = await AsyncStorage.getItem(`guest_cart_${activeSession.id}`);
    const cart = cartJson ? JSON.parse(cartJson) : [];
    // ... modify cart ...
    await AsyncStorage.setItem(`guest_cart_${activeSession.id}`, JSON.stringify(cart));
  } else {
    // Existing Supabase logic
  }
};
```

## Testing
Once fixed, test:
1. Create guest session ✅ (works now)
2. View session in cart screen ✅ (works now - should show the session info)
3. Add items to cart (needs AsyncStorage implementation)
4. Update quantities (needs AsyncStorage implementation)
5. Complete checkout (needs AsyncStorage implementation)
