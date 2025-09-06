import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Rate limiting storage (in-memory for simplicity)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: 5 videos per 10 minutes per user
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

// Video validation schema
const VideoUploadSchema = z.object({
  eventId: z.string().uuid(),
  caption: z.string().max(500).optional(),
  isGreeting: z.boolean().default(false),
});

// Check rate limit
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    // 2. Rate limiting check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message:
              "Too many video uploads. Please wait before uploading again.",
          },
        },
        { status: 429 },
      );
    }

    // 3. Parse form data
    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File;
    const eventId = formData.get("eventId") as string;
    const caption = formData.get("caption") as string;
    const isGreeting = formData.get("isGreeting") === "true";

    // 4. Validate input
    const validationResult = VideoUploadSchema.safeParse({
      eventId,
      caption: caption || undefined,
      isGreeting,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validationResult.error.issues,
          },
        },
        { status: 400 },
      );
    }

    if (!videoFile) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_FILE", message: "Video file is required" },
        },
        { status: 400 },
      );
    }

    // 5. Validate video file
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ["video/webm", "video/mp4", "video/quicktime"];

    if (videoFile.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `File size ${(videoFile.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`,
          },
        },
        { status: 400 },
      );
    }

    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Unsupported video format. Please use MP4 or WebM",
          },
        },
        { status: 400 },
      );
    }

    // 6. Verify event exists and user has access
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, host_id, is_active, video_limit")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EVENT_NOT_FOUND", message: "Event not found" },
        },
        { status: 404 },
      );
    }

    if (!event.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_INACTIVE",
            message: "Event is no longer active",
          },
        },
        { status: 400 },
      );
    }

    // 7. Check video limit for event
    const { count: videoCount } = await supabase
      .from("videos")
      .select("id", { count: "exact" })
      .eq("event_id", eventId);

    if (videoCount && videoCount >= event.video_limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VIDEO_LIMIT_EXCEEDED",
            message: "Event video limit reached",
          },
        },
        { status: 400 },
      );
    }

    // 8. Generate unique file names
    const timestamp = Date.now();
    const videoFileName = `videos/${eventId}/${timestamp}-${user.id}.webm`;
    const thumbnailFileName = `thumbnails/${eventId}/${timestamp}-${user.id}.jpg`;

    // 9. Upload video to Supabase Storage
    const { error: videoUploadError } = await supabase.storage
      .from("event-media")
      .upload(videoFileName, videoFile, {
        contentType: videoFile.type,
        cacheControl: "3600",
      });

    if (videoUploadError) {
      console.error("Video upload error:", videoUploadError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "UPLOAD_FAILED", message: "Failed to upload video" },
        },
        { status: 500 },
      );
    }

    // 10. Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const { error: thumbnailUploadError } = await supabase.storage
        .from("event-media")
        .upload(thumbnailFileName, thumbnailFile, {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (thumbnailUploadError) {
        console.error("Thumbnail upload error:", thumbnailUploadError);
        // Don't fail the entire upload if thumbnail fails
      } else {
        const { data: thumbnailData } = supabase.storage
          .from("event-media")
          .getPublicUrl(thumbnailFileName);
        thumbnailUrl = thumbnailData.publicUrl;
      }
    }

    // 11. Get video URL
    const { data: videoData } = supabase.storage
      .from("event-media")
      .getPublicUrl(videoFileName);

    // 12. Save video record to database
    const { data: videoRecord, error: dbError } = await supabase
      .from("videos")
      .insert({
        event_id: eventId,
        uploaded_by: user.id,
        file_name: videoFileName,
        file_url: videoData.publicUrl,
        thumbnail_url: thumbnailUrl,
        file_size: videoFile.size,
        duration: 0, // Will be updated by processing
        caption: validationResult.data.caption,
        is_greeting: validationResult.data.isGreeting,
        status: "processing",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Clean up uploaded file
      await supabase.storage.from("event-media").remove([videoFileName]);
      if (thumbnailUrl) {
        await supabase.storage.from("event-media").remove([thumbnailFileName]);
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to save video record",
          },
        },
        { status: 500 },
      );
    }

    // 13. Start background processing (simplified - in production, use a queue)
    processVideoInBackground(videoRecord.id);

    // 14. Success response
    return NextResponse.json({
      success: true,
      data: {
        id: videoRecord.id,
        url: videoData.publicUrl,
        thumbnailUrl,
        status: "processing",
        message: "Video uploaded successfully. Processing...",
      },
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}

// Background video processing (simplified)
async function processVideoInBackground(videoId: string) {
  try {
    const supabase = await createClient();

    // In a real implementation, this would:
    // 1. Extract video duration
    // 2. Generate multiple thumbnail sizes
    // 3. Create video previews
    // 4. Update processing status

    // For now, just update status to completed
    await supabase
      .from("videos")
      .update({
        status: "completed",
        duration: 20, // Placeholder - would extract from video
      })
      .eq("id", videoId);
  } catch (error) {
    console.error("Background processing error:", error);

    // Update status to failed
    try {
      const supabase = await createClient();
      await supabase
        .from("videos")
        .update({ status: "failed" })
        .eq("id", videoId);
    } catch (updateError) {
      console.error("Failed to update video status:", updateError);
    }
  }
}

// GET endpoint to check video processing status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_VIDEO_ID", message: "Video ID is required" },
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: video, error } = await supabase
      .from("videos")
      .select(
        "id, status, file_url, thumbnail_url, duration, caption, is_greeting",
      )
      .eq("id", videoId)
      .single();

    if (error || !video) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VIDEO_NOT_FOUND", message: "Video not found" },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Video status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}
