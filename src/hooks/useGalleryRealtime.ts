'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Photo, Video } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

interface GalleryItem extends Photo {
  type: 'photo';
}

interface VideoItem extends Video {
  type: 'video';
}

type MediaItem = GalleryItem | VideoItem;

interface GalleryStats {
  totalPhotos: number;
  totalVideos: number;
  totalContributors: number;
}

interface UseGalleryRealtimeOptions {
  search?: string;
  contributor?: string;
  sortBy?: 'newest' | 'oldest' | 'contributor';
  limit?: number;
}

interface UseGalleryRealtimeReturn {
  items: MediaItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  isConnected: boolean;
  contributors: string[];
  stats: GalleryStats;
  refresh: () => void;
}

export function useGalleryRealtime(
  eventId: string,
  options: UseGalleryRealtimeOptions = {}
): UseGalleryRealtimeReturn {
  const { sortBy = 'newest', limit = 20 } = options;

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [contributors, setContributors] = useState<string[]>([]);
  const [stats, setStats] = useState<GalleryStats>({
    totalPhotos: 0,
    totalVideos: 0,
    totalContributors: 0,
  });

  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentPageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data with debouncing
  const fetchData = useCallback(
    async (page = 0, reset = false) => {
      if (isLoadingRef.current) return;

      // Clear any pending fetch
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      // Debounce fetch calls
      fetchTimeoutRef.current = setTimeout(async () => {
        isLoadingRef.current = true;
        setLoading(page === 0);

        try {
          // Get the gallery slug from the eventId (assuming eventId is the gallery slug)
          const gallerySlug = eventId;

          // Build query parameters
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: sortBy,
            type: 'photos', // Only fetch photos for now
          });

          // Add search and contributor filters if provided
          if (options.search) {
            params.set('search', options.search);
          }
          if (options.contributor) {
            params.set('contributor', options.contributor);
          }

          // Fetch data from API endpoint
          const response = await fetch(
            `/api/gallery/${gallerySlug}/photos?${params.toString()}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(
              result.error?.message || 'Failed to fetch gallery data'
            );
          }

          const { items, pagination } = result.data;

          // Map API response to MediaItem format
          const mediaItems: MediaItem[] = items.map(
            (item: Record<string, unknown>) => ({
              id: item.id,
              event_id: eventId,
              contributor_name: item.uploaded_by || 'Unknown',
              contributor_email: '',
              file_name: (item.url as string)?.split('/').pop() || '',
              file_url: item.url,
              thumbnail_url: item.thumbnail_url,
              file_size: item.file_size || 0,
              mime_type: 'image/jpeg', // Default for now
              caption: item.caption || '',
              uploaded_at: item.created_at,
              is_approved: true,
              exif_data: null,
              type: item.type,
              message: item.type === 'video' ? item.caption : undefined,
            })
          );

          if (reset) {
            setItems(mediaItems);
            currentPageRef.current = 0;
          } else {
            setItems((prev) => [...prev, ...mediaItems]);
          }

          setHasMore(pagination.hasMore);
          setError(null);

          // Extract contributors from items
          const uniqueContributors = [
            ...new Set(mediaItems.map((item) => item.contributor_name)),
          ].sort();
          setContributors(uniqueContributors);

          // Set stats from pagination
          setStats({
            totalPhotos: pagination.total,
            totalVideos: 0, // We'll need to update this if we have videos
            totalContributors: uniqueContributors.length,
          });
        } catch (err) {
          console.error('Error fetching gallery data:', err);
          setError(
            err instanceof Error ? err.message : 'Failed to load gallery'
          );
        } finally {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }, 100); // 100ms debounce
    },
    [eventId, limit, sortBy, options.search, options.contributor]
  );

  // Load more data
  const loadMore = useCallback(() => {
    if (!hasMore || loading || isLoadingRef.current) return;

    currentPageRef.current += 1;
    fetchData(currentPageRef.current, false);
  }, [hasMore, loading, fetchData]);

  // Refresh data
  const refresh = useCallback(() => {
    currentPageRef.current = 0;
    fetchData(0, true);
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    if (!eventId) return;

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Create new channel
    const channel = supabase
      .channel(`gallery-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newPhoto: GalleryItem = {
            ...(payload.new as Photo),
            type: 'photo' as const,
          };

          setItems((prev) => {
            // Check if photo already exists (avoid duplicates)
            const exists = prev.some((item) => item.id === newPhoto.id);
            if (exists) return prev;

            // Add to beginning for newest first, or end for oldest first
            if (sortBy === 'newest') {
              return [newPhoto, ...prev];
            } else {
              return [...prev, newPhoto];
            }
          });

          // Update stats
          setStats((prev) => ({
            ...prev,
            totalPhotos: prev.totalPhotos + 1,
          }));

          // Update contributors
          setContributors((prev) => {
            if (!prev.includes(newPhoto.contributor_name)) {
              return [...prev, newPhoto.contributor_name].sort();
            }
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'videos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newVideo: VideoItem = {
            ...(payload.new as Video),
            type: 'video' as const,
            message: (payload.new as Video).message,
          };

          setItems((prev) => {
            // Check if video already exists (avoid duplicates)
            const exists = prev.some((item) => item.id === newVideo.id);
            if (exists) return prev;

            // Add to beginning for newest first, or end for oldest first
            if (sortBy === 'newest') {
              return [newVideo, ...prev];
            } else {
              return [...prev, newVideo];
            }
          });

          // Update stats
          setStats((prev) => ({
            ...prev,
            totalVideos: prev.totalVideos + 1,
          }));

          // Update contributors
          setContributors((prev) => {
            if (!prev.includes(newVideo.contributor_name)) {
              return [...prev, newVideo.contributor_name].sort();
            }
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const updatedPhoto: GalleryItem = {
            ...(payload.new as Photo),
            type: 'photo' as const,
          };

          setItems((prev) =>
            prev.map((item) =>
              item.id === updatedPhoto.id ? updatedPhoto : item
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const updatedVideo: VideoItem = {
            ...(payload.new as Video),
            type: 'video' as const,
            message: (payload.new as Video).message,
          };

          setItems((prev) =>
            prev.map((item) =>
              item.id === updatedVideo.id ? updatedVideo : item
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setItems((prev) => prev.filter((item) => item.id !== payload.old.id));

          // Update stats
          setStats((prev) => ({
            ...prev,
            totalPhotos: Math.max(0, prev.totalPhotos - 1),
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'videos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setItems((prev) => prev.filter((item) => item.id !== payload.old.id));

          // Update stats
          setStats((prev) => ({
            ...prev,
            totalVideos: Math.max(0, prev.totalVideos - 1),
          }));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');

        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error');
          setError('Connection error. Please refresh the page.');
        }
      });

    channelRef.current = channel;

    // Initial data fetch
    fetchData(0, true);

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [eventId, sortBy, supabase, fetchData]);

  // Handle connection status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        // Re-subscribe to restore connection
        setTimeout(() => {
          // Trigger re-subscription by updating dependencies
          fetchData(0, true);
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [eventId, sortBy, fetchData]); // Include fetchData dependency

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    isConnected,
    contributors,
    stats,
    refresh,
  };
}
