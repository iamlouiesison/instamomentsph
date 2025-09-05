'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  EventStats,
  LoadingSpinner,
  QRDisplay,
} from '@/components/instamoments';
import {
  ArrowLeft,
  Settings,
  Share2,
  Edit,
  Calendar,
  MapPin,
  Users,
  Camera,
  Video,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FILIPINO_EVENT_TYPES } from '@/lib/validations/event';

interface EventDetails {
  id: string;
  name: string;
  description?: string;
  eventType: string;
  eventDate?: string;
  location?: string;
  gallerySlug: string;
  qrCodeUrl: string;
  subscriptionTier: string;
  hasVideoAddon: boolean;
  requiresModeration: boolean;
  allowDownloads: boolean;
  isPublic: boolean;
  customMessage?: string;
  totalPhotos: number;
  totalVideos: number;
  totalContributors: number;
  status: 'active' | 'expired' | 'archived';
  createdAt: string;
  expiresAt?: string;
}

interface EventStatsData {
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

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const eventId = params.id as string;

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to fetch event');
      }

      setEvent(result.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, fetchEventDetails]);

  const handleEdit = () => {
    router.push(`/dashboard/events/${eventId}/edit`);
  };

  const handleSettings = () => {
    router.push(`/dashboard/events/${eventId}/settings`);
  };

  const handleShare = () => {
    // TODO: Implement QR code sharing modal
    toast.info('QR code sharing coming soon!');
  };

  const handleViewGallery = () => {
    window.open(`/gallery/${event?.gallerySlug}`, '_blank');
  };

  const handleUpgrade = () => {
    router.push(`/dashboard/events/${eventId}/upgrade`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-muted-foreground mb-4">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const eventTypeInfo =
    FILIPINO_EVENT_TYPES[event.eventType as keyof typeof FILIPINO_EVENT_TYPES];
  const isExpired =
    event.status === 'expired' ||
    (event.expiresAt && new Date(event.expiresAt) < new Date());
  const isExpiringSoon =
    event.expiresAt &&
    new Date(event.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const statsData: EventStatsData = {
    totalPhotos: event.totalPhotos,
    totalVideos: event.totalVideos,
    totalContributors: event.totalContributors,
    maxPhotos: 100, // This should come from the subscription tier
    maxVideos: event.hasVideoAddon ? 20 : undefined,
    storageDays: 14, // This should come from the subscription tier
    daysRemaining: event.expiresAt
      ? Math.ceil(
          (new Date(event.expiresAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0,
    totalViews: 0, // TODO: Implement analytics
    totalDownloads: 0, // TODO: Implement analytics
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                {eventTypeInfo?.icon && (
                  <eventTypeInfo.icon className="w-8 h-8 text-gray-700" />
                )}
                {event.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {event.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Created {format(new Date(event.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  isExpired
                    ? 'destructive'
                    : isExpiringSoon
                      ? 'secondary'
                      : 'default'
                }
                className="text-sm"
              >
                {isExpired
                  ? 'Expired'
                  : isExpiringSoon
                    ? 'Expiring Soon'
                    : 'Active'}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {event.subscriptionTier.charAt(0).toUpperCase() +
                  event.subscriptionTier.slice(1)}
              </Badge>
              {event.hasVideoAddon && (
                <Badge
                  variant="outline"
                  className="text-sm flex items-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  Video
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleViewGallery}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Gallery
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Event
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSettings}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                {event.subscriptionTier !== 'pro' && (
                  <Button
                    variant="outline"
                    onClick={handleUpgrade}
                    className="flex items-center gap-2"
                  >
                    Upgrade Package
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Event Type</h4>
                        <p className="text-muted-foreground flex items-center gap-2">
                          {eventTypeInfo?.icon && (
                            <eventTypeInfo.icon className="w-4 h-4 text-gray-700" />
                          )}
                          {eventTypeInfo?.label}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Package</h4>
                        <p className="text-muted-foreground">
                          {event.subscriptionTier.charAt(0).toUpperCase() +
                            event.subscriptionTier.slice(1)}
                          {event.hasVideoAddon && ' + Video Add-on'}
                        </p>
                      </div>
                    </div>

                    {event.customMessage && (
                      <div>
                        <h4 className="font-semibold mb-2">Custom Message</h4>
                        <p className="text-muted-foreground">
                          {event.customMessage}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-lg">No recent activity</p>
                      <p className="text-sm">
                        Photos and videos will appear here as guests contribute
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Photos</span>
                      </div>
                      <span className="font-semibold">{event.totalPhotos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Videos</span>
                      </div>
                      <span className="font-semibold">{event.totalVideos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Contributors</span>
                      </div>
                      <span className="font-semibold">
                        {event.totalContributors}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Gallery Link */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share this link with your guests to view the gallery
                    </p>
                    <Button
                      onClick={handleViewGallery}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Gallery
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <EventStats eventId={eventId} stats={statsData} />
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <QRDisplay
                    qrCodeUrl={`/api/qr/${eventId}?format=png&size=256&branded=true`}
                    eventName={event.name}
                    eventCode={event.gallerySlug}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Requires Moderation</h4>
                      <p className="text-sm text-muted-foreground">
                        Approve photos before they appear in gallery
                      </p>
                    </div>
                    <Badge
                      variant={
                        event.requiresModeration ? 'default' : 'secondary'
                      }
                    >
                      {event.requiresModeration ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Allow Downloads</h4>
                      <p className="text-sm text-muted-foreground">
                        Let guests download photos
                      </p>
                    </div>
                    <Badge
                      variant={event.allowDownloads ? 'default' : 'secondary'}
                    >
                      {event.allowDownloads ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Public Gallery</h4>
                      <p className="text-sm text-muted-foreground">
                        Gallery is accessible to everyone
                      </p>
                    </div>
                    <Badge variant={event.isPublic ? 'default' : 'secondary'}>
                      {event.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSettings} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
