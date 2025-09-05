// Upload Security and Validation Utilities
// Comprehensive security measures for file uploads

import { createClient } from '@/lib/supabase/server';
import {
  UPLOAD_CONSTRAINTS,
  RATE_LIMITS,
  validateFileSize,
  validateFileType,
  validateImageDimensions,
  validateVideoDuration,
  sanitizeFileName,
} from '@/lib/validations/upload';

export interface SecurityCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    isCompressed: boolean;
    hasExifData: boolean;
  };
}

export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limits: {
    hourly: number;
    daily: number;
  };
}

export interface EventSecurityCheck {
  isValid: boolean;
  errors: string[];
  eventInfo: {
    id: string;
    name: string;
    status: string;
    maxPhotos: number;
    totalPhotos: number;
    maxPhotosPerUser: number;
    hasVideoAddon: boolean;
    requiresModeration: boolean;
    isPublic: boolean;
    expiresAt?: string;
  };
}

// File signature validation (magic numbers)
const FILE_SIGNATURES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'image/gif': [0x47, 0x49, 0x46],
  'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
  'video/webm': [0x1a, 0x45, 0xdf, 0xa3],
} as const;

/**
 * Validate file signature against MIME type
 */
export async function validateFileSignature(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);

      const signature =
        FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
      if (!signature) {
        resolve(false);
        return;
      }

      // Check if file starts with expected signature
      const matches = signature.every(
        (byte, index) => uint8Array[index] === byte
      );
      resolve(matches);
    };

    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 16)); // Read first 16 bytes
  });
}

/**
 * Comprehensive file security validation
 */
export async function validateFileSecurity(
  file: File,
  isVideo: boolean = false
): Promise<SecurityCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: SecurityCheckResult['metadata'] = {
    fileSize: file.size,
    mimeType: file.type,
    isCompressed: false,
    hasExifData: false,
  };

  try {
    // 1. Basic file validation
    if (file.size === 0) {
      errors.push('File is empty');
      return { isValid: false, errors, warnings, metadata };
    }

    // 2. File size validation
    const maxSize = isVideo
      ? UPLOAD_CONSTRAINTS.VIDEO.MAX_SIZE
      : UPLOAD_CONSTRAINTS.PHOTO.MAX_SIZE;
    if (!validateFileSize(file, maxSize)) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // 3. File type validation
    const allowedTypes = isVideo
      ? UPLOAD_CONSTRAINTS.VIDEO.ALLOWED_TYPES
      : UPLOAD_CONSTRAINTS.PHOTO.ALLOWED_TYPES;
    if (!validateFileType(file, [...allowedTypes])) {
      errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    // 4. File signature validation
    const signatureValid = await validateFileSignature(file);
    if (!signatureValid) {
      errors.push('File signature does not match declared type');
    }

    // 5. Content validation
    if (isVideo) {
      const videoValidation = await validateVideoContent(file);
      if (!videoValidation.isValid) {
        errors.push(...videoValidation.errors);
      }
      metadata.duration = videoValidation.duration;
    } else {
      const imageValidation = await validateImageContent(file);
      if (!imageValidation.isValid) {
        errors.push(...imageValidation.errors);
      }
      metadata.dimensions = imageValidation.dimensions;
      metadata.hasExifData = imageValidation.hasExifData;
    }

    // 6. Filename validation
    const sanitizedName = sanitizeFileName(file.name);
    if (sanitizedName !== file.name) {
      warnings.push(
        'Filename contains special characters and will be sanitized'
      );
    }

    // 7. Check for suspicious patterns
    const suspiciousPatterns = await checkSuspiciousPatterns(file);
    if (suspiciousPatterns.length > 0) {
      warnings.push(...suspiciousPatterns);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  } catch (error) {
    console.error('File validation error:', error);
    return {
      isValid: false,
      errors: ['File validation failed'],
      warnings,
      metadata,
    };
  }
}

/**
 * Validate image content
 */
async function validateImageContent(file: File): Promise<{
  isValid: boolean;
  errors: string[];
  dimensions?: { width: number; height: number };
  hasExifData: boolean;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const errors: string[] = [];

    img.onload = () => {
      URL.revokeObjectURL(url);

      const dimensions = { width: img.width, height: img.height };

      // Check dimensions
      if (!validateImageDimensions(img.width, img.height)) {
        errors.push(`Invalid image dimensions: ${img.width}x${img.height}`);
      }

      // Check for minimum viable image
      if (img.width < 100 || img.height < 100) {
        errors.push('Image too small (minimum 100x100 pixels)');
      }

      // Check for extremely large images
      if (img.width > 4096 || img.height > 4096) {
        errors.push('Image too large (maximum 4096x4096 pixels)');
      }

      // Check if image is corrupted
      if (img.width === 0 || img.height === 0) {
        errors.push('Corrupted image file');
      }

      resolve({
        isValid: errors.length === 0,
        errors,
        dimensions,
        hasExifData: false, // Would need EXIF library to check properly
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        errors: ['Invalid image file'],
        hasExifData: false,
      });
    };

    img.src = url;
  });
}

/**
 * Validate video content
 */
async function validateVideoContent(file: File): Promise<{
  isValid: boolean;
  errors: string[];
  duration?: number;
}> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    const errors: string[] = [];

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);

      const duration = video.duration;

      // Check duration
      if (!validateVideoDuration(duration)) {
        errors.push(
          `Video duration ${duration.toFixed(1)}s exceeds ${UPLOAD_CONSTRAINTS.VIDEO.MAX_DURATION}s limit`
        );
      }

      // Check video dimensions
      if (video.videoWidth < 100 || video.videoHeight < 100) {
        errors.push('Video resolution too low (minimum 100x100 pixels)');
      }

      resolve({
        isValid: errors.length === 0,
        errors,
        duration,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        errors: ['Invalid video file'],
      });
    };

    video.src = url;
    video.load();
  });
}

/**
 * Check for suspicious patterns in file
 */
async function checkSuspiciousPatterns(file: File): Promise<string[]> {
  const warnings: string[] = [];

  try {
    // Check for executable patterns in filename
    const executableExtensions = [
      '.exe',
      '.bat',
      '.cmd',
      '.scr',
      '.pif',
      '.com',
    ];
    const hasExecutableExtension = executableExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (hasExecutableExtension) {
      warnings.push('File has executable extension');
    }

    // Check for double extensions (potential malware)
    const nameParts = file.name.split('.');
    if (nameParts.length > 2) {
      warnings.push('File has multiple extensions');
    }

    // Check for suspicious characters in filename
    const suspiciousChars = /[<>:"|?*\x00-\x1f]/;
    if (suspiciousChars.test(file.name)) {
      warnings.push('Filename contains suspicious characters');
    }

    // Check file size vs type (potential mismatch)
    if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
      warnings.push('Large image file - consider compression');
    }
  } catch (error) {
    console.warn('Suspicious pattern check failed:', error);
  }

  return warnings;
}

/**
 * Check rate limits for user
 */
export async function checkRateLimits(
  userIdentifier: string, // IP address or user ID
  isVideo: boolean = false
): Promise<RateLimitCheck> {
  try {
    const supabase = await createClient();

    // Get current time boundaries
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query uploads in time windows
    const { data: hourlyUploads, error: hourlyError } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_type', isVideo ? 'video_record' : 'photo_upload')
      .gte('created_at', oneHourAgo.toISOString())
      .or(
        `properties->>ip_address.eq.${userIdentifier},properties->>user_id.eq.${userIdentifier}`
      );

    const { data: dailyUploads, error: dailyError } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_type', isVideo ? 'video_record' : 'photo_upload')
      .gte('created_at', oneDayAgo.toISOString())
      .or(
        `properties->>ip_address.eq.${userIdentifier},properties->>user_id.eq.${userIdentifier}`
      );

    if (hourlyError || dailyError) {
      console.error('Rate limit check failed:', hourlyError || dailyError);
      // Allow upload if rate limit check fails (fail open)
      return {
        allowed: true,
        remaining: 999,
        resetTime: now.getTime() + 60 * 60 * 1000,
        limits: {
          hourly: isVideo
            ? RATE_LIMITS.VIDEOS_PER_HOUR
            : RATE_LIMITS.PHOTOS_PER_HOUR,
          daily: isVideo
            ? RATE_LIMITS.VIDEOS_PER_DAY
            : RATE_LIMITS.PHOTOS_PER_DAY,
        },
      };
    }

    const hourlyCount = hourlyUploads?.length || 0;
    const dailyCount = dailyUploads?.length || 0;

    const hourlyLimit = isVideo
      ? RATE_LIMITS.VIDEOS_PER_HOUR
      : RATE_LIMITS.PHOTOS_PER_HOUR;
    const dailyLimit = isVideo
      ? RATE_LIMITS.VIDEOS_PER_DAY
      : RATE_LIMITS.PHOTOS_PER_DAY;

    const allowed = hourlyCount < hourlyLimit && dailyCount < dailyLimit;
    const remaining = Math.min(
      hourlyLimit - hourlyCount,
      dailyLimit - dailyCount
    );

    return {
      allowed,
      remaining: Math.max(0, remaining),
      resetTime: oneHourAgo.getTime() + 60 * 60 * 1000,
      limits: {
        hourly: hourlyLimit,
        daily: dailyLimit,
      },
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow upload if check fails
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60 * 60 * 1000,
      limits: {
        hourly: isVideo
          ? RATE_LIMITS.VIDEOS_PER_HOUR
          : RATE_LIMITS.PHOTOS_PER_HOUR,
        daily: isVideo
          ? RATE_LIMITS.VIDEOS_PER_DAY
          : RATE_LIMITS.PHOTOS_PER_DAY,
      },
    };
  }
}

/**
 * Validate event for uploads
 */
export async function validateEventForUpload(
  eventId: string
): Promise<EventSecurityCheck> {
  try {
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from('events')
      .select(
        `
        id,
        name,
        status,
        max_photos,
        total_photos,
        max_photos_per_user,
        has_video_addon,
        requires_moderation,
        is_public,
        expires_at
      `
      )
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return {
        isValid: false,
        errors: ['Event not found'],
        eventInfo: {
          id: eventId,
          name: 'Unknown',
          status: 'unknown',
          maxPhotos: 0,
          totalPhotos: 0,
          maxPhotosPerUser: 0,
          hasVideoAddon: false,
          requiresModeration: false,
          isPublic: false,
        },
      };
    }

    const errors: string[] = [];

    // Check event status
    if (event.status !== 'active') {
      errors.push(`Event is ${event.status}`);
    }

    // Check photo limits
    if (event.total_photos >= event.max_photos) {
      errors.push('Event has reached maximum photo limit');
    }

    // Check expiration
    if (event.expires_at && new Date(event.expires_at) < new Date()) {
      errors.push('Event has expired');
    }

    return {
      isValid: errors.length === 0,
      errors,
      eventInfo: {
        id: event.id,
        name: event.name,
        status: event.status,
        maxPhotos: event.max_photos,
        totalPhotos: event.total_photos,
        maxPhotosPerUser: event.max_photos_per_user,
        hasVideoAddon: event.has_video_addon,
        requiresModeration: event.requires_moderation,
        isPublic: event.is_public,
        expiresAt: event.expires_at,
      },
    };
  } catch (error) {
    console.error('Event validation error:', error);
    return {
      isValid: false,
      errors: ['Failed to validate event'],
      eventInfo: {
        id: eventId,
        name: 'Unknown',
        status: 'unknown',
        maxPhotos: 0,
        totalPhotos: 0,
        maxPhotosPerUser: 0,
        hasVideoAddon: false,
        requiresModeration: false,
        isPublic: false,
      },
    };
  }
}

/**
 * Check user upload limits for specific event
 */
export async function checkUserEventLimits(
  eventId: string,
  userEmail: string
): Promise<{
  isValid: boolean;
  errors: string[];
  currentCount: number;
  maxAllowed: number;
}> {
  try {
    const supabase = await createClient();

    // Get event limits
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_photos_per_user')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return {
        isValid: false,
        errors: ['Event not found'],
        currentCount: 0,
        maxAllowed: 0,
      };
    }

    // Get user's current upload count for this event
    const { data: contributor } = await supabase
      .from('event_contributors')
      .select('photos_count')
      .eq('event_id', eventId)
      .eq('contributor_email', userEmail)
      .single();

    const currentCount = contributor?.photos_count || 0;
    const maxAllowed = event.max_photos_per_user;

    if (currentCount >= maxAllowed) {
      return {
        isValid: false,
        errors: [
          `You have reached the limit of ${maxAllowed} photos for this event`,
        ],
        currentCount,
        maxAllowed,
      };
    }

    return {
      isValid: true,
      errors: [],
      currentCount,
      maxAllowed,
    };
  } catch (error) {
    console.error('User event limits check error:', error);
    return {
      isValid: false,
      errors: ['Failed to check user limits'],
      currentCount: 0,
      maxAllowed: 0,
    };
  }
}

/**
 * Comprehensive upload security check
 */
export async function performUploadSecurityCheck(
  file: File,
  eventId: string,
  userIdentifier: string,
  userEmail?: string,
  isVideo: boolean = false
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}> {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  try {
    // 1. File security validation
    const fileValidation = await validateFileSecurity(file, isVideo);
    allErrors.push(...fileValidation.errors);
    allWarnings.push(...fileValidation.warnings);

    // 2. Event validation
    const eventValidation = await validateEventForUpload(eventId);
    allErrors.push(...eventValidation.errors);

    // 3. Rate limit check
    const rateLimitCheck = await checkRateLimits(userIdentifier, isVideo);
    if (!rateLimitCheck.allowed) {
      allErrors.push('Upload rate limit exceeded');
    }

    // 4. User event limits check (if email provided)
    if (userEmail) {
      const userLimitsCheck = await checkUserEventLimits(eventId, userEmail);
      allErrors.push(...userLimitsCheck.errors);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      metadata: fileValidation.metadata,
    };
  } catch (error) {
    console.error('Upload security check failed:', error);
    return {
      isValid: false,
      errors: ['Security check failed'],
      warnings: allWarnings,
    };
  }
}
