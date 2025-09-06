"use client";

import React, { useState, useRef, useCallback } from "react";
import { VideoRecorder } from "../video/VideoRecorder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileVideo,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateVideo,
  formatFileSize,
  formatDuration,
} from "@/lib/video-processing";

interface VideoUploadFormProps {
  eventId: string;
  onUploadComplete: (videoId: string) => void;
  onCancel: () => void;
  className?: string;
}

interface UploadState {
  step: "select" | "record" | "upload" | "complete";
  videoFile: File | null;
  thumbnailFile: File | null;
  caption: string;
  isGreeting: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  validationErrors: string[];
}

export const VideoUploadForm: React.FC<VideoUploadFormProps> = ({
  eventId,
  onUploadComplete,
  onCancel,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({
    step: "select",
    videoFile: null,
    thumbnailFile: null,
    caption: "",
    isGreeting: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    validationErrors: [],
  });

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, error: null, validationErrors: [] }));

    // Validate video file
    const validation = await validateVideo(file, {
      maxDuration: 20,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        validationErrors: validation.errors,
        error: "Video validation failed",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      videoFile: file,
      step: "upload",
    }));
  }, []);

  // Handle video recording
  const handleVideoRecorded = useCallback(
    (videoBlob: Blob, thumbnailBlob: Blob) => {
      const videoFile = new File([videoBlob], "recorded-video.webm", {
        type: "video/webm",
      });
      const thumbnailFile = new File([thumbnailBlob], "thumbnail.jpg", {
        type: "image/jpeg",
      });

      setState((prev) => ({
        ...prev,
        videoFile,
        thumbnailFile,
        step: "upload",
      }));
    },
    [],
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!state.videoFile) return;

    setState((prev) => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null,
    }));

    try {
      const formData = new FormData();
      formData.append("video", state.videoFile);
      if (state.thumbnailFile) {
        formData.append("thumbnail", state.thumbnailFile);
      }
      formData.append("eventId", eventId);
      formData.append("caption", state.caption);
      formData.append("isGreeting", state.isGreeting.toString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90),
        }));
      }, 200);

      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Upload failed");
      }

      setState((prev) => ({
        ...prev,
        uploadProgress: 100,
        step: "complete",
      }));

      // Call completion callback after a short delay
      setTimeout(() => {
        onUploadComplete(result.data.id);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Upload failed",
        isUploading: false,
        uploadProgress: 0,
      }));
    }
  }, [
    state.videoFile,
    state.thumbnailFile,
    state.caption,
    state.isGreeting,
    eventId,
    onUploadComplete,
  ]);

  // Reset form
  const handleReset = useCallback(() => {
    setState({
      step: "select",
      videoFile: null,
      thumbnailFile: null,
      caption: "",
      isGreeting: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      validationErrors: [],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Render step content
  const renderStepContent = () => {
    switch (state.step) {
      case "select":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload Video</h3>
              <p className="text-muted-foreground">
                Record a new video or upload an existing one (max 20 seconds)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Record Video */}
              <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Record New Video</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Use your camera to record a 20-second greeting
                </p>
                <Button
                  onClick={() =>
                    setState((prev) => ({ ...prev, step: "record" }))
                  }
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </Card>

              {/* Upload File */}
              <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <FileVideo className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Upload Video File</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose an existing video from your device
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </Card>
            </div>
          </div>
        );

      case "record":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Record Video</h3>
              <p className="text-muted-foreground">
                Record a 20-second greeting video
              </p>
            </div>

            <VideoRecorder
              onVideoRecorded={handleVideoRecorded}
              onCancel={() => setState((prev) => ({ ...prev, step: "select" }))}
              maxDuration={20}
            />
          </div>
        );

      case "upload":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload Details</h3>
              <p className="text-muted-foreground">
                Add details and upload your video
              </p>
            </div>

            {/* Video Preview */}
            {state.videoFile && (
              <div className="space-y-2">
                <Label>Video Preview</Label>
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <video
                    src={URL.createObjectURL(state.videoFile)}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Duration:{" "}
                    {formatDuration((state.videoFile.size / 1000000) * 20)}
                  </span>
                  <span>Size: {formatFileSize(state.videoFile.size)}</span>
                </div>
              </div>
            )}

            {/* Upload Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption for your video..."
                  value={state.caption}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, caption: e.target.value }))
                  }
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {state.caption.length}/500 characters
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGreeting"
                  checked={state.isGreeting}
                  onCheckedChange={(checked) =>
                    setState((prev) => ({ ...prev, isGreeting: checked }))
                  }
                />
                <Label htmlFor="isGreeting">Mark as greeting video</Label>
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={state.isUploading}
              className="w-full"
              size="lg"
            >
              {state.isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Upload Complete!</h3>
            <p className="text-muted-foreground">
              Your video has been uploaded successfully.
            </p>
            <div className="flex space-x-2">
              <Button onClick={handleReset} variant="outline">
                Upload Another
              </Button>
              <Button onClick={onCancel}>Done</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Upload Video</h2>
        {state.step !== "complete" && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {state.validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {state.validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {state.isUploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Uploading video...</span>
            <span>{state.uploadProgress}%</span>
          </div>
          <Progress value={state.uploadProgress} className="h-2" />
        </div>
      )}

      {/* Step Content */}
      {renderStepContent()}
    </Card>
  );
};
