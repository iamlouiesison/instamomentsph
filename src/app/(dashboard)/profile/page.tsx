'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail } from 'lucide-react';
import { PaymentLoading } from '@/components/instamoments/loading-states';

export default function ProfilePage() {
  const { profile, loading, user, error } = useAuthContext();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Debug information
  console.log('ProfilePage Debug:', { profile, loading, user, error });

  // Create profile if user exists but no profile
  const createProfile = useCallback(async () => {
    if (!user || profile || isCreatingProfile) return;

    setIsCreatingProfile(true);
    try {
      const response = await fetch('/api/profile/create', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the page to load the new profile
        window.location.reload();
      } else {
        console.error('Failed to create profile:', result.error);
      }
    } catch {
      // Error handling is done in the hook
    } finally {
      setIsCreatingProfile(false);
    }
  }, [user, profile, isCreatingProfile]);

  // Auto-create profile if needed
  useEffect(() => {
    if (user && !profile && !loading && !error) {
      createProfile();
    }
  }, [user, profile, loading, error, createProfile]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || isCreatingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PaymentLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a href="/signin" className="text-primary hover:underline">
            Try signing in again
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to view your profile.
          </p>
          <a href="/signin" className="text-primary hover:underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!profile && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Your profile could not be loaded.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            User ID: {user.id}
          </p>
          <a href="/signin" className="text-primary hover:underline">
            Try signing in again
          </a>
        </div>
      </div>
    );
  }

  if (!profile && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to view your profile.
          </p>
          <a href="/signin" className="text-primary hover:underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 ring-4 ring-background shadow-lg">
              <AvatarImage
                src={profile?.avatar_url || ''}
                alt={profile?.full_name || ''}
              />
              <AvatarFallback className="text-2xl font-bold">
                {profile?.full_name ? getInitials(profile.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profile?.full_name || 'Walang Pangalan'}
              </h1>
              <p className="text-muted-foreground text-lg mb-3">
                {profile?.email}
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Member since{' '}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-PH')
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-secondary" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription>
                I-update ang personal information mo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.full_name || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Subscription Tier</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile?.subscription_tier}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-accent-foreground" />
                </div>
                Account Statistics
              </CardTitle>
              <CardDescription>
                Tingnan ang activity mo sa InstaMoments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">
                    Photos Uploaded
                  </p>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="text-2xl font-bold text-secondary">0</p>
                  <p className="text-sm text-muted-foreground">
                    Videos Uploaded
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-accent-foreground">0</p>
                  <p className="text-sm text-muted-foreground">
                    Events Created
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
