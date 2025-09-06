'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Home, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PrivateGalleryNotificationProps {
  isPrivate?: boolean;
  eventName?: string;
  hostName?: string;
}

export function PrivateGalleryNotification({
  isPrivate = false,
  eventName,
  hostName,
}: PrivateGalleryNotificationProps) {
  const router = useRouter();

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Gallery in Private Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {eventName ? (
                  <>
                    The gallery for <strong>{eventName}</strong> is in private
                    mode.
                  </>
                ) : (
                  'This gallery is in private mode.'
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Only the event host can view this gallery.
              </p>
              {hostName && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Hosted by {hostName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/signin')}
                className="w-full"
              >
                Sign In
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If you&apos;re the event host, sign in to manage your gallery
                settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gallery not found
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Gallery Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              The gallery you&apos;re looking for doesn&apos;t exist or may have
              been removed.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check the URL or contact the event host for the correct
              link.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.push('/')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
