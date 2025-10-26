# Known Issues & Technical Debt

This document tracks known issues, limitations, and technical debt in the Three Steps MVP.

## Status: MVP Ready for Testing ✅

The app is **functionally complete** and ready for 5-15 user testing despite the items listed below.

---

## Critical Issues

None at this time.

---

## TypeScript Type Issues (Non-Blocking)

**Status:** 🟡 Technical Debt
**Impact:** Development only - does not affect runtime
**Priority:** Medium (fix post-MVP)

### Description
The codebase has TypeScript type checking errors where Supabase table types are being inferred as `never`. This is a type system issue, not a runtime issue.

### Affected Files
- `app/(tabs)/analytics.tsx`
- `app/(tabs)/grocery.tsx`
- `app/(tabs)/history.tsx`
- `app/(tabs)/index.tsx`
- `app/grocery-session/[id].tsx`
- `components/StartGroceryFlow.tsx`

### Why This Doesn't Block MVP
- JavaScript runs at runtime, not TypeScript
- All database operations work correctly in the running app
- Type errors only appear during `npm run typecheck`
- No impact on end users or testers

### Root Cause
Database type definitions in `types/database.ts` aren't being properly recognized by the Supabase client's type inference system. This is likely due to:
1. Schema changes added via migrations not being fully reflected in type definitions
2. Possible version mismatch between Supabase client and type generation

### Fix Plan
- [ ] Regenerate database types using Supabase CLI `supabase gen types typescript`
- [ ] Or manually verify all migration fields are in `types/database.ts`
- [ ] Add type assertions as temporary workaround if needed
- [ ] Consider upgrading to latest Supabase client version

---

## Feature Limitations (By Design for MVP)

### No Offline Support
**Status:** 🔴 Not Implemented
**Reason:** MVP scope limitation
**Workaround:** Requires constant internet connection

**Future Enhancement:**
- Implement local SQLite cache
- Queue operations when offline
- Sync when connection restored

### No Data Export
**Status:** 🔴 Not Implemented
**Reason:** MVP scope limitation
**Workaround:** None currently

**Future Enhancement:**
- Export to CSV
- Export to PDF receipt format
- Email export functionality

### Limited Barcode Support
**Status:** 🟡 Partial Implementation
**Supported:** QR codes, EAN-13, EAN-8, UPC-A, UPC-E
**Not Supported:** Some specialty barcodes

**Future Enhancement:**
- Integrate with barcode database (UPC Database, Open Food Facts)
- Auto-fill product info from barcode
- Support more barcode formats

### No Multi-Store Price Comparison View
**Status:** 🔴 Not Implemented
**Reason:** MVP scope limitation
**Current:** Analytics show overall trends only

**Future Enhancement:**
- Side-by-side store comparison
- Map view with nearby store prices
- Price history charts per store

### Image Upload Performance
**Status:** 🟡 Known Limitation
**Issue:** First-time uploads can take 2-5 seconds on slower connections
**Workaround:** Shows "Saving..." indicator

**Future Enhancement:**
- Image compression before upload
- Background upload queue
- Progress indicator

---

## UI/UX Improvements Needed

### Loading States
**Status:** ✅ Mostly Complete
**Completed:**
- Checkout loading state
- Cart refresh indicator
- Product save loading

**Still Needed:**
- Image upload progress bar
- Analytics calculation loader
- History pagination loading

### Error Handling
**Status:** 🟡 Basic Implementation
**Current:** Try-catch with generic error messages
**Needed:**
- Specific error messages for different failure types
- Retry logic for network failures
- Better user guidance on errors

### Form Validation
**Status:** 🟡 Basic Implementation
**Current:** Required field checks only
**Needed:**
- Email format validation
- Price input validation (prevent negative, validate decimals)
- Character limits on text fields
- Store name suggestions/autocomplete

---

## Performance Concerns

### No Pagination
**Status:** 🟡 Known Limitation
**Affected:** History, Analytics
**Issue:** Will slow down with 100+ shopping trips
**Future Fix:** Implement pagination or infinite scroll

### No Data Caching
**Status:** 🟡 Known Limitation
**Issue:** Every screen refresh fetches from database
**Future Fix:** Implement React Query or similar caching layer

### Image Storage in Database
**Status:** ✅ Fixed in MVP
**Previous:** Stored base64 in database (bloat risk)
**Current:** Uses Supabase Storage (proper solution)

---

## Security Considerations

### Environment Variable Exposure
**Status:** ✅ Properly Handled
**Implementation:** Using EXPO_PUBLIC_ prefix (acceptable for public keys)
**Note:** Anon key is meant to be public, RLS policies protect data

### Row-Level Security
**Status:** ✅ Implemented
**Coverage:** All tables have RLS policies
**Verified:** Users can only access their own data

### Input Sanitization
**Status:** 🟡 Minimal
**Current:** Relying on Supabase parameterized queries
**Future:** Add explicit input validation/sanitization

---

## Testing Gaps

### No Automated Tests
**Status:** 🔴 Not Implemented
**Coverage:** 0%
**Risk Level:** Medium for MVP, High for production

**Future Implementation:**
- [ ] Unit tests for utility functions
- [ ] Integration tests for database operations
- [ ] E2E tests for critical user flows
- [ ] Component testing with React Testing Library

### No Error Monitoring
**Status:** 🔴 Not Implemented
**Future:** Integrate Sentry or similar service

### No Analytics Tracking
**Status:** 🔴 Not Implemented
**Future:** Add usage analytics (Mixpanel, Amplitude, etc.)

---

## Documentation Gaps

### API Documentation
**Status:** 🔴 Not Created
**Needed for:** Future contributors, API changes

### Component Documentation
**Status:** 🔴 Minimal
**Future:** Add JSDoc comments to all components

### Database Schema Documentation
**Status:** 🟡 Partial
**Current:** Comments in migration files
**Needed:** Comprehensive schema diagram

---

## Deployment Readiness

### Not Ready For:
- ❌ Public App Store release
- ❌ Production deployment with real users
- ❌ Marketing/public launch

### Ready For:
- ✅ Closed beta testing (5-15 users)
- ✅ Internal testing
- ✅ Proof of concept demonstrations
- ✅ User feedback collection

---

## Priority Fixes for Post-MVP

### High Priority
1. Fix TypeScript type errors
2. Add automated tests for critical flows
3. Implement error monitoring (Sentry)
4. Add pagination to history/analytics
5. Improve error messages and handling

### Medium Priority
1. Add data export functionality
2. Implement data caching layer
3. Add input validation and sanitization
4. Create proper API documentation
5. Add offline support basics (cache recently viewed data)

### Low Priority
1. Integrate barcode database
2. Add multi-store comparison view
3. Optimize image upload performance
4. Add usage analytics
5. Create comprehensive test suite

---

## How to Report New Issues

When you discover a new issue:

1. Check if it's already listed here
2. Determine severity:
   - **Critical:** Blocks core functionality
   - **High:** Significant but has workaround
   - **Medium:** Affects UX but not blocking
   - **Low:** Nice to have / minor annoyance

3. Add to appropriate section with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Suggested fix (if known)

---

**Last Updated:** 2025-10-25
**MVP Version:** 1.0.0
**Status:** Ready for Limited User Testing
