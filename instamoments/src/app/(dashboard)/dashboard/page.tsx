'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EventCard,
  LoadingSpinner,
  EmptyEvents,
} from '@/components/instamoments';
import {
  Calendar,
  Camera,
  Search,
  Filter,
  Users,
  Video,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Event } from '@/components/instamoments/event-card';

interface DashboardStats {
  totalEvents: number;
  totalContributors: number;
  totalPhotos: number;
  totalVideos: number;
  activeEvents: number;
  expiredEvents: number;
}

export default function DashboardPage() {
  const { user, profile, signOut, loading } = useAuthContext();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to fetch events');
      }

      setEvents(result.data || []);

      // Calculate stats
      const totalStats = result.data.reduce(
        (acc: DashboardStats, event: Event) => {
          acc.totalEvents++;
          acc.totalContributors += event.total_contributors || 0;
          acc.totalPhotos += event.total_photos || 0;
          acc.totalVideos += event.total_videos || 0;
          if (event.status === 'active') acc.activeEvents++;
          if (event.status === 'expired') acc.expiredEvents++;
          return acc;
        },
        {
          totalEvents: 0,
          totalContributors: 0,
          totalPhotos: 0,
          totalVideos: 0,
          activeEvents: 0,
          expiredEvents: 0,
        }
      );

      setStats(totalStats);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else if (!loading) {
      router.push('/signin');
    }
  }, [user, statusFilter, fetchEvents, loading, router]);

  const handleEventEdit = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}/edit`);
  };

  const handleEventView = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEventShare = (_eventId: string) => {
    // TODO: Implement QR code sharing modal
    toast.info('QR code sharing coming soon!');
  };

  const handleEventSettings = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}/settings`);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to InstaMoments!</h2>
          <p className="text-muted-foreground text-lg">
            Start creating and sharing your Filipino celebration moments.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalContributors}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Contributors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPhotos}</p>
                  <p className="text-sm text-muted-foreground">Total Photos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Video className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalVideos}</p>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                Create Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full text-primary-foreground"
              >
                <Link href="/create-event">Create New Event</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                  <Camera className="w-5 h-5 text-secondary" />
                </div>
                My Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStatusFilter('active')}
              >
                View Active Events
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Events Management */}
        <Card className="border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Your Events</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner className="w-8 h-8 mr-2" />
                <span>Loading events...</span>
              </div>
            ) : filteredEvents.length === 0 ? (
              <EmptyEvents onCreateEvent={() => router.push('/create-event')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEventEdit}
                    onView={handleEventView}
                    onShare={handleEventShare}
                    onSettings={handleEventSettings}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
