'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { VideoPlayer } from '../video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Download,
  Share2,
  Clock,
  User,
  Grid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedBy?: string;
  duration: number;
  isGreeting: boolean;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
}

interface VideoGalleryProps {
  videos: Video[];
  onDownload?: (video: Video) => void;
  onShare?: (video: Video) => void;
  showGreetingsOnly?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onDownload,
  onShare,
  showGreetingsOnly = false,
  className,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Filter videos based on greeting preference
  const filteredVideos = showGreetingsOnly
    ? videos.filter((video) => video.isGreeting)
    : videos;

  // Handle video selection
  const handleVideoSelect = useCallback((video: Video) => {
    setSelectedVideo(video);
    setPlayingVideoId(video.id);
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(
    (videoId: string) => {
      if (playingVideoId === videoId) {
        setPlayingVideoId(null);
      } else {
        setPlayingVideoId(videoId);
      }
    },
    [playingVideoId]
  );

  if (filteredVideos.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <div className="space-y-4">
          <div className="text-6xl">🎥</div>
          <h3 className="text-lg font-semibold">No Videos Yet</h3>
          <p className="text-muted-foreground">
            {showGreetingsOnly
              ? 'No greeting videos have been uploaded yet.'
              : 'No videos have been uploaded to this event yet.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">
            Videos ({filteredVideos.length})
          </h3>
          {showGreetingsOnly && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-700"
            >
              Greetings Only
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Grid/List */}
      <div
        className={cn(
          'gap-4',
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'space-y-4'
        )}
      >
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isPlaying={playingVideoId === video.id}
            viewMode={viewMode}
            onSelect={() => handleVideoSelect(video)}
            onPlayPause={() => handlePlayPause(video.id)}
            onDownload={() => onDownload?.(video)}
            onShare={() => onShare?.(video)}
          />
        ))}
      </div>

      {/* Video Modal/Detail View */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <VideoPlayer
              videoUrl={selectedVideo.url}
              thumbnailUrl={selectedVideo.thumbnailUrl}
              title={`Video by ${selectedVideo.uploadedBy}`}
              caption={selectedVideo.caption}
              uploadedBy={selectedVideo.uploadedBy}
              duration={selectedVideo.duration}
              isGreeting={selectedVideo.isGreeting}
              autoPlay={true}
              showControls={true}
              onDownload={() => onDownload?.(selectedVideo)}
              onShare={() => onShare?.(selectedVideo)}
            />
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedVideo(null)}
                className="bg-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Video Card Component
interface VideoCardProps {
  video: Video;
  isPlaying: boolean;
  viewMode: ViewMode;
  onSelect: () => void;
  onPlayPause: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isPlaying,
  viewMode,
  onSelect,
  onPlayPause,
  onDownload,
  onShare,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (viewMode === 'list') {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt="Video thumbnail"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-6 h-6 text-gray-400" />
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-1 right-1">
              <Badge
                variant="secondary"
                className="text-xs bg-black/70 text-white"
              >
                {formatDuration(video.duration)}
              </Badge>
            </div>
          </div>

          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium truncate">
                {video.caption || 'Untitled Video'}
              </h4>
              {video.isGreeting && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/20 text-yellow-700 text-xs"
                >
                  Greeting
                </Badge>
              )}
              {video.status === 'processing' && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-700 text-xs"
                >
                  Processing
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {video.uploadedBy}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(video.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onSelect}>
              View
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="overflow-hidden group cursor-pointer" onClick={onSelect}>
      <div className="relative aspect-video bg-gray-200">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt="Video thumbnail"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="lg"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="bg-black/70 text-white text-xs">
            {formatDuration(video.duration)}
          </Badge>
        </div>

        {/* Greeting Badge */}
        {video.isGreeting && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="bg-yellow-500/80 text-yellow-900 text-xs"
            >
              Greeting
            </Badge>
          </div>
        )}

        {/* Processing Badge */}
        {video.status === 'processing' && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-blue-500/80 text-blue-900 text-xs"
            >
              Processing
            </Badge>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-3">
        <h4 className="font-medium text-sm mb-1 truncate">
          {video.caption || 'Untitled Video'}
        </h4>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            {video.uploadedBy}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(video.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
};
