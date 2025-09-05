'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  QrCode,
  BarChart3,
  Eye,
  RefreshCw,
  Share2,
  Copy,
  Calendar,
  Users,
  Smartphone,
} from 'lucide-react';
import { Event } from '@/types/database';
import { QRCodeDisplay } from './QRCodeDisplay';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface QRCodeManagementProps {
  event: Event;
  className?: string;
}

interface QRCodeAnalytics {
  totalScans: number;
  uniqueScanners: number;
  lastScannedAt: string | null;
  scansToday: number;
  scansThisWeek: number;
  topScanTimes: Array<{ hour: number; count: number }>;
}

export function QRCodeManagement({
  event,
  className = '',
}: QRCodeManagementProps) {
  const [analytics, setAnalytics] = useState<QRCodeAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState('display');

  // Fetch QR code analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoadingAnalytics(true);

      const response = await fetch(`/api/analytics/qr/${event.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch QR analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [event.id, fetchAnalytics]);

  // Regenerate QR code
  const handleRegenerateQR = async () => {
    try {
      // This would trigger a new QR code generation
      // For now, we'll just refresh the analytics
      await fetchAnalytics();
      toast.success('QR code refreshed');
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      toast.error('Failed to regenerate QR code');
    }
  };

  // Copy gallery URL
  const handleCopyUrl = async () => {
    try {
      const galleryUrl = `${window.location.origin}/gallery/${event.gallery_slug}`;
      await navigator.clipboard.writeText(galleryUrl);
      toast.success('Gallery URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  // Share QR code
  const handleShare = async () => {
    try {
      const galleryUrl = `${window.location.origin}/gallery/${event.gallery_slug}`;

      if (navigator.share) {
        await navigator.share({
          title: `${event.name} - InstaMoments`,
          text: `Join the photo sharing for ${event.name}!`,
          url: galleryUrl,
        });
      } else {
        await handleCopyUrl();
      }
    } catch (error) {
      console.error('Failed to share:', error);
      await handleCopyUrl();
    }
  };

  return (
    <div className={className}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="display" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Sharing
          </TabsTrigger>
        </TabsList>

        {/* QR Code Display Tab */}
        <TabsContent value="display" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">QR Code Display</h3>
              <p className="text-sm text-muted-foreground">
                Share this QR code with your guests
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRegenerateQR}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QRCodeDisplay
              event={event}
              size="large"
              showInstructions={true}
              showDownloadOptions={true}
              branded={true}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>
                  Manage your QR code and sharing options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleCopyUrl}
                  className="w-full justify-start"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Gallery URL
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Gallery
                </Button>
                <Button
                  onClick={handleRegenerateQR}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate QR Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">QR Code Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track how your QR code is being used
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={isLoadingAnalytics}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoadingAnalytics ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.totalScans}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Scans
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.uniqueScanners}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Unique Scanners
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.scansToday}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scans Today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {analytics.scansThisWeek}
                      </p>
                      <p className="text-sm text-muted-foreground">This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No analytics data available yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Analytics will appear once guests start scanning your QR code
                </p>
              </CardContent>
            </Card>
          )}

          {analytics && analytics.lastScannedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last scanned:</span>
                    <span className="text-sm font-medium">
                      {format(
                        new Date(analytics.lastScannedAt),
                        'MMM d, yyyy h:mm a'
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Sharing Options</h3>
            <p className="text-sm text-muted-foreground">
              Different ways to share your event gallery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Sharing
                </CardTitle>
                <CardDescription>
                  Perfect for physical events and printed materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Best for:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Printed invitations and programs</li>
                    <li>• Table tents and signage</li>
                    <li>• Social media posts</li>
                    <li>• Email signatures</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setActiveTab('display')}>
                    View QR Code
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Direct Link Sharing
                </CardTitle>
                <CardDescription>
                  Share the direct URL to your gallery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Best for:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• WhatsApp and Messenger</li>
                    <li>• Email invitations</li>
                    <li>• Social media captions</li>
                    <li>• Text messages</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCopyUrl}>
                    Copy Link
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gallery URL</CardTitle>
              <CardDescription>
                Your event gallery is accessible at this URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/gallery/${event.gallery_slug}`
                    : ''}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
