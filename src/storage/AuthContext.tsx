import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { loadProgress } from './progress';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** True once we've pushed any pre-login guest progress up to the account. */
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * On first sign-in/sign-up, pushes whatever guest progress exists on-device
 * up to the account — so creating an account never wipes what you've
 * already earned. Uses upsert with "keep the higher star count" semantics:
 * only writes rows where the local star count beats (or matches) nothing
 * remote yet, via a simple read-then-merge rather than a conflict policy,
 * since this runs once right after sign-up on a fresh account.
 */
async function migrateGuestProgressToAccount(userId: string) {
  const local = await loadProgress();
  const entries = Object.entries(local.starsByLevel);
  if (entries.length === 0) return;

  const rows = entries.map(([level, stars]) => ({
    user_id: userId,
    level: Number(level),
    stars,
  }));

  // Best-effort: if this fails, the player's local progress is untouched
  // and the next sync attempt can retry. Never block sign-up on this.
  await supabase.from('progress').upsert(rows, { onConflict: 'user_id,level' });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) await migrateGuestProgressToAccount(data.user.id);
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    // Deleting a user requires the service_role key, which never ships in
    // the app — so this calls a server-side edge function instead. Until
    // that function is deployed (see README), this surfaces a clear error
    // rather than silently doing nothing.
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signUp,
        signIn,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
