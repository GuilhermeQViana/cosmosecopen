import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAccessEvent } from '@/hooks/useAccessLog';
import { normalizeAuthError } from '@/lib/auth-connection-diagnostics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sanitizedEmail = email.trim().toLowerCase();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: sanitizedEmail, password });
      
      if (!error) {
        setTimeout(() => {
          logAccessEvent({
            action: 'login',
            entityType: 'session',
            details: { email: sanitizedEmail, timestamp: new Date().toISOString() },
          });
        }, 0);
        return { error: null };
      }
      
      // Normalize errors returned by the lib (not just thrown exceptions)
      const normalized = normalizeAuthError(error);
      return { error: new Error(normalized.message) };
    } catch (err: unknown) {
      const normalized = normalizeAuthError(err);
      return { error: new Error(normalized.message) };
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = useCallback(async () => {
    // Log logout before signing out (while we still have the session)
    await logAccessEvent({
      action: 'logout',
      entityType: 'session',
      details: { timestamp: new Date().toISOString() },
    });
    
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
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