import { Database } from '@/types/database';

// Database Event type (snake_case)
type DatabaseEvent = Database['public']['Tables']['events']['Row'];

// Frontend Event interface (camelCase)
export interface FrontendEvent {
  id: string;
  name: string;
  description?: string;
  eventType:
    | 'wedding'
    | 'birthday'
    | 'corporate'
    | 'graduation'
    | 'anniversary'
    | 'debut'
    | 'other';
  eventDate?: string;
  location?: string;
  gallerySlug: string;
  subscriptionTier: string;
  totalPhotos: number;
  totalVideos: number;
  totalContributors: number;
  status: 'active' | 'expired' | 'archived';
  createdAt: string;
  expiresAt?: string;
  hasVideoAddon: boolean;
  requiresModeration: boolean;
}

/**
 * Transform database event data (snake_case) to frontend event interface (camelCase)
 */
export function transformDatabaseEventToFrontend(
  dbEvent: DatabaseEvent
): FrontendEvent {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    description: dbEvent.description || undefined,
    eventType: dbEvent.event_type,
    eventDate: dbEvent.event_date || undefined,
    location: dbEvent.location || undefined,
    gallerySlug: dbEvent.gallery_slug,
    subscriptionTier: dbEvent.subscription_tier || 'free',
    totalPhotos: dbEvent.total_photos,
    totalVideos: dbEvent.total_videos,
    totalContributors: dbEvent.total_contributors,
    status: dbEvent.status,
    createdAt: dbEvent.created_at
      ? new Date(dbEvent.created_at).toISOString()
      : new Date().toISOString(),
    expiresAt: dbEvent.expires_at
      ? new Date(dbEvent.expires_at).toISOString()
      : undefined,
    hasVideoAddon: dbEvent.has_video_addon,
    requiresModeration: dbEvent.requires_moderation,
  };
}

/**
 * Transform array of database events to frontend events
 */
export function transformDatabaseEventsToFrontend(
  dbEvents: DatabaseEvent[]
): FrontendEvent[] {
  return dbEvents.map(transformDatabaseEventToFrontend);
}
