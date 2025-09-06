"use client";

import React, { useEffect, useState } from "react";
import { Event } from "@/types/database";
import { GalleryPage } from "./GalleryPage";
import { useAuth } from "@/hooks/useAuth";

interface PublicGalleryWrapperProps {
  event: Event & { host?: Record<string, unknown> };
}

export function PublicGalleryWrapper({ event }: PublicGalleryWrapperProps) {
  const { user, loading } = useAuth();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    // If we have a user and not loading, we can initialize immediately
    if (user && !loading) {
      console.log(
        "🔄 PublicGalleryWrapper: User found, initializing immediately",
      );
      setIsAuthInitialized(true);
      return;
    }

    // If we're not loading and no user, we can also initialize
    if (!loading && !user) {
      console.log(
        "🔄 PublicGalleryWrapper: No user and not loading, initializing",
      );
      setIsAuthInitialized(true);
      return;
    }

    // Give auth state time to initialize with a shorter timeout
    const timer = setTimeout(() => {
      console.log(
        "🔄 PublicGalleryWrapper: Auth initialization timeout reached",
        {
          hasUser: !!user,
          loading,
          timestamp: new Date().toISOString(),
        },
      );
      setIsAuthInitialized(true);
    }, 1000); // Reduced to 1 second

    return () => clearTimeout(timer);
  }, [user, loading]);

  // The gallery page is public and doesn't require authentication
  // But we pass the user info if available for enhanced features
  return (
    <GalleryPage
      event={event}
      currentUser={user}
      isAuthenticated={!!user && isAuthInitialized}
      isLoadingAuth={loading || !isAuthInitialized}
    />
  );
}
