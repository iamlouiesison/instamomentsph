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
  search: z.string().optional(),
  contributor: z.string().optional(),
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
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      contributor: searchParams.get('contributor'),
      sortBy: searchParams.get('sortBy'),
      type: searchParams.get('type'),
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
    const results: any[] = [];

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

      // Add type to photos
      const photosWithType =
        photos?.map((photo) => ({
          ...(photo as any),
          type: 'photo' as const,
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
          contributor_name,
          contributor_email,
          file_name,
          file_url,
          thumbnail_url,
          file_size,
          duration_seconds,
          mime_type,
          message as caption,
          uploaded_at,
          processing_status
        `
        )
        .eq('event_id', event.id)
        .eq('is_approved', true)
        .eq('processing_status', 'completed');

      // Apply search filter
      if (query.search) {
        videosQuery = videosQuery.or(
          `message.ilike.%${query.search}%,contributor_name.ilike.%${query.search}%`
        );
      }

      // Apply contributor filter
      if (query.contributor && query.contributor !== 'all') {
        videosQuery = videosQuery.eq('contributor_name', query.contributor);
      }

      // Apply sorting
      if (query.sortBy === 'newest') {
        videosQuery = videosQuery.order('uploaded_at', { ascending: false });
      } else if (query.sortBy === 'oldest') {
        videosQuery = videosQuery.order('uploaded_at', { ascending: true });
      } else if (query.sortBy === 'contributor') {
        videosQuery = videosQuery.order('contributor_name', {
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

      // Add type to videos
      const videosWithType =
        videos?.map((video) => ({
          ...(video as any),
          type: 'video' as const,
        })) || [];

      results.push(...videosWithType);
    }

    // Sort combined results if both types are requested
    if (query.type === 'all') {
      if (query.sortBy === 'newest') {
        results.sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
        );
      } else if (query.sortBy === 'oldest') {
        results.sort(
          (a, b) =>
            new Date(a.uploaded_at).getTime() -
            new Date(b.uploaded_at).getTime()
        );
      } else if (query.sortBy === 'contributor') {
        results.sort((a, b) =>
          a.contributor_name.localeCompare(b.contributor_name)
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
        .eq('is_approved', true)
        .eq('processing_status', 'completed');

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
