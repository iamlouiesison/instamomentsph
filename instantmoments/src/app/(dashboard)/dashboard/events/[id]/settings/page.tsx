'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/instamoments';
import {
  EventSettingsSchema,
  type EventSettingsData,
} from '@/lib/validations/event';
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EventSettings {
  id: string;
  name: string;
  requiresModeration: boolean;
  allowDownloads: boolean;
  isPublic: boolean;
  customMessage?: string;
  status: 'active' | 'expired' | 'archived';
}

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const eventId = params.id as string;

  const form = useForm<EventSettingsData>({
    resolver: zodResolver(EventSettingsSchema),
    defaultValues: {
      id: eventId,
      requiresModeration: false,
      allowDownloads: true,
      isPublic: true,
      customMessage: '',
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (eventId) {
      fetchEventSettings();
    }
  }, [eventId]);

  const fetchEventSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to fetch event');
      }

      const eventData = result.data;
      setEvent(eventData);

      // Set form values
      setValue('requiresModeration', eventData.requiresModeration);
      setValue('allowDownloads', eventData.allowDownloads);
      setValue('isPublic', eventData.isPublic);
      setValue('customMessage', eventData.customMessage || '');
    } catch (error) {
      console.error('Error fetching event settings:', error);
      toast.error('Failed to load event settings');
      router.push(`/dashboard/events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EventSettingsData) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error.message || 'Failed to update event settings'
        );
      }

      toast.success('Event settings updated successfully!');
      setEvent(result.data);
    } catch (error) {
      console.error('Error updating event settings:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update event settings'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event settings...</p>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Settings
          </h1>
          <p className="text-gray-600">
            Configure settings for &quot;{event.name}&quot;
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Privacy & Access Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic" className="text-base font-medium">
                    Public Gallery
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Make the gallery accessible to anyone with the link
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={watchedValues.isPublic}
                  onCheckedChange={(checked) => setValue('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="allowDownloads"
                    className="text-base font-medium"
                  >
                    Allow Downloads
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Let guests download photos from the gallery
                  </p>
                </div>
                <Switch
                  id="allowDownloads"
                  checked={watchedValues.allowDownloads}
                  onCheckedChange={(checked) =>
                    setValue('allowDownloads', checked)
                  }
                />
              </div>

              {!watchedValues.isPublic && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Private galleries are only accessible to you and people you
                    specifically share the link with.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="requiresModeration"
                    className="text-base font-medium"
                  >
                    Require Approval
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Review and approve photos before they appear in the gallery
                  </p>
                </div>
                <Switch
                  id="requiresModeration"
                  checked={watchedValues.requiresModeration}
                  onCheckedChange={(checked) =>
                    setValue('requiresModeration', checked)
                  }
                />
              </div>

              {watchedValues.requiresModeration && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    When enabled, all new photos will be held for review.
                    You&apos;ll receive notifications when new content needs
                    approval.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Custom Message */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customMessage">Welcome Message</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Add a custom message that will be shown to guests when they visit your gallery..."
                  rows={4}
                  {...form.register('customMessage')}
                />
                {errors.customMessage && (
                  <p className="text-sm text-red-500">
                    {errors.customMessage.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  This message will be displayed at the top of your gallery to
                  welcome guests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Event Status Warning */}
          {event.status === 'expired' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This event has expired. Some settings may not be applicable to
                expired events.
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || saving}>
              {saving ? (
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
