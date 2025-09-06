'use client';

import { useEffect, useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';

interface AuthStateInitializerProps {
  children: React.ReactNode;
}

export function AuthStateInitializer({ children }: AuthStateInitializerProps) {
  // const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run once when component mounts
    if (isInitialized) return;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth state...');

        // Check if there's a stored auth state in localStorage
        const storedAuth = localStorage.getItem('instamoments_auth_user');

        if (storedAuth) {
          console.log(
            '🔄 Found stored auth state, attempting to restore session...'
          );

          // Try to restore the session
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error('❌ Error restoring session:', error);
            localStorage.removeItem('instamoments_auth_user');
          } else if (session?.user) {
            console.log('✅ Session restored successfully');
          } else {
            console.log('ℹ️ No valid session found, clearing stored auth');
            localStorage.removeItem('instamoments_auth_user');
          }
        } else {
          console.log('ℹ️ No stored auth state found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isInitialized]);

  return <>{children}</>;
}
