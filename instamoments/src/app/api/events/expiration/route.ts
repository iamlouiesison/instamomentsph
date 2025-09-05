import { NextRequest, NextResponse } from 'next/server';
import {
  processExpiredEvents,
  getEventsExpiringSoon,
} from '@/lib/business-logic/event-expiration';

// POST /api/events/expiration - Process expired events
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteContent = searchParams.get('deleteContent') === 'true';
    const hoursThreshold = parseInt(searchParams.get('hoursThreshold') || '24');

    // Process expired events
    const stats = await processExpiredEvents(deleteContent);

    // Get events expiring soon for notification purposes
    const expiringSoon = await getEventsExpiringSoon(hoursThreshold);

    return NextResponse.json({
      success: true,
      data: {
        processed: stats,
        expiringSoon: expiringSoon.length,
        expiringEvents: expiringSoon.map((event) => ({
          id: event.id,
          name: event.name,
          expiresAt: event.expiresAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error processing expired events:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process expired events',
        },
      },
      { status: 500 }
    );
  }
}

// GET /api/events/expiration - Get expiration status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hoursThreshold = parseInt(searchParams.get('hoursThreshold') || '24');

    // Get events expiring soon
    const expiringSoon = await getEventsExpiringSoon(hoursThreshold);

    return NextResponse.json({
      success: true,
      data: {
        expiringSoon: expiringSoon.length,
        events: expiringSoon.map((event) => ({
          id: event.id,
          name: event.name,
          hostId: event.hostId,
          gallerySlug: event.gallerySlug,
          subscriptionTier: event.subscriptionTier,
          totalPhotos: event.totalPhotos,
          totalVideos: event.totalVideos,
          expiresAt: event.expiresAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching expiration status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch expiration status',
        },
      },
      { status: 500 }
    );
  }
}
