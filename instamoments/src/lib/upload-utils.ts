import { createClient } from '@/lib/supabase/client';
import { PhotoUploadData, VideoUploadData } from '@/types/database';

interface UploadPhotoParams {
  file: File;
  eventId: string;
  contributorName: string;
  contributorEmail?: string;
  caption?: string;
}

interface UploadVideoParams {
  file: File;
  eventId: string;
  contributorName: string;
  contributorEmail?: string;
  message?: string;
}

export async function uploadPhoto({
  file,
  eventId,
  contributorName,
  contributorEmail,
  caption,
}: UploadPhotoParams) {
  const supabase = createClient();

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `events/${eventId}/photos/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    // Create thumbnail (simplified - in production, use a proper image processing service)
    const thumbnailPath = `events/${eventId}/thumbnails/${fileName}`;
    const { data: thumbnailData, error: thumbnailError } = await supabase.storage
      .from('thumbnails')
      .upload(thumbnailPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    const thumbnailUrl = thumbnailError 
      ? null 
      : supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath).data.publicUrl;

    // Save photo record to database
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        event_id: eventId,
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        file_name: file.name,
        file_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        file_size: file.size,
        mime_type: file.type,
        caption: caption || null,
        is_approved: true, // For now, auto-approve
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('photos').remove([filePath]);
      if (thumbnailUrl) {
        await supabase.storage.from('thumbnails').remove([thumbnailPath]);
      }
      throw new Error(`Database error: ${dbError.message}`);
    }

    return photoData;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw error;
  }
}

export async function uploadVideo({
  file,
  eventId,
  contributorName,
  contributorEmail,
  message,
}: UploadVideoParams) {
  const supabase = createClient();

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `events/${eventId}/videos/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    // For now, we'll skip thumbnail generation for videos
    // In production, you'd use a video processing service to generate thumbnails

    // Get video duration (simplified - in production, use a proper video processing library)
    const duration = await getVideoDuration(file);

    // Save video record to database
    const { data: videoData, error: dbError } = await supabase
      .from('videos')
      .insert({
        event_id: eventId,
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        file_name: file.name,
        file_url: urlData.publicUrl,
        thumbnail_url: null, // Will be generated later
        file_size: file.size,
        duration_seconds: duration,
        mime_type: file.type,
        message: message || null,
        is_approved: true, // For now, auto-approve
        processing_status: 'completed', // For now, skip processing
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('videos').remove([filePath]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return videoData;
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}

// Helper function to get video duration
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(0); // Default duration if we can't determine it
    };
    
    video.src = URL.createObjectURL(file);
  });
}

// Helper function to validate file before upload
export function validateFile(file: File, type: 'photo' | 'video'): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for photos, 50MB for videos
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (type === 'photo') {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPEG, PNG, or WebP)',
      };
    }
  } else {
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/mov'];
    if (!validVideoTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid video file (MP4, WebM, or MOV)',
      };
    }
  }

  return { valid: true };
}

