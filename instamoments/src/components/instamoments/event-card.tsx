'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Users,
  Camera,
  Video,
  Settings,
  ExternalLink,
  QrCode,
  Clock,
} from 'lucide-react';
import { FILIPINO_EVENT_TYPES, type EventType } from '@/lib/validations/event';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FrontendEvent } from '@/lib/utils/event-transformer';
import { CompactQRCode } from '@/components/features/qr-code';

// Re-export the FrontendEvent as Event for backward compatibility
export type Event = FrontendEvent;

interface EventCardProps {
  event: Event;
  onEdit?: (eventId: string) => void;
  onView?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
  onSettings?: (eventId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onView,
  onShare,
  onSettings,
  showActions = true,
  className,
}) => {
  const eventTypeInfo = FILIPINO_EVENT_TYPES[event.eventType] || FILIPINO_EVENT_TYPES.other;
  const isExpired =
    event.status === 'expired' ||
    (event.expiresAt && new Date(event.expiresAt) < new Date());
  const isExpiringSoon =
    event.expiresAt &&
    new Date(event.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getTierBadge = () => {
    const tierColors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800',
      pro: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          tierColors[event.subscriptionTier as keyof typeof tierColors] ||
            'bg-gray-100 text-gray-800'
        )}
      >
        {event.subscriptionTier.charAt(0).toUpperCase() +
          event.subscriptionTier.slice(1)}
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <eventTypeInfo.icon className="w-5 h-5 text-gray-700" />
              {event.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge()}
              {getTierBadge()}
              {event.hasVideoAddon && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  Video
                </Badge>
              )}
            </div>
          </div>
          {/* QR Code Display */}
          <div className="ml-4">
            <CompactQRCode event={event} size="small" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {event.eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.eventDate), 'MMM dd, yyyy')}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              Created{' '}
              {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), {
                addSuffix: true,
              }) : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Camera className="w-4 h-4" />
              <span className="text-sm">Photos</span>
            </div>
            <div className="font-semibold text-lg">{event.totalPhotos}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Video className="w-4 h-4" />
              <span className="text-sm">Videos</span>
            </div>
            <div className="font-semibold text-lg">{event.totalVideos}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">Contributors</span>
            </div>
            <div className="font-semibold text-lg">
              {event.totalContributors}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare?.(event.id)}
              className="flex-1"
            >
              <QrCode className="w-4 h-4 mr-1" />
              Share QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(event.id)}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSettings?.(event.id)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Expiration Warning */}
        {isExpiringSoon && !isExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Event expires{' '}
                {formatDistanceToNow(new Date(event.expiresAt!), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
