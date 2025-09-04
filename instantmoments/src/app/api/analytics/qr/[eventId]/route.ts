import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics/qr/[eventId] - Get QR code analytics for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Validate event ID
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_EVENT_ID', message: 'Invalid event ID' },
        },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Verify event exists and user has access
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, host_id')
      .eq('id', eventId)
      .eq('host_id', user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    // Get QR scan analytics
    const { data: qrScans, error: scansError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_id', eventId)
      .eq('event_type', 'qr_scan')
      .order('created_at', { ascending: false });

    if (scansError) {
      console.error('Error fetching QR scans:', scansError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ANALYTICS_ERROR',
            message: 'Failed to fetch analytics',
          },
        },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalScans = qrScans?.length || 0;
    const uniqueScanners = new Set(qrScans?.map((scan) => scan.ip_address))
      .size;
    const lastScannedAt = qrScans?.[0]?.created_at || null;

    // Calculate scans today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scansToday =
      qrScans?.filter((scan) => new Date(scan.created_at) >= today).length || 0;

    // Calculate scans this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const scansThisWeek =
      qrScans?.filter((scan) => new Date(scan.created_at) >= weekAgo).length ||
      0;

    // Calculate top scan times by hour
    const hourCounts: Record<number, number> = {};
    qrScans?.forEach((scan) => {
      const hour = new Date(scan.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const topScanTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const analytics = {
      totalScans,
      uniqueScanners,
      lastScannedAt,
      scansToday,
      scansThisWeek,
      topScanTimes,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('QR Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analytics' },
      },
      { status: 500 }
    );
  }
}
