import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AppUser, UserRole } from '@/types/database.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  appUserLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  // THE FIX: separate loading flags for session + appUser
  const [loading, setLoading] = useState(true);
  const [appUserLoading, setAppUserLoading] = useState(true);

  const fetchAppUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching app user:', error);
      return null;
    }
    return data;
  };

  const refreshAppUser = async () => {
    if (!session?.user) return;

    setAppUserLoading(true);
    const userData = await fetchAppUser(session.user.id);
    setAppUser(userData);
    setAppUserLoading(false);
  };

  useEffect(() => {
    // INITIAL SESSION LOAD
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userData = await fetchAppUser(session.user.id);
        setAppUser(userData);
      }

      setLoading(false);
      setAppUserLoading(false);
    });

    // AUTH STATE CHANGE LISTENER
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setAppUserLoading(true);
          const userData = await fetchAppUser(session.user.id);
          setAppUser(userData);
          setAppUserLoading(false);
        } else {
          setAppUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string
  ) => {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    const isAlwaysLoggedIn = role === 'staff';
    const requiresBiometric = role === 'manager' || role === 'owner';

    const insertData = {
      id: data.user.id,
      email,
      full_name: fullName || null,
      role,
      is_always_logged_in: isAlwaysLoggedIn,
      requires_biometric: requiresBiometric,
    };

    const { error: profileError } = await supabase
      .from('app_users')
      .insert(insertData);

    if (profileError) throw profileError;

    // Optional: auto-login after sign-up
    await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        appUser,
        loading,
        appUserLoading,
        signIn,
        signUp,
        signOut,
        refreshAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
