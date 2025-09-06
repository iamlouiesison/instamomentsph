'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wifi,
  WifiOff,
  HardDrive,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface GalleryOptimizationProps {
  eventId: string;
  onOptimize?: () => void;
}

interface CacheStats {
  totalCached: number;
  cacheSize: number;
  lastUpdated: Date | null;
  isOnline: boolean;
}

export function GalleryOptimization({
  eventId,
  onOptimize,
}: GalleryOptimizationProps) {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalCached: 0,
    cacheSize: 0,
    lastUpdated: null,
    isOnline: navigator.onLine,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setCacheStats((prev) => ({ ...prev, isOnline: true }));
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setCacheStats((prev) => ({ ...prev, isOnline: false }));
      toast.warning('You are now offline. Cached content is available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cache statistics
  const loadCacheStats = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cache = await caches.open(`gallery-${eventId}`);
        const keys = await cache.keys();

        let totalSize = 0;
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }

        setCacheStats((prev) => ({
          ...prev,
          totalCached: keys.length,
          cacheSize: totalSize,
          lastUpdated: new Date(),
        }));
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  }, [eventId]);

  useEffect(() => {
    loadCacheStats();
  }, [loadCacheStats]);

  // Optimize gallery for offline viewing
  const handleOptimize = async () => {
    if (!('caches' in window)) {
      toast.error('Browser does not support caching');
      return;
    }

    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      const cache = await caches.open(`gallery-${eventId}`);

      // Fetch gallery data
      const response = await fetch(`/api/gallery/${eventId}/photos?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch gallery data');

      const data = await response.json();
      const items = data.data?.items || [];

      setOptimizationProgress(20);

      // Cache thumbnails and metadata
      let cached = 0;
      for (const item of items) {
        try {
          // Cache thumbnail
          if (item.thumbnail_url) {
            const thumbnailResponse = await fetch(item.thumbnail_url);
            if (thumbnailResponse.ok) {
              await cache.put(item.thumbnail_url, thumbnailResponse.clone());
            }
          }

          // Cache metadata
          const metadataUrl = `/api/gallery/${eventId}/photos/${item.id}`;
          await cache.put(
            metadataUrl,
            new Response(JSON.stringify(item), {
              headers: { 'Content-Type': 'application/json' },
            })
          );

          cached++;
          setOptimizationProgress(20 + (cached / items.length) * 60);
        } catch (error) {
          console.error(`Failed to cache item ${item.id}:`, error);
        }
      }

      setOptimizationProgress(100);
      await loadCacheStats();

      toast.success(`Optimized! Cached ${cached} items for offline viewing`);
      onOptimize?.();
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Failed to optimize gallery for offline viewing');
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        await caches.delete(`gallery-${eventId}`);
        await loadCacheStats();
        toast.success('Cache cleared');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Gallery Optimization
        </CardTitle>
        <CardDescription>
          Optimize gallery performance and enable offline viewing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {cacheStats.isOnline ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {cacheStats.isOnline
                ? 'Real-time updates available'
                : 'Offline mode active'}
            </span>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Cached Items</span>
            </div>
            <div className="text-2xl font-bold">{cacheStats.totalCached}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Cache Size</span>
            </div>
            <div className="text-2xl font-bold">
              {formatFileSize(cacheStats.cacheSize)}
            </div>
          </div>
        </div>

        {/* Optimization Progress */}
        {isOptimizing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Optimizing gallery...</span>
              <span>{optimizationProgress}%</span>
            </div>
            <Progress value={optimizationProgress} className="h-2" />
          </div>
        )}

        {/* Last Updated */}
        {cacheStats.lastUpdated && (
          <div className="text-xs text-muted-foreground text-center">
            Last optimized: {cacheStats.lastUpdated.toLocaleString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing || !cacheStats.isOnline}
            className="flex-1"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Optimize for Offline
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={isOptimizing}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Offline Benefits */}
        {!cacheStats.isOnline && cacheStats.totalCached > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-green-800">
                  Offline Viewing Active
                </div>
                <div className="text-green-700">
                  You can view {cacheStats.totalCached} cached items without
                  internet connection.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800">Performance Tips</div>
              <ul className="text-blue-700 mt-1 space-y-1">
                <li>• Optimize gallery when on WiFi for faster caching</li>
                <li>• Cached content works offline for up to 7 days</li>
                <li>• Clear cache to free up storage space</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
