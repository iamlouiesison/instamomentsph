'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAuthPersistence() {
  const supabase = createClient();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const isWritingRef = useRef(false);

  const syncAuthState = useCallback(async () => {
    // Prevent concurrent syncs
    if (isSyncingRef.current) {
      console.log('🔄 Sync already in progress, skipping...');
      return;
    }

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // Debounce sync calls
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        isSyncingRef.current = true;
        console.log('🔄 Syncing auth state across tabs...');

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Store auth state in localStorage for cross-tab sync
          const authData = {
            id: session.user.id,
            email: session.user.email,
            timestamp: Date.now(),
          };

          // Check if the data has actually changed (excluding timestamp) to prevent unnecessary updates
          const existingData = localStorage.getItem('instamoments_auth_user');
          let shouldUpdate = true;

          if (existingData) {
            try {
              const existing = JSON.parse(existingData);
              // Compare only the meaningful data, not the timestamp
              if (
                existing.id === authData.id &&
                existing.email === authData.email
              ) {
                shouldUpdate = false;
              }
            } catch {
              // If parsing fails, update anyway
              shouldUpdate = true;
            }
          }

          if (shouldUpdate) {
            isWritingRef.current = true;
            localStorage.setItem(
              'instamoments_auth_user',
              JSON.stringify(authData)
            );
            console.log('✅ Auth state synced to localStorage:', {
              userId: authData.id,
              email: authData.email,
            });
            // Reset the flag after a short delay
            setTimeout(() => {
              isWritingRef.current = false;
            }, 100);
          } else {
            console.log(
              '🔄 Auth state unchanged, skipping localStorage update'
            );
          }
        } else {
          // Clear auth state if no session
          const existingData = localStorage.getItem('instamoments_auth_user');
          if (existingData) {
            localStorage.removeItem('instamoments_auth_user');
            console.log('🧹 Auth state cleared from localStorage');
          }
        }
      } catch (error) {
        console.error('❌ Error syncing auth state:', error);
      } finally {
        isSyncingRef.current = false;
      }
    }, 1000); // 1 second debounce to prevent rapid calls
  }, [supabase]);

  useEffect(() => {
    // Initial sync
    syncAuthState();

    // Listen for storage events (cross-tab sync) - only for our custom key
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'instamoments_auth_user' && !isWritingRef.current) {
        console.log('🔄 Auth state changed in another tab:', {
          key: e.key,
          newValue: e.newValue ? 'present' : 'null',
          oldValue: e.oldValue ? 'present' : 'null',
        });
        syncAuthState();
      } else if (e.key === 'instamoments_auth_user' && isWritingRef.current) {
        console.log('🔄 Ignoring storage event - we triggered it');
      }
    };

    // Listen for focus events to refresh auth state (debounced)
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing auth state...');
      syncAuthState();
    };

    // Listen for visibility change to sync when tab becomes visible (debounced)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Tab became visible, refreshing auth state...');
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supabase, syncAuthState]);

  return { syncAuthState };
}
