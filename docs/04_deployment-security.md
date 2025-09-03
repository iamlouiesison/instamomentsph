# Deployment & Security Configuration

## Vercel Deployment

### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel@latest

# Initialize InstaMoments project
vercel

# Link to existing project
vercel link
```

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev --turbo",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1", "hkg1"], // Singapore & Hong Kong for Philippine users
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    },
    "app/api/upload/**/*": {
      "maxDuration": 60
    },
    "app/api/webhooks/**/*": {
      "maxDuration": 10
    }
  },
  "crons": [
    {
      "path": "/api/admin/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Environment Variables (Vercel Dashboard)
```bash
# Production Variables - InstaMoments
NEXT_PUBLIC_SUPABASE_URL=https://[instantmoments-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Application
NEXT_PUBLIC_APP_URL=https://instantmoments.ph
NEXT_PUBLIC_APP_NAME=InstaMoments
NEXT_PUBLIC_APP_VERSION=1.0.0

# PayMongo (Philippine Payments)
PAYMONGO_SECRET_KEY=sk_live_[production-key]
PAYMONGO_PUBLIC_KEY=pk_live_[production-key]
PAYMONGO_WEBHOOK_SECRET=whsec_[webhook-secret]

# Email Service (Resend)
RESEND_API_KEY=re_[production-key]
RESEND_FROM_EMAIL=noreply@instantmoments.ph

# Content Moderation (AWS Rekognition)
AWS_ACCESS_KEY_ID=[production-key]
AWS_SECRET_ACCESS_KEY=[production-secret]
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=instantmoments-moderation

# Security & Rate Limiting
RATE_LIMIT_SECRET=[random-256-bit-string]
ENCRYPTION_SECRET=[random-256-bit-string]
JWT_SECRET=[random-256-bit-string]

# Feature Flags
FEATURE_VIDEO_ENABLED=true
FEATURE_MODERATION_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true
FEATURE_PAYMENT_ENABLED=true

# Analytics (Optional)
POSTHOG_KEY=[production-key]
POSTHOG_HOST=https://app.posthog.com
```

### Domain Configuration
```markdown
1. Add custom domain in Vercel dashboard: instantmoments.ph
2. Configure DNS at domain registrar:
   - A Record: @ → 76.76.21.21
   - CNAME: www → cname.vercel-dns.com
   - CNAME: api → cname.vercel-dns.com
3. SSL certificate auto-provisioned by Vercel
4. Configure redirects:
   - www.instantmoments.ph → instantmoments.ph (301 redirect)
   - All HTTP traffic → HTTPS (automatic)
```

### PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.instantmoments\.ph\/gallery\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'gallery-api',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    }
  ],
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // Next.js config
})
```

## Supabase Configuration

### Project Setup
```markdown
1. Create new Supabase project: "instantmoments-production"
2. Save connection string and keys securely
3. Configure authentication providers:
   - Email/Password ✓ (enabled by default)
   - Google OAuth ✓ (for quick signup)
   - Facebook OAuth ✓ (popular in Philippines)
4. Run database migrations from schema in 02_technical-architecture.md
5. Configure Row Level Security (RLS) policies
6. Set up storage buckets: photos, videos, qr-codes, thumbnails
7. Configure email templates for Filipino context
8. Enable real-time subscriptions for gallery updates
```

### Database Security (RLS Policies)
```sql
-- Enable RLS on all tables (InstaMoments specific)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only manage their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: Host management with public gallery access
CREATE POLICY "Event hosts can manage their events" ON events
  FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Public events viewable by all" ON events
  FOR SELECT USING (is_public = TRUE OR auth.uid() = host_id);

-- Photos: Public viewing for active events, controlled upload
CREATE POLICY "Event photos viewable for public events" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND (events.is_public = TRUE OR events.host_id = auth.uid())
      AND events.status = 'active'
    )
  );

CREATE POLICY "Contributors can insert photos to active events" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.status = 'active'
      AND NOW() < events.expires_at
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

-- Videos: Similar to photos but with additional processing status
CREATE POLICY "Event videos viewable for public events" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND (events.is_public = TRUE OR events.host_id = auth.uid())
      AND events.status = 'active'
      AND videos.processing_status = 'completed'
    )
  );

CREATE POLICY "Contributors can insert videos to active events" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.status = 'active'
      AND events.has_video_addon = TRUE
      AND NOW() < events.expires_at
    )
  );

-- Event Contributors: Tracking and permissions
CREATE POLICY "Contributors viewable for public events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND (events.is_public = TRUE OR events.host_id = auth.uid())
    )
  );

CREATE POLICY "Contributors can insert own contribution record" ON event_contributors
  FOR INSERT WITH CHECK (
    contributor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.uid() IS NULL -- Allow anonymous contributions
  );

-- Payments: Strict user isolation
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics: Host access only
CREATE POLICY "Analytics viewable by event hosts or admin" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = analytics_events.event_id 
      AND events.host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );
```

### Supabase Storage Configuration
```sql
-- Storage buckets for InstaMoments
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('photos', 'photos', true),
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true),
  ('qr-codes', 'qr-codes', true);

-- Storage policies
CREATE POLICY "Event photos uploadable by anyone" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Event photos viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Event videos uploadable by anyone" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Event videos viewable by everyone" ON storage.objects  
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Thumbnails viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "QR codes viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-codes');

-- Host can delete their event media
CREATE POLICY "Event hosts can delete media" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('photos', 'videos', 'thumbnails', 'qr-codes')
    AND EXISTS (
      SELECT 1 FROM events e, photos p 
      WHERE p.file_url LIKE '%' || name || '%'
      AND e.id = p.event_id 
      AND e.host_id = auth.uid()
    )
  );
```

### Supabase Client Configuration
```typescript
// lib/supabase/client.ts - Browser Client
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts - Server Client  
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// lib/supabase/admin.ts - Admin Client (Server-side only)
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## Security Headers

### Next.js Security Configuration
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), payment=(self "https://api.paymongo.com")'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/gallery/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60'
          }
        ]
      }
    ]
  },
}
```

### Content Security Policy (Production)
```typescript
// CSP for InstaMoments PWA
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' 
    https://*.supabase.co 
    https://js.stripe.com 
    https://checkout.stripe.com
    https://api.paymongo.com;
  style-src 'self' 'unsafe-inline' 
    https://fonts.googleapis.com;
  img-src 'self' blob: data: https: 
    https://*.supabase.co 
    https://lh3.googleusercontent.com
    https://platform-lookaside.fbsbx.com;
  font-src 'self' 
    https://fonts.gstatic.com;
  connect-src 'self' 
    https://*.supabase.co 
    wss://*.supabase.co
    https://api.paymongo.com
    https://hooks.stripe.com
    https://api.posthog.com;
  media-src 'self' blob: 
    https://*.supabase.co;
  worker-src 'self' blob:;
  child-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' 
    https://checkout.stripe.com
    https://api.paymongo.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

// Apply CSP in production
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  })
}
```

## Authentication & Authorization

### Authentication Flow Implementation
```typescript
// middleware.ts - InstaMoments Auth Middleware
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    if (profile?.user_type !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Gallery access logging for analytics
  if (request.nextUrl.pathname.startsWith('/gallery/')) {
    const gallerySlug = request.nextUrl.pathname.split('/')[2]
    
    // Track gallery access (fire and forget)
    fetch(`${request.nextUrl.origin}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'gallery_view',
        gallery_slug: gallerySlug,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.ip
      })
    }).catch(() => {}) // Silent fail for analytics
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### API Route Protection
```typescript
// lib/auth.ts - Authentication helpers
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }
  
  return { user, supabase }
}

export async function requireEventOwnership(eventId: string, userId: string) {
  const supabase = await createClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', eventId)
    .single()
    
  if (error || !event || event.host_id !== userId) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 }
    )
  }
  
  return event
}

// Usage in API routes
// app/api/events/[id]/route.ts
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  
  const { user, supabase } = authResult
  const { id } = await context.params
  
  const eventCheck = await requireEventOwnership(id, user.id)
  if (eventCheck instanceof NextResponse) return eventCheck
  
  // Proceed with authorized operation
  // ...
}
```

## Rate Limiting

### API Rate Limiting with Upstash Redis
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Different rate limits for different operations
export const ratelimits = {
  // Photo upload: 10 uploads per 10 minutes per IP
  photoUpload: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    analytics: true,
    prefix: 'ratelimit:photo'
  }),
  
  // Video upload: 5 videos per 10 minutes per IP  
  videoUpload: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'ratelimit:video'
  }),
  
  // Event creation: 5 events per hour per user
  eventCreation: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'ratelimit:event'
  }),
  
  // Gallery access: 100 views per 10 minutes per IP
  galleryAccess: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '10 m'),
    analytics: true,
    prefix: 'ratelimit:gallery'
  }),
  
  // Payment processing: 3 attempts per hour per user
  payment: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'ratelimit:payment'
  })
}

export async function checkRateLimit(
  type: keyof typeof ratelimits,
  identifier: string
) {
  const { success, limit, remaining, reset } = await ratelimits[type].limit(identifier)
  
  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),  
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    }
  }
}

// Usage in API routes
// app/api/upload/photo/route.ts
export async function POST(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
  const rateLimit = await checkRateLimit('photoUpload', ip)
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'RATE_LIMIT_EXCEEDED', 
          message: 'Too many photo uploads. Please try again later.' 
        } 
      },
      { 
        status: 429,
        headers: rateLimit.headers
      }
    )
  }
  
  // Process upload...
}
```

## Input Validation & Sanitization

### Zod Validation Schemas (InstaMoments Specific)
```typescript
// lib/validations/event.ts
import { z } from 'zod'

export const EventCreateSchema = z.object({
  name: z.string()
    .min(3, 'Event name too short')
    .max(100, 'Event name too long')
    .trim()
    .regex(/^[a-zA-Z0-9\s\-'.,&!()]+$/, 'Invalid characters in event name'),
  
  description: z.string()
    .max(500, 'Description too long')
    .trim()
    .optional(),
    
  eventType: z.enum([
    'wedding', 'birthday', 'corporate', 'graduation', 
    'anniversary', 'debut', 'reunion', 'other'
  ]),
  
  eventDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
    
  location: z.string()
    .max(200, 'Location too long')
    .trim()
    .optional(),
    
  subscriptionTier: z.enum(['free', 'basic', 'standard', 'premium', 'pro'])
    .default('free'),
    
  hasVideoAddon: z.boolean().default(false),
  
  requiresModeration: z.boolean().default(false),
  
  customMessage: z.string()
    .max(300, 'Custom message too long')
    .trim()
    .optional()
})

// lib/validations/upload.ts
export const PhotoUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  
  contributorName: z.string()
    .min(1, 'Name required')
    .max(50, 'Name too long')
    .trim()
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Invalid characters in name'),
    
  contributorEmail: z.string()
    .email('Invalid email')
    .max(100, 'Email too long')
    .toLowerCase()
    .trim()
    .optional(),
    
  caption: z.string()
    .max(200, 'Caption too long')
    .trim()
    .optional(),
    
  fileSize: z.number()
    .max(10 * 1024 * 1024, 'Image too large (max 10MB)'),
    
  mimeType: z.string()
    .regex(/^image\/(jpeg|jpg|png|webp|heic)$/, 'Invalid image type'),
    
  exifData: z.record(z.any()).optional()
})

export const VideoUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  
  contributorName: z.string()
    .min(1, 'Name required')
    .max(50, 'Name too long')
    .trim()
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Invalid characters in name'),
    
  contributorEmail: z.string()
    .email('Invalid email')
    .max(100, 'Email too long')
    .toLowerCase()
    .trim()
    .optional(),
    
  message: z.string()
    .max(200, 'Message too long')
    .trim()
    .optional(),
    
  fileSize: z.number()
    .max(50 * 1024 * 1024, 'Video too large (max 50MB)'),
    
  durationSeconds: z.number()
    .max(20, 'Video too long (max 20 seconds)')
    .min(1, 'Video too short'),
    
  mimeType: z.string()
    .regex(/^video\/(mp4|webm|mov|avi)$/, 'Invalid video type')
})

// lib/validations/payment.ts
export const PaymentCreateSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  
  tierPurchased: z.enum(['basic', 'standard', 'premium', 'pro']),
  
  hasVideoAddon: z.boolean().default(false),
  
  paymentMethod: z.enum(['gcash', 'paymaya', 'card', 'bank', 'otc']),
  
  amount: z.number()
    .min(69900, 'Invalid amount') // ₱699 in centavos
    .max(559900, 'Invalid amount') // ₱5,599 in centavos
})
```

### Content Sanitization & Security
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'
import { remark } from 'remark'
import strip from 'strip-markdown'

// Sanitize HTML content (captions, messages)
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML allowed in user content
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

// Sanitize and normalize text content
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-'.,!?()&]/g, '') // Remove special characters
    .substring(0, 500) // Hard limit
}

// Sanitize filename for storage
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 100)
}

// Validate and sanitize image EXIF data
export function sanitizeExifData(exifData: any): Record<string, any> {
  const allowedFields = [
    'make', 'model', 'dateTime', 'orientation', 
    'xResolution', 'yResolution', 'software'
  ]
  
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(exifData || {})) {
    if (allowedFields.includes(key) && typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    }
  }
  
  return sanitized
}
```

### API Route Validation Pattern
```typescript
// lib/api-validation.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function validateRequest<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  try {
    const body = await request.json()
    const validated = schema.parse(body)
    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.flatten().fieldErrors
          }
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Unable to process request'
        }
      },
      { status: 400 }
    )
  }
}

// Usage in API routes
export async function POST(request: NextRequest) {
  const validationResult = await validateRequest(request, EventCreateSchema)
  
  if (validationResult instanceof NextResponse) {
    return validationResult // Validation error response
  }
  
  const eventData = validationResult // Validated data
  // Proceed with business logic...
}
```

## Monitoring & Error Tracking

### Vercel Analytics Integration
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Error Tracking with Sentry (Optional)
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Error filtering for InstaMoments
  beforeSend(event) {
    // Filter out irrelevant errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      
      // Skip camera permission errors (user declined)
      if (error?.value?.includes('NotAllowedError')) {
        return null
      }
      
      // Skip network errors during poor connectivity
      if (error?.value?.includes('NetworkError')) {
        return null
      }
    }
    
    return event
  },
  
  // Tag Filipino users for better analytics
  beforeSendTransaction(event) {
    if (typeof window !== 'undefined') {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (timezone.includes('Manila') || timezone.includes('Asia')) {
        event.tags = { ...event.tags, region: 'philippines' }
      }
    }
    return event
  }
})
```

### Custom Error Boundary for InstaMoments
```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to monitoring service
    console.error('InstaMoments Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="mx-auto max-w-md mt-8">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              Don't worry, your photos are safe. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => this.setState({ hasError: false })}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// app/error.tsx - Next.js Error UI
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Event Error</h2>
          <p className="text-muted-foreground mb-4">
            There was a problem loading this event. Your memories are still safe.
          </p>
          <div className="space-y-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Performance Monitoring
```typescript
// lib/performance.ts
export function trackPerformance(metricName: string, value: number, tags?: Record<string, string>) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Custom performance tracking for InstaMoments
    const metric = {
      name: metricName,
      value,
      timestamp: Date.now(),
      tags: {
        ...tags,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      }
    }
    
    // Send to analytics (fire and forget)
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }).catch(() => {}) // Silent fail
  }
}

// Usage throughout the app
export function trackUploadTime(startTime: number) {
  const uploadTime = Date.now() - startTime
  trackPerformance('photo_upload_duration', uploadTime, { type: 'photo' })
}

export function trackGalleryLoadTime(photoCount: number) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'gallery-load') {
        trackPerformance('gallery_load_duration', entry.duration, { 
          photoCount: photoCount.toString() 
        })
      }
    }
  })
  
  observer.observe({ entryTypes: ['measure'] })
}
```

## PayMongo Integration Security

### Secure Payment Processing
```typescript
// lib/paymongo.ts
import crypto from 'crypto'

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!
const PAYMONGO_PUBLIC = process.env.PAYMONGO_PUBLIC_KEY!
const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET!

export async function createPaymentIntent(data: {
  amount: number // In centavos
  eventId: string
  tierPurchased: string
  hasVideoAddon: boolean
  paymentMethod: string
}) {
  const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: data.amount,
          payment_method_allowed: [data.paymentMethod],
          payment_method_options: {
            card: { request_three_d_secure: 'any' },
            gcash: { success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success` },
            paymaya: { success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success` }
          },
          currency: 'PHP',
          description: `InstaMoments ${data.tierPurchased} package for event`,
          metadata: {
            event_id: data.eventId,
            tier: data.tierPurchased,
            has_video_addon: data.hasVideoAddon.toString(),
            app: 'instantmoments'
          }
        }
      }
    })
  })
  
  if (!response.ok) {
    throw new Error('Payment intent creation failed')
  }
  
  return response.json()
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// app/api/webhooks/paymongo/route.ts
export async function POST(request: NextRequest) {
  const rawPayload = await request.text()
  const signature = request.headers.get('paymongo-signature')
  
  if (!signature || !verifyWebhookSignature(rawPayload, signature)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }
  
  const payload = JSON.parse(rawPayload)
  
  // Process webhook securely
  switch (payload.data.type) {
    case 'payment.paid':
      await handlePaymentSuccess(payload.data.attributes)
      break
    case 'payment.failed':
      await handlePaymentFailure(payload.data.attributes)  
      break
  }
  
  return NextResponse.json({ received: true })
}
```

## Deployment Checklist

### Pre-Deployment Verification
- [ ] All environment variables configured in Vercel dashboard
- [ ] Database schema deployed and RLS policies enabled in Supabase
- [ ] Storage buckets created with proper policies in Supabase
- [ ] PayMongo webhooks configured with production endpoints
- [ ] Domain DNS properly configured (instantmoments.ph)
- [ ] SSL certificate auto-provisioned and active
- [ ] Security headers configured and tested
- [ ] Rate limiting implemented and tested
- [ ] Content moderation system configured
- [ ] Email templates configured for Filipino context
- [ ] PWA manifest and service worker configured
- [ ] Error tracking and monitoring set up

### Post-Deployment Testing
- [ ] QR code generation and scanning flow works on mobile devices
- [ ] Photo upload from mobile camera functions correctly
- [ ] Video recording and playback works across browsers
- [ ] Real-time gallery updates function properly
- [ ] Payment processing works with GCash, PayMaya, and cards
- [ ] Email notifications send correctly
- [ ] Gallery access permissions work correctly
- [ ] Admin dashboard functions properly
- [ ] Performance metrics meet targets (< 3s load time)
- [ ] Security headers verified (securityheaders.com)
- [ ] WCAG accessibility compliance checked
- [ ] Mobile responsiveness tested on various Philippine devices
- [ ] Test with slow 3G connections (common in Philippines)

### Philippine Market Specific Testing
- [ ] GCash payment integration tested end-to-end
- [ ] PayMaya payment integration tested end-to-end  
- [ ] Over-the-counter payment options configured
- [ ] Filipino event types and templates working
- [ ] Time zone handling (Asia/Manila) correct
- [ ] Currency formatting (₱ PHP) displays correctly
- [ ] Email templates in appropriate tone for Filipino market
- [ ] Mobile data usage optimized for prepaid plans
- [ ] Works on popular Philippine mobile browsers

### Monitoring & Alerting Setup
- [ ] Uptime monitoring configured (99.9% target)
- [ ] Error rate alerting set up (< 1% target)
- [ ] Payment failure notifications configured  
- [ ] Storage usage alerts configured
- [ ] Rate limiting alerts configured
- [ ] Database performance monitoring active
- [ ] Real-time gallery latency monitoring
- [ ] Mobile performance monitoring active

## Backup & Recovery

### Database Backup Strategy
```bash
# Supabase Pro Plan Features
# - Automated daily backups retained for 7 days
# - Point-in-time recovery (PITR) up to 7 days
# - Cross-region backup replication

# Manual backup for critical events
pg_dump $SUPABASE_DB_URL > "instantmoments-backup-$(date +%Y%m%d).sql"

# Backup critical data before major updates
supabase db dump --db-url $SUPABASE_DB_URL --data-only > data-backup.sql
```

### File Storage Backup
```typescript
// scripts/backup-storage.ts - Backup critical files
import { supabaseAdmin } from '@/lib/supabase/admin'
import fs from 'fs'
import path from 'path'

async function backupCriticalFiles() {
  const backupDir = path.join(process.cwd(), 'backups', new Date().toISOString().split('T')[0])
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  // Backup QR codes (critical for event access)
  const { data: qrFiles } = await supabaseAdmin.storage
    .from('qr-codes')
    .list('', { limit: 1000 })
    
  for (const file of qrFiles || []) {
    const { data } = await supabaseAdmin.storage
      .from('qr-codes')
      .download(file.name)
      
    if (data) {
      const buffer = await data.arrayBuffer()
      fs.writeFileSync(
        path.join(backupDir, `qr-${file.name}`),
        Buffer.from(buffer)
      )
    }
  }
  
  console.log(`Backup completed: ${backupDir}`)
}

// Run backup
if (require.main === module) {
  backupCriticalFiles().catch(console.error)
}
```

### Disaster Recovery Procedures

#### Application Recovery (Code Issues)
```markdown
1. **Identify Issue**: Check Vercel deployment logs and error monitoring
2. **Quick Rollback**: Use Vercel dashboard to rollback to previous deployment
3. **Database Check**: Verify database integrity and recent backups
4. **Communication**: Update status page and notify active event hosts
5. **Post-Mortem**: Document issue and implement preventive measures
```

#### Database Recovery (Data Issues)  
```markdown
1. **Stop Write Operations**: Set application to read-only mode if possible
2. **Assess Damage**: Identify affected tables and data scope
3. **Point-in-Time Recovery**: Use Supabase PITR to restore to known good state
4. **Data Verification**: Verify critical data integrity (events, payments)
5. **Resume Operations**: Gradually restore write operations
6. **Notify Users**: Inform affected event hosts of any data loss
```

#### Complete System Failure Recovery
```markdown
1. **New Vercel Project**: Deploy from GitHub repository
2. **New Supabase Project**: Restore from latest backup
3. **Environment Variables**: Reconfigure all production variables
4. **Domain Setup**: Point DNS to new deployment
5. **Payment Integration**: Reconfigure PayMongo webhooks
6. **Data Migration**: Import backed up files and data
7. **Testing**: Verify all critical functionality
8. **Communication**: Notify users of service restoration
```

### Recovery Time Objectives (RTO)
- **Application Issues**: < 15 minutes (Vercel rollback)
- **Database Issues**: < 1 hour (PITR recovery)
- **Complete Failure**: < 4 hours (full system rebuild)
- **File Storage Issues**: < 2 hours (restore from backups)

### Recovery Point Objectives (RPO)
- **Transaction Data**: < 5 minutes (real-time replication)
- **File Uploads**: < 1 hour (regular backup intervals)
- **User Data**: < 1 hour (database backup frequency)
- **Configuration**: < 24 hours (daily backup schedule)

### Business Continuity for Filipino Events
```markdown
During peak Filipino event season (December-February):

1. **Enhanced Monitoring**: 24/7 monitoring during wedding season
2. **Faster Response**: < 30 minute response time for critical issues
3. **Backup Support**: Manual event creation support if needed
4. **Communication**: Direct phone support for event hosts
5. **Extended Backups**: Daily backups during peak season
6. **Capacity Planning**: Scale infrastructure proactively
```

This comprehensive deployment and security configuration ensures InstaMoments operates reliably and securely for Filipino celebrations while maintaining optimal performance and user experience.