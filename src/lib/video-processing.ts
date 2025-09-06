/**
 * Video processing utilities for compression, validation, and thumbnail generation
 */

export interface VideoProcessingOptions {
  maxDuration: number; // in seconds
  maxFileSize: number; // in bytes
  targetWidth: number;
  targetHeight: number;
  quality: number; // 0-1
}

export interface VideoValidationResult {
  isValid: boolean;
  errors: string[];
  duration: number;
  fileSize: number;
  dimensions: { width: number; height: number };
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality: number;
  timeOffset: number; // in seconds
}

const DEFAULT_OPTIONS: VideoProcessingOptions = {
  maxDuration: 20,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  targetWidth: 1280,
  targetHeight: 720,
  quality: 0.8,
};

/**
 * Validate video file for upload requirements
 */
export async function validateVideo(
  file: File | Blob,
  options: Partial<VideoProcessingOptions> = {},
): Promise<VideoValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];

  // Check file size
  if (file.size > opts.maxFileSize) {
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${(opts.maxFileSize / 1024 / 1024).toFixed(1)}MB`,
    );
  }

  // Check file type
  const supportedTypes = ["video/webm", "video/mp4", "video/quicktime"];
  if (!supportedTypes.some((type) => file.type.includes(type))) {
    errors.push("Unsupported video format. Please use MP4 or WebM");
  }

  // Get video metadata
  const metadata = await getVideoMetadata(file);

  if (metadata.duration > opts.maxDuration) {
    errors.push(
      `Video duration ${metadata.duration.toFixed(1)}s exceeds limit of ${opts.maxDuration}s`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    duration: metadata.duration,
    fileSize: file.size,
    dimensions: metadata.dimensions,
  };
}

/**
 * Get video metadata (duration, dimensions)
 */
export async function getVideoMetadata(file: File | Blob): Promise<{
  duration: number;
  dimensions: { width: number; height: number };
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        dimensions: {
          width: video.videoWidth,
          height: video.videoHeight,
        },
      };
      URL.revokeObjectURL(url);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = url;
  });
}

/**
 * Compress video using MediaRecorder API
 */
export async function compressVideo(
  videoBlob: Blob,
  options: Partial<VideoProcessingOptions> = {},
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    video.onloadedmetadata = () => {
      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      let newWidth = opts.targetWidth;
      let newHeight = opts.targetHeight;

      if (aspectRatio > 1) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Create new video element for recording
      const compressedVideo = document.createElement("video");
      compressedVideo.width = newWidth;
      compressedVideo.height = newHeight;
      compressedVideo.src = video.src;

      // Use MediaRecorder to re-encode with compression
      const stream = canvas.captureStream(30); // 30fps
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 1000000, // 1Mbps
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: "video/webm" });
        URL.revokeObjectURL(video.src);
        resolve(compressedBlob);
      };

      mediaRecorder.onerror = (error) => {
        URL.revokeObjectURL(video.src);
        reject(error);
      };

      // Start recording
      mediaRecorder.start();

      // Draw video frames to canvas
      const drawFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop();
          return;
        }

        ctx.drawImage(video, 0, 0, newWidth, newHeight);
        requestAnimationFrame(drawFrame);
      };

      video.play();
      drawFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video for compression"));
    };

    video.src = URL.createObjectURL(videoBlob);
  });
}

/**
 * Generate thumbnail from video at specific time offset
 */
export async function generateVideoThumbnail(
  videoBlob: Blob,
  options: Partial<ThumbnailOptions> = {},
): Promise<Blob> {
  const opts: ThumbnailOptions = {
    width: 320,
    height: 240,
    quality: 0.8,
    timeOffset: 2,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    video.onloadedmetadata = () => {
      // Set canvas dimensions
      canvas.width = opts.width;
      canvas.height = opts.height;

      // Seek to time offset
      video.currentTime = Math.min(opts.timeOffset, video.duration / 2);
    };

    video.onseeked = () => {
      // Calculate aspect ratio and draw
      const aspectRatio = video.videoWidth / video.videoHeight;
      let drawWidth = opts.width;
      let drawHeight = opts.height;

      if (aspectRatio > 1) {
        drawHeight = drawWidth / aspectRatio;
      } else {
        drawWidth = drawHeight * aspectRatio;
      }

      const x = (opts.width - drawWidth) / 2;
      const y = (opts.height - drawHeight) / 2;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, opts.width, opts.height);
      ctx.drawImage(video, x, y, drawWidth, drawHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate thumbnail"));
          }
        },
        "image/jpeg",
        opts.quality,
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video for thumbnail generation"));
    };

    video.src = URL.createObjectURL(videoBlob);
  });
}

/**
 * Get video duration from blob
 */
export async function getVideoDuration(videoBlob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(video.src);
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video"));
    };

    video.src = URL.createObjectURL(videoBlob);
  });
}

/**
 * Check if browser supports video recording
 */
export function isVideoRecordingSupported(): boolean {
  return !!(
    typeof window !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * Get supported video MIME types for recording
 */
export function getSupportedVideoMimeTypes(): string[] {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];

  return types.filter((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
