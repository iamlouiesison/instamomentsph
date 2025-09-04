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
  const {
    search = '',
    contributor = 'all',
    sortBy = 'newest',
    limit = 20,
  } = options;

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

  // Fetch initial data
  const fetchData = useCallback(
    async (page = 0, reset = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      setLoading(page === 0);

      try {
        const offset = page * limit;

        // Fetch photos
        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventId)
          .eq('is_approved', true)
          .order('uploaded_at', { ascending: sortBy === 'oldest' })
          .range(offset, offset + limit - 1);

        if (photosError) throw photosError;

        // Fetch videos
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('event_id', eventId)
          .eq('is_approved', true)
          .order('uploaded_at', { ascending: sortBy === 'oldest' })
          .range(offset, offset + limit - 1);

        if (videosError) throw videosError;

        // Combine and sort media items
        const photoItems: MediaItem[] = photos.map((photo) => ({
          ...photo,
          type: 'photo' as const,
        }));
        const videoItems: MediaItem[] = videos.map((video) => ({
          ...video,
          type: 'video' as const,
        }));

        const combinedItems = [...photoItems, ...videoItems];

        // Sort combined items
        if (sortBy === 'newest') {
          combinedItems.sort(
            (a, b) =>
              new Date(b.uploaded_at).getTime() -
              new Date(a.uploaded_at).getTime()
          );
        } else if (sortBy === 'oldest') {
          combinedItems.sort(
            (a, b) =>
              new Date(a.uploaded_at).getTime() -
              new Date(b.uploaded_at).getTime()
          );
        } else if (sortBy === 'contributor') {
          combinedItems.sort((a, b) =>
            a.contributor_name.localeCompare(b.contributor_name)
          );
        }

        // Apply pagination to combined results
        const startIndex = offset;
        const endIndex = startIndex + limit;
        const paginatedItems = combinedItems.slice(startIndex, endIndex);

        if (reset) {
          setItems(paginatedItems);
          currentPageRef.current = 0;
        } else {
          setItems((prev) => [...prev, ...paginatedItems]);
        }

        setHasMore(paginatedItems.length === limit);
        setError(null);

        // Fetch contributors
        const { data: contributorsData } = await supabase
          .from('event_contributors')
          .select('contributor_name')
          .eq('event_id', eventId)
          .order('contributor_name');

        if (contributorsData) {
          setContributors(contributorsData.map((c) => c.contributor_name));
        }

        // Fetch stats
        const { data: eventData } = await supabase
          .from('events')
          .select('total_photos, total_videos, total_contributors')
          .eq('id', eventId)
          .single();

        if (eventData) {
          setStats({
            totalPhotos: eventData.total_photos || 0,
            totalVideos: eventData.total_videos || 0,
            totalContributors: eventData.total_contributors || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching gallery data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [eventId, limit, sortBy, supabase]
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
          console.log('New photo uploaded:', payload);
          const newPhoto = { ...(payload.new as any), type: 'photo' as const };

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
          console.log('New video uploaded:', payload);
          const newVideo = { ...(payload.new as any), type: 'video' as const };

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
          console.log('Photo updated:', payload);
          const updatedPhoto = {
            ...(payload.new as any),
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
          console.log('Video updated:', payload);
          const updatedVideo = {
            ...(payload.new as any),
            type: 'video' as const,
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
          console.log('Photo deleted:', payload);
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
          console.log('Video deleted:', payload);
          setItems((prev) => prev.filter((item) => item.id !== payload.old.id));

          // Update stats
          setStats((prev) => ({
            ...prev,
            totalVideos: Math.max(0, prev.totalVideos - 1),
          }));
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');

        if (status === 'SUBSCRIBED') {
          console.log('Successfully connected to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
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
    };
  }, [eventId, fetchData, sortBy, supabase]);

  // Handle connection status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
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
      console.log('Connection lost');
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

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
