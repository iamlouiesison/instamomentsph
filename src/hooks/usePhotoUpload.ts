"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcessedImage } from "@/lib/image-processing";

export interface PhotoUploadData {
  eventId: string;
  files: ProcessedImage[];
  contributorName: string;
  contributorEmail?: string;
  caption?: string;
}

export interface PhotoUploadResponse {
  success: boolean;
  data?: {
    photoId: string;
    fileUrl: string;
    thumbnailUrl?: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    rateLimit: {
      remaining: number;
      resetTime: number;
    };
  };
}

export interface PhotoUploadResult {
  results: PhotoUploadResponse[];
  successfulPhotos: ProcessedImage[];
  failedPhotos: ProcessedImage[];
}

export interface UsePhotoUploadOptions {
  onSuccess?: (uploadedPhotos: PhotoUploadResponse[]) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export interface UsePhotoUploadReturn {
  uploadPhotos: (data: PhotoUploadData) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data: PhotoUploadResult | undefined;
  reset: () => void;
  uploadProgress: number;
  uploadedCount: number;
  totalCount: number;
}

/**
 * React Query hook for photo uploads with progress tracking
 */
export function usePhotoUpload(
  options: UsePhotoUploadOptions = {},
): UsePhotoUploadReturn {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onProgress } = options;

  const mutation = useMutation<PhotoUploadResult, string, PhotoUploadData>({
    mutationFn: async (
      uploadData: PhotoUploadData,
    ): Promise<PhotoUploadResult> => {
      const { eventId, files, contributorName, contributorEmail, caption } =
        uploadData;

      // Upload files sequentially to track progress
      const results: PhotoUploadResponse[] = [];

      for (const [index, photo] of files.entries()) {
        try {
          // Update progress
          const progress = Math.round(((index + 1) / files.length) * 100);
          onProgress?.(progress);

          // Create form data for this photo
          const formData = new FormData();
          formData.append("file", photo.file);
          formData.append("thumbnail", photo.thumbnail);
          formData.append("eventId", eventId);
          formData.append("contributorName", contributorName);
          formData.append("contributorEmail", contributorEmail || "");
          formData.append("caption", caption || "");
          formData.append("exifData", JSON.stringify(photo.exifData || {}));

          // Upload photo
          const response = await fetch("/api/upload/photo", {
            method: "POST",
            body: formData,
          });

          const result: PhotoUploadResponse = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || "Upload failed");
          }

          results.push(result);
        } catch (error) {
          console.error(`Upload failed for photo ${index + 1}:`, error);

          // Add error result
          results.push({
            success: false,
            error: {
              code: "UPLOAD_ERROR",
              message: error instanceof Error ? error.message : "Upload failed",
            },
          });
        }
      }

      const successfulUploads = results.filter((result) => result.success);
      return {
        results,
        successfulPhotos: uploadData.files.slice(0, successfulUploads.length),
        failedPhotos: uploadData.files.slice(successfulUploads.length),
      };
    },
    onSuccess: (data, variables) => {
      const { results } = data;
      const successfulUploads = results.filter((result) => result.success);
      const failedUploads = results.filter((result) => !result.success);

      if (successfulUploads.length > 0) {
        // Invalidate gallery queries to refresh the UI
        queryClient.invalidateQueries({
          queryKey: ["gallery", variables.eventId],
        });

        queryClient.invalidateQueries({
          queryKey: ["events"],
        });

        // Call success callback with successfully uploaded photos
        onSuccess?.(data.results);
      }

      if (failedUploads.length > 0) {
        const errorMessage = `${failedUploads.length} of ${results.length} photos failed to upload`;
        onError?.(errorMessage);
      }
    },
    onError: (error) => {
      console.error("Photo upload mutation failed:", error);
      onError?.(String(error));
    },
  });

  return {
    uploadPhotos: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
    uploadProgress: mutation.isPending ? 0 : 100,
    uploadedCount: mutation.data?.results.filter((r) => r.success).length || 0,
    totalCount: mutation.data?.results.length || 0,
  };
}

/**
 * Hook for batch photo uploads with individual file progress
 */
export function useBatchPhotoUpload(options: UsePhotoUploadOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onProgress } = options;

  const mutation = useMutation({
    mutationFn: async (
      uploadData: PhotoUploadData,
    ): Promise<{
      results: PhotoUploadResponse[];
      successfulPhotos: ProcessedImage[];
      failedPhotos: ProcessedImage[];
    }> => {
      const { eventId, files, contributorName, contributorEmail, caption } =
        uploadData;

      const results: PhotoUploadResponse[] = [];
      const successfulPhotos: ProcessedImage[] = [];
      const failedPhotos: ProcessedImage[] = [];

      // Upload all files in parallel for better performance
      const uploadPromises = files.map(async (photo, index) => {
        try {
          // Create form data for this photo
          const formData = new FormData();
          formData.append("file", photo.file);
          formData.append("thumbnail", photo.thumbnail);
          formData.append("eventId", eventId);
          formData.append("contributorName", contributorName);
          formData.append("contributorEmail", contributorEmail || "");
          formData.append("caption", caption || "");
          formData.append("exifData", JSON.stringify(photo.exifData || {}));

          // Upload photo
          const response = await fetch("/api/upload/photo", {
            method: "POST",
            body: formData,
          });

          const result: PhotoUploadResponse = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || "Upload failed");
          }

          return { result, photo, success: true };
        } catch (error) {
          console.error(`Upload failed for photo ${index + 1}:`, error);
          return {
            result: {
              success: false,
              error: {
                code: "UPLOAD_ERROR",
                message:
                  error instanceof Error ? error.message : "Upload failed",
              },
            },
            photo,
            success: false,
          };
        }
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);

      // Process results
      uploadResults.forEach(({ result, photo, success }) => {
        results.push(result);
        if (success) {
          successfulPhotos.push(photo);
        } else {
          failedPhotos.push(photo);
        }
      });

      // Update progress
      onProgress?.(100);

      return {
        results,
        successfulPhotos,
        failedPhotos,
      };
    },
    onSuccess: (data, variables) => {
      const { successfulPhotos, failedPhotos } = data;

      if (successfulPhotos.length > 0) {
        // Invalidate gallery queries to refresh the UI
        queryClient.invalidateQueries({
          queryKey: ["gallery", variables.eventId],
        });

        queryClient.invalidateQueries({
          queryKey: ["events"],
        });

        onSuccess?.(data.results);
      }

      if (failedPhotos.length > 0) {
        const errorMessage = `${failedPhotos.length} of ${variables.files.length} photos failed to upload`;
        onError?.(errorMessage);
      }
    },
    onError: (error) => {
      console.error("Batch photo upload mutation failed:", error);
      onError?.(String(error));
    },
  });

  return {
    uploadPhotos: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
    uploadProgress: mutation.isPending ? 0 : 100,
    uploadedCount: mutation.data?.successfulPhotos.length || 0,
    totalCount: mutation.data?.results.length || 0,
  };
}

/**
 * Hook for single photo upload with detailed progress
 */
export function useSinglePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onProgress } = options;

  const mutation = useMutation({
    mutationFn: async (uploadData: {
      eventId: string;
      photo: ProcessedImage;
      contributorName: string;
      contributorEmail?: string;
      caption?: string;
    }): Promise<PhotoUploadResponse> => {
      const { eventId, photo, contributorName, contributorEmail, caption } =
        uploadData;

      // Update progress
      onProgress?.(50);

      // Create form data
      const formData = new FormData();
      formData.append("file", photo.file);
      formData.append("thumbnail", photo.thumbnail);
      formData.append("eventId", eventId);
      formData.append("contributorName", contributorName);
      formData.append("contributorEmail", contributorEmail || "");
      formData.append("caption", caption || "");
      formData.append("exifData", JSON.stringify(photo.exifData || {}));

      // Upload photo
      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      const result: PhotoUploadResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Upload failed");
      }

      // Update progress
      onProgress?.(100);

      return result;
    },
    onSuccess: (result, variables) => {
      // Invalidate gallery queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: ["gallery", variables.eventId],
      });

      queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      onSuccess?.([
        {
          success: true,
          data: {
            photoId: "retry-success",
            fileUrl: variables.photo.file.name,
            message: "Photo uploaded successfully",
          },
        },
      ]);
    },
    onError: (error) => {
      console.error("Single photo upload mutation failed:", error);
      onError?.(String(error));
    },
  });

  return {
    uploadPhoto: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
    uploadProgress: mutation.isPending ? 50 : 100,
  };
}

/**
 * Hook for photo upload with retry logic
 */
export function usePhotoUploadWithRetry(
  options: UsePhotoUploadOptions & {
    maxRetries?: number;
    retryDelay?: number;
  } = {},
) {
  const { maxRetries = 3, retryDelay = 1000, ...uploadOptions } = options;

  const mutation = useMutation<PhotoUploadResult, string, PhotoUploadData>({
    mutationFn: async (
      uploadData: PhotoUploadData,
    ): Promise<PhotoUploadResult> => {
      const { eventId, files, contributorName, contributorEmail, caption } =
        uploadData;

      const results: PhotoUploadResponse[] = [];
      let retryCount = 0;

      for (const [index, photo] of files.entries()) {
        let success = false;
        let lastError: Error | null = null;

        while (!success && retryCount < maxRetries) {
          try {
            // Create form data for this photo
            const formData = new FormData();
            formData.append("file", photo.file);
            formData.append("thumbnail", photo.thumbnail);
            formData.append("eventId", eventId);
            formData.append("contributorName", contributorName);
            formData.append("contributorEmail", contributorEmail || "");
            formData.append("caption", caption || "");
            formData.append("exifData", JSON.stringify(photo.exifData || {}));

            // Upload photo
            const response = await fetch("/api/upload/photo", {
              method: "POST",
              body: formData,
            });

            const result: PhotoUploadResponse = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(result.error?.message || "Upload failed");
            }

            results.push(result);
            success = true;
            retryCount = 0; // Reset retry count for next photo
          } catch (error) {
            lastError =
              error instanceof Error ? error : new Error("Unknown error");
            retryCount++;

            if (retryCount < maxRetries) {
              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * retryCount),
              );
            }
          }
        }

        if (!success && lastError) {
          console.error(
            `Upload failed for photo ${index + 1} after ${maxRetries} retries:`,
            lastError,
          );

          results.push({
            success: false,
            error: {
              code: "UPLOAD_ERROR",
              message: lastError.message,
            },
          });
        }
      }

      return {
        results,
        successfulPhotos: uploadData.files.filter(
          (_, index) => results[index]?.success,
        ),
        failedPhotos: uploadData.files.filter(
          (_, index) => !results[index]?.success,
        ),
      };
    },
    onSuccess: (data) => {
      if (uploadOptions.onSuccess) {
        uploadOptions.onSuccess(data.results);
      }
    },
    onError: uploadOptions.onError,
  });

  return {
    uploadPhotos: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
    uploadProgress: mutation.isPending ? 0 : 100,
    uploadedCount: mutation.data?.results.filter((r) => r.success).length || 0,
    totalCount: mutation.data?.results.length || 0,
  };
}
