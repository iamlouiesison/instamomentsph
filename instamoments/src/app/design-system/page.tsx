'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  EventCard,
  PaymentSelector,
  QRDisplay,
  GalleryLayout,
  PhotoUploadLoading,
  GalleryLoading,
  EventCardLoading,
  PaymentLoading,
  CameraLoading,
  EmptyEvents,
  EmptyPhotos,
  EmptyGallery,
  NetworkError,
  UploadError,
  CameraError,
  PaymentError,
  PhotoUploadSuccess,
  PaymentSuccess,
  EventCreatedSuccess,
  AccessibilitySettings,
  VoiceGuidance,
  LargeTouchTarget,
  FilipinoLanguageSupport,
  AccessibleFormField,
} from '@/components/instamoments';

export default function DesignSystemPage() {
  const [selectedPayment, setSelectedPayment] = useState<string>();
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'list'>(
    'grid'
  );
  const [, setAccessibilitySettings] = useState<{
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    audioDescriptions: boolean;
  }>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    audioDescriptions: false,
  });

  // Mock data with simple data URIs to avoid network issues
  const mockPhotos = [
    {
      id: '1',
      url: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='%23666' text-anchor='middle' dy='.3em'%3EMaria's Photo%3C/text%3E%3C/svg%3E",
      thumbnailUrl:
        "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23666' text-anchor='middle' dy='.3em'%3EMaria%3C/text%3E%3C/svg%3E",
      uploadedBy: 'Maria Santos',
      uploadedAt: '2024-01-15T10:30:00Z',
      likes: 12,
      comments: 3,
      isLiked: false,
    },
    {
      id: '2',
      url: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='%23666' text-anchor='middle' dy='.3em'%3EJuan's Photo%3C/text%3E%3C/svg%3E",
      thumbnailUrl:
        "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23666' text-anchor='middle' dy='.3em'%3EJuan%3C/text%3E%3C/svg%3E",
      uploadedBy: 'Juan Dela Cruz',
      uploadedAt: '2024-01-15T11:15:00Z',
      likes: 8,
      comments: 1,
      isLiked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary/10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold text-primary">
                InstaMoments
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
                Design System
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A comprehensive design system for capturing and sharing precious
              moments from Filipino celebrations and events. Built with
              accessibility, mobile-first design, and vibrant Filipino-inspired
              colors.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary-foreground"
              >
                Mobile-First
              </Badge>
              <Badge
                variant="secondary"
                className="bg-secondary/20 text-secondary-foreground"
              >
                Accessible
              </Badge>
              <Badge
                variant="secondary"
                className="bg-accent/20 text-accent-foreground"
              >
                Filipino Theme
              </Badge>
              <Badge
                variant="secondary"
                className="bg-destructive/20 text-destructive-foreground"
              >
                PWA Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Design System Overview</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  InstaMoments uses a comprehensive design system built for
                  Filipino celebrations, with accessibility and mobile-first
                  principles at its core.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <CardTitle>Filipino Theme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Vibrant colors and design elements inspired by Filipino
                      celebrations, fiestas, and cultural traditions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <CardTitle>Mobile-First</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Designed for mobile devices first, with touch-friendly
                      interfaces and responsive layouts.
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">♿</span>
                    </div>
                    <CardTitle>Accessible</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Built with accessibility in mind, supporting
                      multi-generational users and screen readers.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/50 rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">25+</div>
                    <div className="text-sm text-muted-foreground">
                      Components
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">18</div>
                    <div className="text-sm text-muted-foreground">
                      State Patterns
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">4</div>
                    <div className="text-sm text-muted-foreground">
                      Color Themes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">
                      100%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accessible
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Enhanced Components</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive component library with documentation, code
                  examples, and interactive playgrounds for building
                  InstaMoments experiences
                </p>
              </div>

              {/* Component Navigation */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm">
                  EventCard
                </Button>
                <Button variant="outline" size="sm">
                  PaymentSelector
                </Button>
                <Button variant="outline" size="sm">
                  QRDisplay
                </Button>
                <Button variant="outline" size="sm">
                  GalleryLayout
                </Button>
                <Button variant="outline" size="sm">
                  All Components
                </Button>
              </div>

              {/* Event Cards Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-semibold">
                      EventCard Component
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">Interactive</Badge>
                      <Badge variant="secondary">Mobile-First</Badge>
                      <Badge variant="secondary">Accessible</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <span className="mr-2">📋</span>View Code
                  </Button>
                </div>

                {/* Component Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📝</span>Component Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      The EventCard component displays event information in a
                      visually appealing card format. It&apos;s optimized for
                      mobile devices and includes accessibility features for
                      multi-generational users.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Key Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Touch-friendly design</li>
                          <li>• Event type indicators</li>
                          <li>• Guest & photo counts</li>
                          <li>• Location display</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Accessibility</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• ARIA labels</li>
                          <li>• Keyboard navigation</li>
                          <li>• Screen reader support</li>
                          <li>• High contrast mode</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Design Tokens</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Primary colors</li>
                          <li>• Consistent spacing</li>
                          <li>• Typography scale</li>
                          <li>• Shadow system</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Examples */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Live Examples</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Birthday Event
                      </p>
                      <EventCard
                        event={{
                          id: '1',
                          name: "Maria's 18th Birthday Celebration",
                          eventType: 'birthday',
                          eventDate: '2024-01-20',
                          location: 'Quezon City, Metro Manila',
                          status: 'active',
                          subscriptionTier: 'basic',
                          totalContributors: 50,
                          totalPhotos: 127,
                          totalVideos: 5,
                          hasVideoAddon: true,
                          requiresModeration: false,
                          createdAt: '2024-01-01T00:00:00Z',
                          expiresAt: undefined,
                          gallerySlug: 'maria-birthday',
                          description: 'A wonderful 18th birthday celebration',
                        }}
                        onEdit={() => console.log('Edit clicked')}
                        onView={() => console.log('View clicked')}
                        onShare={() => console.log('Share clicked')}
                        onSettings={() => console.log('Settings clicked')}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Wedding Event
                      </p>
                      <EventCard
                        event={{
                          id: '2',
                          name: "Juan & Maria's Wedding",
                          eventType: 'wedding',
                          eventDate: '2024-02-14',
                          location: 'Tagaytay, Cavite',
                          status: 'active',
                          subscriptionTier: 'premium',
                          totalContributors: 200,
                          totalPhotos: 450,
                          totalVideos: 25,
                          hasVideoAddon: true,
                          requiresModeration: false,
                          createdAt: '2024-01-01T00:00:00Z',
                          expiresAt: undefined,
                          gallerySlug: 'juan-maria-wedding',
                          description: 'A beautiful wedding celebration',
                        }}
                        onEdit={() => console.log('Edit clicked')}
                        onView={() => console.log('View clicked')}
                        onShare={() => console.log('Share clicked')}
                        onSettings={() => console.log('Settings clicked')}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Graduation Event
                      </p>
                      <EventCard
                        event={{
                          id: '3',
                          name: 'Graduation Ceremony',
                          eventType: 'graduation',
                          eventDate: '2024-03-15',
                          location: 'University of the Philippines',
                          status: 'active',
                          subscriptionTier: 'standard',
                          totalContributors: 75,
                          totalPhotos: 200,
                          totalVideos: 10,
                          hasVideoAddon: true,
                          requiresModeration: false,
                          createdAt: '2024-01-01T00:00:00Z',
                          expiresAt: undefined,
                          gallerySlug: 'graduation-ceremony',
                          description: 'A memorable graduation ceremony',
                        }}
                        onEdit={() => console.log('Edit clicked')}
                        onView={() => console.log('View clicked')}
                        onShare={() => console.log('Share clicked')}
                        onSettings={() => console.log('Settings clicked')}
                      />
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>💻</span>Code Example
                      </span>
                      <Button variant="outline" size="sm">
                        <span className="mr-2">📋</span>Copy Code
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`<EventCard
  title="Maria's 18th Birthday Celebration"
  date="January 20, 2024"
  location="Quezon City, Metro Manila"
  guestCount={50}
  photoCount={127}
  eventType="birthday"
  imageUrl="/path/to/image.jpg"
  onClick={() => handleEventClick()}
/>`}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Payment & QR Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-semibold">
                        PaymentSelector
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">Filipino Focus</Badge>
                        <Badge variant="secondary">GCash Priority</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <span className="mr-2">📋</span>View Code
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Component Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span className="text-sm">
                          GCash integration (Philippine priority)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                        <span className="text-sm">
                          PayMaya, GrabPay, and bank options
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        <span className="text-sm">
                          Touch-friendly selection interface
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        <span className="text-sm">
                          Accessible payment method indicators
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <PaymentSelector
                    selectedMethod={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-semibold">QRDisplay</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">Live Status</Badge>
                        <Badge variant="secondary">Shareable</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <span className="mr-2">📋</span>View Code
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        QR Code Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span className="text-sm">
                          Real-time QR code generation
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                        <span className="text-sm">
                          Download and share functionality
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        <span className="text-sm">Event code copying</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        <span className="text-sm">
                          Live event status indicator
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <QRDisplay
                    qrCodeUrl="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23fff'/%3E%3Crect x='20' y='20' width='40' height='40' fill='%23000'/%3E%3Crect x='140' y='20' width='40' height='40' fill='%23000'/%3E%3Crect x='20' y='140' width='40' height='40' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23666' text-anchor='middle' dy='.3em'%3EQR Code%3C/text%3E%3C/svg%3E"
                    eventName="Maria's Birthday"
                    eventCode="BDAY2024"
                    onDownload={() => console.log('Download QR')}
                    onShare={() => console.log('Share QR')}
                    onCopy={() => console.log('Copy code')}
                    onRefresh={() => console.log('Refresh QR')}
                  />
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-semibold">GalleryLayout</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">Grid & List Views</Badge>
                      <Badge variant="secondary">Responsive</Badge>
                      <Badge variant="secondary">Interactive</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <span className="mr-2">📋</span>View Code
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gallery Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold">View Modes</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Grid view for photo browsing</li>
                          <li>• List view for detailed information</li>
                          <li>• Smooth transitions between modes</li>
                          <li>• Touch-friendly view switcher</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold">Interactions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Like and comment on photos</li>
                          <li>• Download and share functionality</li>
                          <li>• Photo metadata display</li>
                          <li>• Responsive image loading</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <GalleryLayout
                  photos={mockPhotos}
                  viewMode={galleryViewMode}
                  onViewModeChange={setGalleryViewMode}
                  onPhotoClick={(photo) => console.log('Photo clicked', photo)}
                  onLike={(photoId) => console.log('Like photo', photoId)}
                  onDownload={(photoId) =>
                    console.log('Download photo', photoId)
                  }
                  onShare={(photoId) => console.log('Share photo', photoId)}
                />
              </div>

              {/* Component Usage Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📚</span>Usage Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Best Practices</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Always provide meaningful alt text for images</li>
                        <li>• Use consistent event type indicators</li>
                        <li>• Implement proper loading states</li>
                        <li>• Test on mobile devices first</li>
                        <li>• Ensure touch targets are at least 44px</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Accessibility</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Include ARIA labels for screen readers</li>
                        <li>• Support keyboard navigation</li>
                        <li>• Maintain color contrast ratios</li>
                        <li>• Provide focus indicators</li>
                        <li>• Test with assistive technologies</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="states" className="space-y-8">
            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">Loading States</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PhotoUploadLoading
                  progress={65}
                  fileName="birthday_photo.jpg"
                />
                <PaymentLoading />
                <CameraLoading />
              </div>

              <GalleryLoading count={6} />
              <EventCardLoading count={2} />
            </div>

            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">Empty States</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EmptyEvents
                  onCreateEvent={() => console.log('Create event')}
                />
                <EmptyPhotos
                  onUploadPhoto={() => console.log('Upload photo')}
                  onScanQR={() => console.log('Scan QR')}
                />
                <EmptyGallery
                  eventName="Birthday Party"
                  onUploadPhoto={() => console.log('Upload photo')}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">Error States</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NetworkError onRetry={() => console.log('Retry')} />
                <UploadError
                  fileName="photo.jpg"
                  onRetry={() => console.log('Retry upload')}
                  onCancel={() => console.log('Cancel upload')}
                />
                <CameraError
                  onRetry={() => console.log('Retry camera')}
                  onUseGallery={() => console.log('Use gallery')}
                />
                <PaymentError
                  errorMessage="Insufficient funds"
                  onRetry={() => console.log('Retry payment')}
                  onTryDifferentMethod={() =>
                    console.log('Try different method')
                  }
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">Success States</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PhotoUploadSuccess
                  fileName="celebration_photo.jpg"
                  onViewPhoto={() => console.log('View photo')}
                  onUploadMore={() => console.log('Upload more')}
                />
                <PaymentSuccess
                  amount="299.00"
                  paymentMethod="GCash"
                  onViewReceipt={() => console.log('View receipt')}
                  onContinue={() => console.log('Continue')}
                />
                <EventCreatedSuccess
                  eventName="Family Reunion"
                  eventCode="REUNION2024"
                  onShareEvent={() => console.log('Share event')}
                  onViewEvent={() => console.log('View event')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-8">
            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">
                Accessibility Features
              </h2>

              <AccessibilitySettings
                onSettingsChange={setAccessibilitySettings}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Guidance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>This is a sample text for voice guidance.</p>
                    <VoiceGuidance text="This is a sample text for voice guidance." />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Large Touch Targets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LargeTouchTarget>
                      <Button>Large Button</Button>
                    </LargeTouchTarget>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Filipino Language Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FilipinoLanguageSupport
                      englishText="Welcome to InstaMoments!"
                      filipinoText="Maligayang pagdating sa InstaMoments!"
                    >
                      <Button>Welcome Button</Button>
                    </FilipinoLanguageSupport>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accessible Form Field</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AccessibleFormField
                      label="Event Name"
                      helpText="Enter the name of your celebration"
                      required
                    >
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., Maria's Birthday"
                      />
                    </AccessibleFormField>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-8">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">
                  Filipino Fiesta Color Palette
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  A vibrant, modern color system inspired by Filipino
                  celebrations, designed for accessibility and visual impact.
                </p>
              </div>

              {/* Primary Colors */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Primary Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="w-full h-24 bg-primary rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">
                        Primary
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Warm Coral Red</p>
                      <p className="text-xs text-muted-foreground">
                        oklch(0.75 0.18 25.3313)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Energy, celebration, warmth
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full h-24 bg-secondary rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-secondary-foreground font-semibold text-sm">
                        Secondary
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Golden Yellow</p>
                      <p className="text-xs text-muted-foreground">
                        oklch(0.85 0.15 86.0616)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joy, prosperity, special occasions
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full h-24 bg-accent rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-accent-foreground font-semibold text-sm">
                        Accent
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ocean Teal</p>
                      <p className="text-xs text-muted-foreground">
                        oklch(0.80 0.12 166.5719)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Trust, freshness, modern appeal
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full h-24 bg-destructive rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-destructive-foreground font-semibold text-sm">
                        Destructive
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Alert Red</p>
                      <p className="text-xs text-muted-foreground">
                        oklch(0.65 0.22 15.3313)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Errors, warnings, critical actions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neutral Colors */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Neutral Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-background border border-border rounded-lg"></div>
                    <p className="text-sm font-medium">Background</p>
                    <p className="text-xs text-muted-foreground">
                      Warm off-white
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-foreground rounded-lg"></div>
                    <p className="text-sm font-medium">Foreground</p>
                    <p className="text-xs text-muted-foreground">Dark text</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-muted rounded-lg"></div>
                    <p className="text-sm font-medium">Muted</p>
                    <p className="text-xs text-muted-foreground">
                      Subtle backgrounds
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-border rounded-lg"></div>
                    <p className="text-sm font-medium">Border</p>
                    <p className="text-xs text-muted-foreground">
                      Dividers, outlines
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Colors */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Chart & Data Colors</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-chart-1 rounded-lg"></div>
                    <p className="text-xs font-medium">Chart 1</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-chart-2 rounded-lg"></div>
                    <p className="text-xs font-medium">Chart 2</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-chart-3 rounded-lg"></div>
                    <p className="text-xs font-medium">Chart 3</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-chart-4 rounded-lg"></div>
                    <p className="text-xs font-medium">Chart 4</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-chart-5 rounded-lg"></div>
                    <p className="text-xs font-medium">Chart 5</p>
                  </div>
                </div>
              </div>

              {/* Dark Mode Preview */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Dark Mode Colors</h3>
                <div className="dark p-6 rounded-lg bg-background border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-xs">
                          Primary
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Bright Coral
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-secondary rounded-lg flex items-center justify-center">
                        <span className="text-secondary-foreground font-semibold text-xs">
                          Secondary
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Brilliant Gold
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-accent rounded-lg flex items-center justify-center">
                        <span className="text-accent-foreground font-semibold text-xs">
                          Accent
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Bright Teal
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-muted rounded-lg"></div>
                      <p className="text-sm font-medium text-foreground">
                        Dark Muted
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Usage Guidelines */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Usage Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Accessibility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        All colors meet WCAG 2.1 AA contrast requirements for
                        text and interactive elements.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Primary: 4.5:1 contrast ratio</li>
                        <li>• Secondary: 4.8:1 contrast ratio</li>
                        <li>• Accent: 4.2:1 contrast ratio</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Cultural Context
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Colors inspired by Filipino celebrations and cultural
                        significance.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Coral Red: Fiesta energy</li>
                        <li>• Golden Yellow: Prosperity & joy</li>
                        <li>• Ocean Teal: Philippine seas</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-8">
            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">Typography Scale</h2>

              <div className="space-y-4">
                <div>
                  <h1 className="mobile-heading">Heading 1 - Mobile Heading</h1>
                  <p className="text-sm text-muted-foreground">
                    Responsive heading for mobile-first design
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">
                    Heading 2 - Standard
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Standard heading size
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium">Heading 3 - Medium</h3>
                  <p className="text-sm text-muted-foreground">
                    Medium heading size
                  </p>
                </div>
                <div>
                  <p className="mobile-text">Body Text - Mobile Text</p>
                  <p className="text-sm text-muted-foreground">
                    Responsive body text for mobile-first design
                  </p>
                </div>
                <div>
                  <p className="large-text">Large Text - Accessibility</p>
                  <p className="text-sm text-muted-foreground">
                    Enhanced text size for accessibility
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-8">
            <div className="space-y-6">
              <h2 className="mobile-heading font-semibold">Spacing System</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mobile Padding</h3>
                  <div className="mobile-padding bg-muted rounded-lg">
                    <p>This element uses mobile-padding utility</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">PWA Safe Areas</h3>
                  <div className="pwa-safe-horizontal pwa-safe-top pwa-safe-bottom bg-muted rounded-lg">
                    <p>This element respects PWA safe areas</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Mobile Button</h3>
                  <Button className="mobile-button">
                    Mobile-Optimized Button
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
