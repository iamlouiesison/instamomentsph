'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Database } from '@/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setAuthState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
          }));
          return;
        }

        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setAuthState({
            user: session.user,
            profile: profile || null,
            loading: false,
            error: profileError?.message || null,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'An error occurred',
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setAuthState({
          user: session.user,
          profile: profile || null,
          loading: false,
          error: profileError?.message || null,
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return { error };
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return { error };
    }

    return { data, error: null };
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return { error };
    }

    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return { error };
    }

    return { error: null };
  };

  const resetPassword = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return { error };
    }

    setAuthState((prev) => ({ ...prev, loading: false }));
    return { error: null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) {
      return { error: new Error('User not authenticated') };
    }

    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authState.user.id)
      .select()
      .single();

    if (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return { error };
    }

    setAuthState((prev) => ({ ...prev, profile: data, loading: false }));
    return { data, error: null };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    resetPassword,
    updateProfile,
  };
}
