'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  Video,
  BarChart3,
  Settings,
  Users,
  MapPin,
  Heart,
  Share2,
  Download,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { CalendarIcon } from '@/components/ui/calendar-icon';
import { PhotoGallery } from './PhotoGallery';
import { GalleryOptimization } from './GalleryOptimization';
import { Event } from '@/types/database';
import { EVENT_TYPES } from '@/lib/validations/event';
import { format } from 'date-fns';

interface GalleryLayoutProps {
  event: Event & { host?: Record<string, unknown> };
  showUpload?: boolean;
  onUploadClick?: () => void;
  onQRScanClick?: () => void;
}

export function GalleryLayout({
  event,
  showUpload = false,
  onUploadClick,
  onQRScanClick,
}: GalleryLayoutProps) {
  const [activeTab, setActiveTab] = useState('gallery');

  const eventTypeInfo = EVENT_TYPES[event.event_type];

  // Check if event is still active
  const isEventActive =
    event.status === 'active' &&
    (!event.expires_at || new Date(event.expires_at) > new Date());

  if (!isEventActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CalendarIcon size="md" variant="muted" />
              Event Not Available
            </CardTitle>
            <CardDescription>
              This event gallery is no longer active or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => (window.location.href = '/')}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {event.name}
                </h1>
                <p className="text-gray-600">InstaMoments Gallery</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {event.allow_downloads && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {eventTypeInfo && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {eventTypeInfo.label}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {event.subscription_tier} Plan
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{event.name}</CardTitle>
                {event.description && (
                  <CardDescription className="text-lg">
                    {event.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {event.event_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon size="sm" variant="muted" />
                  <span>
                    {format(new Date(event.event_date), 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.total_contributors} contributors</span>
              </div>
            </div>

            {/* Custom Message */}
            {event.custom_message && (
              <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <p className="text-pink-800">{event.custom_message}</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Camera className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{event.total_photos}</div>
                <div className="text-sm text-muted-foreground">Photos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Video className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{event.total_videos}</div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">
                  {event.total_contributors}
                </div>
                <div className="text-sm text-muted-foreground">
                  Contributors
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{event.max_photos}</div>
                <div className="text-sm text-muted-foreground">Max Photos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            {/* Upload Section */}
            {showUpload && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Join the Photo Sharing
                  </CardTitle>
                  <CardDescription>
                    Enter your information to start uploading photos and videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={onUploadClick} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Uploading
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onQRScanClick}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Gallery
                </CardTitle>
                <CardDescription>
                  View all photos and videos shared by guests in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoGallery
                  eventId={event.id}
                  allowDownloads={event.allow_downloads}
                  maxPhotos={event.max_photos}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gallery Statistics
                </CardTitle>
                <CardDescription>
                  View detailed analytics and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Statistics view coming soon!</p>
                  <p className="text-sm">
                    Track engagement, popular photos, and contributor activity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <GalleryOptimization eventId={event.id} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gallery Settings
                </CardTitle>
                <CardDescription>
                  Configure gallery preferences and display options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-refresh</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically update gallery when new content is added
                      </div>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">High-quality thumbnails</div>
                      <div className="text-sm text-muted-foreground">
                        Load higher resolution thumbnails for better quality
                      </div>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Download permissions</div>
                      <div className="text-sm text-muted-foreground">
                        Allow guests to download photos and videos
                      </div>
                    </div>
                    <Badge
                      variant={event.allow_downloads ? 'default' : 'secondary'}
                    >
                      {event.allow_downloads ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
