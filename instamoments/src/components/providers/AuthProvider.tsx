'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, Profile } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ data?: unknown; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  signInWithProvider: (
    provider: 'google' | 'facebook'
  ) => Promise<{ error: unknown }>;
  resetPassword: (email: string) => Promise<{ error: unknown }>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ data?: unknown; error: unknown }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
