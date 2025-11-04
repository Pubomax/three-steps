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
        try {
          const sessionsJson = await AsyncStorage.getItem('guest_sessions');
          if (sessionsJson) {
            await migrateGuestDataToUser();
          }
        } catch {}
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

      const { error: fnError } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id },
      });
      if (fnError) {
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

  const migrateGuestDataToUser = async () => {
    try {
      const sessionsJson = await AsyncStorage.getItem('guest_sessions');
      if (!sessionsJson) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const guestSessions = JSON.parse(sessionsJson);
      for (const s of guestSessions) {
        const { data: createdSession } = await supabase
          .from('grocery_sessions')
          .insert({
            user_id: user.id,
            name: s.name,
            store_name: s.store_name ?? null,
            store_location: s.store_location ?? null,
            spending_limit: s.spending_limit ?? null,
            grocery_type: s.grocery_type ?? 'regular',
            is_active: !!s.is_active,
            started_at: s.started_at ?? new Date().toISOString(),
            status: s.status ?? 'in_progress',
          })
          .select('id')
          .single();

        if (!createdSession) continue;

        const cartKey = `guest_cart_${s.id}`;
        const cartJson = await AsyncStorage.getItem(cartKey);
        if (cartJson) {
          const cart = JSON.parse(cartJson);
          for (const item of cart) {
            // Attempt to find existing product by QR; if not present, create minimal product
            let productId = item.product_id;
            if (item.product_id && typeof item.product_id === 'string') {
              const { data: existingProduct } = await supabase
                .from('products')
                .select('id')
                .eq('qr_code', item.product_id)
                .maybeSingle();
              if (existingProduct) {
                productId = existingProduct.id;
              } else {
                const { data: newProduct } = await supabase
                  .from('products')
                  .insert({
                    qr_code: item.product_id,
                    brand: item.products?.brand ?? null,
                    name: item.products?.name ?? 'Unknown',
                    image_url: item.products?.image_url ?? null,
                  })
                  .select('id')
                  .single();
                if (newProduct) productId = newProduct.id;
              }
            }

            await supabase.from('cart_items').insert({
              user_id: user.id,
              session_id: createdSession.id,
              product_id: productId,
              price: item.price,
              quantity: item.quantity || 1,
            });
          }
        }
      }

      await AsyncStorage.removeItem('guest_sessions');
      const keys = await AsyncStorage.getAllKeys();
      const guestCartKeys = keys.filter((k) => k.startsWith('guest_cart_'));
      if (guestCartKeys.length) await AsyncStorage.multiRemove(guestCartKeys);
    } catch {}
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
