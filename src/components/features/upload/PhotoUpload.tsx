'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  compressImage,
  ProcessedImage,
  createPreviewUrl,
  revokePreviewUrl,
  formatFileSize,
  getImageDimensions,
} from '@/lib/image-processing';
import { usePhotoUpload, PhotoUploadResponse } from '@/hooks/usePhotoUpload';

// Validation schema for photo upload form
const PhotoUploadSchema = z.object({
  contributorName: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  contributorEmail: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  caption: z
    .string()
    .max(200, 'Caption must be less than 200 characters')
    .optional(),
});

export type PhotoUploadFormData = z.infer<typeof PhotoUploadSchema>;

interface PhotoUploadProps {
  eventId: string;
  eventName: string;
  maxPhotosPerUser: number;
  onUploadComplete?: (uploadedPhotos: PhotoUploadResponse[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadingPhoto extends ProcessedImage {
  id: string;
  previewUrl: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadError?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  eventId,
  eventName,
  maxPhotosPerUser,
  onUploadComplete,
  onUploadError,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedPhotos, setProcessedPhotos] = useState<UploadingPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // React Query hook for photo uploads
  const {
    uploadPhotos,
    isPending: isUploading,
    isError: uploadError,
    error: uploadErrorDetails,
    isSuccess: uploadSuccess,
    uploadProgress,
    uploadedCount,
    totalCount,
  } = usePhotoUpload({
    onSuccess: (uploadedPhotos) => {
      onUploadComplete?.(uploadedPhotos);
      // Reset form after successful upload
      form.reset();
      setProcessedPhotos([]);
      setSelectedFiles([]);
    },
    onError: (error) => {
      onUploadError?.(error);
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<PhotoUploadFormData>({
    resolver: zodResolver(PhotoUploadSchema),
    defaultValues: {
      contributorName: '',
      contributorEmail: '',
      caption: '',
    },
  });

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup preview URLs
      processedPhotos.forEach((photo) => {
        revokePreviewUrl(photo.previewUrl);
      });
    };
  }, [cameraStream, processedPhotos]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith('image/')) {
          onUploadError?.('Please select only image files');
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          onUploadError?.('File size must be less than 10MB');
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Check if adding these files would exceed the limit
      const totalFiles = selectedFiles.length + validFiles.length;
      if (totalFiles > maxPhotosPerUser) {
        onUploadError?.(`You can only upload up to ${maxPhotosPerUser} photos`);
        return;
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setIsProcessing(true);

      try {
        // Process images in parallel
        const processingPromises = validFiles.map(async (file) => {
          const processed = await compressImage(file);
          const dimensions = await getImageDimensions(file);
          const previewUrl = createPreviewUrl(processed.file);

          return {
            ...processed,
            id: Math.random().toString(36).substr(2, 9),
            previewUrl,
            isUploading: false,
            uploadProgress: 0,
            dimensions,
          } as UploadingPhoto;
        });

        const processed = await Promise.all(processingPromises);
        setProcessedPhotos((prev) => [...prev, ...processed]);
      } catch (error) {
        console.error('Image processing failed:', error);
        onUploadError?.('Failed to process images. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedFiles.length, maxPhotosPerUser, onUploadError]
  );

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileSelect(e.target.files);
      }
    },
    [handleFileSelect]
  );

  // Handle camera capture
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setCameraStream(stream);
      setShowCamera(true);

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      onUploadError?.('Camera access denied. Please allow camera permissions.');
    }
  }, [onUploadError]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(async () => {
    if (!cameraVideoRef.current || !cameraCanvasRef.current) return;

    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], `camera_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });

          stopCamera();
          await handleFileSelect([file]);
        }
      },
      'image/jpeg',
      0.9
    );
  }, [handleFileSelect, stopCamera]);

  // Remove photo from selection
  const removePhoto = useCallback((photoId: string) => {
    setProcessedPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo) {
        revokePreviewUrl(photo.previewUrl);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }, []);

  // Upload photos using React Query hook
  const handleUpload = useCallback(
    (formData: PhotoUploadFormData) => {
      if (processedPhotos.length === 0) {
        onUploadError?.('Please select at least one photo');
        return;
      }

      // Update photos to show uploading state
      setProcessedPhotos((prev) =>
        prev.map((p) => ({ ...p, isUploading: true, uploadProgress: 0 }))
      );

      // Convert UploadingPhoto to ProcessedImage for upload
      const photosToUpload: ProcessedImage[] = processedPhotos.map((photo) => ({
        file: photo.file,
        thumbnail: photo.thumbnail,
        exifData: photo.exifData,
        originalSize: photo.originalSize,
        compressedSize: photo.compressedSize,
        compressionRatio: photo.compressionRatio,
      }));

      // Call React Query mutation
      uploadPhotos({
        eventId,
        files: photosToUpload,
        contributorName: formData.contributorName,
        contributorEmail: formData.contributorEmail,
        caption: formData.caption,
      });
    },
    [processedPhotos, eventId, uploadPhotos, onUploadError]
  );

  const onSubmit = form.handleSubmit(handleUpload);

  const canUpload = processedPhotos.length > 0 && !isProcessing && !isUploading;
  const totalPhotos = processedPhotos.length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Photos to {eventName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  Drop photos here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPEG, PNG, WebP, HEIC (max 10MB each)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can upload up to {maxPhotosPerUser} photos
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  disabled={isProcessing || isUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Processing {selectedFiles.length} photos...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md mx-auto">
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={stopCamera}
                className="bg-white/20 backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                size="lg"
                onClick={capturePhoto}
                className="bg-white/20 backdrop-blur-sm"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <canvas ref={cameraCanvasRef} className="hidden" />
        </div>
      )}

      {/* Selected Photos Preview */}
      {processedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Photos ({totalPhotos})</span>
              {isUploading && (
                <span className="text-sm font-normal text-muted-foreground">
                  Uploading... {uploadedCount}/{totalCount || totalPhotos}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {processedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={photo.previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(photo.previewUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removePhoto(photo.id)}
                        disabled={isUploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Upload Progress */}
                    {photo.isUploading && (
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    )}

                    {/* Upload Status */}
                    {uploadSuccess && photo.isUploading && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}

                    {(uploadError || photo.uploadError) && (
                      <div className="absolute top-2 right-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>{formatFileSize(photo.compressedSize)}</p>
                    {photo.compressionRatio > 0 && (
                      <p className="text-green-600">
                        -{photo.compressionRatio}% compressed
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {(uploadError || photo.uploadError) && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadErrorDetails?.message || photo.uploadError}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {processedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contributor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contributorName">Your Name *</Label>
                  <Input
                    id="contributorName"
                    {...form.register('contributorName')}
                    placeholder="Enter your name"
                    disabled={isUploading}
                  />
                  {form.formState.errors.contributorName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.contributorName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contributorEmail">Email (Optional)</Label>
                  <Input
                    id="contributorEmail"
                    type="email"
                    {...form.register('contributorEmail')}
                    placeholder="your@email.com"
                    disabled={isUploading}
                  />
                  {form.formState.errors.contributorEmail && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.contributorEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  {...form.register('caption')}
                  placeholder="Add a caption for your photos..."
                  rows={3}
                  disabled={isUploading}
                />
                {form.formState.errors.caption && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.caption.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={!canUpload} className="flex-1">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading {uploadedCount}/{totalCount || totalPhotos}...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {totalPhotos} Photo{totalPhotos !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>

              {/* Upload Results */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Success: {uploadedCount}</span>
                    <span>
                      Failed: {(totalCount || totalPhotos) - uploadedCount}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
