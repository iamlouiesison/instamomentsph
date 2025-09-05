'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventStats, LoadingSpinner } from '@/components/instamoments';
import { MainNavigation } from '@/components/layout';
import { QRCodeDisplay } from '@/components/features/qr-code';
import {
  ArrowLeft,
  Settings,
  Share2,
  Download,
  QrCode,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  Camera,
  Video,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  eventType: string;
  eventDate?: string;
  subscriptionTier?: string;
  totalPhotos: number;
  totalVideos: number;
  totalContributors: number;
  status: string;
  requiresModeration: boolean;
  allowDownloads: boolean;
  isPublic: boolean;
  customMessage?: string;
  gallerySlug: string;
  qrCodeUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

interface EventStats {
  totalPhotos: number;
  totalVideos: number;
  totalContributors: number;
  maxPhotos: number;
  maxVideos?: number;
  storageDays: number;
  daysRemaining: number;
  totalViews?: number;
  totalDownloads?: number;
}

export default function EventManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to fetch event');
      }

      const eventData = result.data;
      setEvent(eventData);

      // Calculate stats
      const eventStats: EventStats = {
        totalPhotos: eventData.totalPhotos || 0,
        totalVideos: eventData.totalVideos || 0,
        totalContributors: eventData.totalContributors || 0,
        maxPhotos: getMaxPhotos(eventData.subscriptionTier),
        maxVideos: eventData.hasVideoAddon
          ? getMaxVideos(eventData.subscriptionTier)
          : undefined,
        storageDays: getStorageDays(eventData.subscriptionTier),
        daysRemaining: eventData.expiresAt
          ? Math.max(
              0,
              Math.ceil(
                (new Date(eventData.expiresAt).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0,
        totalViews: 0, // TODO: Implement analytics
        totalDownloads: 0, // TODO: Implement analytics
      };

      setStats(eventStats);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxPhotos = (tier?: string): number => {
    const limits = {
      free: 30,
      basic: 50,
      standard: 100,
      premium: 250,
      pro: 500,
    };
    return limits[tier as keyof typeof limits] || 30;
  };

  const getMaxVideos = (tier?: string): number => {
    const limits = {
      free: 0,
      basic: 0,
      standard: 20,
      premium: 50,
      pro: 100,
    };
    return limits[tier as keyof typeof limits] || 0;
  };

  const getStorageDays = (tier?: string): number => {
    const limits = {
      free: 3,
      basic: 7,
      standard: 14,
      premium: 30,
      pro: 30,
    };
    return limits[tier as keyof typeof limits] || 3;
  };

  const handleDelete = async () => {
    if (!event) return;

    if (event.total_photos > 0 || event.total_videos > 0) {
      toast.error(
        'Cannot delete event with photos or videos. Archive instead.'
      );
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this event? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to delete event');
      }

      toast.success('Event deleted successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete event'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (!event) return;
    const galleryUrl = `${window.location.origin}/gallery/${event.gallery_slug}`;
    navigator.clipboard.writeText(galleryUrl);
    toast.success('Gallery link copied to clipboard!');
  };

  const handleViewGallery = () => {
    if (!event) return;
    const galleryUrl = `/gallery/${event.gallery_slug}`;
    window.open(galleryUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Event Not Found</h3>
                  <p className="text-muted-foreground">
                    {error || 'The event you are looking for does not exist.'}
                  </p>
                </div>
                <Button onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isExpired =
    event.status === 'expired' ||
    (event.expiresAt && new Date(event.expiresAt) < new Date());
  const isExpiringSoon =
    event.expiresAt &&
    new Date(event.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    !isExpired;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Compact Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                {event.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600 capitalize text-sm">
                  {event.eventType} Event
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={isExpired ? 'destructive' : 'default'} className="text-xs">
                    {isExpired ? 'Expired' : 'Active'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {event.subscriptionTier
                      ? event.subscriptionTier.charAt(0).toUpperCase() +
                        event.subscriptionTier.slice(1)
                      : 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expiration Warnings */}
        {isExpiringSoon && !isExpired && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This event expires{' '}
              {formatDistanceToNow(new Date(event.expiresAt!), {
                addSuffix: true,
              })}
              . Consider upgrading to extend storage.
            </AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This event has expired. Photos and videos may be deleted soon.
              Download your memories now.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event Details & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compact Event Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.eventDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">Event Date</p>
                        <p className="font-medium text-sm">
                          {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="font-medium text-sm truncate">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="font-medium text-sm">
                        {event.createdAt
                          ? formatDistanceToNow(new Date(event.createdAt), {
                              addSuffix: true,
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{event.description}</p>
                  </div>
                )}

                {event.customMessage && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Message for Guests</p>
                    <p className="text-sm text-blue-900">{event.customMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            {stats && (
              <div>
                <EventStats eventId={eventId} stats={stats} />
              </div>
            )}

            {/* QR Code Display */}
            {showQRCode && event && (
              <div>
                <QRCodeDisplay
                  event={event}
                  size="large"
                  showInstructions={true}
                  showDownloadOptions={true}
                  branded={true}
                />
              </div>
            )}
          </div>

          {/* Right Column - Actions & Quick Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Button
                  onClick={handleViewGallery}
                  className="w-full justify-start"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Gallery
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Gallery
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="w-full justify-start"
                  size="sm"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/print/qr/${eventId}`)}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print QR Code
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/events/${eventId}/settings`)}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Event Settings
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {stats && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Photos</span>
                      </div>
                      <span className="font-semibold">{stats.totalPhotos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Videos</span>
                      </div>
                      <span className="font-semibold">{stats.totalVideos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Contributors</span>
                      </div>
                      <span className="font-semibold">{stats.totalContributors}</span>
                    </div>
                    {stats.daysRemaining > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Days Left</span>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {stats.daysRemaining}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-red-600 text-sm">Delete Event</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Permanently delete this event and all its data.
                    </p>
                    {event.totalPhotos > 0 || event.totalVideos > 0 ? (
                      <p className="text-xs text-red-600 mt-1">
                        Cannot delete event with {event.totalPhotos} photos and{' '}
                        {event.totalVideos} videos.
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={
                      isDeleting || event.totalPhotos > 0 || event.totalVideos > 0
                    }
                    size="sm"
                    className="w-full"
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Event
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
