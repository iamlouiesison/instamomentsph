'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Download,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventSettingsProps {
  event: {
    id: string;
    name: string;
    requiresModeration: boolean;
    allowDownloads: boolean;
    isPublic: boolean;
    customMessage?: string;
    status: string;
    expiresAt?: string;
  };
  onUpdate: (field: string, value: boolean | string) => void;
  className?: string;
}

export const EventSettings: React.FC<EventSettingsProps> = ({
  event,
  onUpdate,
  className,
}) => {
  const isExpired =
    event.status === 'expired' ||
    (event.expiresAt && new Date(event.expiresAt) < new Date());
  const isExpiringSoon =
    event.expiresAt &&
    new Date(event.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    !isExpired;

  return (
    <div className={cn('space-y-6', className)}>
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
              <Label htmlFor="isPublic" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Public Gallery
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view the gallery
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={event.isPublic}
              onCheckedChange={(checked) => onUpdate('isPublic', checked)}
              disabled={!!isExpired}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label
                htmlFor="requiresModeration"
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Content Moderation
              </Label>
              <p className="text-sm text-muted-foreground">
                Review photos and videos before they appear in the gallery
              </p>
            </div>
            <Switch
              id="requiresModeration"
              checked={event.requiresModeration}
              onCheckedChange={(checked) =>
                onUpdate('requiresModeration', checked)
              }
              disabled={!!isExpired}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label
                htmlFor="allowDownloads"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Allow Downloads
              </Label>
              <p className="text-sm text-muted-foreground">
                Let guests download photos from the gallery
              </p>
            </div>
            <Switch
              id="allowDownloads"
              checked={event.allowDownloads}
              onCheckedChange={(checked) => onUpdate('allowDownloads', checked)}
              disabled={!!isExpired}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Guest Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message for Guests</Label>
            <textarea
              id="customMessage"
              placeholder="Add a special message that will be shown to guests when they scan the QR code..."
              value={event.customMessage || ''}
              onChange={(e) => onUpdate('customMessage', e.target.value)}
              disabled={!!isExpired}
              className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              This message will be displayed to guests when they access your
              event gallery
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Event Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={isExpired ? 'destructive' : 'default'}>
                {isExpired ? 'Expired' : 'Active'}
              </Badge>
            </div>

            {event.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.expiresAt).toLocaleDateString('en-PH')}
                </span>
              </div>
            )}

            {isExpiringSoon && !isExpired && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This event expires soon. Consider upgrading to extend storage.
                </AlertDescription>
              </Alert>
            )}

            {isExpired && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This event has expired. Settings cannot be modified.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Current Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gallery Visibility</span>
              <Badge variant={event.isPublic ? 'default' : 'secondary'}>
                {event.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Content Moderation</span>
              <Badge
                variant={event.requiresModeration ? 'default' : 'secondary'}
              >
                {event.requiresModeration ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Downloads</span>
              <Badge variant={event.allowDownloads ? 'default' : 'secondary'}>
                {event.allowDownloads ? 'Allowed' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
