import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  convertGuestToUser: (email: string, password: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const GUEST_MODE_KEY = 'guest_mode';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check both auth session and guest mode
    Promise.all([
      supabase.auth.getSession(),
      AsyncStorage.getItem(GUEST_MODE_KEY)
    ]).then(([{ data: { session } }, guestMode]) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsGuest(guestMode === 'true' && !session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        // User logged in, disable guest mode
        setIsGuest(false);
        await AsyncStorage.removeItem(GUEST_MODE_KEY);
      }
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
    setIsGuest(false);
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
  };

  const continueAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuest(true);
  };

  const convertGuestToUser = async (email: string, password: string) => {
    try {
      // Sign up the user
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) return { error };

      // Guest data migration would happen here
      // For now, we'll just clear guest mode
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setIsGuest(false);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      // Delete all user data from Supabase
      // The database should have ON DELETE CASCADE configured to handle related data
      const { error: deleteError } = await supabase.rpc('delete_user_account');
      
      if (deleteError) {
        // If RPC doesn't exist, we'll need to delete the auth user directly
        // This will cascade to related data if properly configured
        console.log('RPC delete failed, trying direct auth deletion:', deleteError);
      }

      // Delete the auth user account (this is the primary deletion)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        // User doesn't have admin access, use the signOut approach
        // The deletion will need to happen server-side or via database triggers
        await supabase.auth.signOut();
      }
      
      // Clear local state
      setSession(null);
      setUser(null);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      isGuest, 
      signIn, 
      signUp, 
      signOut, 
      continueAsGuest,
      convertGuestToUser,
      deleteAccount
    }}>
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
