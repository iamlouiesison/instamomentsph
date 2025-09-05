'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  Video,
  Upload,
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  Download,
  QrCode,
  Smartphone,
  Clock,
} from 'lucide-react';
import { Event } from '@/types/database';
import { EVENT_TYPES } from '@/lib/validations/event';
import { QRScanner } from '@/components/features/qr-code/QRScanner';
import { PhotoGallery } from './PhotoGallery';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GalleryPageProps {
  event: Event & { host?: Record<string, unknown> };
}

export function GalleryPage({ event }: GalleryPageProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [contributorInfo, setContributorInfo] = useState({
    name: '',
    email: '',
  });
  const router = useRouter();

  const eventTypeInfo = EVENT_TYPES[event.event_type];

  // Check if event is still active
  const isEventActive =
    event.status === 'active' &&
    (!event.expires_at || new Date(event.expires_at) > new Date());

  // Handle contributor info submission
  const handleContributorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contributorInfo.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Store contributor info in sessionStorage for uploads
    sessionStorage.setItem('contributor_info', JSON.stringify(contributorInfo));
    setShowUpload(true);
    toast.success('Welcome! You can now upload photos and videos.');
  };

  // Handle QR scan result
  const handleQRScan = () => {
    // QR scanner will handle navigation automatically
    setShowQRScanner(false);
  };

  // Share gallery
  const handleShare = async () => {
    try {
      const shareData = {
        title: `${event.name} - InstaMoments`,
        text: `Join the photo sharing for ${event.name}!`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Gallery URL copied to clipboard');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to share gallery');
    }
  };

  // Download all photos (if allowed)
  const handleDownloadAll = () => {
    if (!event.allow_downloads) {
      toast.error('Downloads are not allowed for this event');
      return;
    }
    // TODO: Implement download all functionality
    toast.info('Download all feature coming soon!');
  };

  if (!isEventActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              Event Not Available
            </CardTitle>
            <CardDescription>
              This event gallery is no longer active or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showQRScanner) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setShowQRScanner(false)}
            className="mb-4"
          >
            ← Back to Gallery
          </Button>
          <QRScanner onScan={handleQRScan} />
        </div>
      </div>
    );
  }

  if (showUpload) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setShowUpload(false)}
            className="mb-4"
          >
            ← Back to Gallery
          </Button>
          {/* TODO: Implement upload interface */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Photos & Videos</CardTitle>
              <CardDescription>
                Upload your memories for {event.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload interface coming soon!
              </p>
            </CardContent>
          </Card>
        </div>
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
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {event.allow_downloads && (
                <Button variant="outline" size="sm" onClick={handleDownloadAll}>
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
                      <eventTypeInfo.icon className="w-3 h-3 text-gray-700" />
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
                  <Calendar className="h-4 w-4" />
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
              <Alert className="mb-6">
                <Heart className="h-4 w-4" />
                <AlertDescription className="text-lg">
                  {event.custom_message}
                </AlertDescription>
              </Alert>
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

        {/* Guest Entry Form */}
        <Card className="mb-8">
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
            <form onSubmit={handleContributorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contributorInfo.name}
                    onChange={(e) =>
                      setContributorInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contributorInfo.email}
                    onChange={(e) =>
                      setContributorInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Start Uploading
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQRScanner(true)}
                  className="flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

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

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Contribute</CardTitle>
            <CardDescription>
              Follow these simple steps to share your memories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">For Guests:</h4>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <span>
                      Enter your name above and click &quot;Start
                      Uploading&quot;
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <span>Upload your photos and videos from the event</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <span>Add captions or messages to your uploads</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      4
                    </span>
                    <span>View and download all shared memories</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Event Details:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Maximum {event.max_photos} photos allowed</li>
                  <li>• {event.max_photos_per_user} photos per person</li>
                  <li>• Storage for {event.storage_days} days</li>
                  {event.has_video_addon && <li>• Video uploads enabled</li>}
                  {event.requires_moderation && (
                    <li>• Photos require approval</li>
                  )}
                  {!event.allow_downloads && <li>• Downloads disabled</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
