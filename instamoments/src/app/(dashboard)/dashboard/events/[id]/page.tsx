'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { DatePicker } from '@/components/ui/date-picker';
import { CalendarIcon } from '@/components/ui/calendar-icon';
import { QRCodeDisplay } from '@/components/features/qr-code';
import { LoadingSpinner } from '@/components/instamoments';
import {
  ArrowLeft,
  Settings,
  QrCode,
  MapPin,
  Users,
  Camera,
  Video,
  Clock,
  AlertTriangle,
  Trash2,
  Save,
  Copy,
  Archive,
  BarChart3,
  Lock,
  Zap,
  Eye,
  Download as DownloadIcon,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  event_type:
    | 'wedding'
    | 'birthday'
    | 'corporate'
    | 'graduation'
    | 'anniversary'
    | 'debut'
    | 'other';
  event_date: string | null;
  host_id: string;
  qr_code_url: string;
  gallery_slug: string;
  subscription_tier: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
  max_photos: number;
  max_photos_per_user: number;
  storage_days: number;
  has_video_addon: boolean;
  requires_moderation: boolean;
  allow_downloads: boolean;
  is_public: boolean;
  custom_message: string | null;
  total_photos: number;
  total_videos: number;
  total_contributors: number;
  status: 'active' | 'expired' | 'archived';
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  // Computed fields
  daysRemaining: number;
  storageUsed: number;
  storageLimit: number;
  photoLimitReached: boolean;
  videoLimitReached: boolean;
}

import { EVENT_TYPES } from '@/lib/validations/event';

const getEventTypeConfig = (eventType: string) => {
  return (
    EVENT_TYPES[eventType as keyof typeof EVENT_TYPES] ||
    EVENT_TYPES.other
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getSubscriptionTierInfo = (tier?: string) => {
  const tiers = {
    free: {
      label: 'Free',
      icon: '🆓',
      color: 'text-gray-600',
      features: ['Basic features'],
    },
    basic: {
      label: 'Basic',
      icon: '⭐',
      color: 'text-blue-600',
      features: ['Enhanced storage'],
    },
    standard: {
      label: 'Standard',
      icon: '💎',
      color: 'text-purple-600',
      features: ['Video support', 'Priority support'],
    },
    premium: {
      label: 'Premium',
      icon: '👑',
      color: 'text-yellow-600',
      features: ['Unlimited storage', 'Advanced analytics'],
    },
    pro: {
      label: 'Pro',
      icon: '🚀',
      color: 'text-red-600',
      features: ['White-label', 'API access'],
    },
  };
  return tiers[tier as keyof typeof tiers] || tiers.free;
};

export default function EventManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    eventType: 'birthday',
    eventDate: '',
    customMessage: '',
    requiresModeration: false,
    allowDownloads: true,
    isPublic: true,
  });

  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to fetch event');
      }

      const eventData = result.data;
      setEvent(eventData);

      // Populate form with event data
      setFormData({
        name: eventData.name || '',
        description: eventData.description || '',
        location: eventData.location || '',
        eventType: eventData.event_type || 'birthday',
        eventDate: eventData.event_date || '',
        customMessage: eventData.custom_message || '',
        requiresModeration: eventData.requires_moderation || false,
        allowDownloads: eventData.allow_downloads !== false,
        isPublic: eventData.is_public !== false,
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [eventId, fetchEvent]);

  const handleSave = async () => {
    if (!event) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to update event');
      }

      toast.success('Event updated successfully!');
      await fetchEvent(); // Refresh data
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update event'
      );
    } finally {
      setIsSaving(false);
    }
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


  const handleDuplicate = () => {
    if (!event) return;
    // TODO: Implement duplicate functionality
    toast.info('Duplicate functionality coming soon!');
  };

  const handleExport = () => {
    if (!event) return;
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon!');
  };

  const handleArchive = () => {
    if (!event) return;
    // TODO: Implement archive functionality
    toast.info('Archive functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading event...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
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
    (event.expires_at && new Date(event.expires_at) < new Date());
  const isExpiringSoon =
    event.expires_at &&
    new Date(event.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    !isExpired;
  const eventTypeConfig = getEventTypeConfig(event.event_type);
  const tierInfo = getSubscriptionTierInfo(event.subscription_tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                  {event.name}
                </h1>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="border">
                  {eventTypeConfig.label}
                </Badge>
                <Badge variant={isExpired ? 'destructive' : 'default'}>
                  {isExpired ? 'Expired' : 'Active'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {tierInfo.icon} {tierInfo.label}
                </Badge>
              </div>
              <p className="text-gray-600 text-lg">
                {eventTypeConfig.description} • Created{' '}
                {formatDistanceToNow(new Date(event.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>

          </div>
        </div>

        {/* Expiration Warnings */}
        {isExpiringSoon && !isExpired && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This event expires{' '}
              {formatDistanceToNow(new Date(event.expires_at!), {
                addSuffix: true,
              })}
              . Consider upgrading to extend storage.
            </AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This event has expired. Photos and videos may be deleted soon.
              Download your memories now.
            </AlertDescription>
          </Alert>
        )}


        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon size="md" variant="default" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.event_date && (
                      <div className="flex items-center gap-3">
                        <CalendarIcon size="sm" variant="muted" className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Event Date</p>
                          <p className="font-medium text-sm">
                            {formatDate(event.event_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="font-medium text-sm truncate">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">Created</p>
                        <p className="font-medium text-sm">
                          {formatDistanceToNow(new Date(event.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">Contributors</p>
                        <p className="font-medium text-sm">
                          {event.total_contributors}
                        </p>
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-600 mb-1">Description</p>
                      <p className="text-sm text-gray-900">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {event.custom_message && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">
                        Message for Guests
                      </p>
                      <p className="text-sm text-blue-900">
                        {event.custom_message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Photos</span>
                      </div>
                      <span className="font-semibold">
                        {event.total_photos}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Videos</span>
                      </div>
                      <span className="font-semibold">
                        {event.total_videos}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Contributors
                        </span>
                      </div>
                      <span className="font-semibold">
                        {event.total_contributors}
                      </span>
                    </div>
                    {event.daysRemaining > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Days Left
                          </span>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {event.daysRemaining}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Storage & Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Storage & Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Photo Storage</span>
                      <span className="text-sm text-gray-600">
                        {event.total_photos} / {event.max_photos}
                      </span>
                    </div>
                    <Progress
                      value={(event.total_photos / event.max_photos) * 100}
                      className="h-2"
                    />
                    {event.photoLimitReached && (
                      <p className="text-xs text-red-600 mt-1">
                        Photo limit reached
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Video Storage</span>
                      <span className="text-sm text-gray-600">
                        {event.total_videos} /{' '}
                        {event.has_video_addon ? 'Unlimited' : '0'}
                      </span>
                    </div>
                    <Progress
                      value={event.has_video_addon ? 0 : 100}
                      className="h-2"
                    />
                    {event.videoLimitReached && (
                      <p className="text-xs text-red-600 mt-1">
                        Video limit reached
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Storage Days</span>
                    <span className="text-sm text-gray-600">
                      {event.storage_days} days
                    </span>
                  </div>
                  <Progress
                    value={(event.daysRemaining / event.storage_days) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Event Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter event name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) =>
                        setFormData({ ...formData, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(EVENT_TYPES).map(
                        ([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Event location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <DatePicker
                      id="eventDate"
                      placeholder="Select event date"
                      value={formData.eventDate ? new Date(formData.eventDate) : undefined}
                      onChange={(date) => {
                        if (date) {
                          setFormData({ ...formData, eventDate: date.toISOString().split('T')[0] });
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customMessage">
                    Custom Message for Guests
                  </Label>
                  <Textarea
                    id="customMessage"
                    value={formData.customMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customMessage: e.target.value,
                      })
                    }
                    placeholder="Add a special message for your guests..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="isPublic">Public Event</Label>
                      <p className="text-sm text-gray-600">
                        Allow anyone with the link to view this event
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPublic: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="requiresModeration">
                        Require Moderation
                      </Label>
                      <p className="text-sm text-gray-600">
                        Review photos and videos before they appear in the
                        gallery
                      </p>
                    </div>
                    <Switch
                      id="requiresModeration"
                      checked={formData.requiresModeration}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          requiresModeration: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="allowDownloads">Allow Downloads</Label>
                      <p className="text-sm text-gray-600">
                        Let guests download photos and videos
                      </p>
                    </div>
                    <Switch
                      id="allowDownloads"
                      checked={formData.allowDownloads}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowDownloads: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Sharing & QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Gallery Link</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={`${window.location.origin}/gallery/${event.gallery_slug}`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/gallery/${event.gallery_slug}`);
                          toast.success('Gallery link copied to clipboard!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>QR Code</Label>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowQRCode(!showQRCode)}
                        className="w-full"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                      </Button>
                    </div>
                  </div>

                  {showQRCode && (
                    <div className="pt-4 border-t">
                      <QRCodeDisplay
                        event={event}
                        size="medium"
                        showInstructions={true}
                        showDownloadOptions={true}
                        branded={true}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Copy className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">Duplicate Event</h3>
                        <p className="text-sm text-gray-600">
                          Create a copy with same settings
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDuplicate}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DownloadIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">Export Data</h3>
                        <p className="text-sm text-gray-600">
                          Download photos and videos
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      size="sm"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Archive className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">Archive Event</h3>
                        <p className="text-sm text-gray-600">
                          Hide from dashboard
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleArchive}
                      variant="outline"
                      size="sm"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <h3 className="font-medium text-red-600">Delete Event</h3>
                        <p className="text-sm text-gray-600">
                          Permanently delete this event and all its data
                          {event.total_photos > 0 || event.total_videos > 0 ? (
                            <span className="block text-red-600 mt-1">
                              Cannot delete with {event.total_photos} photos and{' '}
                              {event.total_videos} videos
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={
                        isDeleting ||
                        event.total_photos > 0 ||
                        event.total_videos > 0
                      }
                      size="sm"
                    >
                      {isDeleting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
