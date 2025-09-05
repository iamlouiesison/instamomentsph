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
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log('Initial session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: error?.message,
        });

        if (!mounted) return;

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
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id);

          console.log('Profile result:', {
            profilesCount: profiles?.length || 0,
            error: profileError?.message,
          });

          if (mounted) {
            setAuthState({
              user: session.user,
              profile: profiles && profiles.length > 0 ? profiles[0] : null,
              loading: false,
              error: profileError?.message || null,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setAuthState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false,
          }));
        }
      }
    };

    getInitialSession();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - setting loading to false');
        setAuthState((prev) => {
          if (prev.loading) {
            return { ...prev, loading: false };
          }
          return prev;
        });
      }
    }, 5000); // 5 second timeout

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session?.user);

      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        setAuthState({
          user: session.user,
          profile: profiles && profiles.length > 0 ? profiles[0] : null,
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
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Handle token refresh - user is still authenticated
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        setAuthState({
          user: session.user,
          profile: profiles && profiles.length > 0 ? profiles[0] : null,
          loading: false,
          error: profileError?.message || null,
        });
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        // Handle initial session - user is authenticated
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        setAuthState({
          user: session.user,
          profile: profiles && profiles.length > 0 ? profiles[0] : null,
          loading: false,
          error: profileError?.message || null,
        });
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No initial session - user is not authenticated
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in with:', { email, password: '***' });
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔐 Sign in result:', {
      success: !error,
      error: error?.message,
      userId: data?.user?.id,
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
