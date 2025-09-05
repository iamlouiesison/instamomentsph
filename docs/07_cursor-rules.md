# Cursor AI Development Rules - InstaMoments

## Project Overview
InstaMoments is a Filipino-focused photo and video sharing platform for celebrations and events. Users create events, generate QR codes, and allow guests to contribute photos and videos to a shared gallery. Built as a Progressive Web App optimized for Philippine market with GCash integration.

---

## Core Technology Stack

### Frontend Framework
- **Next.js 15** with App Router (latest stable)
- **TypeScript** with strict mode enabled
- **React 18** with Server Components by default
- **Tailwind CSS 4.1.12** (latest) for styling
- **shadcn/ui** component library

### Backend & Database
- **Supabase** for PostgreSQL database, authentication, and storage
- **Supabase RLS** for row-level security policies
- **Next.js API Routes** for server-side logic
- **PayMongo** for Philippine payment processing (GCash priority)

### Key Libraries
```json
{
  "@supabase/ssr": "latest",
  "@supabase/supabase-js": "latest",
  "@tanstack/react-query": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  "zod": "latest",
  "lucide-react": "latest",
  "qrcode": "latest",
  "html5-qrcode": "latest",
  "browser-image-compression": "latest",
  "date-fns": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

---

## Folder Structure (Strictly Follow)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/              # Protected routes
│   │   ├── dashboard/
│   │   ├── create-event/
│   │   └── settings/
│   ├── gallery/[slug]/           # Public gallery pages
│   ├── api/                      # API routes
│   │   ├── events/
│   │   ├── upload/
│   │   ├── gallery/
│   │   ├── payments/
│   │   └── webhooks/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── loading.tsx
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── gallery/                  # Gallery-specific components
│   ├── auth/                     # Authentication components
│   ├── providers/                # Context providers
│   └── layout/                   # Layout components
├── lib/                          # Utilities and configurations
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── admin.ts              # Admin client
│   ├── validations/              # Zod schemas
│   ├── utils.ts                  # Utility functions
│   ├── constants.ts              # App constants
│   └── hooks/                    # Custom React hooks
├── types/                        # TypeScript definitions
│   ├── database.ts               # Supabase generated types
│   ├── api.ts                    # API response types
│   └── app.ts                    # Application types
└── middleware.ts                 # Next.js middleware
```

---

## Database Schema Rules

### Table Naming Convention
- Use **snake_case** for table and column names
- Use **singular** table names: `profile`, `event`, `photo`
- Foreign keys: `{table}_id` (e.g., `event_id`, `user_id`)

### Core Tables Structure
```sql
-- Users managed by Supabase auth.users
-- Always reference auth.users(id) for user relationships

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- wedding, birthday, debut, etc.
  event_date DATE NOT NULL,
  gallery_slug TEXT NOT NULL UNIQUE,
  qr_code_url TEXT,
  package_type TEXT DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  moderator_enabled BOOLEAN DEFAULT false,
  photo_limit INTEGER DEFAULT 100,
  video_limit INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue pattern for photos, videos, payments, etc.
```

### RLS Policies (Always Implement)
- **profiles**: Users can only see/edit their own profile
- **events**: Host can manage their events, public read for active events
- **photos/videos**: Host can moderate, contributors can upload
- **payments**: Only user and system can access payment records

---

## TypeScript Rules

### Type Definitions
```typescript
// Always export interfaces from types/ directory
export interface Event {
  id: string
  hostId: string
  name: string
  eventType: 'wedding' | 'birthday' | 'debut' | 'graduation' | 'corporate' | 'other'
  eventDate: Date
  gallerySlug: string
  qrCodeUrl?: string
  packageType: 'basic' | 'premium' | 'deluxe'
  isActive: boolean
  moderatorEnabled: boolean
  photoLimit: number
  videoLimit: number
  createdAt: Date
  updatedAt: Date
}

// Use Database types from Supabase
export type Database = // Generated by supabase gen types typescript
```

### Zod Validation (Required for all forms)
```typescript
import { z } from 'zod'

export const EventCreateSchema = z.object({
  name: z.string()
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name must be less than 100 characters'),
  eventType: z.enum(['wedding', 'birthday', 'debut', 'graduation', 'corporate', 'other']),
  eventDate: z.date()
    .min(new Date(), 'Event date cannot be in the past'),
  packageType: z.enum(['basic', 'premium', 'deluxe']).default('basic')
})

export type EventCreateInput = z.infer<typeof EventCreateSchema>
```

### Error Handling
```typescript
// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// API error responses
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
    field?: string // For validation errors
  }
}
```

---

## Component Development Rules

### File Naming
- Components: **PascalCase** (`EventCard.tsx`, `PhotoUpload.tsx`)
- Pages: **kebab-case** directories with `page.tsx`
- Hooks: **camelCase** starting with `use` (`useAuth.ts`, `useUpload.ts`)

### Component Structure
```tsx
// Required imports order
import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

// Internal imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { Event } from '@/types/database'

// Component props interface
interface EventCardProps {
  event: Event
  onEdit?: (id: string) => void
  showActions?: boolean
}

// Main component with proper typing
export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onEdit, 
  showActions = true 
}) => {
  // Early returns for loading/error states
  if (!event) return null

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {/* Component JSX */}
    </div>
  )
}

// Default export for pages only
export default EventCard
```

### Form Components (react-hook-form + zod)
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EventCreateSchema, EventCreateInput } from '@/lib/validations/event'

export const EventCreateForm: React.FC = () => {
  const form = useForm<EventCreateInput>({
    resolver: zodResolver(EventCreateSchema),
    defaultValues: {
      name: '',
      eventType: 'birthday',
      packageType: 'basic'
    }
  })

  const onSubmit = async (data: EventCreateInput) => {
    try {
      // Handle form submission
    } catch (error) {
      // Handle errors appropriately
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

---

## API Route Rules

### Route Structure
```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EventCreateSchema } from '@/lib/validations/event'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // 2. Input validation
    const body = await request.json()
    const validatedData = EventCreateSchema.parse(body)

    // 3. Business logic
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        host_id: user.id,
        gallery_slug: generateSlug(validatedData.name)
      })
      .select()
      .single()

    if (error) throw error

    // 4. Success response
    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    // 5. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    )
  }
}
```

### Response Format (Consistent)
```typescript
// Success response
interface ApiResponse<T = any> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

// Error response
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
    field?: string
  }
}
```

---

## Supabase Integration Rules

### Client Configuration
```typescript
// lib/supabase/client.ts (Browser)
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts (Server)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
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

### Query Patterns
```typescript
// Always use React Query for data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

---

## UI/UX Rules

### Design System (shadcn/ui + Tailwind)
```tsx
// Use design tokens consistently
<div className="bg-background text-foreground">
  <Button variant="default" size="lg">
    Primary Action
  </Button>
  <Button variant="outline" size="default">
    Secondary Action
  </Button>
</div>

// Filipino-friendly colors and themes
const filipinoEventThemes = {
  wedding: 'bg-rose-50 border-rose-200 text-rose-900',
  birthday: 'bg-blue-50 border-blue-200 text-blue-900',
  debut: 'bg-purple-50 border-purple-200 text-purple-900',
  graduation: 'bg-emerald-50 border-emerald-200 text-emerald-900'
}
```

### Accessibility Requirements
- All interactive elements must have proper ARIA labels
- Color contrast ratio 4.5:1 minimum
- Keyboard navigation support
- Screen reader compatibility
- Focus management for modals/drawers

### Mobile-First Design
```tsx
// Always use responsive classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Content adapts to screen size */}
  </div>
</div>

// Touch-friendly tap targets (minimum 44px)
<Button size="lg" className="min-h-[44px] min-w-[44px]">
  Tap me
</Button>
```

---

## Philippine Localization Rules

### Filipino Context Integration
```typescript
// Event types specific to Filipino culture
export const FILIPINO_EVENT_TYPES = {
  wedding: { label: 'Kasal', icon: '💒', description: 'Wedding celebration' },
  birthday: { label: 'Kaarawan', icon: '🎂', description: 'Birthday party' },
  debut: { label: '18th Birthday', icon: '👑', description: 'Coming of age celebration' },
  christening: { label: 'Binyag', icon: '👶', description: 'Baptism ceremony' },
  graduation: { label: 'Pagtatapos', icon: '🎓', description: 'Graduation ceremony' },
  corporate: { label: 'Company Event', icon: '🏢', description: 'Business gathering' }
}

// Payment methods priority (GCash first)
export const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', icon: '/icons/gcash.svg', priority: 1 },
  { id: 'paymaya', name: 'PayMaya', icon: '/icons/paymaya.svg', priority: 2 },
  { id: 'card', name: 'Credit/Debit Card', icon: '/icons/card.svg', priority: 3 },
  { id: 'bank', name: 'Online Banking', icon: '/icons/bank.svg', priority: 4 }
]
```

### Multi-generational UX
```tsx
// Large, clear UI elements for older users
<Button 
  size="lg" 
  className="text-lg font-semibold px-8 py-4 min-h-[56px]"
>
  Upload Photo
</Button>

// Simple, intuitive navigation
<nav className="fixed bottom-0 w-full bg-white border-t">
  <div className="flex justify-around py-2">
    <Button variant="ghost" size="lg" className="flex-col gap-1">
      <Home className="h-6 w-6" />
      <span className="text-xs">Home</span>
    </Button>
  </div>
</nav>
```

---

## Performance Rules

### Image Optimization
```tsx
import Image from 'next/image'
import { compressImage } from '@/lib/utils/image'

// Always optimize images before upload
const handleImageUpload = async (file: File) => {
  const compressedFile = await compressImage(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  })
  
  // Upload compressed image
}

// Use Next.js Image component
<Image
  src={photo.url}
  alt={photo.description}
  width={300}
  height={200}
  className="object-cover rounded-lg"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        return failureCount < 3
      }
    }
  }
})
```

---

## Security Rules

### Input Validation (Always Required)
```typescript
// Validate all inputs with Zod
const PhotoUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine((file) => file.type.startsWith('image/'), 'File must be an image'),
  eventId: z.string().uuid(),
  description: z.string().max(500).optional()
})

// Sanitize user content
import DOMPurify from 'isomorphic-dompurify'

const sanitizedContent = DOMPurify.sanitize(userInput)
```

### Authentication Middleware
```typescript
// middleware.ts - Protect routes
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/create-event/:path*']
}
```

---

## Payment Integration Rules (PayMongo)

### Payment Flow
```typescript
// app/api/payments/create/route.ts
import { PayMongo } from '@/lib/paymongo'

export async function POST(request: NextRequest) {
  try {
    const { amount, eventId, paymentMethod } = await request.json()
    
    // Create payment intent
    const paymentIntent = await PayMongo.createPaymentIntent({
      amount: amount * 100, // Convert to centavos
      currency: 'PHP',
      payment_method_allowed: ['gcash', 'paymaya', 'card'],
      metadata: { eventId }
    })

    return NextResponse.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret }
    })
  } catch (error) {
    // Handle payment errors
  }
}
```

---

## Testing Rules

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from '@/components/EventCard'
import { mockEvent } from '@/lib/test-utils'

describe('EventCard', () => {
  it('displays event information correctly', () => {
    render(<EventCard event={mockEvent} />)
    
    expect(screen.getByText(mockEvent.name)).toBeInTheDocument()
    expect(screen.getByText('Wedding')).toBeInTheDocument()
  })

  it('handles edit action', async () => {
    const onEdit = jest.fn()
    render(<EventCard event={mockEvent} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockEvent.id)
  })
})
```

---

## Environment Variables (Required)

```bash
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# PayMongo (Philippines)
PAYMONGO_SECRET_KEY=sk_test_your_secret_key
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB
NEXT_PUBLIC_MAX_FILES_PER_EVENT=100

# Philippine Specific
NEXT_PUBLIC_DEFAULT_CURRENCY=PHP
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Manila
```

---

## Deployment Rules (Vercel)

### Build Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Performance Monitoring
```typescript
// Always include error tracking
import { captureException } from '@sentry/nextjs'

try {
  // Risky operation
} catch (error) {
  captureException(error)
  throw error
}
```

---

## Code Quality Rules

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Git Commit Rules
```
feat: add photo upload functionality
fix: resolve QR code generation issue  
docs: update API documentation
style: improve mobile responsive design
refactor: optimize database queries
test: add event creation tests
chore: update dependencies
```

---

## Filipino Cultural Considerations

### Event-Specific Features
- **Wedding packages**: Include church ceremony, reception phases
- **Debut celebrations**: 18 roses, 18 candles photo moments
- **Birthday parties**: Cake cutting, blowing candles highlights
- **Graduations**: Sablay wearing, diploma receiving moments

### Family-Centered UX
- Multi-generational sharing (simple UI for grandparents)
- Family group photo prioritization in galleries
- Easy sharing to Filipino social platforms (Facebook priority)
- Offline capability for poor internet connections

---

## Development Server Rules

### Critical Directory Requirements
- **ALWAYS run the development server from the correct directory**: `/Users/louiesison/projects/instamomentsph/instamoments`
- **NEVER run npm commands from the parent directory** (`instamomentsph`) as it will fail with ENOENT errors
- **Use the full path command**: `cd /Users/louiesison/projects/instamomentsph/instamoments && npm run dev`
- **Verify the correct directory** before running any npm commands by checking for `package.json` presence
- **REMEMBER**: The correct working directory is `/Users/louiesison/projects/instamomentsph/instamoments` - this is where package.json exists

### Development Workflow
```bash
# Correct way to start development server
cd /Users/louiesison/projects/instamomentsph/instamoments
npm run dev

# Or use the full path command
cd /Users/louiesison/projects/instamomentsph/instamoments && npm run dev
```

### Directory Structure Context
```
/Users/louiesison/projects/instamomentsph/          # Parent directory (NO package.json)
├── docs/                                           # Documentation
├── instamoments/                                 # Next.js project directory (HAS package.json)
│   ├── package.json                               # ← This is where npm commands must run
│   ├── src/
│   ├── public/
│   └── ...
└── src/                                           # Legacy directory (ignore)
```

---

## AI Assistant Instructions

When generating code for this project:

1. **Always run development server from `/Users/louiesison/projects/instamomentsph/instamoments`**
2. **Always follow the exact folder structure** defined above
3. **Use TypeScript strictly** - no `any` types allowed
4. **Implement proper error handling** in all API routes
5. **Include Filipino context** where culturally relevant
6. **Optimize for mobile-first** responsive design
7. **Follow accessibility guidelines** (WCAG 2.1 AA)
8. **Use React Query** for all data fetching
9. **Validate all inputs** with Zod schemas
10. **Implement proper loading and error states**
11. **Include proper TypeScript interfaces** for all data structures
12. **Always run development server** at localhost:3000

### Code Review Checklist
Before implementing any feature, verify:
- [ ] TypeScript types are properly defined
- [ ] Zod validation schemas are implemented
- [ ] Error handling covers all edge cases
- [ ] Mobile responsive design is implemented
- [ ] Accessibility features are included
- [ ] Filipino cultural context is considered
- [ ] Performance optimization is applied
- [ ] Security best practices are followed

---

**Remember**: This is a family-oriented Filipino event platform. Every design and development decision should prioritize simplicity, cultural relevance, and multi-generational usability while maintaining professional quality and security standards.