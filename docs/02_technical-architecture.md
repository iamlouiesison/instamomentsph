# Technical Architecture

## Tech Stack

### Core Technologies
- **Frontend Framework**: Next.js 15 with TypeScript 5.5+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Deployment**: Vercel (Edge Runtime)
- **Development**: Cursor AI
- **Version Control**: GitHub

### Additional Libraries
- **State Management**: Zustand (for client-side state)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query v5 (React Query)
- **Date Handling**: date-fns
- **Image Processing**: sharp (server-side), browser-image-compression (client-side)
- **Video Processing**: ffmpeg.wasm (client-side compression)
- **PWA**: next-pwa v5
- **QR Generation**: qrcode package
- **QR Scanning**: html5-qrcode
- **Payment Processing**: 
  - PayMongo (GCash, PayMaya, Cards)
  - Over-the-counter payment APIs
- **Real-time Communication**: Supabase Realtime subscriptions
- **File Upload**: @supabase/storage-js
- **Testing**: Jest + React Testing Library + Playwright (E2E)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Client Browsers (PWA)                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           Next.js 15 PWA (Vercel Edge)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │    Pages    │  │     API     │  │   Static    │          │  │
│  │  │    (RSC)    │  │   Routes    │  │   Assets    │          │  │
│  │  │             │  │             │  │             │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │   Camera    │  │  Real-time  │  │     PWA     │          │  │
│  │  │     API     │  │   Gallery   │  │  Features   │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │    Auth     │  │  Database   │  │   Storage   │                │
│  │   (JWT)     │  │    (PG)     │  │    (S3)     │                │
│  │             │  │             │  │             │                │
│  │- Magic Link │  │- Events     │  │- Photos     │                │
│  │- Email/Pass │  │- Photos     │  │- Videos     │                │
│  │- Social     │  │- Videos     │  │- QR Codes   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Real-time  │  │   Edge      │  │    Row      │                │
│  │    Subs     │  │ Functions   │  │   Level     │                │
│  │             │  │             │  │  Security   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Services                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  PayMongo   │  │    Email    │  │  Analytics  │                │
│  │             │  │             │  │             │                │
│  │- GCash      │  │- Resend.com │  │- Vercel     │                │
│  │- PayMaya    │  │- Transac    │  │- PostHog    │                │
│  │- Cards      │  │- Email      │  │- Mixpanel   │                │
│  │- OTC        │  │  Templates  │  │  (optional) │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth)
-- auth.users table is automatically created

-- User Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'guest', -- 'host', 'guest', 'planner'
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'basic', 'standard', 'premium', 'pro'
  subscription_status TEXT DEFAULT 'active',
  payment_customer_id TEXT, -- PayMongo customer ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'wedding', 'birthday', 'corporate', 'graduation', etc.
  event_date DATE,
  location TEXT,
  host_id UUID REFERENCES auth.users(id) NOT NULL,
  qr_code_url TEXT NOT NULL,
  gallery_slug TEXT UNIQUE NOT NULL, -- For public gallery access
  
  -- Subscription & Limits
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  max_photos INTEGER DEFAULT 30,
  max_photos_per_user INTEGER DEFAULT 3,
  storage_days INTEGER DEFAULT 3,
  has_video_addon BOOLEAN DEFAULT FALSE,
  
  -- Settings
  requires_moderation BOOLEAN DEFAULT FALSE,
  allow_downloads BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  custom_message TEXT,
  
  -- Metadata
  total_photos INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  total_contributors INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Based on storage_days
);

-- Photos Table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id),
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- Compressed thumbnail
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Content
  caption TEXT,
  is_approved BOOLEAN DEFAULT TRUE, -- For moderation
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  exif_data JSONB, -- Camera, location, etc.
  
  CONSTRAINT photos_event_user_limit CHECK (
    -- This will be enforced by application logic
    TRUE
  )
);

-- Videos Table  
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id),
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- Video thumbnail
  file_size BIGINT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Content
  message TEXT, -- Video greeting message/caption
  is_approved BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processing_status TEXT DEFAULT 'pending' -- 'pending', 'processing', 'completed', 'failed'
);

-- Event Contributors (for tracking who contributed)
CREATE TABLE event_contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id),
  contributor_name TEXT NOT NULL,
  contributor_email TEXT NOT NULL,
  photos_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  first_contribution_at TIMESTAMPTZ DEFAULT NOW(),
  last_contribution_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, contributor_email)
);

-- Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Payment Details
  amount_cents INTEGER NOT NULL, -- Amount in centavos
  currency TEXT DEFAULT 'PHP',
  payment_method TEXT NOT NULL, -- 'gcash', 'paymaya', 'card', 'otc'
  payment_provider TEXT DEFAULT 'paymongo',
  external_payment_id TEXT NOT NULL, -- PayMongo payment intent ID
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  paid_at TIMESTAMPTZ,
  
  -- Subscription Details  
  tier_purchased TEXT NOT NULL, -- 'basic', 'standard', 'premium', 'pro'
  has_video_addon BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events (for tracking user behavior)
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'qr_scan', 'photo_upload', 'video_record', 'gallery_view'
  properties JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events
CREATE POLICY "Event hosts can manage their events" ON events
  FOR ALL USING (auth.uid() = host_id);
CREATE POLICY "Public events viewable by all" ON events
  FOR SELECT USING (is_public = TRUE);

-- Photos
CREATE POLICY "Event photos viewable by all for public events" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.is_public = TRUE
    )
  );
CREATE POLICY "Contributors can insert photos" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.status = 'active'
    )
  );
CREATE POLICY "Event hosts can moderate photos" ON photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Videos
CREATE POLICY "Event videos viewable by all for public events" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.is_public = TRUE
    )
  );
CREATE POLICY "Contributors can insert videos" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.status = 'active'
    )
  );

-- Event Contributors
CREATE POLICY "Contributors viewable for public events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.is_public = TRUE
    )
  );

-- Payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_gallery_slug ON events(gallery_slug);
CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_photos_event_id ON photos(event_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at);
CREATE INDEX idx_videos_event_id ON videos(event_id);
CREATE INDEX idx_videos_uploaded_at ON videos(uploaded_at);
CREATE INDEX idx_contributors_event_id ON event_contributors(event_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
```

### Data Models (TypeScript)

```typescript
// Base types
export interface Profile {
  id: string
  email: string
  fullName?: string
  phoneNumber?: string
  avatarUrl?: string
  userType: 'host' | 'guest' | 'planner'
  subscriptionTier: 'free' | 'basic' | 'standard' | 'premium' | 'pro'
  subscriptionStatus: 'active' | 'inactive' | 'past_due'
  paymentCustomerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  name: string
  description?: string
  eventType: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'anniversary' | 'debut' | 'other'
  eventDate?: Date
  location?: string
  hostId: string
  qrCodeUrl: string
  gallerySlug: string
  
  // Subscription & Limits
  subscriptionTier: 'free' | 'basic' | 'standard' | 'premium' | 'pro'
  maxPhotos: number
  maxPhotosPerUser: number
  storageDays: number
  hasVideoAddon: boolean
  
  // Settings
  requiresModeration: boolean
  allowDownloads: boolean
  isPublic: boolean
  customMessage?: string
  
  // Metadata
  totalPhotos: number
  totalVideos: number
  totalContributors: number
  
  status: 'active' | 'expired' | 'archived'
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface Photo {
  id: string
  eventId: string
  contributorId?: string
  contributorName: string
  contributorEmail?: string
  
  // File Info
  fileName: string
  fileUrl: string
  thumbnailUrl?: string
  fileSize: number
  mimeType: string
  
  // Content
  caption?: string
  isApproved: boolean
  
  // Metadata
  uploadedAt: Date
  exifData?: Record<string, any>
}

export interface Video {
  id: string
  eventId: string
  contributorId?: string
  contributorName: string
  contributorEmail?: string
  
  // File Info
  fileName: string
  fileUrl: string
  thumbnailUrl?: string
  fileSize: number
  durationSeconds: number
  mimeType: string
  
  // Content
  message?: string
  isApproved: boolean
  
  // Metadata
  uploadedAt: Date
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface EventContributor {
  id: string
  eventId: string
  contributorId?: string
  contributorName: string
  contributorEmail: string
  photosCount: number
  videosCount: number
  firstContributionAt: Date
  lastContributionAt: Date
}

export interface Payment {
  id: string
  eventId: string
  userId: string
  
  // Payment Details
  amountCents: number
  currency: string
  paymentMethod: 'gcash' | 'paymaya' | 'card' | 'otc'
  paymentProvider: string
  externalPaymentId: string
  
  // Status
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paidAt?: Date
  
  // Subscription Details
  tierPurchased: 'basic' | 'standard' | 'premium' | 'pro'
  hasVideoAddon: boolean
  
  createdAt: Date
  updatedAt: Date
}

// Zod schemas for validation
import { z } from 'zod'

export const EventCreateSchema = z.object({
  name: z.string().min(3, 'Event name too short').max(100, 'Event name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  eventType: z.enum(['wedding', 'birthday', 'corporate', 'graduation', 'anniversary', 'debut', 'other']),
  eventDate: z.string().optional(), // Will be converted to Date
  location: z.string().max(200, 'Location too long').optional(),
  subscriptionTier: z.enum(['free', 'basic', 'standard', 'premium', 'pro']).default('free'),
  hasVideoAddon: z.boolean().default(false),
  requiresModeration: z.boolean().default(false),
  customMessage: z.string().max(300).optional()
})

export const PhotoUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  contributorName: z.string().min(1, 'Name required').max(50, 'Name too long'),
  contributorEmail: z.string().email('Invalid email').optional(),
  caption: z.string().max(200, 'Caption too long').optional(),
  fileSize: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid image type')
})

export const VideoUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  contributorName: z.string().min(1, 'Name required').max(50, 'Name too long'),
  contributorEmail: z.string().email('Invalid email').optional(),
  message: z.string().max(200, 'Message too long').optional(),
  fileSize: z.number().max(50 * 1024 * 1024, 'Video too large (max 50MB)'),
  durationSeconds: z.number().max(20, 'Video too long (max 20 seconds)'),
  mimeType: z.string().regex(/^video\/(mp4|webm|mov)$/, 'Invalid video type')
})

export const PaymentCreateSchema = z.object({
  eventId: z.string().uuid(),
  tierPurchased: z.enum(['basic', 'standard', 'premium', 'pro']),
  hasVideoAddon: z.boolean().default(false),
  paymentMethod: z.enum(['gcash', 'paymaya', 'card', 'otc'])
})

export type EventCreateData = z.infer<typeof EventCreateSchema>
export type PhotoUploadData = z.infer<typeof PhotoUploadSchema>
export type VideoUploadData = z.infer<typeof VideoUploadSchema>
export type PaymentCreateData = z.infer<typeof PaymentCreateSchema>
```

## API Design

### API Routes Structure

```typescript
// app/api/[resource]/route.ts pattern

// Authentication (handled by Supabase Auth)
// Built-in endpoints:
// POST /auth/v1/signup
// POST /auth/v1/signin
// POST /auth/v1/signout
// POST /auth/v1/recover

// User Management
GET    /api/user/profile          // Get current user profile
PUT    /api/user/profile          // Update profile
DELETE /api/user/profile          // Delete account

// Event Management
POST   /api/events                // Create new event
GET    /api/events                // Get user's events
GET    /api/events/[id]           // Get specific event details
PUT    /api/events/[id]           // Update event
DELETE /api/events/[id]           // Delete event
POST   /api/events/[id]/upgrade   // Upgrade event tier

// Public Gallery Access
GET    /api/gallery/[slug]        // Get public gallery by slug
GET    /api/gallery/[slug]/photos // Get gallery photos
GET    /api/gallery/[slug]/videos // Get gallery videos
GET    /api/gallery/[slug]/stats  // Get gallery statistics

// Media Upload
POST   /api/upload/photo          // Upload photo to event
POST   /api/upload/video          // Upload video to event
POST   /api/upload/presigned      // Get presigned URL for direct upload
DELETE /api/upload/[id]           // Delete uploaded media (host only)

// Content Moderation
PUT    /api/moderate/photo/[id]   // Approve/reject photo
PUT    /api/moderate/video/[id]   // Approve/reject video
GET    /api/moderate/[eventId]    // Get pending items for moderation

// Payment Processing
POST   /api/payments/create       // Create payment intent
POST   /api/payments/confirm      // Confirm payment
GET    /api/payments/status/[id]  // Get payment status
POST   /api/webhooks/paymongo     // PayMongo webhooks

// Analytics & Tracking
POST   /api/analytics/track       // Track user events
GET    /api/analytics/event/[id]  // Get event analytics (host only)

// QR Code Generation
GET    /api/qr/[eventId]          // Generate QR code for event
GET    /api/qr/[eventId]/download // Download QR code as image

// Administrative
GET    /api/admin/events          // Admin: Get all events
GET    /api/admin/users           // Admin: Get all users
POST   /api/admin/cleanup         // Admin: Clean expired data
```

### API Response Format

```typescript
// Successful response
interface ApiResponse<T = any> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

// Error response
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
    field?: string // For validation errors
  }
}

// Example successful response
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Maria's Wedding",
    "gallerySlug": "marias-wedding-2024"
  }
}

// Example error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Event name is required",
    "field": "name"
  }
}

// Pagination example
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

## Security Architecture

### Authentication Flow
```
Guest Access â†' QR Code Scan â†' Anonymous Contribution â†' Optional Account Creation
     â†"
Host Registration â†' Email/Password or Magic Link â†' JWT Token â†' Protected Dashboard
```

### Security Layers
1. **Transport Security**: HTTPS only, secure headers, HSTS enabled
2. **Authentication**: Supabase Auth with JWT tokens, magic link support
3. **Authorization**: Row Level Security (RLS) policies in PostgreSQL
4. **Input Validation**: Zod schemas for all API inputs
5. **File Upload Security**: Virus scanning, file type validation, size limits
6. **Rate Limiting**: API route protection per IP and user
7. **Content Moderation**: AI-powered inappropriate content detection
8. **CORS**: Configured for production domains only
9. **Data Privacy**: Philippines Data Privacy Act compliance

### Specific Security Measures

```typescript
// File upload validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_VIDEO_DURATION = 20 // seconds

// Rate limiting configuration
const RATE_LIMITS = {
  photo_upload: '10 per 10 minutes',
  video_upload: '5 per 10 minutes',
  event_creation: '5 per hour',
  api_general: '100 per 10 minutes'
}

// Content moderation rules
const MODERATION_RULES = {
  auto_reject_explicit: true,
  auto_reject_violence: true,
  flag_for_review_threshold: 0.7,
  require_manual_review_for_videos: true
}
```

## Performance Strategy

### Optimization Techniques
- **React Server Components** for initial page loads and SEO
- **Progressive Web App (PWA)** features with service worker caching
- **Image optimization**: Next.js Image component, WebP format, responsive sizing
- **Video compression**: Client-side compression with ffmpeg.wasm before upload
- **Real-time optimization**: Efficient Supabase subscriptions with connection pooling
- **Database optimization**: Proper indexing, query optimization, connection pooling
- **Edge caching**: Vercel Edge Runtime with global CDN
- **Lazy loading**: Images and videos load on demand
- **Bundle optimization**: Code splitting, tree shaking, dynamic imports
- **Mobile-first design**: Optimized for slower mobile connections

### Performance Targets
- **First Contentful Paint**: < 1.5s (3G connection)
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **QR Scan to Camera**: < 3 seconds
- **Photo Upload Time**: < 10 seconds (including compression)
- **Gallery Load Time**: < 2 seconds
- **Real-time Update Latency**: < 1 second

### Caching Strategy
```typescript
// Browser caching
const CACHE_STRATEGIES = {
  static_assets: '1 year',
  api_responses: '5 minutes',
  event_galleries: '10 minutes',
  user_profiles: '1 hour',
  photos_thumbnails: '7 days',
  qr_codes: '24 hours'
}

// Service Worker caching
const PWA_CACHE_RULES = {
  precache: ['/', '/gallery/[slug]', '/contribute'],
  runtime: {
    photos: 'CacheFirst',
    api: 'NetworkFirst',
    pages: 'StaleWhileRevalidate'
  }
}
```

## Third-Party Integrations

### Payment Processing (PayMongo)
- **GCash Integration**: Direct GCash payments via PayMongo API
- **PayMaya Integration**: Maya wallet payments
- **Credit/Debit Cards**: Visa, Mastercard processing
- **Over-the-counter**: 7-Eleven, SM Bills Payment integration
- **Webhook handling**: Payment status updates and subscription management

### Email Service (Resend.com)
- **Transactional emails**: Welcome, payment confirmations, gallery sharing
- **Event notifications**: Gallery ready, new contributions
- **Marketing emails**: Feature announcements, tips for better events

### Analytics & Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **PostHog (Optional)**: User behavior analytics, feature flags
- **Custom analytics**: Event engagement tracking, conversion funnels
- **Error tracking**: Sentry integration for production error monitoring
- **Uptime monitoring**: UptimeRobot or similar service

### Content Moderation
- **AI Content Screening**: AWS Rekognition or Google Cloud Vision API
- **Manual review workflow**: Admin dashboard for flagged content
- **Community reporting**: User flagging system for inappropriate content

### File Storage & Processing
- **Supabase Storage**: Primary file storage with CDN
- **Image optimization**: Server-side processing with sharp
- **Video processing**: Client-side compression, server-side thumbnail generation
- **Backup storage**: AWS S3 for critical data backup

## Environment Variables

```bash
# .env.local (Development)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=InstaMoments
NEXT_PUBLIC_APP_VERSION=1.0.0

# PayMongo (Philippines Payments)
PAYMONGO_SECRET_KEY=sk_test_[...]
PAYMONGO_PUBLIC_KEY=pk_test_[...]
PAYMONGO_WEBHOOK_SECRET=whsec_[...]

# Email (Resend)
RESEND_API_KEY=re_[...]
RESEND_FROM_EMAIL=noreply@instantmoments.ph

# Analytics (Optional)
POSTHOG_KEY=[...]
POSTHOG_HOST=https://app.posthog.com

# Content Moderation
AWS_ACCESS_KEY_ID=[...]
AWS_SECRET_ACCESS_KEY=[...]
AWS_REGION=ap-southeast-1

# Security
RATE_LIMIT_SECRET=[random-string]
ENCRYPTION_SECRET=[random-string]
JWT_SECRET=[random-string]

# Feature Flags
FEATURE_VIDEO_ENABLED=true
FEATURE_MODERATION_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true

# .env.production (Vercel Environment Variables)
# Same structure but with production values
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project-id].supabase.co
NEXT_PUBLIC_APP_URL=https://instantmoments.ph
PAYMONGO_SECRET_KEY=sk_live_[...]
# ... etc
```

## Infrastructure Scaling Plan

### Performance Monitoring
- **Real User Monitoring (RUM)**: Track actual user performance metrics
- **Synthetic Monitoring**: Automated testing of critical user journeys
- **Database Performance**: Query optimization and connection pool monitoring
- **Storage Costs**: Track file storage growth and implement cleanup policies

### Scaling Triggers
- **Database**: Scale when connection pool reaches 80% utilization
- **Storage**: Implement tiered storage when costs exceed 30% of revenue
- **API**: Add rate limiting when requests exceed 1000/minute
- **CDN**: Enable additional edge locations when international usage grows

### Cost Optimization
- **Automatic Cleanup**: Delete expired events and associated media
- **Storage Optimization**: Convert old photos to more compressed formats
- **Database Archival**: Move old events to cheaper storage solutions
- **Usage-based Scaling**: Dynamic resource allocation based on demand patterns