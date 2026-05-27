import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/clerk-react';
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

function toAppUser(clerkUser: ReturnType<typeof useUser>['user']): AppUser | null {
  if (!clerkUser) return null;

  return {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
    fullName: clerkUser.fullName,
    phone: clerkUser.primaryPhoneNumber?.phoneNumber ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState('');

  const user = useMemo(() => toAppUser(clerkUser), [clerkUser]);
  const loading = !isLoaded;

  const clearAuthError = useCallback(() => {
    setAuthError('');
  }, []);

  useEffect(() => {
    setAuthTokenProvider(async () => getToken());
    return () => setAuthTokenProvider(null);
  }, [getToken]);

  const refreshProfile = useCallback(async (userId?: string) => {
    const targetId = userId ?? user?.id;
    if (!targetId || !isSignedIn) {
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
  }, [isSignedIn, user?.fullName, user?.id, user?.phone]);

  useEffect(() => {
    if (loading) return;

    if (!isSignedIn || !user?.id) {
      setProfile(null);
      return;
    }

    refreshProfile(user.id);
  }, [isSignedIn, loading, refreshProfile, user?.id]);

  const logout = useCallback(async () => {
    setAuthError('');
    await signOut({ redirectUrl: '/' });
    setProfile(null);
  }, [signOut]);

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
