import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Event } from "@/types/database";
// import { GalleryPage } from '@/components/features/gallery/GalleryPage';
import { LoadingStates } from "@/components/instamoments/loading-states";
import { PublicGalleryWrapper } from "@/components/features/gallery/PublicGalleryWrapper";
import { PrivateGalleryNotification } from "@/components/instamoments/private-gallery-notification";

interface GalleryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for the gallery page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: event } = await supabase
    .from("events")
    .select(
      "name, description, event_type, event_date, location, custom_message",
    )
    .eq("gallery_slug", slug)
    .eq("status", "active")
    .single();

  if (!event) {
    return {
      title: "Gallery Not Found - InstaMoments",
      description: "The requested gallery could not be found.",
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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.name} - InstaMoments Gallery`,
      description:
        event.description || `Join the photo sharing for ${event.name}!`,
    },
  };
}

// Check if event exists (for private gallery detection)
async function checkEventExists(slug: string): Promise<{
  exists: boolean;
  isPrivate?: boolean;
  eventName?: string;
  hostName?: string;
}> {
  try {
    // Use our special API endpoint that can check event existence without RLS restrictions
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/gallery/${slug}/check`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return { exists: false };
    }

    const result = await response.json();

    if (!result.success) {
      return { exists: false };
    }

    return result.data;
  } catch (error) {
    console.error("Error checking event existence:", error);
    return { exists: false };
  }
}

// Fetch event data
async function getEventData(slug: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("gallery_slug", slug)
    .eq("status", "active")
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
  ipAddress?: string,
) {
  try {
    const supabase = await createClient();

    await supabase.from("analytics_events").insert({
      event_id: eventId,
      event_type: "gallery_view",
      properties: {
        user_agent: userAgent,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
      },
      user_agent: userAgent,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error("Failed to track gallery view:", error);
    // Don't fail the page load if analytics fails
  }
}

export default async function GalleryPageRoute({ params }: GalleryPageProps) {
  const { slug } = await params;

  // First check if the event exists and if it's private
  const eventCheck = await checkEventExists(slug);

  if (!eventCheck.exists) {
    // Event doesn't exist at all
    return (
      <PrivateGalleryNotification
        isPrivate={false} // This will show the "Gallery Not Found" message
      />
    );
  }

  if (eventCheck.isPrivate) {
    // Event exists but is private
    return (
      <PrivateGalleryNotification
        isPrivate={true}
        eventName={eventCheck.eventName}
        hostName={eventCheck.hostName}
      />
    );
  }

  // Event exists and is public, get full event data
  const event = await getEventData(slug);

  if (!event) {
    // This shouldn't happen if checkEventExists returned exists: true and isPrivate: false
    return (
      <PrivateGalleryNotification
        isPrivate={false} // This will show the "Gallery Not Found" message
      />
    );
  }

  // Track gallery view (don't await to avoid blocking page load)
  trackGalleryView(event.id);

  return (
    <Suspense fallback={<LoadingStates.GalleryPageLoading />}>
      <PublicGalleryWrapper event={event} />
    </Suspense>
  );
}
