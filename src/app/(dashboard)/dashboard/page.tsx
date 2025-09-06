"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EventCard,
  LoadingSpinner,
  EmptyEvents,
} from "@/components/instamoments";
import { CalendarIcon } from "@/components/ui/calendar-icon";
import { Camera, Search, Filter, Users, Video, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Event } from "@/components/instamoments/event-card";

interface DashboardStats {
  totalEvents: number;
  totalContributors: number;
  totalPhotos: number;
  totalVideos: number;
  activeEvents: number;
  expiredEvents: number;
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuthContext();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalContributors: 0,
    totalPhotos: 0,
    totalVideos: 0,
    activeEvents: 0,
    expiredEvents: 0,
  });
  const [eventsLoading, setEventsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const lastFetchRef = useRef<{ userId: string | null; statusFilter: string }>({
    userId: null,
    statusFilter: "all",
  });
  const lastAuthStateRef = useRef<{
    userId: string | null;
    profileId: string | null;
  }>({
    userId: null,
    profileId: null,
  });

  const fetchEvents = useCallback(async () => {
    // Don't fetch events if user is not authenticated
    if (!user) {
      console.log("No user authenticated - skipping events fetch");
      return;
    }

    // Check if we've already fetched for this user and status filter
    if (
      lastFetchRef.current.userId === user.id &&
      lastFetchRef.current.statusFilter === statusFilter
    ) {
      console.log("Already fetched events for this user and status filter");
      return;
    }

    try {
      setEventsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/events?${params.toString()}`, {
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (!result.success) {
        // If authentication is required, redirect to sign in instead of throwing error
        if (result.error?.message === "Authentication required") {
          console.log("Authentication required - redirecting to sign in");
          router.push("/signin");
          return;
        }
        throw new Error(result.error.message || "Failed to fetch events");
      }

      setEvents(result.data || []);

      // Calculate stats
      const totalStats = result.data.reduce(
        (acc: DashboardStats, event: Event) => {
          acc.totalEvents++;
          acc.totalContributors += event.totalContributors || 0;
          acc.totalPhotos += event.totalPhotos || 0;
          acc.totalVideos += event.totalVideos || 0;
          if (event.status === "active") acc.activeEvents++;
          if (event.status === "expired") acc.expiredEvents++;
          return acc;
        },
        {
          totalEvents: 0,
          totalContributors: 0,
          totalPhotos: 0,
          totalVideos: 0,
          activeEvents: 0,
          expiredEvents: 0,
        },
      );

      setStats(totalStats);

      // Update the ref to track what we've fetched
      lastFetchRef.current = {
        userId: user.id,
        statusFilter: statusFilter,
      };
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  }, [statusFilter, user, router]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    const currentProfileId = profile?.id || null;

    // Check if auth state has actually changed
    const authStateChanged =
      lastAuthStateRef.current.userId !== currentUserId ||
      lastAuthStateRef.current.profileId !== currentProfileId;

    if (!authStateChanged && user) {
      console.log("Dashboard - Auth state unchanged, skipping effect");
      return;
    }

    console.log("Dashboard useEffect - Auth state:", {
      hasUser: !!user,
      userId: currentUserId,
      loading,
      profile: currentProfileId,
      changed: authStateChanged,
    });

    // Update the ref
    lastAuthStateRef.current = {
      userId: currentUserId,
      profileId: currentProfileId,
    };

    if (user) {
      fetchEvents();
    } else if (!loading) {
      console.log("Dashboard - No user and not loading, redirecting to signin");
      router.push("/signin");
    }
  }, [user, loading, router, profile?.id, fetchEvents]); // Include fetchEvents in dependencies

  // Separate effect for status filter changes
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [statusFilter, user, fetchEvents]); // Include user and fetchEvents in dependencies

  const handleEventEdit = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}/edit`);
  };

  const handleEventView = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEventShare = (_eventId: string) => {
    // TODO: Implement QR code sharing modal
    toast.info("QR code sharing coming soon!");
  };

  const handleEventSettings = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}/settings`);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome to InstaMoments!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Start creating and sharing your celebration moments.
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/create-event">
                <CalendarIcon size="sm" variant="default" className="mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Compact Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size="sm" variant="primary" />
                    <span className="text-sm text-gray-600">Events</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalEvents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Contributors</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalContributors}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Photos</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalPhotos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Videos</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalVideos}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setStatusFilter("active")}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Active Events
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Status Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filter Events</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="expired">Expired Only</SelectItem>
                    <SelectItem value="archived">Archived Only</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Events */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl">Your Events</CardTitle>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner className="w-8 h-8 mr-2" />
                    <span>Loading events...</span>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <EmptyEvents
                    onCreateEvent={() => router.push("/create-event")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={handleEventEdit}
                        onView={handleEventView}
                        onShare={handleEventShare}
                        onSettings={handleEventSettings}
                        showActions={true}
                        showQRCode={false}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
