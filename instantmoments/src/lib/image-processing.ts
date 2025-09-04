// Image Processing Utilities for InstaMoments
// Handles compression, format conversion, and EXIF data processing

import imageCompression from 'browser-image-compression';

export interface ImageProcessingOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  convertToWebP?: boolean;
}

export interface ProcessedImage {
  file: File;
  thumbnail: File;
  exifData: any | null;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface EXIFData {
  make?: string;
  model?: string;
  dateTime?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
  };
  orientation?: number;
  width?: number;
  height?: number;
}

// Default compression options optimized for mobile
const DEFAULT_OPTIONS: ImageProcessingOptions = {
  maxSizeMB: 1, // 1MB max file size
  maxWidthOrHeight: 1920, // Max dimension
  useWebWorker: true,
  quality: 0.8, // 80% quality
  convertToWebP: true,
};

/**
 * Compress and process an image file
 */
export async function compressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Validate file type
    if (!isValidImageType(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      // 10MB max
      throw new Error('File size exceeds 10MB limit');
    }

    const originalSize = file.size;

    // Extract EXIF data before compression
    const exifData = await extractEXIFData(file);

    // Compress the main image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB,
      maxWidthOrHeight: opts.maxWidthOrHeight,
      useWebWorker: opts.useWebWorker,
      initialQuality: opts.quality,
    });

    // Convert to WebP if requested and supported
    let finalFile = compressedFile;
    if (opts.convertToWebP && supportsWebP()) {
      finalFile = await convertToWebP(compressedFile, opts.quality);
    }

    // Generate thumbnail
    const thumbnail = await generateThumbnail(finalFile, {
      maxWidthOrHeight: 300,
      quality: 0.7,
    });

    const compressedSize = finalFile.size;
    const compressionRatio = Math.round(
      ((originalSize - compressedSize) / originalSize) * 100
    );

    return {
      file: finalFile,
      thumbnail,
      exifData,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error(
      `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate a thumbnail from an image
 */
export async function generateThumbnail(
  file: File,
  options: { maxWidthOrHeight?: number; quality?: number } = {}
): Promise<File> {
  const opts = {
    maxWidthOrHeight: 300,
    quality: 0.7,
    ...options,
  };

  try {
    const thumbnail = await imageCompression(file, {
      maxSizeMB: 0.5, // 500KB max for thumbnail
      maxWidthOrHeight: opts.maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: opts.quality,
    });

    // Create a new file with thumbnail naming
    const thumbnailFile = new File([thumbnail], `thumb_${file.name}`, {
      type: thumbnail.type,
    });

    return thumbnailFile;
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

/**
 * Extract EXIF data from an image file
 */
export async function extractEXIFData(file: File): Promise<EXIFData | null> {
  try {
    // Create a canvas to read image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = new Image();
    const url = URL.createObjectURL(file);

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Basic EXIF-like data extraction
        const exifData: EXIFData = {
          width: img.width,
          height: img.height,
          // Note: Full EXIF extraction would require a library like exif-js
          // For now, we'll extract basic metadata
        };

        URL.revokeObjectURL(url);
        resolve(exifData);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  } catch (error) {
    console.error('EXIF extraction failed:', error);
    return null;
  }
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<File> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return file; // Fallback to original if WebP not supported

    const img = new Image();
    const url = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                { type: 'image/webp' }
              );
              resolve(webpFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // Fallback to original
      };

      img.src = url;
    });
  } catch (error) {
    console.error('WebP conversion failed:', error);
    return file; // Fallback to original
  }
}

/**
 * Check if the browser supports WebP format
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Create a preview URL for an image file
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Sanitize EXIF data by removing sensitive information
 */
export function sanitizeEXIFData(exifData: EXIFData | null): EXIFData | null {
  if (!exifData) return null;

  // Remove GPS data for privacy
  const sanitized = { ...exifData };
  delete sanitized.gps;

  // Keep only safe metadata
  return {
    make: sanitized.make,
    model: sanitized.model,
    width: sanitized.width,
    height: sanitized.height,
    orientation: sanitized.orientation,
  };
}

/**
 * Batch process multiple images
 */
export async function batchProcessImages(
  files: File[],
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];

  // Process images in batches to avoid overwhelming the browser
  const batchSize = 3;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchPromises = batch.map((file) => compressImage(file, options));

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error);
      // Continue with other batches
    }
  }

  return results;
}
