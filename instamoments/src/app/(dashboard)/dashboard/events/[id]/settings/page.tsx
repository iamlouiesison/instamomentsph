'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner, EmptyStates } from '@/components/instamoments';
import {
  ArrowLeft,
  Save,
  Shield,
  Download,
  Eye,
  EyeOff,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const EventSettingsSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().optional(),
  customMessage: z.string().max(500, 'Custom message must be less than 500 characters').optional(),
  requiresModeration: z.boolean(),
  allowDownloads: z.boolean(),
  isPublic: z.boolean(),
});

type EventSettingsData = z.infer<typeof EventSettingsSchema>;

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
  createdAt: string;
  expiresAt?: string;
}

export default function EventSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EventSettingsData>({
    resolver: zodResolver(EventSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      customMessage: '',
      requiresModeration: false,
      allowDownloads: true,
      isPublic: true,
    },
  });

  const { handleSubmit, watch, setValue, formState: { errors, isDirty } } = form;
  const watchedValues = watch();

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
      
      // Populate form with event data
      setValue('name', eventData.name);
      setValue('description', eventData.description || '');
      setValue('location', eventData.location || '');
      setValue('customMessage', eventData.customMessage || '');
      setValue('requiresModeration', eventData.requiresModeration || false);
      setValue('allowDownloads', eventData.allowDownloads !== false);
      setValue('isPublic', eventData.isPublic !== false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EventSettingsData) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to update event');
      }

      toast.success('Event settings updated successfully!');
      setEvent(result.data);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update event'
      );
    } finally {
      setIsSaving(false);
    }
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
          <EmptyStates
            type="error"
            title="Event Not Found"
            description={error || 'The event you are looking for does not exist.'}
            action={{
              label: 'Back to Dashboard',
              onClick: () => router.push('/dashboard'),
            }}
          />
        </div>
      </div>
    );
  }

  const isExpired = event.status === 'expired' || 
    (event.expiresAt && new Date(event.expiresAt) < new Date());

  return (
    <div className="min-h-screen bg-background">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Event Settings
              </h1>
              <p className="text-gray-600">
                Configure your event gallery settings and preferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isExpired ? 'destructive' : 'default'}>
                {isExpired ? 'Expired' : 'Active'}
              </Badge>
              <Badge variant="outline">
                {event.subscriptionTier ? 
                  event.subscriptionTier.charAt(0).toUpperCase() + event.subscriptionTier.slice(1) : 
                  'Unknown'
                }
              </Badge>
            </div>
          </div>
        </div>

        {/* Event Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Event Name</p>
                <p className="font-medium">{event.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Type</p>
                <p className="font-medium capitalize">{event.event_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contributors</p>
                <p className="font-medium">{event.total_contributors} people</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Photos</p>
                <p className="font-medium">{event.total_photos} uploaded</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Videos</p>
                <p className="font-medium">{event.total_videos} uploaded</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {event.created_at ? new Date(event.created_at).toLocaleDateString('en-PH') : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Maria's Wedding"
                    {...form.register('name')}
                    disabled={isExpired}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Manila Hotel, Makati City"
                    {...form.register('location')}
                    disabled={isExpired}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell your guests about your event..."
                  rows={3}
                  {...form.register('description')}
                  disabled={isExpired}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message for Guests</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Add a special message that will be shown to guests when they scan the QR code..."
                  rows={2}
                  {...form.register('customMessage')}
                  disabled={isExpired}
                />
                <p className="text-xs text-gray-500">
                  This message will be displayed to guests when they access your event gallery
                </p>
                {errors.customMessage && (
                  <p className="text-sm text-red-500">{errors.customMessage.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic">Public Gallery</Label>
                  <p className="text-sm text-gray-600">
                    Allow anyone with the link to view the gallery
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={watchedValues.isPublic}
                  onCheckedChange={(checked) => setValue('isPublic', checked)}
                  disabled={isExpired}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="requiresModeration">Content Moderation</Label>
                  <p className="text-sm text-gray-600">
                    Review photos and videos before they appear in the gallery
                  </p>
                </div>
                <Switch
                  id="requiresModeration"
                  checked={watchedValues.requiresModeration}
                  onCheckedChange={(checked) => setValue('requiresModeration', checked)}
                  disabled={isExpired}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allowDownloads">Allow Downloads</Label>
                  <p className="text-sm text-gray-600">
                    Let guests download photos from the gallery
                  </p>
                </div>
                <Switch
                  id="allowDownloads"
                  checked={watchedValues.allowDownloads}
                  onCheckedChange={(checked) => setValue('allowDownloads', checked)}
                  disabled={isExpired}
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning for Expired Events */}
          {isExpired && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This event has expired. You can view the settings but cannot make changes.
                To modify settings, create a new event.
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || isSaving || isExpired}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
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
        </form>
      </div>
    </div>
  );
}