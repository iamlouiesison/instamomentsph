import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: 10 photos per 10 minutes per IP
const RATE_LIMIT = {
  maxPhotos: 10,
  windowMs: 10 * 60 * 1000, // 10 minutes
};

// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// Validation schema for upload request
const UploadRequestSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  contributorName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long"),
  contributorEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  caption: z.string().max(200, "Caption too long").optional(),
  exifData: z.string().optional(),
});

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const key = `upload:${ip}`;

  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });

    return {
      allowed: true,
      remaining: RATE_LIMIT.maxPhotos - 1,
      resetTime: now + RATE_LIMIT.windowMs,
    };
  }

  if (current.count >= RATE_LIMIT.maxPhotos) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  // Increment count
  current.count++;
  rateLimitMap.set(key, current);

  return {
    allowed: true,
    remaining: RATE_LIMIT.maxPhotos - current.count,
    resetTime: current.resetTime,
  };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

async function validateEvent(
  eventId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, name, status, max_photos, total_photos, max_photos_per_user, subscription_tier",
    )
    .eq("id", eventId)
    .single();

  if (error || !event) {
    throw new Error("Event not found");
  }

  if (event.status !== "active") {
    throw new Error("Event is not active");
  }

  if (event.total_photos >= event.max_photos) {
    throw new Error("Event has reached maximum photo limit");
  }

  return event;
}

async function checkUserPhotoLimit(
  eventId: string,
  contributorEmail: string,
  maxPhotosPerUser: number,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  if (!contributorEmail) return; // Skip check if no email provided

  try {
    const { data: contributor, error } = await supabase
      .from("event_contributors")
      .select("total_photos")
      .eq("event_id", eventId)
      .eq("contributor_email", contributorEmail)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.warn(
        "event_contributors table not found, skipping user photo limit check",
      );
      return; // Skip check if table doesn't exist
    }

    const currentCount = contributor?.total_photos || 0;
    if (currentCount >= maxPhotosPerUser) {
      throw new Error(
        `You have reached the maximum of ${maxPhotosPerUser} photos per user`,
      );
    }
  } catch (error) {
    // If table doesn't exist, skip the check
    console.warn(
      "Skipping user photo limit check:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function uploadToStorage(
  file: File,
  thumbnail: File,
  eventId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ fileUrl: string; thumbnailUrl: string | null }> {
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop() || "jpg";
  const fileName = `photo_${timestamp}.${fileExtension}`;
  const thumbnailName = `thumb_${timestamp}.${fileExtension}`;

  const filePath = `events/${eventId}/photos/${fileName}`;
  const thumbnailPath = `events/${eventId}/thumbnails/${thumbnailName}`;

  // Upload main photo
  const { error: fileError } = await supabase.storage
    .from("photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (fileError) {
    throw new Error(`Failed to upload photo: ${fileError.message}`);
  }

  // Upload thumbnail
  const { error: thumbnailError } = await supabase.storage
    .from("thumbnails")
    .upload(thumbnailPath, thumbnail, {
      cacheControl: "3600",
      upsert: false,
    });

  if (thumbnailError) {
    // If thumbnail upload fails, we can still proceed with the main photo
    console.warn("Thumbnail upload failed:", thumbnailError.message);
  }

  // Get public URLs
  const {
    data: { publicUrl: fileUrl },
  } = supabase.storage.from("photos").getPublicUrl(filePath);

  const {
    data: { publicUrl: thumbnailUrl },
  } = supabase.storage.from("thumbnails").getPublicUrl(thumbnailPath);

  return {
    fileUrl,
    thumbnailUrl: thumbnailError ? null : thumbnailUrl,
  };
}

async function savePhotoRecord(
  eventId: string,
  contributorName: string,
  contributorEmail: string | null,
  caption: string | null,
  fileName: string,
  fileUrl: string,
  thumbnailUrl: string | null,
  fileSize: number,
  mimeType: string,
  exifData: Record<string, unknown>,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      contributor_name: contributorName,
      contributor_email: contributorEmail,
      file_name: fileName,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      file_size: fileSize,
      mime_type: mimeType,
      caption,
      exif_data: exifData,
      is_approved: true, // Auto-approve for now
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save photo record: ${error.message}`);
  }

  return data;
}

async function logAnalyticsEvent(
  eventId: string,
  eventType: string,
  properties: Record<string, unknown>,
  userAgent: string | null,
  ipAddress: string | null,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  try {
    await supabase.from("analytics_events").insert({
      event_id: eventId,
      event_type: eventType,
      properties,
      user_agent: userAgent,
      ip_address: ipAddress,
    });
  } catch (error) {
    // Don't fail the upload if analytics logging fails
    console.warn("Analytics logging failed:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many uploads. Please try again later.",
            details: {
              remaining: rateLimit.remaining,
              resetTime: rateLimit.resetTime,
            },
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.maxPhotos.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          },
        },
      );
    }

    // Parse form data
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const thumbnail = formData.get("thumbnail") as File;
    const eventId = formData.get("eventId") as string;
    const contributorName = formData.get("contributorName") as string;
    const contributorEmail = formData.get("contributorEmail") as string;
    const caption = formData.get("caption") as string;
    const exifDataString = formData.get("exifData") as string;

    // Validate required fields
    if (!file || !thumbnail || !eventId || !contributorName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message:
              "Missing required fields: file, thumbnail, eventId, or contributorName",
          },
        },
        { status: 400 },
      );
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
          },
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
          },
        },
        { status: 400 },
      );
    }

    // Validate request data
    const validatedData = UploadRequestSchema.parse({
      eventId,
      contributorName,
      contributorEmail: contributorEmail || undefined,
      caption: caption || undefined,
      exifData: exifDataString || undefined,
    });

    // Parse EXIF data
    let exifData = null;
    if (exifDataString) {
      try {
        exifData = JSON.parse(exifDataString);
      } catch (error) {
        console.warn("Failed to parse EXIF data:", error);
      }
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Validate event exists and is active
    const event = await validateEvent(validatedData.eventId, supabase);

    // Check user photo limit
    await checkUserPhotoLimit(
      validatedData.eventId,
      validatedData.contributorEmail || "",
      event.max_photos_per_user,
      supabase,
    );

    // Upload files to storage
    const { fileUrl, thumbnailUrl } = await uploadToStorage(
      file,
      thumbnail,
      validatedData.eventId,
      supabase,
    );

    // Save photo record to database
    const photoRecord = await savePhotoRecord(
      validatedData.eventId,
      validatedData.contributorName,
      validatedData.contributorEmail || null,
      validatedData.caption || null,
      file.name,
      fileUrl,
      thumbnailUrl,
      file.size,
      file.type,
      exifData,
      supabase,
    );

    // Log analytics event
    await logAnalyticsEvent(
      validatedData.eventId,
      "photo_upload",
      {
        photoId: photoRecord.id,
        contributorName: validatedData.contributorName,
        fileSize: file.size,
        mimeType: file.type,
        hasCaption: !!validatedData.caption,
        hasExifData: !!exifData,
      },
      request.headers.get("user-agent"),
      clientIP,
      supabase,
    );

    return NextResponse.json({
      success: true,
      data: {
        photoId: photoRecord.id,
        fileUrl,
        thumbnailUrl,
        message: "Photo uploaded successfully",
      },
      meta: {
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
      },
    });
  } catch (error) {
    console.error("Photo upload error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes("Event not found")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EVENT_NOT_FOUND",
              message: error.message,
            },
          },
          { status: 404 },
        );
      }

      if (error.message.includes("not active")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EVENT_INACTIVE",
              message: error.message,
            },
          },
          { status: 400 },
        );
      }

      if (error.message.includes("maximum photo limit")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EVENT_PHOTO_LIMIT_REACHED",
              message: error.message,
            },
          },
          { status: 400 },
        );
      }

      if (error.message.includes("maximum of")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_PHOTO_LIMIT_REACHED",
              message: error.message,
            },
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPLOAD_ERROR",
            message: error.message,
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
