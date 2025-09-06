"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Event } from "@/types/database";
import { PhotoGallery } from "./PhotoGallery";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface GalleryPageProps {
  event: Event & { host?: Record<string, unknown> };
  currentUser?: SupabaseUser | null;
  isAuthenticated?: boolean;
  isLoadingAuth?: boolean;
}

export function GalleryPage({
  event,
  currentUser,
  isAuthenticated = false,
  // isLoadingAuth = false,
}: GalleryPageProps) {
  const router = useRouter();

  // Check if event is still active
  const isEventActive =
    event.status === "active" &&
    (!event.expires_at || new Date(event.expires_at) > new Date());

  if (!isEventActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Event Not Available</h2>
          <p className="text-muted-foreground mb-4">
            This event gallery is no longer active or has expired.
          </p>
          <Button onClick={() => router.push("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Event Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {event.name}
          </h1>
          {event.description && (
            <p className="text-lg text-gray-600">{event.description}</p>
          )}
        </div>

        {/* Gallery */}
        <PhotoGallery
          eventId={event.gallery_slug}
          allowDownloads={event.allow_downloads}
          maxPhotos={event.max_photos}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
