/**
 * Event expiration handling and cleanup service
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSubscriptionLimits } from './subscription-limits';

export interface ExpiredEvent {
  id: string;
  name: string;
  hostId: string;
  gallerySlug: string;
  subscriptionTier: string;
  totalPhotos: number;
  totalVideos: number;
  createdAt: string;
  expiresAt: string;
}

export interface ExpirationStats {
  totalExpired: number;
  totalPhotosDeleted: number;
  totalVideosDeleted: number;
  totalStorageFreed: number; // in bytes
}

/**
 * Find events that have expired
 */
export async function findExpiredEvents(): Promise<ExpiredEvent[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      host_id,
      gallery_slug,
      subscription_tier,
      total_photos,
      total_videos,
      created_at,
      expires_at
    `)
    .eq('status', 'active')
    .lt('expires_at', now);

  if (error) {
    console.error('Error finding expired events:', error);
    throw new Error('Failed to find expired events');
  }

  return events || [];
}

/**
 * Mark an event as expired
 */
export async function markEventAsExpired(eventId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('events')
    .update({ 
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error marking event as expired:', error);
    throw new Error('Failed to mark event as expired');
  }
}

/**
 * Delete photos and videos for an expired event
 */
export async function deleteEventContent(eventId: string): Promise<{
  photosDeleted: number;
  videosDeleted: number;
  storageFreed: number;
}> {
  const supabase = createAdminClient();
  let photosDeleted = 0;
  let videosDeleted = 0;
  let storageFreed = 0;

  try {
    // Get photos to delete
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, file_url, thumbnail_url, file_size')
      .eq('event_id', eventId);

    if (photosError) {
      console.error('Error fetching photos for deletion:', photosError);
      throw new Error('Failed to fetch photos for deletion');
    }

    // Get videos to delete
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, file_url, thumbnail_url, file_size')
      .eq('event_id', eventId);

    if (videosError) {
      console.error('Error fetching videos for deletion:', videosError);
      throw new Error('Failed to fetch videos for deletion');
    }

    // Delete photos from storage
    if (photos && photos.length > 0) {
      const photoUrls = photos
        .map(p => [p.file_url, p.thumbnail_url])
        .flat()
        .filter(Boolean);

      const { error: photoStorageError } = await supabase.storage
        .from('photos')
        .remove(photoUrls);

      if (photoStorageError) {
        console.error('Error deleting photos from storage:', photoStorageError);
        // Continue with database cleanup even if storage deletion fails
      }

      // Delete photos from database
      const { error: photoDbError } = await supabase
        .from('photos')
        .delete()
        .eq('event_id', eventId);

      if (photoDbError) {
        console.error('Error deleting photos from database:', photoDbError);
        throw new Error('Failed to delete photos from database');
      }

      photosDeleted = photos.length;
      storageFreed += photos.reduce((sum, p) => sum + (p.file_size || 0), 0);
    }

    // Delete videos from storage
    if (videos && videos.length > 0) {
      const videoUrls = videos
        .map(v => [v.file_url, v.thumbnail_url])
        .flat()
        .filter(Boolean);

      const { error: videoStorageError } = await supabase.storage
        .from('videos')
        .remove(videoUrls);

      if (videoStorageError) {
        console.error('Error deleting videos from storage:', videoStorageError);
        // Continue with database cleanup even if storage deletion fails
      }

      // Delete videos from database
      const { error: videoDbError } = await supabase
        .from('videos')
        .delete()
        .eq('event_id', eventId);

      if (videoDbError) {
        console.error('Error deleting videos from database:', videoDbError);
        throw new Error('Failed to delete videos from database');
      }

      videosDeleted = videos.length;
      storageFreed += videos.reduce((sum, v) => sum + (v.file_size || 0), 0);
    }

    return { photosDeleted, videosDeleted, storageFreed };
  } catch (error) {
    console.error('Error deleting event content:', error);
    throw error;
  }
}

/**
 * Process expired events (mark as expired and optionally delete content)
 */
export async function processExpiredEvents(
  deleteContent: boolean = false
): Promise<ExpirationStats> {
  const expiredEvents = await findExpiredEvents();
  const stats: ExpirationStats = {
    totalExpired: 0,
    totalPhotosDeleted: 0,
    totalVideosDeleted: 0,
    totalStorageFreed: 0,
  };

  for (const event of expiredEvents) {
    try {
      // Mark event as expired
      await markEventAsExpired(event.id);
      stats.totalExpired++;

      // Delete content if requested
      if (deleteContent) {
        const contentStats = await deleteEventContent(event.id);
        stats.totalPhotosDeleted += contentStats.photosDeleted;
        stats.totalVideosDeleted += contentStats.videosDeleted;
        stats.totalStorageFreed += contentStats.storageFreed;
      }

      console.log(`Processed expired event: ${event.name} (${event.id})`);
    } catch (error) {
      console.error(`Error processing expired event ${event.id}:`, error);
      // Continue processing other events
    }
  }

  return stats;
}

/**
 * Calculate expiration date for an event
 */
export function calculateExpirationDate(
  createdAt: string | Date,
  subscriptionTier: string
): Date {
  const created = new Date(createdAt);
  const limits = getSubscriptionLimits(subscriptionTier);
  
  return new Date(
    created.getTime() + limits.storageDays * 24 * 60 * 60 * 1000
  );
}

/**
 * Check if an event is expiring soon (within 24 hours)
 */
export function isEventExpiringSoon(
  expiresAt: string | Date,
  hoursThreshold: number = 24
): boolean {
  const expiration = new Date(expiresAt);
  const now = new Date();
  const hoursUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilExpiration <= hoursThreshold && hoursUntilExpiration > 0;
}

/**
 * Get events expiring soon
 */
export async function getEventsExpiringSoon(
  hoursThreshold: number = 24
): Promise<ExpiredEvent[]> {
  const supabase = createAdminClient();
  const now = new Date();
  const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      host_id,
      gallery_slug,
      subscription_tier,
      total_photos,
      total_videos,
      created_at,
      expires_at
    `)
    .eq('status', 'active')
    .gte('expires_at', now.toISOString())
    .lte('expires_at', threshold.toISOString());

  if (error) {
    console.error('Error finding events expiring soon:', error);
    throw new Error('Failed to find events expiring soon');
  }

  return events || [];
}

/**
 * Extend event expiration (for upgrades)
 */
export async function extendEventExpiration(
  eventId: string,
  newSubscriptionTier: string
): Promise<void> {
  const supabase = createAdminClient();
  const newExpirationDate = calculateExpirationDate(
    new Date().toISOString(),
    newSubscriptionTier
  );

  const { error } = await supabase
    .from('events')
    .update({
      subscription_tier: newSubscriptionTier,
      expires_at: newExpirationDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error extending event expiration:', error);
    throw new Error('Failed to extend event expiration');
  }
}

/**
 * Archive an event (soft delete)
 */
export async function archiveEvent(eventId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('events')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error archiving event:', error);
    throw new Error('Failed to archive event');
  }
}

/**
 * Restore an archived event
 */
export async function restoreEvent(eventId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('events')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error restoring event:', error);
    throw new Error('Failed to restore event');
  }
}
