import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const PhotosQuerySchema = z.object({
  slug: z.string().min(1),
});

const PhotosSearchParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional().default(''),
  contributor: z.string().optional().default(''),
  sortBy: z
    .enum(['newest', 'oldest', 'contributor'])
    .optional()
    .default('newest'),
  type: z.enum(['all', 'photos', 'videos']).optional().default('all'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();

    // Validate parameters
    const { slug } = PhotosQuerySchema.parse(await params);
    const searchParams = new URL(request.url).searchParams;
    const query = PhotosSearchParamsSchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
      contributor: searchParams.get('contributor') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      type: searchParams.get('type') || undefined,
    });

    // Get event by gallery slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status, is_public, expires_at')
      .eq('gallery_slug', slug)
      .eq('status', 'active')
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GALLERY_NOT_FOUND',
            message: 'Gallery not found or no longer active',
          },
        },
        { status: 404 }
      );
    }

    // Check if event is expired
    if (event.expires_at && new Date(event.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GALLERY_EXPIRED',
            message: 'This gallery has expired',
          },
        },
        { status: 410 }
      );
    }

    const offset = query.page * query.limit;
    const results: Array<{
      id: string;
      type: 'photo' | 'video';
      url: string;
      thumbnail_url?: string;
      caption?: string;
      uploaded_by?: string;
      created_at: string;
      file_size?: number;
      duration?: number;
    }> = [];

    // Fetch photos if requested
    if (query.type === 'all' || query.type === 'photos') {
      let photosQuery = supabase
        .from('photos')
        .select(
          `
          id,
          event_id,
          contributor_name,
          contributor_email,
          file_name,
          file_url,
          thumbnail_url,
          file_size,
          mime_type,
          caption,
          uploaded_at,
          exif_data
        `
        )
        .eq('event_id', event.id)
        .eq('is_approved', true);

      // Apply search filter
      if (query.search) {
        photosQuery = photosQuery.or(
          `caption.ilike.%${query.search}%,contributor_name.ilike.%${query.search}%`
        );
      }

      // Apply contributor filter
      if (query.contributor && query.contributor !== 'all') {
        photosQuery = photosQuery.eq('contributor_name', query.contributor);
      }

      // Apply sorting
      if (query.sortBy === 'newest') {
        photosQuery = photosQuery.order('uploaded_at', { ascending: false });
      } else if (query.sortBy === 'oldest') {
        photosQuery = photosQuery.order('uploaded_at', { ascending: true });
      } else if (query.sortBy === 'contributor') {
        photosQuery = photosQuery.order('contributor_name', {
          ascending: true,
        });
      }

      // Apply pagination
      photosQuery = photosQuery.range(offset, offset + query.limit - 1);

      const { data: photos, error: photosError } = await photosQuery;

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to fetch photos',
            },
          },
          { status: 500 }
        );
      }

      // Add type to photos and map database fields to expected interface
      const photosWithType =
        photos?.map((photo) => ({
          id: photo.id,
          type: 'photo' as const,
          url: photo.file_url,
          thumbnail_url: photo.thumbnail_url,
          caption: photo.caption,
          uploaded_by: photo.contributor_name,
          created_at: photo.uploaded_at,
          file_size: photo.file_size,
        })) || [];

      results.push(...photosWithType);
    }

    // Fetch videos if requested
    if (query.type === 'all' || query.type === 'videos') {
      let videosQuery = supabase
        .from('videos')
        .select(
          `
          id,
          event_id,
          uploaded_by,
          file_name,
          file_url,
          thumbnail_url,
          file_size,
          duration,
          mime_type,
          caption,
          created_at,
          status
        `
        )
        .eq('event_id', event.id)
        .eq('status', 'completed');

      // Apply search filter
      if (query.search) {
        videosQuery = videosQuery.or(`caption.ilike.%${query.search}%`);
      }

      // Apply contributor filter
      if (query.contributor && query.contributor !== 'all') {
        videosQuery = videosQuery.eq('uploaded_by', query.contributor);
      }

      // Apply sorting
      if (query.sortBy === 'newest') {
        videosQuery = videosQuery.order('created_at', { ascending: false });
      } else if (query.sortBy === 'oldest') {
        videosQuery = videosQuery.order('created_at', { ascending: true });
      } else if (query.sortBy === 'contributor') {
        videosQuery = videosQuery.order('uploaded_by', {
          ascending: true,
        });
      }

      // Apply pagination
      videosQuery = videosQuery.range(offset, offset + query.limit - 1);

      const { data: videos, error: videosError } = await videosQuery;

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to fetch videos',
            },
          },
          { status: 500 }
        );
      }

      // Add type to videos and map database fields to expected interface
      const videosWithType =
        videos?.map((video) => ({
          id: video.id,
          type: 'video' as const,
          url: video.file_url,
          thumbnail_url: video.thumbnail_url,
          caption: video.caption,
          uploaded_by: video.uploaded_by,
          created_at: video.created_at,
          file_size: video.file_size,
          duration: video.duration,
        })) || [];

      results.push(...videosWithType);
    }

    // Sort combined results if both types are requested
    if (query.type === 'all') {
      if (query.sortBy === 'newest') {
        results.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (query.sortBy === 'oldest') {
        results.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (query.sortBy === 'contributor') {
        results.sort((a, b) =>
          (a.uploaded_by || '').localeCompare(b.uploaded_by || '')
        );
      }
    }

    // Get total count for pagination
    let totalCount = 0;

    if (query.type === 'all' || query.type === 'photos') {
      const { count: photosCount } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('is_approved', true);

      totalCount += photosCount || 0;
    }

    if (query.type === 'all' || query.type === 'videos') {
      const { count: videosCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'completed');

      totalCount += videosCount || 0;
    }

    const hasMore = offset + results.length < totalCount;

    return NextResponse.json({
      success: true,
      data: {
        items: results,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount,
          hasMore,
          totalPages: Math.ceil(totalCount / query.limit),
        },
        filters: {
          search: query.search,
          contributor: query.contributor,
          sortBy: query.sortBy,
          type: query.type,
        },
      },
    });
  } catch (error) {
    console.error('Photos API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch photos',
        },
      },
      { status: 500 }
    );
  }
}
