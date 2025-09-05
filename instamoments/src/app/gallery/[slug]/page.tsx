import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Event } from '@/types/database';
import { GalleryPage } from '@/components/features/gallery/GalleryPage';
import { LoadingStates } from '@/components/instamoments/loading-states';

interface GalleryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate metadata for the gallery page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: event } = await supabase
    .from('events')
    .select('name, description, event_type, event_date, location, custom_message')
    .eq('gallery_slug', slug)
    .eq('status', 'active')
    .single();

  if (!event) {
    return {
      title: 'Gallery Not Found - InstaMoments',
      description: 'The requested gallery could not be found.',
    };
  }

  return {
    title: `${event.name} - InstaMoments Gallery`,
    description:
      event.description ||
      `Join the photo sharing for ${event.name}! Upload your photos and videos to create lasting memories.`,
    openGraph: {
      title: `${event.name} - InstaMoments Gallery`,
      description:
        event.description || `Join the photo sharing for ${event.name}!`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name} - InstaMoments Gallery`,
      description:
        event.description || `Join the photo sharing for ${event.name}!`,
    },
  };
}

// Fetch event data
async function getEventData(slug: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('gallery_slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !event) {
    return null;
  }

  return event as Event & { host: Record<string, unknown> };
}

// Track gallery view analytics
async function trackGalleryView(
  eventId: string,
  userAgent?: string,
  ipAddress?: string
) {
  try {
    const supabase = await createClient();

    await supabase.from('analytics_events').insert({
      event_id: eventId,
      event_type: 'gallery_view',
      properties: {
        user_agent: userAgent,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
      },
      user_agent: userAgent,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error('Failed to track gallery view:', error);
    // Don't fail the page load if analytics fails
  }
}

export default async function GalleryPageRoute({ params }: GalleryPageProps) {
  const { slug } = await params;

  // Get event data
  const event = await getEventData(slug);

  if (!event) {
    notFound();
  }

  // Track gallery view (don't await to avoid blocking page load)
  trackGalleryView(event.id);

  return (
    <Suspense fallback={<LoadingStates.GalleryPageLoading />}>
      <GalleryPage event={event} />
    </Suspense>
  );
}
