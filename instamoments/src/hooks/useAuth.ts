'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Database } from '@/types/database';
import { useAuthPersistence } from './useAuthPersistence';

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
  const { syncAuthState } = useAuthPersistence();

  useEffect(() => {
    let mounted = true;
    let profileFetchTimeout: NodeJS.Timeout | null = null;
    let authTimeout: NodeJS.Timeout | null = null;

    // Get initial session with optimized approach
    const getInitialSession = async () => {
      try {
        console.log('🔐 Getting initial session...');

        // First try to get the session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log('🔐 Initial session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          error: error?.message,
          timestamp: new Date().toISOString(),
        });

        if (!mounted) return;

        if (error) {
          console.error('🔐 Session error:', error);
          setAuthState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
          }));
          return;
        }

        if (session?.user) {
          console.log('🔐 User found, setting auth state...');
          // Clear any pending timeout since we have a session
          if (authTimeout) {
            clearTimeout(authTimeout);
            authTimeout = null;
          }
          // Set user immediately, fetch profile in background
          setAuthState({
            user: session.user,
            profile: null, // Will be loaded in background
            loading: false,
            error: null,
          });

          // Fetch profile in background with debouncing
          if (profileFetchTimeout) {
            clearTimeout(profileFetchTimeout);
          }

          profileFetchTimeout = setTimeout(async () => {
            try {
              const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id);

              console.log('🔐 Profile result:', {
                profilesCount: profiles?.length || 0,
                error: profileError?.message,
              });

              if (mounted) {
                setAuthState((prev) => ({
                  ...prev,
                  profile: profiles && profiles.length > 0 ? profiles[0] : null,
                  error: profileError?.message || null,
                }));
              }
            } catch (profileError) {
              console.error('🔐 Profile fetch error:', profileError);
            }
          }, 200); // 200ms delay to prevent rapid calls

          // Sync auth state across tabs
          syncAuthState();
        } else {
          // No session found, check for stored auth state
          console.log('🔐 No session found, checking stored auth state...');

          const storedAuth = localStorage.getItem('instamoments_auth_user');
          if (storedAuth) {
            console.log('🔐 Found stored auth state, keeping loading state...');
            // Keep loading state to prevent premature logout
            // Don't set loading to true here, let the auth state change listener handle it
            setAuthState((prev) => ({
              ...prev,
              loading: true,
            }));
          } else {
            // No stored auth state, user is not authenticated
            console.log('🔐 No stored auth state, clearing auth state...');
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
            syncAuthState();
          }
        }
      } catch (error) {
        console.error('🔐 Error getting initial session:', error);
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

    // Listen for storage events to sync auth state across tabs (only for our custom key)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'instamoments_auth_user') {
        console.log('🔐 Storage event detected:', {
          key: e.key,
          newValue: e.newValue ? 'present' : 'null',
          oldValue: e.oldValue ? 'present' : 'null',
          timestamp: new Date().toISOString(),
        });
        getInitialSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Shorter timeout to prevent long loading states
    authTimeout = setTimeout(() => {
      if (mounted) {
        // Check if we have stored auth state before timing out
        const storedAuth = localStorage.getItem('instamoments_auth_user');
        if (storedAuth) {
          console.log(
            '🔐 Timeout reached but stored auth exists, keeping loading state...'
          );
          // Don't timeout if we have stored auth - let the auth state change listener handle it
          return;
        }

        console.warn('Auth loading timeout - setting loading to false');
        setAuthState((prev) => {
          if (prev.loading) {
            return { ...prev, loading: false };
          }
          return prev;
        });
      }
    }, 5000); // Increased to 5 seconds to allow more time for auth restoration

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', {
        event,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
      });

      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 User signed in, syncing auth state...');
        // Clear any pending timeout since we have a session
        if (authTimeout) {
          clearTimeout(authTimeout);
          authTimeout = null;
        }
        // Set user immediately, fetch profile in background
        setAuthState({
          user: session.user,
          profile: null,
          loading: false,
          error: null,
        });

        // Fetch profile in background with debouncing
        if (profileFetchTimeout) {
          clearTimeout(profileFetchTimeout);
        }

        profileFetchTimeout = setTimeout(async () => {
          try {
            const { data: profiles, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id);

            if (mounted) {
              setAuthState((prev) => ({
                ...prev,
                profile: profiles && profiles.length > 0 ? profiles[0] : null,
                error: profileError?.message || null,
              }));
            }
          } catch (profileError) {
            console.error('🔐 Profile fetch error:', profileError);
          }
        }, 200);

        // Sync auth state across tabs
        syncAuthState();
      } else if (event === 'SIGNED_OUT') {
        console.log('🔐 User signed out, clearing auth state...');
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });

        // Clear auth state across tabs
        syncAuthState();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔐 Token refreshed, updating auth state...');
        // Handle token refresh - user is still authenticated
        setAuthState({
          user: session.user,
          profile: null, // Don't refetch profile on token refresh
          loading: false,
          error: null,
        });

        // Sync auth state across tabs
        syncAuthState();
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        console.log('🔐 Initial session found, setting auth state...');
        // Clear any pending timeout since we have a session
        if (authTimeout) {
          clearTimeout(authTimeout);
          authTimeout = null;
        }
        // Handle initial session - user is authenticated
        setAuthState({
          user: session.user,
          profile: null, // Will be loaded in background
          loading: false,
          error: null,
        });

        // Fetch profile in background with debouncing
        if (profileFetchTimeout) {
          clearTimeout(profileFetchTimeout);
        }

        profileFetchTimeout = setTimeout(async () => {
          try {
            const { data: profiles, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id);

            if (mounted) {
              setAuthState((prev) => ({
                ...prev,
                profile: profiles && profiles.length > 0 ? profiles[0] : null,
                error: profileError?.message || null,
              }));
            }
          } catch (profileError) {
            console.error('🔐 Profile fetch error:', profileError);
          }
        }, 200);

        // Sync auth state across tabs
        syncAuthState();
      } else if (event === 'INITIAL_SESSION' && !session) {
        console.log('🔐 No initial session found');

        // Check if there's a stored auth state before clearing
        const storedAuth = localStorage.getItem('instamoments_auth_user');
        if (storedAuth) {
          console.log('🔐 Found stored auth state, keeping loading state...');
          // Don't clear the state immediately, keep loading
          setAuthState((prev) => ({
            ...prev,
            loading: true,
          }));
        } else {
          // No stored auth state, user is not authenticated
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });

          // Clear auth state across tabs
          syncAuthState();
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('🔐 Password recovery event');
        // Handle password recovery
        setAuthState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    });

    return () => {
      mounted = false;
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [supabase, syncAuthState]);

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
