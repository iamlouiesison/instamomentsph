// Upload Validation Schemas and Utilities
// Comprehensive validation for photo and video uploads

import { z } from 'zod';

// File validation constants
export const UPLOAD_CONSTRAINTS = {
  PHOTO: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ],
    MAX_DIMENSION: 4096, // 4K max
    MIN_DIMENSION: 100, // 100px min
  },
  VIDEO: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'],
    MAX_DURATION: 20, // 20 seconds
    MIN_DURATION: 1, // 1 second
  },
  THUMBNAIL: {
    MAX_SIZE: 1 * 1024 * 1024, // 1MB
    MAX_DIMENSION: 500,
  },
} as const;

// Rate limiting constraints
export const RATE_LIMITS = {
  PHOTOS_PER_HOUR: 50,
  PHOTOS_PER_DAY: 200,
  VIDEOS_PER_HOUR: 10,
  VIDEOS_PER_DAY: 50,
  UPLOADS_PER_MINUTE: 10,
} as const;

// Base contributor information schema
export const ContributorInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/,
      'Name contains invalid characters'
    ),
  email: z
    .string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

// Photo upload validation schema
export const PhotoUploadValidationSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  contributor: ContributorInfoSchema,
  caption: z
    .string()
    .max(200, 'Caption must be less than 200 characters')
    .optional(),
  tags: z.array(z.string().max(20)).max(5, 'Maximum 5 tags allowed').optional(),
  isPrivate: z.boolean().default(false),
  allowDownload: z.boolean().default(true),
});

// Video upload validation schema
export const VideoUploadValidationSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  contributor: ContributorInfoSchema,
  message: z
    .string()
    .max(200, 'Message must be less than 200 characters')
    .optional(),
  duration: z
    .number()
    .min(
      UPLOAD_CONSTRAINTS.VIDEO.MIN_DURATION,
      `Video must be at least ${UPLOAD_CONSTRAINTS.VIDEO.MIN_DURATION} second`
    )
    .max(
      UPLOAD_CONSTRAINTS.VIDEO.MAX_DURATION,
      `Video must be less than ${UPLOAD_CONSTRAINTS.VIDEO.MAX_DURATION} seconds`
    ),
  isPrivate: z.boolean().default(false),
  allowDownload: z.boolean().default(true),
});

// File validation schemas
export const FileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .min(1, 'File cannot be empty')
    .max(
      UPLOAD_CONSTRAINTS.PHOTO.MAX_SIZE,
      `File size must be less than ${UPLOAD_CONSTRAINTS.PHOTO.MAX_SIZE / (1024 * 1024)}MB`
    ),
  type: z
    .string()
    .refine(
      (type) => UPLOAD_CONSTRAINTS.PHOTO.ALLOWED_TYPES.includes(type as any),
      `File type must be one of: ${UPLOAD_CONSTRAINTS.PHOTO.ALLOWED_TYPES.join(', ')}`
    ),
  lastModified: z.number().optional(),
});

export const VideoFileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .min(1, 'File cannot be empty')
    .max(
      UPLOAD_CONSTRAINTS.VIDEO.MAX_SIZE,
      `File size must be less than ${UPLOAD_CONSTRAINTS.VIDEO.MAX_SIZE / (1024 * 1024)}MB`
    ),
  type: z
    .string()
    .refine(
      (type) => UPLOAD_CONSTRAINTS.VIDEO.ALLOWED_TYPES.includes(type as any),
      `File type must be one of: ${UPLOAD_CONSTRAINTS.VIDEO.ALLOWED_TYPES.join(', ')}`
    ),
  lastModified: z.number().optional(),
});

// Complete upload request schemas
export const PhotoUploadRequestSchema = PhotoUploadValidationSchema.extend({
  file: FileValidationSchema,
  thumbnail: FileValidationSchema.optional(),
  exifData: z.record(z.string(), z.any()).optional(),
  dimensions: z
    .object({
      width: z
        .number()
        .min(UPLOAD_CONSTRAINTS.PHOTO.MIN_DIMENSION)
        .max(UPLOAD_CONSTRAINTS.PHOTO.MAX_DIMENSION),
      height: z
        .number()
        .min(UPLOAD_CONSTRAINTS.PHOTO.MIN_DIMENSION)
        .max(UPLOAD_CONSTRAINTS.PHOTO.MAX_DIMENSION),
    })
    .optional(),
});

export const VideoUploadRequestSchema = VideoUploadValidationSchema.extend({
  file: VideoFileValidationSchema,
  thumbnail: FileValidationSchema.optional(),
  metadata: z
    .object({
      duration: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
      bitrate: z.number().optional(),
      framerate: z.number().optional(),
    })
    .optional(),
});

// Batch upload validation
export const BatchUploadSchema = z.object({
  eventId: z.string().uuid(),
  contributor: ContributorInfoSchema,
  photos: z
    .array(PhotoUploadRequestSchema)
    .min(1, 'At least one photo required')
    .max(10, 'Maximum 10 photos per batch'),
  sharedCaption: z.string().max(200).optional(),
});

// Event validation for uploads
export const EventUploadValidationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['active', 'expired', 'archived']),
  maxPhotos: z.number().min(1),
  totalPhotos: z.number().min(0),
  maxPhotosPerUser: z.number().min(1),
  hasVideoAddon: z.boolean(),
  requiresModeration: z.boolean(),
  isPublic: z.boolean(),
  expiresAt: z.string().datetime().optional(),
});

// User upload limits validation
export const UserUploadLimitsSchema = z.object({
  userId: z.string().uuid().optional(),
  userEmail: z.string().email().optional(),
  photosUploadedToday: z.number().min(0),
  photosUploadedThisHour: z.number().min(0),
  videosUploadedToday: z.number().min(0),
  videosUploadedThisHour: z.number().min(0),
  lastUploadAt: z.string().datetime().optional(),
});

// Validation utility functions
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type.toLowerCase());
}

export function validateImageDimensions(
  width: number,
  height: number,
  maxDimension: number = UPLOAD_CONSTRAINTS.PHOTO.MAX_DIMENSION,
  minDimension: number = UPLOAD_CONSTRAINTS.PHOTO.MIN_DIMENSION
): boolean {
  return (
    width >= minDimension &&
    height >= minDimension &&
    width <= maxDimension &&
    height <= maxDimension
  );
}

export function validateVideoDuration(duration: number): boolean {
  return (
    duration >= UPLOAD_CONSTRAINTS.VIDEO.MIN_DURATION &&
    duration <= UPLOAD_CONSTRAINTS.VIDEO.MAX_DURATION
  );
}

export function sanitizeFileName(fileName: string): string {
  // Remove or replace invalid characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100); // Limit length
}

export function generateUniqueFileName(
  originalName: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'jpg';
  const sanitizedName = sanitizeFileName(originalName.replace(/\.[^/.]+$/, ''));
  const prefixStr = prefix ? `${prefix}_` : '';

  return `${prefixStr}${sanitizedName}_${timestamp}.${extension}`;
}

export function validateContributorInfo(info: {
  name: string;
  email?: string;
  phone?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation
  if (!info.name || info.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (info.name.length > 50) {
    errors.push('Name must be less than 50 characters');
  } else if (
    !/^[a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/.test(
      info.name
    )
  ) {
    errors.push('Name contains invalid characters');
  }

  // Email validation (optional)
  if (info.email && info.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(info.email)) {
      errors.push('Invalid email format');
    } else if (info.email.length > 100) {
      errors.push('Email must be less than 100 characters');
    }
  }

  // Phone validation (optional)
  if (info.phone && info.phone.trim().length > 0) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(info.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUploadLimits(
  userLimits: any,
  eventLimits: any,
  isVideo: boolean = false
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (isVideo) {
    // Video limits
    if (userLimits.videosUploadedToday >= RATE_LIMITS.VIDEOS_PER_DAY) {
      errors.push('Daily video upload limit reached');
    }
    if (userLimits.videosUploadedThisHour >= RATE_LIMITS.VIDEOS_PER_HOUR) {
      errors.push('Hourly video upload limit reached');
    }
    if (!eventLimits.hasVideoAddon) {
      errors.push('Video uploads not enabled for this event');
    }
  } else {
    // Photo limits
    if (userLimits.photosUploadedToday >= RATE_LIMITS.PHOTOS_PER_DAY) {
      errors.push('Daily photo upload limit reached');
    }
    if (userLimits.photosUploadedThisHour >= RATE_LIMITS.PHOTOS_PER_HOUR) {
      errors.push('Hourly photo upload limit reached');
    }
  }

  // Event limits
  if (eventLimits.totalPhotos >= eventLimits.maxPhotos) {
    errors.push('Event has reached maximum photo limit');
  }

  if (eventLimits.status !== 'active') {
    errors.push('Event is not active');
  }

  if (eventLimits.expiresAt && new Date(eventLimits.expiresAt) < new Date()) {
    errors.push('Event has expired');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Content moderation helpers
export function containsInappropriateContent(text: string): boolean {
  // Basic content filtering - in production, use a proper content moderation service
  const inappropriateWords = [
    'spam',
    'scam',
    'fake',
    'hate',
    'abuse',
    'harassment',
  ];

  const lowerText = text.toLowerCase();
  return inappropriateWords.some((word) => lowerText.includes(word));
}

export function validateImageContent(
  file: File
): Promise<{ isValid: boolean; reason?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Check dimensions
      if (
        img.width < UPLOAD_CONSTRAINTS.PHOTO.MIN_DIMENSION ||
        img.height < UPLOAD_CONSTRAINTS.PHOTO.MIN_DIMENSION
      ) {
        resolve({ isValid: false, reason: 'Image too small' });
        return;
      }

      if (
        img.width > UPLOAD_CONSTRAINTS.PHOTO.MAX_DIMENSION ||
        img.height > UPLOAD_CONSTRAINTS.PHOTO.MAX_DIMENSION
      ) {
        resolve({ isValid: false, reason: 'Image too large' });
        return;
      }

      // Check if image is corrupted
      if (img.width === 0 || img.height === 0) {
        resolve({ isValid: false, reason: 'Corrupted image' });
        return;
      }

      resolve({ isValid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ isValid: false, reason: 'Invalid image file' });
    };

    img.src = url;
  });
}

// Type exports
export type ContributorInfo = z.infer<typeof ContributorInfoSchema>;
export type PhotoUploadValidation = z.infer<typeof PhotoUploadValidationSchema>;
export type VideoUploadValidation = z.infer<typeof VideoUploadValidationSchema>;
export type PhotoUploadRequest = z.infer<typeof PhotoUploadRequestSchema>;
export type VideoUploadRequest = z.infer<typeof VideoUploadRequestSchema>;
export type BatchUpload = z.infer<typeof BatchUploadSchema>;
export type EventUploadValidation = z.infer<typeof EventUploadValidationSchema>;
export type UserUploadLimits = z.infer<typeof UserUploadLimitsSchema>;
