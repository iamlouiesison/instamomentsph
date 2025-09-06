'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Share2,
  Clock,
  User,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  uploadedBy?: string;
  duration?: number;
  isGreeting?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  hasError: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  caption,
  uploadedBy,
  duration,
  isGreeting = false,
  autoPlay = false,
  showControls = true,
  className,
  onDownload,
  onShare,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    currentTime: 0,
    duration: duration || 0,
    volume: 1,
    isLoading: true,
    hasError: false,
  });

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (state.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [state.isPlaying]);

  // Handle mute/unmute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = !state.isMuted;
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, [state.isMuted]);

  // Handle progress bar click
  const handleProgressClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * state.duration;

      videoRef.current.currentTime = newTime;
      setState((prev) => ({ ...prev, currentTime: newTime }));
    },
    [state.duration]
  );

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;

    setState((prev) => ({
      ...prev,
      duration: videoRef.current!.duration,
      isLoading: false,
    }));
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    setState((prev) => ({
      ...prev,
      currentTime: videoRef.current!.currentTime,
    }));
  }, []);

  const handlePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleError = useCallback(() => {
    setState((prev) => ({ ...prev, hasError: true, isLoading: false }));
  }, []);

  const handleLoadStart = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, hasError: false }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && videoRef.current && !state.isPlaying) {
      videoRef.current.play();
    }
  }, [autoPlay, state.isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progressPercentage =
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  if (state.hasError) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <div className="space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h3 className="text-lg font-semibold">Video Error</h3>
          <p className="text-muted-foreground">
            Unable to load video. Please check the URL or try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black group',
          state.isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg'
        )}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          playsInline
          preload="metadata"
        />

        {/* Loading Overlay */}
        {state.isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!state.isPlaying && !state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={togglePlay}
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {state.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {state.isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                <div className="flex items-center space-x-2 text-white text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(state.currentTime)} /{' '}
                    {formatTime(state.duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isGreeting && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/20 text-yellow-200"
                  >
                    Greeting
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={onShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Info Overlay */}
        {(title || caption || uploadedBy) && (
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
              {title && (
                <h3 className="text-white font-semibold text-sm mb-1">
                  {title}
                </h3>
              )}
              {caption && (
                <p className="text-white/80 text-xs mb-1 flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {caption}
                </p>
              )}
              {uploadedBy && (
                <p className="text-white/60 text-xs flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {uploadedBy}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
