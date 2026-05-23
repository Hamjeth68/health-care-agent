import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, syncAuthenticatedProfile, updateProfile } from "../services/api";
import { isSupabaseConfigured, supabase } from "../services/supabase";
import type { Profile } from "../types";

interface SignupPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authError: string;
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<{ emailConfirmationRequired: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const user = session?.user ?? null;

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    try {
      const nextProfile = await getProfile(user.id);
      if (nextProfile?.id) {
        setProfile(nextProfile);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const synced = await syncAuthenticatedProfile(metadata.name, metadata.phone);
      setProfile(synced.profile);
    } catch {
      setProfile(null);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      setAuthError("Supabase is not configured. Add mobile/.env before using authentication.");
      return () => {
        mounted = false;
      };
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    if (data.session) {
      await syncAuthenticatedProfile().catch(() => undefined);
    }
  }, []);

  const signup = useCallback(async ({ name, phone, email, password }: SignupPayload) => {
    setAuthError("");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), phone: phone.trim() } }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data.user && data.session) {
      const synced = await syncAuthenticatedProfile(name.trim(), phone.trim()).catch(() => null);
      if (synced?.profile) {
        setProfile(synced.profile);
      } else {
        await updateProfile(data.user.id, name.trim(), phone.trim()).catch(() => undefined);
      }
    }

    return { emailConfirmationRequired: !data.session };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      authError,
      configured: isSupabaseConfigured,
      login,
      signup,
      logout,
      refreshProfile,
      clearAuthError: () => setAuthError("")
    }),
    [authError, loading, login, logout, profile, refreshProfile, session, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
