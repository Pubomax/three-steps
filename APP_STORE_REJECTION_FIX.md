# App Store Rejection Fixes - Guideline 5.1.1

**Submission ID:** e541fbd3-fc02-4b97-8327-a540eeb7bf69  
**Review Date:** October 29, 2025  
**Version Reviewed:** 1.0  

## Issues Identified

### Issue 1: Camera Permission Button Text
**Guideline:** 5.1.1 - Legal - Privacy - Data Collection and Storage

**Problem:** The app displayed a custom message before the camera permission request with inappropriate button text "Grant Permission". Apple requires that permission request buttons use neutral words like "Continue" or "Next" instead of directing users to grant permission.

### Issue 2: Mandatory Account Registration
**Guideline:** 5.1.1(v) - Account Sign-In

**Problem:** The app required users to register or log in before accessing any features. Apple requires that non-account-based features be accessible without requiring users to enter personal information.

### Issue 3: Missing Account Deletion
**Guideline:** 5.1.1(v) - Data Collection and Storage

**Problem:** The app supports account creation but does not include an option to initiate account deletion. Apps that support account creation must also offer account deletion to give users control of their data.

---

## Solution 1: Camera Permission Button Text

### File Modified: `app/(tabs)/grocery.tsx`

**Changed button text from:**
```tsx
<Text style={styles.primaryButtonText}>Grant Permission</Text>
```

**To:**
```tsx
<Text style={styles.primaryButtonText}>Continue</Text>
```

### Implementation Details

- **Location:** Line 133 in `app/(tabs)/grocery.tsx`
- **Context:** The permission screen displays before requesting camera access
- **Message Display:** The custom message "Camera Access Required" and explanation text remain unchanged (this is allowed by Apple)
- **Only Change:** Button text changed from "Grant Permission" to "Continue"

### Compliance with Apple Guidelines

✅ **Before:** Custom message explaining why camera access is needed  
✅ **During:** Button with neutral text ("Continue") that triggers permission request  
✅ **After:** Native iOS permission dialog appears (controlled by the system)

---

## Solution 2: Guest Mode Implementation

### Overview

Implemented full guest mode that allows users to use all app features without creating an account. Guest data is stored locally on the device using AsyncStorage. Users can optionally create an account later to sync their data across devices.

### Files Modified

1. **contexts/AuthContext.tsx** - Added guest mode support
2. **app/_layout.tsx** - Updated navigation logic to allow guest access
3. **app/login.tsx** - Added "Continue as Guest" button
4. **components/LogoutButton.tsx** - Updated to show guest mode indicator
5. **package.json** - Added @react-native-async-storage/async-storage dependency

### Key Changes

#### 1. AuthContext Updates (`contexts/AuthContext.tsx`)

Added new functionality:
- `isGuest` state to track guest mode
- `continueAsGuest()` function to enable guest mode
- `convertGuestToUser()` function for future guest-to-user migration
- AsyncStorage integration for persistent guest mode state

```tsx
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;  // NEW
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;  // NEW
  convertGuestToUser: (email: string, password: string) => Promise<{ error: Error | null }>;  // NEW
};
```

#### 2. App Layout Updates (`app/_layout.tsx`)

Updated navigation logic to allow both authenticated users AND guests to access the app:

```tsx
const isAuthenticated = user || isGuest;

if (!isAuthenticated && inAuthGroup) {
  router.replace('/login');
} else if (isAuthenticated && !inAuthGroup) {
  router.replace('/(tabs)/home');
}
```

#### 3. Login Screen Updates (`app/login.tsx`)

Added "Continue as Guest" button with divider:
- Users can now skip account creation
- Button styled with outline to differentiate from primary action
- Handles guest mode activation and navigation

#### 4. Logout Button Updates (`components/LogoutButton.tsx`)

Enhanced to support guest mode:
- Shows different icon for guest users (UserPlus icon with styled border)
- Different alert dialog for guests offering to create account or exit guest mode
- Maintains existing sign-out functionality for authenticated users

### Guest Mode Features

✅ **Full App Access:** Guest users can access all features without an account  
✅ **Local Storage:** All guest data stored locally using AsyncStorage  
✅ **No Registration Required:** Users can explore and use the app immediately  
✅ **Optional Account Creation:** Guests can create an account anytime via the button in header  
✅ **Data Isolation:** Guest data remains on device until account is created  
✅ **Apple Compliant:** Meets guideline 5.1.1(v) requirements  

---

## Solution 3: Account Deletion Feature

### Overview

Implemented complete account deletion functionality allowing users to permanently delete their accounts and all associated data directly from within the app. The feature includes multiple confirmation steps and clear warnings about data loss.

### Files Created/Modified

1. **app/(tabs)/settings.tsx** - NEW: Complete settings screen with account deletion
2. **app/(tabs)/_layout.tsx** - Added Settings tab to navigation
3. **contexts/AuthContext.tsx** - Added `deleteAccount()` function
4. **supabase/migrations/20251030000000_add_account_deletion.sql** - NEW: Database migration for proper data cleanup

### Key Changes

#### 1. Settings Screen (`app/(tabs)/settings.tsx`)

Complete account settings interface with:
- **Account Information Display:** Shows user email and account status
- **Sign Out Option:** Standard sign-out functionality
- **Delete Account Section:** Clearly marked "Danger Zone" with account deletion
- **Guest Mode Support:** Special UI for guest users encouraging account creation
- **Multiple Confirmations:** Two-step confirmation process to prevent accidental deletion

**Deletion Flow:**
1. User taps "Delete Account" button
2. First alert explains what will be deleted (sessions, history, scans, cart items, personal data)
3. Second confirmation asks "Are you absolutely sure?"
4. Account and all data deleted
5. User redirected to login screen with confirmation message

#### 2. Navigation Updates (`app/(tabs)/_layout.tsx`)

Added new Settings tab:
- Icon: Settings gear icon
- Location: Added as 6th tab after Analytics
- Accessible to both authenticated users and guests
- Header shows logout/guest indicator

#### 3. Auth Context Updates (`contexts/AuthContext.tsx`)

Added `deleteAccount()` function:
```tsx
const deleteAccount = async () => {
  // Call Supabase RPC function to delete all user data
  await supabase.rpc('delete_user_account');
  
  // Sign out and clear local state
  await supabase.auth.signOut();
  setSession(null);
  setUser(null);
};
```

#### 4. Database Migration (`supabase/migrations/20251030000000_add_account_deletion.sql`)

Created secure database function and updated constraints:
- **Function:** `delete_user_account()` - Deletes all user-associated data
- **Security:** SECURITY DEFINER ensures proper permissions
- **Cascade Deletes:** Updated all foreign key constraints to include ON DELETE CASCADE
- **Tables Affected:** cart_items, scans, grocery_sessions, checkout_sessions
- **Preserved Data:** Products and stores (shared resources) are not deleted

### Account Deletion Features

✅ **Easy Access:** Dedicated Settings tab accessible from main navigation  
✅ **Multiple Confirmations:** Two-step confirmation prevents accidental deletion  
✅ **Clear Warnings:** Users informed about permanent data loss  
✅ **Complete Deletion:** All user data removed including sessions, scans, cart items  
✅ **Secure Process:** Database-level cascade deletes ensure complete cleanup  
✅ **No External Steps:** All deletion happens within the app (no emails or phone calls required)  
✅ **Apple Compliant:** Meets guideline 5.1.1(v) account deletion requirements  

---

## Testing Verification

### Camera Permission Fix
1. Clean install the app
2. Continue as guest or login
3. Navigate to the Grocery tab with an active session
4. The permission screen should display with "Continue" button
5. Tapping "Continue" triggers the native iOS permission dialog

### Guest Mode Fix
1. Clean install the app
2. Login screen should show "Continue as Guest" button
3. Tap "Continue as Guest" - should navigate to home screen
4. Guest indicator (UserPlus icon) should appear in header
5. Can use all app features without an account
6. Tapping guest indicator shows options to create account or exit
7. Data persists between app sessions while in guest mode

### Account Deletion Fix
1. Create an account or sign in
2. Navigate to Settings tab (gear icon)
3. Scroll to "Danger Zone" section
4. Tap "Delete Account"
5. First confirmation dialog appears with list of data to be deleted
6. Second confirmation dialog asks "Are you absolutely sure?"
7. After confirmation, account and all data are deleted
8. User redirected to login screen with success message

---

## Dependencies Added

```bash
npm install @react-native-async-storage/async-storage
```

This package is required for:
- Persistent guest mode state across app restarts
- Local storage of guest data
- Future guest-to-user data migration

---

## Database Migration Required

Apply the account deletion migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually apply the migration file:
# supabase/migrations/20251030000000_add_account_deletion.sql
```

This migration:
- Creates `delete_user_account()` function
- Updates foreign key constraints to CASCADE on delete
- Ensures complete data cleanup when accounts are deleted

---

## Compliance Summary

### Guideline 5.1.1 - Camera Permission
✅ **Compliant:** Button text uses neutral language ("Continue")  
✅ **Compliant:** Provides context about why permission is needed  
✅ **Compliant:** Respects user control over personal information  

### Guideline 5.1.1(v) - Account Sign-In
✅ **Compliant:** Users can access all features without creating an account  
✅ **Compliant:** Registration is optional, not mandatory  
✅ **Compliant:** No personal information required to use the app  
✅ **Compliant:** Account creation offers benefits (sync across devices) but isn't required  

### Guideline 5.1.1(v) - Account Deletion
✅ **Compliant:** Account deletion option clearly available in Settings tab  
✅ **Compliant:** Deletion is permanent (not temporary deactivation)  
✅ **Compliant:** No external steps required (no emails, phone calls, website visits)  
✅ **Compliant:** Multiple confirmations prevent accidental deletion  
✅ **Compliant:** All user data completely removed from database  

---

## Next Steps for Resubmission

1. ✅ Camera permission button text fixed
2. ✅ Guest mode implemented
3. ✅ Account deletion feature added
4. ✅ Dependencies installed
5. ✅ Database migration created
6. Apply database migration to Supabase
7. Build new version with EAS Build
8. Submit updated build to App Store Connect
9. Respond to App Store review with explanation of fixes
10. Wait for re-review

## Pre-Submission Checklist

- [ ] Run database migration: `supabase db push`
- [ ] Test account creation
- [ ] Test guest mode
- [ ] Test account deletion (with test account)
- [ ] Test camera permission flow
- [ ] Verify Settings tab is accessible
- [ ] Build iOS app: `eas build --platform ios --profile production`
- [ ] Submit to App Store: `eas submit --platform ios --latest`

---

## Build Commands

```bash
# Apply database migration
supabase db push

# Install dependencies (if not already done)
npm install

# Build new iOS version
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

---

## Review Response Template

When resubmitting, include this message in App Store Connect:

---

**Resolution of Guideline 5.1.1 Issues**

We have addressed all three issues identified in the review:

**1. Camera Permission Button Text (Guideline 5.1.1 - Privacy)**

Changes Made:
- Updated the button text from "Grant Permission" to "Continue" on the camera permission screen
- The button now uses neutral language as required by Apple's guidelines
- All other aspects of the permission request remain compliant

File Modified:
- `app/(tabs)/grocery.tsx` - Line 133

**2. Account Registration Requirement (Guideline 5.1.1(v) - Account Sign-In)**

Changes Made:
- Implemented full guest mode allowing users to access all app features without registration
- Added "Continue as Guest" button on login screen
- Guest data is stored locally on the device using AsyncStorage
- Users can optionally create an account later to sync data across devices

Files Modified:
- `contexts/AuthContext.tsx` - Added guest mode support
- `app/_layout.tsx` - Updated navigation to allow guest access
- `app/login.tsx` - Added guest mode button
- `components/LogoutButton.tsx` - Added guest mode indicator

**3. Account Deletion (Guideline 5.1.1(v) - Data Collection and Storage)**

Changes Made:
- Added complete account deletion feature accessible from Settings tab
- Users can permanently delete their accounts and all associated data
- Multiple confirmation steps prevent accidental deletion
- All deletion happens within the app (no external steps required)
- Database-level cascade deletes ensure complete data removal

Files Added/Modified:
- `app/(tabs)/settings.tsx` - NEW: Complete settings screen with deletion
- `app/(tabs)/_layout.tsx` - Added Settings tab
- `contexts/AuthContext.tsx` - Added deleteAccount() function
- Database migration for proper data cleanup

Key Features:
- Settings tab clearly visible in main navigation
- "Delete Account" option in dedicated "Danger Zone" section
- Two-step confirmation process with clear warnings
- Permanent deletion of all user data (sessions, scans, cart items, personal information)
- No requirement to contact support or visit external website

All three changes ensure full compliance with Apple's App Store Review Guidelines 5.1.1 regarding privacy, data collection, account requirements, and account deletion.

---

## Date Fixed
October 30, 2025

## Version for Resubmission
1.0.1 (or next version number)
