# Rollback Guide - App Store Rejection Fixes

This guide provides step-by-step instructions to rollback all changes made to fix the App Store rejection issues, in case you need to revert to the previous version.

## Quick Rollback Commands

```bash
# 1. Checkout previous version from git
git checkout HEAD~1

# 2. Reinstall original dependencies
npm install

# 3. Rollback database migration
supabase db reset
# or manually apply the rollback migration below
```

---

## Files Modified/Created

### Files to Delete (if rolling back)
- `app/(tabs)/settings.tsx` - NEW settings screen
- `supabase/migrations/20251030000000_add_account_deletion.sql` - Account deletion migration
- `ROLLBACK_GUIDE.md` - This file

### Files to Restore to Original Version

1. **app/(tabs)/grocery.tsx**
   - Restore line 133: Change "Continue" back to "Grant Permission"

2. **contexts/AuthContext.tsx**
   - Remove guest mode functionality
   - Remove deleteAccount function
   - Remove AsyncStorage import

3. **app/_layout.tsx**
   - Remove isGuest from auth check
   - Restore original navigation logic

4. **app/login.tsx**
   - Remove "Continue as Guest" button
   - Remove guest mode handler

5. **components/LogoutButton.tsx**
   - Remove guest mode handling
   - Restore original sign-out only functionality

6. **app/(tabs)/_layout.tsx**
   - Remove Settings tab
   - Remove Settings import

7. **package.json**
   - Uninstall @react-native-async-storage/async-storage (optional)

---

## Step-by-Step Rollback Instructions

### Option 1: Git Rollback (Recommended)

If you committed the changes:

```bash
# View recent commits
git log --oneline -5

# Find the commit hash before the changes
# Then reset to that commit
git reset --hard <commit-hash>

# Force push if already pushed (be careful!)
git push --force
```

### Option 2: Manual Rollback

#### Step 1: Rollback Database Migration

Create and apply rollback migration:

**File:** `supabase/migrations/20251030000001_rollback_account_deletion.sql`

```sql
-- Rollback: Remove account deletion functionality

-- Drop the delete_user_account function
DROP FUNCTION IF EXISTS delete_user_account();

-- Revert foreign key constraints (remove CASCADE)
-- Note: Only if your original schema didn't have CASCADE

ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey,
ADD CONSTRAINT cart_items_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_session_id_fkey,
ADD CONSTRAINT cart_items_session_id_fkey 
  FOREIGN KEY (session_id) 
  REFERENCES grocery_sessions(id);

ALTER TABLE scans
DROP CONSTRAINT IF EXISTS scans_user_id_fkey,
ADD CONSTRAINT scans_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

ALTER TABLE grocery_sessions
DROP CONSTRAINT IF EXISTS grocery_sessions_user_id_fkey,
ADD CONSTRAINT grocery_sessions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

ALTER TABLE checkout_sessions
DROP CONSTRAINT IF EXISTS checkout_sessions_user_id_fkey,
ADD CONSTRAINT checkout_sessions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);
```

Apply rollback:
```bash
supabase db push
```

#### Step 2: Restore grocery.tsx

```tsx
// Line 133 - Change back to:
<Text style={styles.primaryButtonText}>Grant Permission</Text>
```

#### Step 3: Restore AuthContext.tsx

Remove all guest mode and account deletion code, restore to:

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Step 4: Restore app/_layout.tsx

```tsx
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [user, segments, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
```

#### Step 5: Restore login.tsx

Remove guest mode button and handler, restore original:

```tsx
// Remove handleGuestMode function
// Remove the divider and guest button sections
// Keep only the original login/signup form
```

#### Step 6: Restore LogoutButton.tsx

```tsx
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <LogOut size={24} color="#ef4444" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
  },
});
```

#### Step 7: Restore app/(tabs)/_layout.tsx

Remove Settings tab:

```tsx
import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Camera, History, BarChart3 } from 'lucide-react-native';
import LogoutButton from '@/components/LogoutButton';

// Remove Settings import and tab screen
```

#### Step 8: Delete Settings Screen

```bash
rm app/(tabs)/settings.tsx
```

#### Step 9: Uninstall AsyncStorage (Optional)

```bash
npm uninstall @react-native-async-storage/async-storage
```

---

## Verification After Rollback

After rolling back, verify:

1. ✅ App requires login on launch (no guest mode)
2. ✅ Camera permission shows "Grant Permission" button
3. ✅ No Settings tab in navigation
4. ✅ Logout button shows only red logout icon
5. ✅ No account deletion option available
6. ✅ App compiles without errors

```bash
# Test compilation
npm run ios
# or
npm run android
```

---

## Git Commands for Rollback

### If changes were committed:

```bash
# See commit history
git log --oneline

# Revert specific commit (creates new commit)
git revert <commit-hash>

# Or reset to before changes (destructive)
git reset --hard <commit-hash-before-changes>

# If you need to undo the reset
git reflog
git reset --hard HEAD@{1}
```

### If changes not committed:

```bash
# Discard all changes
git reset --hard HEAD

# Or discard specific files
git checkout HEAD -- app/(tabs)/grocery.tsx
git checkout HEAD -- contexts/AuthContext.tsx
# etc...
```

---

## Emergency Rollback Checklist

- [ ] Backup current state before rollback
- [ ] Rollback database migration
- [ ] Restore all modified files
- [ ] Delete new files (settings.tsx)
- [ ] Uninstall AsyncStorage (optional)
- [ ] Test app compilation
- [ ] Test app functionality
- [ ] Verify all features work as before

---

## Partial Rollback Options

You can rollback individual features if needed:

### Rollback Only Account Deletion
- Delete `app/(tabs)/settings.tsx`
- Remove Settings tab from `app/(tabs)/_layout.tsx`
- Remove `deleteAccount()` from `contexts/AuthContext.tsx`
- Run database rollback migration

### Rollback Only Guest Mode
- Restore `contexts/AuthContext.tsx` (remove guest functions)
- Restore `app/_layout.tsx` (remove isGuest check)
- Restore `app/login.tsx` (remove guest button)
- Restore `components/LogoutButton.tsx` (remove guest handling)
- Uninstall AsyncStorage

### Rollback Only Camera Permission Text
- Restore line 133 in `app/(tabs)/grocery.tsx`
- Change "Continue" back to "Grant Permission"

---

## Support

If you encounter issues during rollback:
1. Check git reflog for recent states
2. Ensure database is properly rolled back
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. Clear build cache: `npx expo start -c`

## Important Notes

- **Database:** If users already have data, rolling back CASCADE deletes may cause issues
- **AsyncStorage:** Guest data will be lost after uninstalling the package
- **Git:** Always commit before making major changes
- **Testing:** Test thoroughly in development before deploying rollback to production

---

**Last Updated:** October 30, 2025
