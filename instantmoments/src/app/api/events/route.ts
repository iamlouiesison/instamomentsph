import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  EventCreateSchema,
  generateGallerySlug,
} from '@/lib/validations/event';
import { z } from 'zod';

// GET /api/events - Get user's events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'active', 'expired', 'archived'

    let query = supabase
      .from('events')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const {
      data: events,
      error,
      count,
    } = await query.range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch events' },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: events || [],
      meta: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > page * limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/events:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
      },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = EventCreateSchema.parse(body);

    // Generate unique gallery slug
    const gallerySlug = generateGallerySlug(
      validatedData.name,
      validatedData.eventDate
    );

    // Check if slug is unique
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('gallery_slug', gallerySlug)
      .single();

    if (existingEvent) {
      // If slug exists, append timestamp
      const timestamp = Date.now().toString(36);
      const uniqueSlug = `${gallerySlug}-${timestamp}`;

      const eventData = {
        ...validatedData,
        host_id: user.id,
        gallery_slug: uniqueSlug,
        event_date: validatedData.eventDate
          ? new Date(validatedData.eventDate).toISOString().split('T')[0]
          : null,
        qr_code_url: '', // Will be generated after event creation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: event, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to create event',
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: event,
      });
    }

    // Create event with original slug
    const eventData = {
      ...validatedData,
      host_id: user.id,
      gallery_slug: gallerySlug,
      event_date: validatedData.eventDate
        ? new Date(validatedData.eventDate).toISOString().split('T')[0]
        : null,
      qr_code_url: '', // Will be generated after event creation
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: event, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to create event' },
        },
        { status: 500 }
      );
    }

    // TODO: Generate QR code and update event with QR code URL
    // This will be implemented in the QR code generation service

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/events:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
      },
      { status: 500 }
    );
  }
}
