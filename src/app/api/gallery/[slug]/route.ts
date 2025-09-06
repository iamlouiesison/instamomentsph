import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const GalleryQuerySchema = z.object({
  slug: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const supabase = await createClient();

    // Validate parameters
    const { slug } = GalleryQuerySchema.parse(await params);

    // Get event by gallery slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        description,
        event_type,
        event_date,
        location,
        custom_message,
        subscription_tier,
        max_photos,
        max_photos_per_user,
        storage_days,
        has_video_addon,
        requires_moderation,
        allow_downloads,
        is_public,
        total_photos,
        total_videos,
        total_contributors,
        status,
        created_at,
        updated_at,
        expires_at,
        host:profiles!events_host_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("gallery_slug", slug)
      .eq("status", "active")
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GALLERY_NOT_FOUND",
            message: "Gallery not found or no longer active",
          },
        },
        { status: 404 },
      );
    }

    // Check if event is expired
    if (event.expires_at && new Date(event.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GALLERY_EXPIRED",
            message: "This gallery has expired",
          },
        },
        { status: 410 },
      );
    }

    // Get recent contributors
    const { data: contributors } = await supabase
      .from("event_contributors")
      .select(
        "contributor_name, contributor_email, photos_count, videos_count, last_contribution_at",
      )
      .eq("event_id", event.id)
      .order("last_contribution_at", { ascending: false })
      .limit(10);

    // Get recent photos for preview
    const { data: recentPhotos } = await supabase
      .from("photos")
      .select("id, thumbnail_url, contributor_name, uploaded_at")
      .eq("event_id", event.id)
      .eq("is_approved", true)
      .order("uploaded_at", { ascending: false })
      .limit(6);

    // Get recent videos for preview
    const { data: recentVideos } = await supabase
      .from("videos")
      .select("id, thumbnail_url, contributor_name, uploaded_at")
      .eq("event_id", event.id)
      .eq("is_approved", true)
      .order("uploaded_at", { ascending: false })
      .limit(2);

    // Track gallery view analytics
    try {
      await supabase.from("analytics_events").insert({
        event_id: event.id,
        event_type: "gallery_view",
        properties: {
          user_agent: request.headers.get("user-agent"),
          referer: request.headers.get("referer"),
          timestamp: new Date().toISOString(),
        },
        user_agent: request.headers.get("user-agent"),
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
      });
    } catch (analyticsError) {
      console.error("Failed to track gallery view:", analyticsError);
      // Don't fail the request if analytics fails
    }

    return NextResponse.json({
      success: true,
      data: {
        event: {
          ...event,
          isActive: true,
          isExpired: false,
        },
        contributors: contributors || [],
        recentMedia: {
          photos: recentPhotos || [],
          videos: recentVideos || [],
        },
        stats: {
          totalPhotos: event.total_photos || 0,
          totalVideos: event.total_videos || 0,
          totalContributors: event.total_contributors || 0,
          recentContributors: contributors?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("Gallery API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid gallery slug",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load gallery information",
        },
      },
      { status: 500 },
    );
  }
}
