import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile, setAuthTokenProvider, syncAuthenticatedProfile } from '../services/api';

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
}

export interface AppUser {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
}

interface AuthContextValue {
  user: AppUser | null;
  profile: Profile | null;
  loading: boolean;
  authError: string;
  clearAuthError: () => void;
  logout: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    phone: user.user_metadata?.phone ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState('');

  const user = useMemo(() => toAppUser(session?.user ?? null), [session]);

  const clearAuthError = useCallback(() => setAuthError(''), []);

  // Wire up the token provider used by api.ts
  useEffect(() => {
    setAuthTokenProvider(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    return () => setAuthTokenProvider(null);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async (userId?: string) => {
    const targetId = userId ?? user?.id;
    if (!targetId || !session) {
      setProfile(null);
      return;
    }

    try {
      const profileData = await getProfile(targetId);
      if (profileData?.id) {
        setProfile(profileData);
        return;
      }
      const synced = await syncAuthenticatedProfile(user?.fullName ?? undefined, user?.phone ?? undefined);
      setProfile(synced.profile);
    } catch {
      try {
        const synced = await syncAuthenticatedProfile(user?.fullName ?? undefined, user?.phone ?? undefined);
        setProfile(synced.profile);
      } catch {
        setProfile(null);
      }
    }
  }, [session, user?.fullName, user?.id, user?.phone]);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) {
      setProfile(null);
      return;
    }
    refreshProfile(user.id);
  }, [loading, refreshProfile, user?.id]);

  const logout = useCallback(async () => {
    setAuthError('');
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    authError,
    clearAuthError,
    logout,
    refreshProfile,
  }), [authError, clearAuthError, loading, logout, profile, refreshProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
