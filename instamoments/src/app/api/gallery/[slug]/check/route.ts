import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Use service role key to bypass RLS for existence check
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();

    // Check if event exists and get basic info
    const { data: event, error } = await adminSupabase
      .from('events')
      .select('id, name, is_public, host_id, status')
      .eq('gallery_slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !event) {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          isPrivate: false
        }
      });
    }

    // Event exists - check if it's private
    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        isPrivate: !event.is_public,
        eventName: event.name,
        hostName: 'Event Host' // We can't get host name due to RLS
      }
    });

  } catch (error) {
    console.error('Error checking event existence:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to check event' } },
      { status: 500 }
    );
  }
}
