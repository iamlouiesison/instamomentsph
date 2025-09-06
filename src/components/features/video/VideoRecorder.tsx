"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Video, Square, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, thumbnailBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  className?: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
  hasPermission: boolean;
  isInitializing: boolean;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoRecorded,
  onCancel,
  maxDuration = 20,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
    hasPermission: false,
    isInitializing: false,
  });

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isInitializing: true, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setState((prev) => ({
        ...prev,
        hasPermission: true,
        isInitializing: false,
      }));
    } catch (error) {
      console.error("Camera initialization failed:", error);
      setState((prev) => ({
        ...prev,
        error: "Camera access denied or not available",
        isInitializing: false,
        hasPermission: false,
      }));
    }
  }, []);

  // Generate thumbnail from video
  const generateThumbnail = useCallback(
    async (videoBlob: Blob) => {
      try {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(videoBlob);

        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        video.currentTime = Math.min(2, video.duration / 2); // Get frame at 2s or middle

        await new Promise((resolve) => {
          video.onseeked = resolve;
        });

        const canvas =
          thumbnailCanvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Canvas context not available");

        canvas.width = 320;
        canvas.height = 240;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (thumbnailBlob) => {
            if (thumbnailBlob) {
              onVideoRecorded(videoBlob, thumbnailBlob);
            }
            URL.revokeObjectURL(video.src);
          },
          "image/jpeg",
          0.8,
        );
      } catch (error) {
        console.error("Thumbnail generation failed:", error);
        // Still proceed with video recording even if thumbnail fails
        onVideoRecorded(videoBlob, new Blob());
      }
    },
    [onVideoRecorded],
  );

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      setState((prev) => ({ ...prev, isRecording: false }));

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state.isRecording]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
        generateThumbnail(videoBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms

      setState((prev) => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
      }));

      // Start timer
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newDuration = prev.duration + 0.1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return { ...prev, duration: maxDuration };
          }
          return { ...prev, duration: newDuration };
        });
      }, 100);
    } catch (error) {
      console.error("Recording start failed:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to start recording",
        isRecording: false,
      }));
    }
  }, [maxDuration, generateThumbnail, stopRecording]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (state.isPaused) {
      mediaRecorderRef.current.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    } else {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.isPaused]);

  // Re-record
  const reRecord = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      duration: 0,
      error: null,
    }));
    chunksRef.current = [];
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return cleanup;
  }, [initializeCamera, cleanup]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (state.duration / maxDuration) * 100;
  const remainingTime = maxDuration - state.duration;

  if (!state.hasPermission && !state.isInitializing) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <Alert className="mb-4">
          <AlertDescription>
            {state.error || "Camera access is required to record videos"}
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <Button onClick={initializeCamera} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  if (state.isInitializing) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Initializing camera...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            muted
            playsInline
          />

          {/* Recording Overlay */}
          {state.isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                {state.isPaused ? "PAUSED" : "REC"}
              </span>
            </div>
          )}

          {/* Timer Overlay */}
          <div className="absolute top-4 right-4">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-sm font-bold",
                remainingTime <= 5
                  ? "bg-red-500 text-white"
                  : "bg-black/50 text-white",
              )}
            >
              {formatTime(state.duration)} / {formatTime(maxDuration)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Recording Progress</span>
            <span>{remainingTime.toFixed(1)}s remaining</span>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!state.isRecording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-red-500 hover:bg-red-600"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={togglePause} variant="outline" size="lg">
                {state.isPaused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          {state.duration > 0 && !state.isRecording && (
            <Button variant="outline" onClick={reRecord}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-record
            </Button>
          )}
        </div>
      </div>

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={thumbnailCanvasRef} className="hidden" />
    </Card>
  );
};
