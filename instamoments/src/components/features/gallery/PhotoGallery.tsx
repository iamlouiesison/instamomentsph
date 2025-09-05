'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Share2,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { CalendarIcon } from '@/components/ui/calendar-icon';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useGalleryRealtime } from '@/hooks/useGalleryRealtime';
import { Photo, Video } from '@/types/database';

interface PhotoGalleryProps {
  eventId: string;
  allowDownloads?: boolean;
  maxPhotos?: number;
}

interface MediaItem extends Photo {
  type: 'photo';
}

interface VideoItem extends Video {
  type: 'video';
}

type GalleryItem = MediaItem | VideoItem;

export function PhotoGallery({
  eventId,
  allowDownloads = true,
}: PhotoGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contributorFilter, setContributorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'contributor'>(
    'newest'
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    isConnected,
    contributors,
    stats,
  } = useGalleryRealtime(eventId, {
    search: searchQuery,
    contributor: contributorFilter,
    sortBy,
    limit: 20,
  });

  // Filter items based on search and contributor
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      (item.type === 'photo' ? item.caption : item.message)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.contributor_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContributor =
      contributorFilter === 'all' ||
      item.contributor_name === contributorFilter;

    return matchesSearch && matchesContributor;
  });

  // Handle infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleObserver, filteredItems.length]);

  // Handle item click
  const handleItemClick = (item: GalleryItem, index: number) => {
    setSelectedItem(item);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setZoom(1);
    setRotation(0);
  };

  // Handle lightbox navigation
  const handlePrevious = useCallback(() => {
    const newIndex =
      lightboxIndex > 0 ? lightboxIndex - 1 : filteredItems.length - 1;
    setLightboxIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
    setZoom(1);
    setRotation(0);
  }, [lightboxIndex, filteredItems]);

  const handleNext = useCallback(() => {
    const newIndex =
      lightboxIndex < filteredItems.length - 1 ? lightboxIndex + 1 : 0;
    setLightboxIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
    setZoom(1);
    setRotation(0);
  }, [lightboxIndex, filteredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          setIsLightboxOpen(false);
          break;
        case '+':
        case '=':
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case '-':
          setZoom((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case 'r':
          setRotation((prev) => (prev + 90) % 360);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isLightboxOpen,
    lightboxIndex,
    filteredItems.length,
    handleNext,
    handlePrevious,
  ]);

  // Handle download
  const handleDownload = async (item: GalleryItem) => {
    if (!allowDownloads) {
      toast.error('Downloads are not allowed for this event');
      return;
    }

    try {
      const response = await fetch(item.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  // Handle share
  const handleShare = async (item: GalleryItem) => {
    try {
      const shareData = {
        title: `${item.type === 'photo' ? 'Photo' : 'Video'} from ${item.contributor_name}`,
        text:
          (item.type === 'photo' ? item.caption : item.message) ||
          `Check out this ${item.type}!`,
        url: item.file_url,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(item.file_url);
        toast.success('Photo URL copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share photo');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setContributorFilter('all');
    setSortBy('newest');
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <div className="text-red-500 mb-4">
            <WifiOff className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Connection Error</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load gallery. Please check your connection and try
              again.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Live Updates
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {stats.totalPhotos} photos • {stats.totalVideos} videos
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search photos, captions, or contributors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={contributorFilter}
              onValueChange={setContributorFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by contributor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contributors</SelectItem>
                {contributors.map((contributor) => (
                  <SelectItem key={contributor} value={contributor}>
                    {contributor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: 'newest' | 'oldest' | 'contributor') =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="contributor">By Contributor</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || contributorFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {filteredItems.length === 0 && !loading ? (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos found</h3>
              <p className="text-sm">
                {searchQuery || contributorFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No photos have been uploaded yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-muted"
              onClick={() => handleItemClick(item, index)}
            >
              <Image
                src={item.thumbnail_url || item.file_url}
                alt={
                  (item.type === 'photo' ? item.caption : item.message) ||
                  `${item.type === 'photo' ? 'Photo' : 'Video'} by ${item.contributor_name}`
                }
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type === 'video' ? 'VIDEO' : 'PHOTO'}
                </Badge>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  {allowDownloads && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(item);
                    }}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Contributor Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">
                    {item.contributor_name}
                  </div>
                  {(item.type === 'photo' ? item.caption : item.message) && (
                    <div className="truncate text-white/80">
                      {item.type === 'photo' ? item.caption : item.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Intersection observer target */}
          {hasMore && <div ref={lastItemRef} className="h-1" />}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedItem?.contributor_name}
                <span className="text-muted-foreground">
                  ({lightboxIndex + 1} of {filteredItems.length})
                </span>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                {allowDownloads && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedItem && handleDownload(selectedItem)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedItem && handleShare(selectedItem)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center p-6 relative">
            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Image/Video Display */}
            {selectedItem && (
              <div className="relative max-w-full max-h-full">
                {selectedItem.type === 'video' ? (
                  <video
                    src={selectedItem.file_url}
                    controls
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                ) : (
                  <Image
                    src={selectedItem.file_url}
                    alt={
                      (selectedItem.type === 'photo'
                        ? (selectedItem as MediaItem).caption
                        : (selectedItem as VideoItem).message) ||
                      `${selectedItem.type === 'photo' ? 'Photo' : 'Video'} by ${selectedItem.contributor_name}`
                    }
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                    unoptimized
                  />
                )}
              </div>
            )}
          </div>

          {/* Caption and Metadata */}
          {selectedItem && (
            <div className="p-6 pt-0 border-t">
              <div className="space-y-2">
                {(selectedItem.type === 'photo'
                  ? (selectedItem as MediaItem).caption
                  : (selectedItem as VideoItem).message) && (
                  <p className="text-sm">
                    {selectedItem.type === 'photo'
                      ? (selectedItem as MediaItem).caption
                      : (selectedItem as VideoItem).message}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon size="xs" variant="muted" />
                    {format(
                      new Date(selectedItem.uploaded_at),
                      'MMM d, yyyy h:mm a'
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedItem.contributor_name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
