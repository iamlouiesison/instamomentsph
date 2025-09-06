import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const StatsQuerySchema = z.object({
  slug: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const supabase = await createClient();

    // Validate parameters
    const { slug } = StatsQuerySchema.parse(await params);

    // Get event by gallery slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status, is_public, expires_at")
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

    // Get basic stats from events table
    const { data: eventStats } = await supabase
      .from("events")
      .select(
        "total_photos, total_videos, total_contributors, created_at, updated_at",
      )
      .eq("id", event.id)
      .single();

    // Get detailed contributor stats
    const { data: contributors } = await supabase
      .from("event_contributors")
      .select(
        "contributor_name, photos_count, videos_count, first_contribution_at, last_contribution_at",
      )
      .eq("event_id", event.id)
      .order("last_contribution_at", { ascending: false });

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: recentPhotos } = await supabase
      .from("photos")
      .select("id, uploaded_at, contributor_name")
      .eq("event_id", event.id)
      .eq("is_approved", true)
      .gte("uploaded_at", yesterday.toISOString())
      .order("uploaded_at", { ascending: false });

    const { data: recentVideos } = await supabase
      .from("videos")
      .select("id, uploaded_at, contributor_name")
      .eq("event_id", event.id)
      .eq("is_approved", true)
      .eq("processing_status", "completed")
      .gte("uploaded_at", yesterday.toISOString())
      .order("uploaded_at", { ascending: false });

    // Get top contributors
    const topContributors =
      contributors
        ?.map((contributor) => ({
          name: contributor.contributor_name,
          totalMedia: contributor.photos_count + contributor.videos_count,
          photos: contributor.photos_count,
          videos: contributor.videos_count,
          firstContribution: contributor.first_contribution_at,
          lastContribution: contributor.last_contribution_at,
        }))
        .sort((a, b) => b.totalMedia - a.totalMedia)
        .slice(0, 10) || [];

    // Calculate activity metrics
    const totalRecentActivity =
      (recentPhotos?.length || 0) + (recentVideos?.length || 0);
    const uniqueRecentContributors = new Set([
      ...(recentPhotos?.map((p) => p.contributor_name) || []),
      ...(recentVideos?.map((v) => v.contributor_name) || []),
    ]).size;

    // Get storage usage (approximate)
    const { data: storageData } = await supabase
      .from("photos")
      .select("file_size")
      .eq("event_id", event.id)
      .eq("is_approved", true);

    const { data: videoStorageData } = await supabase
      .from("videos")
      .select("file_size")
      .eq("event_id", event.id)
      .eq("is_approved", true)
      .eq("processing_status", "completed");

    const totalStorageBytes = [
      ...(storageData?.map((p) => p.file_size) || []),
      ...(videoStorageData?.map((v) => v.file_size) || []),
    ].reduce((sum, size) => sum + (size || 0), 0);

    const totalStorageMB =
      Math.round((totalStorageBytes / (1024 * 1024)) * 100) / 100;

    // Get engagement metrics (if analytics are available)
    const { data: analytics } = await supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .eq("event_id", event.id)
      .gte("created_at", yesterday.toISOString());

    const galleryViews =
      analytics?.filter((a) => a.event_type === "gallery_view").length || 0;
    const qrScans =
      analytics?.filter((a) => a.event_type === "qr_scan").length || 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPhotos: eventStats?.total_photos || 0,
          totalVideos: eventStats?.total_videos || 0,
          totalContributors: eventStats?.total_contributors || 0,
          totalStorageMB,
          eventCreatedAt: eventStats?.created_at,
          lastUpdatedAt: eventStats?.updated_at,
        },
        activity: {
          recentUploads: totalRecentActivity,
          recentContributors: uniqueRecentContributors,
          galleryViews,
          qrScans,
          last24Hours: {
            photos: recentPhotos?.length || 0,
            videos: recentVideos?.length || 0,
            contributors: uniqueRecentContributors,
          },
        },
        contributors: {
          total: contributors?.length || 0,
          topContributors,
          recentContributors: contributors?.slice(0, 5) || [],
        },
        engagement: {
          galleryViews,
          qrScans,
          averageUploadsPerContributor: contributors?.length
            ? Math.round(
                (((eventStats?.total_photos || 0) +
                  (eventStats?.total_videos || 0)) /
                  contributors.length) *
                  100,
              ) / 100
            : 0,
        },
        performance: {
          totalStorageMB,
          averagePhotoSize: storageData?.length
            ? Math.round(
                storageData.reduce((sum, p) => sum + (p.file_size || 0), 0) /
                  storageData.length /
                  1024,
              )
            : 0,
          averageVideoSize: videoStorageData?.length
            ? Math.round(
                videoStorageData.reduce(
                  (sum, v) => sum + (v.file_size || 0),
                  0,
                ) /
                  videoStorageData.length /
                  (1024 * 1024),
              )
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);

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
          message: "Failed to fetch gallery statistics",
        },
      },
      { status: 500 },
    );
  }
}
