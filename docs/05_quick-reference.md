# InstaMoments Quick Reference Guide

## Project Overview

**InstaMoments** - A PWA for Filipino event photo and video sharing through QR code scanning. Enables real-time collaborative galleries with 20-second video greetings for weddings, birthdays, and family celebrations.

**Tech Stack**: Next.js 15 + React 18 + TypeScript + Tailwind CSS 4.1.12 + shadcn/ui + Supabase + Vercel + PWA

## Project Setup Commands

```bash
# Create InstaMoments Next.js 15 project
npx create-next-app@latest instantmoments --typescript --tailwind --app --src-dir

# Install InstaMoments-specific dependencies
npm install @supabase/ssr @supabase/supabase-js
npm install @tanstack/react-query @hookform/resolvers react-hook-form
npm install zod date-fns clsx tailwind-merge class-variance-authority
npm install qrcode html5-qrcode browser-image-compression
npm install zustand lucide-react
npm install next-pwa workbox-webpack-plugin
npm install -D @types/node @types/qrcode

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button card input form toast avatar badge table tabs alert progress select dialog dropdown-menu

# PWA setup
npm install next-pwa@latest

# Development commands
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
npm run db:types     # Generate Supabase types

# Deployment
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

## Environment Variables

```bash
# .env.local (Development)
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

# Email Service (Resend)
RESEND_API_KEY=re_[...]
RESEND_FROM_EMAIL=noreply@instantmoments.ph

# Content Moderation (AWS)
AWS_ACCESS_KEY_ID=[...]
AWS_SECRET_ACCESS_KEY=[...]
AWS_REGION=ap-southeast-1

# Feature Flags
FEATURE_VIDEO_ENABLED=true
FEATURE_MODERATION_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true

# Security
RATE_LIMIT_SECRET=[random-string]
ENCRYPTION_SECRET=[random-string]
```

## Project Structure

```
src/
├── app/                    # Next.js 15 app router
│   ├── (auth)/            # Auth group route
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/       # Dashboard group route
│   │   ├── dashboard/
│   │   └── settings/
│   ├── gallery/           # Public galleries
│   │   └── [slug]/page.tsx
│   ├── api/               # API routes
│   │   ├── events/
│   │   ├── upload/
│   │   ├── payments/
│   │   └── webhooks/
│   ├── layout.tsx         # Root layout with PWA
│   ├── page.tsx           # Landing page
│   ├── loading.tsx        # Global loading UI
│   └── error.tsx          # Global error UI
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── navigation.tsx
│   ├── features/          # Feature components
│   │   ├── qr-code/
│   │   ├── gallery/
│   │   ├── upload/
│   │   └── payments/
│   └── providers/         # Context providers
├── lib/
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── utils/             # Utility functions
│   ├── validations/       # Zod schemas
│   └── constants/         # App constants
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
│   └── supabase.ts        # Generated types
├── styles/               # Global styles
│   └── globals.css
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/           # App icons
└── middleware.ts         # Auth middleware
```

## Essential Code Snippets

### Supabase Client Setup

```typescript
// lib/supabase/client.ts - Browser Client
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```typescript
// lib/supabase/server.ts - Server Client
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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
```

### API Route Template

```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EventCreateSchema } from '@/lib/validations/event'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Validate input
    const body = await request.json()
    const validatedData = EventCreateSchema.parse(body)

    // Business logic
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        host_id: user.id,
        gallery_slug: generateSlug(validatedData.name),
        qr_code_url: generateQRCode(gallerySlug)
      })
      .select()
      .single()

    if (eventError) throw eventError

    return NextResponse.json({ success: true, data: event })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten() } },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    )
  }
}
```

### React Query Hook for Events

```typescript
// hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          photos:photos(count),
          videos:videos(count)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventData) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })
      
      if (!response.ok) throw new Error('Failed to create event')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}
```

### QR Code Generation Component

```typescript
// components/features/qr-code/QRCodeDisplay.tsx
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Printer } from 'lucide-react'

interface QRCodeDisplayProps {
  eventId: string
  eventName: string
  size?: 'small' | 'large'
}

export function QRCodeDisplay({ eventId, eventName, size = 'large' }: QRCodeDisplayProps) {
  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${eventId}`
  
  return (
    <Card className="qr-scan-area text-center">
      <CardContent className="p-6">
        <div className={cn(
          "mx-auto bg-white p-4 rounded-lg shadow-sm",
          size === 'large' ? 'w-48 h-48' : 'w-32 h-32'
        )}>
          <QRCodeSVG 
            value={qrValue}
            size={size === 'large' ? 192 : 128}
            level="M"
            includeMargin
          />
        </div>
        <h3 className="font-semibold mt-4">{eventName}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Guests scan this to add photos instantly
        </p>
        <div className="flex gap-2 mt-4 justify-center">
          <Button variant="outline" size="sm" onClick={() => downloadQR(qrValue, eventName)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => printQR()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Photo Upload Component

```typescript
// components/features/upload/PhotoUpload.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Upload } from 'lucide-react'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'

interface PhotoUploadProps {
  eventId: string
  onUploadComplete: () => void
}

export function PhotoUpload({ eventId, onUploadComplete }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [contributorName, setContributorName] = useState('')
  const [caption, setCaption] = useState('')
  
  const { mutate: uploadPhotos, isPending } = usePhotoUpload({
    onSuccess: onUploadComplete
  })

  const handleFileSelect = (selectedFiles: File[]) => {
    // Compress and validate files
    const validFiles = selectedFiles
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 5) // Max 5 photos at once
    
    setFiles(validFiles)
  }

  const handleUpload = () => {
    if (!contributorName.trim() || files.length === 0) return
    
    uploadPhotos({
      eventId,
      files,
      contributorName: contributorName.trim(),
      caption: caption.trim()
    })
  }

  return (
    <div className="space-y-4">
      <div className="qr-scan-area">
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-h4 mb-2">Add Your Photos</h3>
          <p className="text-body text-muted-foreground mb-4">
            Share your memories from this celebration
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="filipino-gradient">
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(Array.from(e.target.files || []))}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" size="lg" asChild>
              <label htmlFor="file-upload">
                <Upload className="w-5 h-5 mr-2" />
                Upload Photos
              </label>
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {files.map((file, index) => (
              <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="Your name (required)"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              maxLength={50}
            />
            <Textarea
              placeholder="Add a message (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              rows={2}
            />
            <Button 
              onClick={handleUpload} 
              disabled={!contributorName.trim() || isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? 'Uploading...' : `Upload ${files.length} Photo${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Philippine Payment Integration

```typescript
// lib/paymongo.ts
export async function createPaymentIntent(data: {
  amount: number // In centavos
  eventId: string
  paymentMethod: 'gcash' | 'paymaya' | 'card'
}) {
  const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY!).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: data.amount,
          payment_method_allowed: [data.paymentMethod],
          payment_method_options: {
            gcash: { 
              success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?event=${data.eventId}` 
            },
            paymaya: { 
              success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?event=${data.eventId}` 
            }
          },
          currency: 'PHP',
          description: `InstaMoments event package`,
          metadata: {
            event_id: data.eventId,
            app: 'instantmoments'
          }
        }
      }
    })
  })
  
  return response.json()
}
```

## Database Quick Queries

### Common Supabase Patterns

```sql
-- Get event with photos and videos count
SELECT 
  e.*,
  COUNT(DISTINCT p.id) as photo_count,
  COUNT(DISTINCT v.id) as video_count,
  COUNT(DISTINCT ec.id) as contributor_count
FROM events e
LEFT JOIN photos p ON e.id = p.event_id AND p.is_approved = true
LEFT JOIN videos v ON e.id = v.event_id AND v.is_approved = true
LEFT JOIN event_contributors ec ON e.id = ec.event_id
WHERE e.host_id = auth.uid()
GROUP BY e.id;

-- Get gallery photos for public viewing
SELECT 
  p.*,
  ec.contributor_name,
  e.name as event_name
FROM photos p
JOIN events e ON p.event_id = e.id
JOIN event_contributors ec ON p.event_id = ec.event_id AND p.contributor_email = ec.contributor_email
WHERE e.gallery_slug = $1 
  AND e.is_public = true 
  AND e.status = 'active'
  AND p.is_approved = true
ORDER BY p.uploaded_at DESC;

-- Insert new photo with contributor tracking
INSERT INTO photos (
  event_id, contributor_name, contributor_email,
  file_name, file_url, file_size, mime_type, caption
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- Update contributor stats
INSERT INTO event_contributors (event_id, contributor_name, contributor_email, photos_count)
VALUES ($1, $2, $3, 1)
ON CONFLICT (event_id, contributor_email) 
DO UPDATE SET 
  photos_count = event_contributors.photos_count + 1,
  last_contribution_at = NOW();
```

### TypeScript Database Types

```typescript
// types/database.ts
export interface Event {
  id: string
  name: string
  description?: string
  event_type: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'anniversary' | 'debut' | 'other'
  event_date?: string
  location?: string
  host_id: string
  gallery_slug: string
  subscription_tier: 'free' | 'basic' | 'standard' | 'premium' | 'pro'
  max_photos: number
  max_photos_per_user: number
  has_video_addon: boolean
  total_photos: number
  total_videos: number
  total_contributors: number
  status: 'active' | 'expired' | 'archived'
  created_at: string
  expires_at?: string
}

export interface Photo {
  id: string
  event_id: string
  contributor_name: string
  contributor_email?: string
  file_name: string
  file_url: string
  thumbnail_url?: string
  file_size: number
  caption?: string
  is_approved: boolean
  uploaded_at: string
}
```

## API Routes Quick Reference

```typescript
// Core API Endpoints
GET    /api/events                // Get user's events
POST   /api/events                // Create new event
GET    /api/events/[id]           // Get event details
PUT    /api/events/[id]           // Update event
DELETE /api/events/[id]           // Delete event

GET    /api/gallery/[slug]        // Get public gallery
GET    /api/gallery/[slug]/photos // Get gallery photos
GET    /api/gallery/[slug]/videos // Get gallery videos

POST   /api/upload/photo          // Upload photo
POST   /api/upload/video          // Upload video

POST   /api/payments/create       // Create PayMongo payment
POST   /api/webhooks/paymongo     // PayMongo webhooks

GET    /api/qr/[eventId]          // Generate QR code
```

## Form Validation Patterns

```typescript
// lib/validations/event.ts
import { z } from 'zod'

export const EventCreateSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().max(500).optional(),
  eventType: z.enum(['wedding', 'birthday', 'corporate', 'graduation', 'anniversary', 'debut', 'other']),
  eventDate: z.string().optional(),
  location: z.string().max(200).optional(),
  subscriptionTier: z.enum(['free', 'basic', 'standard', 'premium', 'pro']).default('free'),
  hasVideoAddon: z.boolean().default(false)
})

export const PhotoUploadSchema = z.object({
  eventId: z.string().uuid(),
  contributorName: z.string().min(1).max(50).trim(),
  contributorEmail: z.string().email().optional(),
  caption: z.string().max(200).optional(),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/)
})
```

## PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    }
  ],
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
})
```

```json
// public/manifest.json
{
  "name": "InstaMoments - Filipino Event Photos",
  "short_name": "InstaMoments",
  "description": "Instant event photo sharing for Filipino celebrations",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Create Event",
      "short_name": "Create",
      "description": "Create a new event",
      "url": "/create-event",
      "icons": [{ "src": "/icons/create-192x192.png", "sizes": "192x192" }]
    }
  ],
  "categories": ["photography", "social", "events"],
  "lang": "en-PH"
}
```

## Git Workflow

```bash
# Feature branch workflow for InstaMoments
git checkout -b feature/qr-code-generation
git add .
git commit -m "feat: add QR code generation for events"
git push origin feature/qr-code-generation

# Commit message conventions
feat: add QR code scanning functionality
fix: resolve photo upload compression issue
docs: update README with deployment steps
style: format gallery components
refactor: optimize Supabase queries
test: add tests for payment processing
chore: update dependencies

# Quick fixes
git add .
git commit -m "fix: resolve gallery real-time sync issue"
git push

# Release preparation
git checkout main
git merge develop
git tag -a v1.0.0 -m "Initial release: InstaMoments Filipino event platform"
git push origin main --tags
```

## Debugging Checklist

### Common Issues

1. **QR Code Scanning Not Working**
   - Check camera permissions in browser
   - Verify QR code URL format
   - Test on different devices/browsers
   - Clear browser cache and test

2. **Photo Upload Failures**
   - Check file size limits (10MB max)
   - Verify image compression is working
   - Check Supabase storage policies
   - Test network connection stability

3. **Real-time Gallery Updates Not Working**
   - Verify Supabase realtime subscription
   - Check RLS policies for photos table
   - Test WebSocket connection
   - Clear browser cache

4. **Payment Processing Issues**
   - Verify PayMongo API keys
   - Check webhook endpoint configuration
   - Test payment methods individually
   - Review error logs in Vercel

5. **PWA Installation Problems**
   - Verify manifest.json is accessible
   - Check service worker registration
   - Test HTTPS in production
   - Validate PWA criteria

## Performance Optimization

```typescript
// Image compression utility
import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // 1MB max
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp'
  }
  
  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Image compression failed:', error)
    return file
  }
}

// Lazy loading for gallery
export function useIntersectionObserver(
  ref: RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}
```

## Security Best Practices

### Input Sanitization

```typescript
// lib/sanitize.ts
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 500) // Hard limit
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .substring(0, 100)
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const photoUploadLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 m'),
  analytics: true,
})

// Usage in API route
const { success } = await photoUploadLimit.limit(request.ip ?? 'anonymous')
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

## Deployment Commands

```bash
# Environment setup
cp .env.example .env.local
# Fill in all environment variables

# Build and test locally
npm run build
npm run start

# Deploy to Vercel
vercel --prod

# Check deployment
vercel logs --follow

# Database migrations
npx supabase db push
npx supabase db reset

# Generate types after schema changes
npm run db:types
```

## Testing Framework

```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test

# Run tests
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run test:watch   # Watch mode
```

```typescript
// __tests__/components/QRCode.test.tsx
import { render, screen } from '@testing-library/react'
import { QRCodeDisplay } from '@/components/features/qr-code/QRCodeDisplay'

describe('QRCodeDisplay', () => {
  it('renders QR code with event information', () => {
    render(<QRCodeDisplay eventId="123" eventName="Test Event" />)
    
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText(/guests scan this/i)).toBeInTheDocument()
  })
})
```

## Useful Links

- **Next.js 15**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS 4.1.12**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **React Query**: https://tanstack.com/query
- **Zod**: https://zod.dev
- **PayMongo**: https://developers.paymongo.com
- **Vercel**: https://vercel.com/docs
- **PWA**: https://web.dev/progressive-web-apps

## Filipino Market Specific

### Event Types

```typescript
export const FILIPINO_EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', icon: '💍', popular: true },
  { id: 'birthday', label: 'Birthday Party', icon: '🎂', popular: true },
  { id: 'debut', label: 'Debut (18th Birthday)', icon: '👗', popular: true },
  { id: 'corporate', label: 'Corporate Event', icon: '🏢' },
  { id: 'graduation', label: 'Graduation', icon: '🎓' },
  { id: 'anniversary', label: 'Anniversary', icon: '💕' },
  { id: 'reunion', label: 'Family Reunion', icon: '👨‍👩‍👧‍👦' },
  { id: 'christening', label: 'Christening', icon: '👶' },
  { id: 'other', label: 'Other Celebration', icon: '🎉' },
]
```

### Payment Methods

```typescript
export const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', popular: true, description: 'Most popular' },
  { id: 'paymaya', name: 'PayMaya', popular: true, description: 'Digital wallet' },
  { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard' },
  { id: 'bank', name: 'Bank Transfer', description: 'InstaPay, PESONet' },
  { id: 'otc', name: 'Over the Counter', description: '7-Eleven, SM Bills' },
]
```

### Pricing (Philippine Pesos)

```typescript
export const PRICING_TIERS = {
  free: { price: 0, photos: 30, storage: 3, video: false },
  basic: { price: 69900, photos: 50, storage: 7, video: false }, // ₱699
  standard: { price: 99900, photos: 100, storage: 14, video: 60000 }, // ₱999 + ₱600 video
  premium: { price: 199900, photos: 250, storage: 30, video: 120000 }, // ₱1,999 + ₱1,200 video
  pro: { price: 349900, photos: 500, storage: 30, video: 210000 }, // ₱3,499 + ₱2,100 video
}
```

## Quick Commands Reference

```bash
# Most used commands during development
npm run dev                    # Start development
npm run db:types              # Update database types
npx shadcn@latest add [component]  # Add new UI component
vercel --prod                 # Deploy to production
git add . && git commit -m "feat: description"  # Quick commit

# Debug commands
npm run build                 # Check build errors
npm run type-check            # TypeScript errors
npm run lint                  # ESLint issues
```

This quick reference contains all the essential information needed to develop, deploy, and maintain the InstaMoments platform efficiently. Keep this handy during development for quick access to patterns, configurations, and troubleshooting steps.