"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Share2,
  Search,
  // Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  // Wifi,
  WifiOff,
  Play,
  Camera,
  Video,
  // Heart,
  // MoreHorizontal,
} from "lucide-react";
import { CalendarIcon } from "@/components/ui/calendar-icon";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGalleryRealtime } from "@/hooks/useGalleryRealtime";
import { Photo, Video as VideoType } from "@/types/database";
import {
  LoadingSpinner,
  GalleryLoading,
} from "@/components/instamoments/loading-states";

interface PhotoGalleryProps {
  eventId: string;
  allowDownloads?: boolean;
  maxPhotos?: number;
  currentUser?: User | null;
  isAuthenticated?: boolean;
}

interface MediaItem extends Photo {
  type: "photo";
}

interface VideoItem extends VideoType {
  type: "video";
}

type GalleryItem = MediaItem | VideoItem;

export function PhotoGallery({
  eventId,
  allowDownloads = true,
  // currentUser,
  // isAuthenticated = false,
}: PhotoGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contributorFilter, setContributorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "contributor">(
    "newest",
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
      (item.type === "photo" ? item.caption : item.message)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.contributor_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContributor =
      contributorFilter === "all" ||
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
    [hasMore, loading, loadMore],
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
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          setIsLightboxOpen(false);
          break;
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case "r":
          setRotation((prev) => (prev + 90) % 360);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      toast.error("Downloads are not allowed for this event");
      return;
    }

    try {
      const fileUrl = item.type === "photo" ? item.file_url : item.file_url;
      const fileName = item.type === "photo" ? item.file_name : item.file_name;

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle share
  const handleShare = async (item: GalleryItem) => {
    try {
      const caption = item.type === "photo" ? item.caption : item.message;
      const fileUrl = item.type === "photo" ? item.file_url : item.file_url;

      const shareData = {
        title: `${item.type === "photo" ? "Photo" : "Video"} from ${item.contributor_name}`,
        text: caption || `Check out this ${item.type}!`,
        url: fileUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(fileUrl);
        toast.success("Photo URL copied to clipboard");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share photo");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setContributorFilter("all");
    setSortBy("newest");
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

  // Show loading state while initial data is being fetched
  if (loading && items.length === 0) {
    return <GalleryLoading count={12} />;
  }

  return (
    <div className="space-y-6">
      {/* Connection Status and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Offline</span>
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {stats.totalPhotos} photos • {stats.totalVideos} videos
          </span>
        </div>
      </div>

      {/* Google Photos Style Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Select
            value={contributorFilter}
            onValueChange={setContributorFilter}
          >
            <SelectTrigger className="w-40 bg-background/50 border-border/50">
              <SelectValue placeholder="All people" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All people</SelectItem>
              {contributors.map((contributor) => (
                <SelectItem key={contributor} value={contributor}>
                  {contributor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: "newest" | "oldest" | "contributor") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-32 bg-background/50 border-border/50">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="contributor">By person</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || contributorFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Google Photos Style Gallery Grid */}
      {filteredItems.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery || contributorFilter !== "all"
              ? "No photos found"
              : "No photos yet"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery || contributorFilter !== "all"
              ? "Try adjusting your search or filters to see more photos"
              : "Be the first to share a memory from this event!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Google Photos Style Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-2 space-y-2">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="relative group cursor-pointer break-inside-avoid mb-2 rounded-lg overflow-hidden bg-muted hover:shadow-lg transition-all duration-200"
                onClick={() => handleItemClick(item, index)}
              >
                {/* Image Container */}
                <div className="relative">
                  <Image
                    src={item.thumbnail_url || item.file_url}
                    alt={
                      (item.type === "photo" ? item.caption : item.message) ||
                      `${item.type === "photo" ? "Photo" : "Video"} by ${item.contributor_name}`
                    }
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    priority={index === 0}
                  />

                  {/* Video Play Button Overlay */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 text-primary ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  {/* Type Indicator */}
                  <div className="absolute top-2 left-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-black/60 rounded-md">
                      {item.type === "video" ? (
                        <Video className="h-3 w-3 text-white" />
                      ) : (
                        <Camera className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.contributor_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <CalendarIcon size="xs" variant="muted" />
                        {format(new Date(item.uploaded_at), "MMM d")}
                      </div>
                    </div>
                    {(item.type === "photo" ? item.caption : item.message) && (
                      <p className="text-xs text-white/90 truncate">
                        {item.type === "photo" ? item.caption : item.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Loading more photos...</span>
              </div>
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
            <DialogTitle className="sr-only">
              Photo Gallery -{" "}
              {selectedItem?.type === "photo" ? "Photo" : "Video"} Viewer
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedItem?.type === "photo"
                ? `Viewing photo: ${selectedItem.caption || "Untitled photo"}`
                : `Viewing video: ${(selectedItem as VideoItem)?.message || "Untitled video"}`}
            </DialogDescription>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
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
                {selectedItem.type === "video" ? (
                  <video
                    src={selectedItem.file_url}
                    controls
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: "transform 0.2s ease",
                    }}
                  />
                ) : (
                  <Image
                    src={selectedItem.file_url}
                    alt={
                      (selectedItem.type === "photo"
                        ? selectedItem.caption
                        : (selectedItem as VideoItem).message) ||
                      `${selectedItem.type === "photo" ? "Photo" : "Video"} by ${selectedItem.contributor_name}`
                    }
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: "transform 0.2s ease",
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
                {(selectedItem.type === "photo"
                  ? selectedItem.caption
                  : (selectedItem as VideoItem).message) && (
                  <p className="text-sm">
                    {selectedItem.type === "photo"
                      ? selectedItem.caption
                      : (selectedItem as VideoItem).message}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon size="xs" variant="muted" />
                    {format(
                      new Date(selectedItem.uploaded_at),
                      "MMM d, yyyy h:mm a",
                    )}
                  </div>
                  <div className="flex items-center gap-1">
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
