# UI Design System & Pages

## Design System

### Design Tokens (tweakcn.com Inspired)

```css
/* Tailwind CSS 4.1.12 Configuration with OKLCH Color Space */
@import "tailwindcss";

/* Custom Design Tokens - InstaMoments Theme */
@layer base {
  :root {
    /* Core Colors */
    --background: oklch(1.0000 0 0);              /* Pure white */
    --foreground: oklch(0.1469 0.0041 49.2499);   /* Deep charcoal */
    --card: oklch(1.0000 0 0);                    /* White cards */
    --card-foreground: oklch(0.1469 0.0041 49.2499);
    --popover: oklch(1.0000 0 0);
    --popover-foreground: oklch(0.1469 0.0041 49.2499);
    
    /* Brand Colors - Filipino Celebration Inspired */
    --primary: oklch(0.8803 0.1348 86.0616);      /* Warm golden yellow - joy/celebration */
    --primary-foreground: oklch(0.1469 0.0041 49.2499);
    --secondary: oklch(0.7116 0.1812 22.8389);    /* Rich coral - warmth/connection */
    --secondary-foreground: oklch(1.0000 0 0);
    
    /* Neutral Palette */
    --muted: oklch(0.9699 0.0013 106.4238);       /* Light gray backgrounds */
    --muted-foreground: oklch(0.5534 0.0116 58.0708);
    --accent: oklch(0.9699 0.0013 106.4238);
    --accent-foreground: oklch(0.2161 0.0061 56.0434);
    
    /* Semantic Colors */
    --destructive: oklch(0.6368 0.2078 25.3313);  /* Error red */
    --destructive-foreground: oklch(0.9851 0 0);
    
    /* Interface Elements */
    --border: oklch(0.9232 0.0026 48.7171);
    --input: oklch(0.9232 0.0026 48.7171);
    --ring: oklch(0.8803 0.1348 86.0616);
    
    /* Chart Colors */
    --chart-1: oklch(0.8803 0.1348 86.0616);
    --chart-2: oklch(0.7116 0.1812 22.8389);
    --chart-3: oklch(0.7775 0.1595 166.5719);
    --chart-4: oklch(0.5923 0.1120 227.9733);
    --chart-5: oklch(0.7484 0.1384 37.9119);
    
    /* Sidebar Colors */
    --sidebar: oklch(0.9699 0.0013 106.4238);
    --sidebar-foreground: oklch(0.2161 0.0061 56.0434);
    --sidebar-primary: oklch(0.8803 0.1348 86.0616);
    --sidebar-primary-foreground: oklch(1.0000 0 0);
    --sidebar-accent: oklch(1.0000 0 0);
    --sidebar-accent-foreground: oklch(0.2161 0.0061 56.0434);
    --sidebar-border: oklch(0.9232 0.0026 48.7171);
    --sidebar-ring: oklch(0.8803 0.1348 86.0616);
    
    /* Typography */
    --font-sans: ABeeZee, ui-sans-serif, sans-serif, system-ui;
    --font-serif: Lora;
    --font-mono: Fira Code;
    
    /* Spacing & Radius */
    --radius: 0.75rem;                            /* Rounded corners for modern feel */
    --spacing: 0.25rem;
    
    /* Shadows - Elevated UI */
    --shadow-2xs: 0px 4px 10px 0px hsl(0 0% 0% / 0.05);
    --shadow-xs: 0px 4px 10px 0px hsl(0 0% 0% / 0.05);
    --shadow-sm: 0px 4px 10px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow: 0px 4px 10px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow-md: 0px 4px 10px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
    --shadow-lg: 0px 4px 10px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
    --shadow-xl: 0px 4px 10px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
    --shadow-2xl: 0px 4px 10px 0px hsl(0 0% 0% / 0.25);
    
    /* Typography */
    --tracking-normal: normal;
  }
  
  .dark {
    --background: oklch(0.2161 0.0061 56.0434);   /* Dark charcoal */
    --foreground: oklch(0.9851 0 0);              /* Near white */
    --card: oklch(0.2685 0.0063 34.2976);         /* Elevated dark cards */
    --card-foreground: oklch(0.9851 0 0);
    --popover: oklch(0.2685 0.0063 34.2976);
    --popover-foreground: oklch(0.9851 0 0);
    
    --primary: oklch(0.7685 0.1369 20.7298);      /* Warm gold in dark */
    --primary-foreground: oklch(0.2161 0.0061 56.0434);
    --secondary: oklch(0.8803 0.1348 86.0616);    /* Bright coral in dark */
    --secondary-foreground: oklch(0.3115 0.0647 79.0038);
    
    --muted: oklch(0.3741 0.0087 67.5582);        /* Dark muted */
    --muted-foreground: oklch(0.7161 0.0091 56.2590);
    --accent: oklch(0.3741 0.0087 67.5582);
    --accent-foreground: oklch(0.9851 0 0);
    
    --destructive: oklch(0.7106 0.1661 22.2162);
    --destructive-foreground: oklch(0.2161 0.0061 56.0434);
    
    --border: oklch(0.3741 0.0087 67.5582);
    --input: oklch(0.3741 0.0087 67.5582);
    --ring: oklch(0.7685 0.1369 20.7298);
    
    --chart-1: oklch(0.7685 0.1369 20.7298);
    --chart-2: oklch(0.8803 0.1348 86.0616);
    --chart-3: oklch(0.7729 0.1535 163.2231);
    --chart-4: oklch(0.7535 0.1390 232.6615);
    --chart-5: oklch(0.8369 0.1644 84.4286);
    
    --sidebar: oklch(0.2685 0.0063 34.2976);
    --sidebar-foreground: oklch(0.9851 0 0);
    --sidebar-primary: oklch(0.7685 0.1369 20.7298);
    --sidebar-primary-foreground: oklch(0.2161 0.0061 56.0434);
    --sidebar-accent: oklch(0.3741 0.0087 67.5582);
    --sidebar-accent-foreground: oklch(0.9851 0 0);
    --sidebar-border: oklch(0.3741 0.0087 67.5582);
    --sidebar-ring: oklch(0.7685 0.1369 20.7298);
    
    --shadow-2xs: 0px 5px 15px 0px hsl(0 0% 0% / 0.13);
    --shadow-xs: 0px 5px 15px 0px hsl(0 0% 0% / 0.13);
    --shadow-sm: 0px 5px 15px 0px hsl(0 0% 0% / 0.25), 0px 1px 2px -1px hsl(0 0% 0% / 0.25);
    --shadow: 0px 5px 15px 0px hsl(0 0% 0% / 0.25), 0px 1px 2px -1px hsl(0 0% 0% / 0.25);
    --shadow-md: 0px 5px 15px 0px hsl(0 0% 0% / 0.25), 0px 2px 4px -1px hsl(0 0% 0% / 0.25);
    --shadow-lg: 0px 5px 15px 0px hsl(0 0% 0% / 0.25), 0px 4px 6px -1px hsl(0 0% 0% / 0.25);
    --shadow-xl: 0px 5px 15px 0px hsl(0 0% 0% / 0.25), 0px 8px 10px -1px hsl(0 0% 0% / 0.25);
    --shadow-2xl: 0px 5px 15px 0px hsl(0 0% 0% / 0.63);
  }
}

/* Mobile-First Filipino Design Tokens */
@layer components {
  .filipino-gradient {
    @apply bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20;
  }
  
  .celebration-card {
    @apply bg-card border border-border rounded-lg shadow-lg overflow-hidden;
  }
  
  .qr-scan-area {
    @apply bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/30 rounded-xl p-8;
  }
}
```

### Typography Scale

```css
/* Filipino-Friendly Typography System */
@layer utilities {
  /* Headlines - ABeeZee for modern readability */
  .text-hero { @apply text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight; }
  .text-h1 { @apply text-3xl sm:text-4xl font-bold tracking-tight leading-tight; }
  .text-h2 { @apply text-2xl sm:text-3xl font-semibold tracking-tight leading-snug; }
  .text-h3 { @apply text-xl sm:text-2xl font-semibold leading-snug; }
  .text-h4 { @apply text-lg sm:text-xl font-semibold; }
  
  /* Body Text - Optimized for mobile reading */
  .text-body-lg { @apply text-lg leading-relaxed; }
  .text-body { @apply text-base leading-relaxed; }
  .text-body-sm { @apply text-sm leading-relaxed; }
  
  /* UI Elements */
  .text-button { @apply text-sm font-medium tracking-wide; }
  .text-caption { @apply text-xs text-muted-foreground leading-relaxed; }
  .text-overline { @apply text-xs font-semibold uppercase tracking-wider; }
  
  /* Special Typography */
  .text-celebration { @apply font-serif text-2xl font-medium italic text-secondary; }
  .text-countdown { @apply font-mono text-xl font-bold tabular-nums; }
}
```

### Component Patterns

```typescript
// InstaMoments Component Patterns
export const componentVariants = {
  // Button Variants - Filipino Event Context
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md",
    celebrate: "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg",
    gcash: "bg-blue-600 text-white hover:bg-blue-700 shadow-md", // GCash brand color
    paymaya: "bg-green-600 text-white hover:bg-green-700 shadow-md", // PayMaya brand color
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  },
  
  // Card Variants
  card: {
    default: "rounded-lg border bg-card text-card-foreground shadow-sm",
    elevated: "rounded-lg border bg-card text-card-foreground shadow-lg",
    celebration: "celebration-card filipino-gradient",
    photo: "rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow",
    event: "celebration-card hover:shadow-xl transition-all duration-300 cursor-pointer",
    pricing: "rounded-xl border-2 bg-card shadow-lg hover:shadow-xl transition-all duration-300",
  },
  
  // Input Variants
  input: {
    default: "flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-sm",
    large: "flex h-14 w-full rounded-lg border border-input bg-background px-4 py-4",
    search: "flex h-12 w-full rounded-full border border-input bg-background px-6 py-3",
  },
  
  // Gallery Variants
  gallery: {
    grid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3",
    masonry: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3",
    featured: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
  }
}

// Layout Patterns
export const layouts = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-8 sm:py-12 md:py-16",
  hero: "py-12 sm:py-16 md:py-20 lg:py-24",
  centered: "flex flex-col items-center justify-center text-center",
  mobile_padding: "px-4 sm:px-6",
  safe_area: "pb-safe-area-inset-bottom", // For PWA
}
```

## Page Inventory

### Public Pages

#### Landing Page (/)
```markdown
Structure:

🎉 Hero Section - Filipino Celebration Focus
- Headline: "Capture Every Filipino Celebration Moment Instantly"
- Subheadline: "QR codes, real-time galleries, and video messages for weddings, birthdays, and family gatherings"
- CTA Buttons: [Create Event] [See How It Works]
- Hero Visual: Collage of Filipino celebrations with floating QR code
- Trust Indicators: "Join 1000+ Filipino families" + event photos

📱 How It Works Section
- Step 1: Create Event & Print QR Code
- Step 2: Guests Scan & Share Photos/Videos Instantly  
- Step 3: Everyone Enjoys Live Gallery & Memories
- Visual: Interactive demo showing QR scan → camera → gallery flow

🏆 Perfect For Filipino Events
- Wedding receptions & ceremonies
- Birthday parties & debuts  
- Corporate celebrations & team building
- Graduation parties
- Family reunions & anniversaries
- Visual: Event type icons with sample photos

💖 Why Filipino Families Love InstaMoments
- "Hindi na nawawala ang mga litrato" - No more lost photos
- "Lahat ng guests nakakakuha" - Everyone can contribute
- "Video messages pa!" - Plus video greetings
- Testimonial cards with real user photos

💰 Pricing Section - Filipino Market Optimized
- Free: Perfect for small gatherings
- Standard ₱999: Most popular for typical Filipino celebrations
- Premium ₱1,999: For big weddings & corporate events
- Payment methods: GCash, PayMaya, Bank Transfer
- "Money-back guarantee - Satisfied or refunded"

📞 Footer
- Contact: "Need help? Message us on Facebook"
- Links: Privacy Policy, Terms, FAQ
- Language: English/Filipino toggle
- Social: Facebook, Instagram, TikTok
```

#### How It Works (/how-it-works)
```markdown
Interactive Step-by-Step Guide:

1. Create Your Event (30 seconds)
   - Choose event type & name
   - Select package & payment
   - Instant QR code generation

2. Display QR Codes at Event
   - Print table tent cards
   - Display on screens
   - Share via messages

3. Guests Scan & Contribute
   - Camera opens instantly
   - Upload photos with messages
   - Record video greetings

4. Real-Time Gallery Magic
   - Photos appear instantly
   - Everyone can view & download
   - Video messages play beautifully

5. Keep Memories Forever
   - Email gallery to all guests
   - Download photo albums
   - Share on social media
```

#### Pricing (/pricing)
```markdown
Filipino Market-Focused Pricing:

💝 Free - Perfect for Testing
- 30 photos max (3 per person)
- 3-day storage
- Basic gallery viewing
- InstaMoments watermark

🎊 Basic - ₱699 per event
- 50 photos (5 per person)
- 7-day storage  
- Photo messages
- No watermark
- Email support

⭐ Standard - ₱999 per event (Most Popular)
- 100 photos (5 per person)
- 14-day storage
- Email gallery sharing
- Social media integration
- Priority support
- + Video Addon: ₱600 (20-second greetings)

💎 Premium - ₱1,999 per event
- 250 photos (5 per person)
- 30-day storage
- All premium features
- Professional gallery layouts
- Dedicated support
- + Video Addon: ₱1,200

🏆 Pro - ₱3,499 per event (For Wedding Planners)
- 500 photos (5 per person)
- 30-day storage
- Custom branding
- Advanced analytics
- Event coordinator assistance
- + Video Addon: ₱2,100

Payment Methods:
- GCash (Most Popular)
- PayMaya/Maya
- BPI/BDO Bank Transfer
- Credit/Debit Cards
- Over-the-Counter: 7-Eleven, SM Bills Payment
```

### Authentication Pages

#### Sign In (/auth/signin)
```markdown
Mobile-First Filipino UX:

Header: InstaMoments logo + "Welcome back"

Form:
- Email input (large, friendly)
- Password input with show/hide toggle
- "Remember me" checkbox
- [Sign In] button (primary, full-width)

Quick Options:
- "Or continue with:" 
- [Continue with Google] (popular in PH)
- [Continue with Facebook] (most popular)

Footer Links:
- "Forgot your password?" 
- "New to InstaMoments? Create account"
- "Need help? Contact support"

Visual: Background with subtle Filipino celebration elements
```

#### Sign Up (/auth/signup)
```markdown
Welcome Flow for Filipino Users:

Header: "Join thousands of Filipino families"

Form:
- Full name (required for events)
- Email address 
- Password (strength indicator)
- Phone number (optional, for SMS notifications)
- "I agree to Terms & Privacy Policy" checkbox
- [Create Account] button

Social Options:
- [Sign up with Google]
- [Sign up with Facebook]

Onboarding Preview:
- "After signing up, you can:"
- ✓ Create your first event in 2 minutes
- ✓ Generate QR codes instantly
- ✓ Start collecting memories right away

Trust Signals:
- "Used by 1000+ Filipino families"
- "Featured in events across Metro Manila"
```

### Protected Pages

#### Dashboard (/dashboard)
```markdown
Layout - Filipino Event Planner Focus:

┌─────────────────────────────────────────────────────┐
│ Header: InstaMoments + User Menu + Notifications   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📱 Quick Actions (Mobile-First)                   │
│  [+ Create New Event] [📋 My Events] [💳 Billing]  │
│                                                     │
│  🎉 Recent Events                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Maria's     │ │ Birthday    │ │ Corporate   │   │
│  │ Wedding     │ │ Party       │ │ Event       │   │
│  │ 47 photos   │ │ 23 photos   │ │ 12 photos   │   │
│  │ ₱999 paid   │ │ ₱699 paid   │ │ Free        │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
│  📊 Quick Stats                                     │
│  Total Events: 5    Photos Collected: 147          │
│  Active Events: 2   Video Messages: 23             │
│                                                     │
│  🔥 Event Season Tips (Dec-Feb)                    │
│  "Wedding season is here! Book your events early"   │
│                                                     │
└─────────────────────────────────────────────────────┘

Components:
- Welcome message with first name
- Event cards with preview photos
- Quick statistics dashboard
- Seasonal tips for Filipino events
- Recent activity feed
- Payment status indicators
```

#### Event Management (/dashboard/events/[id])
```markdown
Single Event Dashboard:

🎊 Event Header
- Event name, date, type
- QR code (view/download/print)
- Live status indicator
- Share event link

📈 Real-Time Statistics
- 47 photos uploaded
- 12 video messages  
- 23 contributors
- Last activity: 2 minutes ago

📸 Live Gallery Feed (Real-Time)
- Newest photos first
- Photo + contributor name + timestamp
- Video message thumbnails
- Moderation controls (if enabled)

👥 Contributors List
- Names + email addresses
- Contribution count per person
- Contact options for follow-up

⚙️ Event Settings
- Moderation on/off
- Download permissions
- Gallery privacy settings
- Email notifications

🎬 Gallery Actions
- [Download All Photos]
- [Email Gallery to Guests]  
- [Share on Social Media]
- [Generate Thank You Messages]
```

#### Gallery Creation Flow (/create-event)
```markdown
Step-by-Step Event Creation:

Step 1: Event Details
- Event name (required)
- Event type: Wedding, Birthday, Corporate, etc.
- Event date (optional)
- Location (optional)  
- Brief description

Step 2: Choose Package
- Visual pricing cards
- Feature comparison
- Popular choice highlighted
- "You can upgrade anytime" note

Step 3: Payment (if not Free)
- Payment method selection:
  * GCash (with logo & "Most popular")
  * PayMaya/Maya
  * Bank transfer
  * Credit/debit card
- Secure payment processing
- Receipt via email

Step 4: Event Ready!
- Instant QR code generation
- Download QR codes (various sizes)
- Gallery link created
- Email confirmation sent
- "Share this link with guests" CTA
```

#### Gallery Viewing (/gallery/[slug])
```markdown
Public Gallery - The Heart of InstaMoments:

🎉 Event Header
- Event name & date
- Host information
- Contributor count & stats
- "Add your photos" CTA (prominent)

📱 Camera Interface (QR Scan Entry Point)
- Large "Take Photo" button
- "Record Video Message" button  
- Name/email capture (simple form)
- "Your photos save to your device too" note

🖼️ Live Photo Gallery
- Masonry/grid layout (responsive)
- Infinite scroll loading
- Photo captions/messages
- Contributor names
- Real-time updates (new photos appear)
- Heart reactions (optional)

🎥 Video Messages Section  
- Video thumbnail grid
- Play inline or fullscreen
- Video captions/messages
- "Add your video greeting" CTA

📤 Sharing Options
- Individual photo sharing
- Gallery link sharing
- Social media integration
- Download favorites

🔒 Privacy Controls
- Respect contributor privacy
- Download permissions
- Report inappropriate content
```

### Settings Pages

#### Profile Settings (/dashboard/settings/profile)
```markdown
Filipino User-Friendly Settings:

👤 Personal Information
- Profile photo upload
- Full name (as it appears on events)
- Email address
- Phone number (for SMS notifications)
- Preferred language: English/Filipino

🎊 Event Preferences  
- Default event type
- Preferred payment method
- Notification preferences:
  * Email for new photos
  * SMS for event milestones  
  * Facebook Messenger updates

🔔 Communication Settings
- Event updates
- Marketing emails
- Feature announcements
- Tips for better events

⚠️ Account Management
- Change password
- Download my data
- Delete account
- "Need help? Contact support"
```

#### Billing & Payments (/dashboard/settings/billing)
```markdown
Philippine Payment Management:

💳 Payment Methods
- Linked GCash account
- PayMaya/Maya wallet
- Saved credit/debit cards
- Bank account information
- + Add new payment method

📊 Usage & Billing
- Current events: 2 active, 3 total
- Storage used: 245 MB of unlimited
- Next payment: No recurring charges
- "Pay per event" model explanation

💰 Transaction History
- Recent payments table:
  Date | Event | Amount | Method | Status
  Dec 15 | Maria's Wedding | ₱999 | GCash | Paid
  Nov 28 | Birthday Party | ₱699 | PayMaya | Paid

🧾 Receipts & Invoices
- Download official receipts
- Email invoices to company
- BIR-compliant documentation

💡 Billing Help
- "Common questions about payments"
- "How to get official receipts"
- "Refund policy explained"
```

## Component Library (shadcn/ui)

### Core Components for InstaMoments

```bash
# Essential shadcn/ui components for Filipino event platform
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add avatar
npx shadcn@latest add badge  
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add switch
npx shadcn@latest add radio-group
npx shadcn@latest add checkbox
npx shadcn@latest add label
```

### Custom InstaMoments Components

```typescript
// Filipino Event-Specific Components

// QR Code Display Component
export function QRCodeDisplay({ eventId, size = "large" }: { eventId: string, size?: "small" | "large" }) {
  return (
    <Card className="qr-scan-area text-center">
      <CardContent className="p-6">
        <div className={cn(
          "mx-auto bg-white p-4 rounded-lg shadow-sm",
          size === "large" ? "w-48 h-48" : "w-32 h-32"
        )}>
          <QRCodeSVG value={`${process.env.NEXT_PUBLIC_APP_URL}/gallery/${eventId}`} size="100%" />
        </div>
        <p className="mt-4 text-body text-muted-foreground">
          Guests scan this to add photos instantly
        </p>
        <div className="flex gap-2 mt-4 justify-center">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Event Type Selector - Filipino Events
export function EventTypeSelector({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const eventTypes = [
    { id: 'wedding', label: 'Wedding', icon: '💒', popular: true },
    { id: 'birthday', label: 'Birthday Party', icon: '🎂', popular: true },
    { id: 'debut', label: 'Debut (18th Birthday)', icon: '👗', popular: true },
    { id: 'corporate', label: 'Corporate Event', icon: '🏢', popular: false },
    { id: 'graduation', label: 'Graduation', icon: '🎓', popular: false },
    { id: 'anniversary', label: 'Anniversary', icon: '💕', popular: false },
    { id: 'reunion', label: 'Family Reunion', icon: '👨‍👩‍👧‍👦', popular: false },
    { id: 'other', label: 'Other Celebration', icon: '🎉', popular: false },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {eventTypes.map((type) => (
        <Card
          key={type.id}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            value === type.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50",
            type.popular && "border-primary/30"
          )}
          onClick={() => onChange(type.id)}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">{type.icon}</div>
            <p className="text-sm font-medium">{type.label}</p>
            {type.popular && (
              <Badge variant="secondary" className="mt-2 text-xs">
                Popular
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Photo Upload Interface
export function PhotoUploadArea({ eventId, onUpload }: { eventId: string, onUpload: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  
  return (
    <div
      className={cn(
        "qr-scan-area transition-all duration-200",
        isDragging && "border-primary bg-primary/10"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        onUpload(files)
      }}
    >
      <div className="text-center">
        <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-h4 mb-2">Add Your Photos</h3>
        <p className="text-body text-muted-foreground mb-4">
          Drag photos here or use the camera button
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="filipino-gradient">
            <Camera className="w-5 h-5 mr-2" />
            Take Photo
          </Button>
          <Button variant="outline" size="lg">
            <Upload className="w-5 h-5 mr-2" />
            Upload Photos
          </Button>
        </div>
      </div>
    </div>
  )
}

// Philippine Payment Method Selector
export function PaymentMethodSelector({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const paymentMethods = [
    { 
      id: 'gcash', 
      name: 'GCash', 
      icon: '/icons/gcash.png', 
      popular: true,
      description: 'Most popular in Philippines' 
    },
    { 
      id: 'paymaya', 
      name: 'PayMaya', 
      icon: '/icons/paymaya.png', 
      popular: true,
      description: 'Digital wallet' 
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: '/icons/card.png', 
      popular: false,
      description: 'Visa, Mastercard' 
    },
    { 
      id: 'bank', 
      name: 'Bank Transfer', 
      icon: '/icons/bank.png', 
      popular: false,
      description: 'InstaPay, PESONet' 
    },
    { 
      id: 'otc', 
      name: 'Over the Counter', 
      icon: '/icons/otc.png', 
      popular: false,
      description: '7-Eleven, SM Bills Payment' 
    },
  ]

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <Card
          key={method.id}
          className={cn(
            "cursor-pointer transition-all duration-200",
            value === method.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50"
          )}
          onClick={() => onChange(method.id)}
        >
          <CardContent className="flex items-center p-4">
            <div className="flex items-center flex-1">
              <img 
                src={method.icon} 
                alt={method.name} 
                className="w-8 h-8 mr-3" 
              />
              <div>
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </div>
            {method.popular && (
              <Badge variant="secondary" className="ml-2">
                Popular
              </Badge>
            )}
            {value === method.id && (
              <CheckCircle className="w-5 h-5 text-primary ml-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Event Statistics Dashboard
export function EventStats({ event }: { event: Event }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Camera className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{event.totalPhotos}</p>
          <p className="text-sm text-muted-foreground">Photos</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Video className="w-6 h-6 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold">{event.totalVideos}</p>
          <p className="text-sm text-muted-foreground">Videos</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold">{event.totalContributors}</p>
          <p className="text-sm text-muted-foreground">Contributors</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-info" />
          <p className="text-2xl font-bold">
            {Math.ceil((new Date(event.expiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
          </p>
          <p className="text-sm text-muted-foreground">Days Left</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading States for Filipino Context
export const LoadingStates = {
  PhotoUpload: () => (
    <div className="animate-pulse">
      <div className="h-32 bg-muted rounded-lg mb-4" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  ),
  
  EventCard: () => (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-2/3 mb-4" />
          <div className="h-20 bg-muted rounded mb-4" />
          <div className="flex space-x-2">
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  
  Gallery: () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

// Empty States with Filipino Context
export const EmptyStates = {
  NoEvents: () => (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-h3 mb-2">No events yet</h3>
      <p className="text-body text-muted-foreground mb-6">
        Create your first Filipino celebration event
      </p>
      <Button size="lg">
        <Plus className="w-5 h-5 mr-2" />
        Create Event
      </Button>
    </div>
  ),
  
  NoPhotos: ({ eventName }: { eventName: string }) => (
    <div className="text-center py-12">
      <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-h3 mb-2">No photos yet for {eventName}</h3>
      <p className="text-body text-muted-foreground mb-6">
        Share your QR code so guests can start adding memories
      </p>
      <Button size="lg">
        <Share2 className="w-5 h-5 mr-2" />
        Share QR Code
      </Button>
    </div>
  )
}
```

## Responsive Design

### Mobile-First Breakpoints

```css
/* Filipino Mobile Usage Patterns - Tailwind CSS 4.1.12 */
@media (min-width: 375px) { /* sm - Minimum phone size */ }
@media (min-width: 640px) { /* md - Large phones / small tablets */ }
@media (min-width: 768px) { /* lg - Tablets */ } 
@media (min-width: 1024px) { /* xl - Small desktops */ }
@media (min-width: 1280px) { /* 2xl - Large desktops */ }
```

### Filipino Mobile-First Patterns

```typescript
// Responsive Grid Systems for Filipino Content
const ResponsivePatterns = {
  // Photo Gallery - Optimized for Filipino family photos
  photoGrid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4",
  
  // Event Cards - Filipino celebration context
  eventGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  
  // Navigation - Touch-friendly for all ages
  navigation: "flex flex-col sm:flex-row gap-2 sm:gap-4",
  
  // Payment Methods - Large touch targets
  paymentGrid: "space-y-3 sm:space-y-4",
  
  // Stats Dashboard 
  statsGrid: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4",
}

// Typography Responsive Scaling
const ResponsiveText = {
  hero: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  heading: "text-xl sm:text-2xl md:text-3xl",
  subheading: "text-lg sm:text-xl",
  body: "text-sm sm:text-base",
  caption: "text-xs sm:text-sm"
}

// Spacing for Filipino UI Patterns
const ResponsiveSpacing = {
  section: "py-8 sm:py-12 md:py-16 lg:py-20",
  container: "px-4 sm:px-6 lg:px-8",
  card: "p-4 sm:p-6 md:p-8",
  button: "px-4 py-3 sm:px-6 sm:py-4",
}
```

### PWA Specific Responsive Features

```css
/* PWA Safe Areas for Filipino Mobile Devices */
@supports (padding: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
}

/* Camera Interface Responsive */
.camera-interface {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
}

/* Gallery Responsive Masonry */
.gallery-masonry {
  column-count: 2;
}

@media (min-width: 640px) {
  .gallery-masonry {
    column-count: 3;
  }
}

@media (min-width: 1024px) {
  .gallery-masonry {
    column-count: 4;
  }
}
```

## User Experience Flows

### Critical Filipino User Journeys

#### QR Code Scan → Photo Upload Flow
```
🔍 QR Code Scan
   ↓ (< 2 seconds)
📱 Camera Permission Request
   ↓ (Allow)
📸 Camera Interface Opens
   ↓ (Take Photo)
✏️ Add Caption/Name
   ↓ (Optional)
⬆️ Upload & Compress
   ↓ (< 10 seconds)
✅ Photo Appears in Gallery
   ↓ (Real-time)
🎉 Success Message
   "Salamat! Your photo is now in the gallery"
```

#### Event Creation Flow (Host)
```
🎊 Landing Page
   ↓ ("Create Event")
📝 Event Details Form
   - Event name, type, date
   - "Maria's Wedding Reception"
   ↓ (Next)
💰 Choose Package
   - Standard ₱999 (Most Popular)
   - + Video Addon ₱600
   ↓ (Choose Standard + Video)
💳 Payment Method
   - Select GCash (Most Popular)
   ↓ (Pay ₱1,599)
🔐 GCash Payment
   - Redirect to GCash app
   ↓ (Payment Success)
🎯 Event Created!
   - QR codes generated
   - Gallery link active
   - Email confirmation sent
```

#### Video Greeting Recording Flow
```
🎥 "Record Video Message" Button
   ↓ (Tap)
📹 Camera Permission + Recording
   - 20-second countdown timer
   - "Say your message for Maria!"
   ↓ (Record)
⏹️ Recording Complete
   - Preview playback
   - "Re-record" or "Send"
   ↓ (Send)
📝 Add Caption (Optional)
   - "Congratulations message"
   ↓ (Submit)
⬆️ Video Upload & Processing
   - Compression + thumbnail generation
   ↓ (Complete)
✅ Added to Event Gallery
   - "Your video greeting is live!"
```

### Secondary User Paths

#### Gallery Sharing Flow
```
👀 View Event Gallery
   ↓ (Share Button)
📤 Share Options
   - Copy link
   - Facebook share
   - WhatsApp/Viber share  
   - Email gallery
   ↓ (Choose Option)
📱 Native Share Interface
   - Recipients selection
   ↓ (Send)
🎊 Shared Successfully
   "Gallery shared with your friends!"
```

#### Payment & Upgrade Flow
```
📈 Hit Photo Limit
   - "You've reached your 30 photo limit"
   - "Upgrade to add more memories"
   ↓ (Upgrade Now)
💎 Upgrade Options
   - Basic ₱699 (50 photos)
   - Standard ₱999 (100 photos) ★ Recommended
   - Premium ₱1,999 (250 photos)
   ↓ (Choose Standard)
💳 Quick Payment
   - Saved GCash account
   - One-click payment
   ↓ (Pay ₱999)
🚀 Instant Upgrade
   - Limits increased immediately
   - "You can now add 100 photos!"
   - Continue uploading
```

## Accessibility Requirements

### WCAG 2.1 AA Compliance for Filipino Context

#### Color & Contrast
- **Text Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- **UI Elements**: 3:1 contrast ratio for buttons, form controls
- **Focus Indicators**: High contrast focus rings on all interactive elements
- **Color Independence**: Never rely on color alone for information

#### Filipino Multi-Generational Accessibility
```typescript
// Font Size Options for Different Ages
const AccessibilitySettings = {
  fontSize: {
    small: "text-sm leading-relaxed",    // For younger users
    normal: "text-base leading-relaxed", // Default
    large: "text-lg leading-relaxed",    // For older family members
    xlarge: "text-xl leading-relaxed"    // For vision impaired users
  },
  
  // Touch Targets - Important for all ages at Filipino events
  touchTargets: {
    button: "min-h-[44px] min-w-[44px]",     // iOS guideline
    qrScan: "min-h-[60px] min-w-[60px]",     // Larger for elderly users
    photo: "min-h-[48px] min-w-[48px]",      // Photo selection
  },
  
  // High Contrast Mode
  highContrast: {
    background: "bg-white dark:bg-black",
    text: "text-black dark:text-white",
    border: "border-black dark:border-white border-2",
  }
}
```

#### Screen Reader Support
```typescript
// ARIA Labels for Filipino Context
const AriaLabels = {
  qrCode: "QR code for event: {eventName}. Scan to add photos",
  photoUpload: "Upload photo for {eventName}. File size limit 10MB",
  videoRecord: "Record 20-second video message for {eventName}",
  gallery: "Photo gallery for {eventName} with {photoCount} photos",
  payment: "Pay {amount} pesos using {paymentMethod}",
  contributor: "Photo by {contributorName} uploaded {timeAgo}",
}

// Screen Reader Announcements
const ScreenReaderAnnouncements = {
  photoUploaded: "Photo uploaded successfully to {eventName} gallery",
  videoRecording: "Recording video message. {remainingSeconds} seconds remaining",
  paymentSuccess: "Payment successful. Event {eventName} upgraded to {tier}",
  newPhotoAdded: "New photo added to gallery by {contributorName}",
}
```

#### Keyboard Navigation
```typescript
// Keyboard Navigation Patterns
const KeyboardPatterns = {
  // Tab order for QR scan flow
  qrScanFlow: [
    'qr-scanner',
    'camera-button', 
    'upload-button',
    'contributor-name',
    'photo-caption',
    'submit-button'
  ],
  
  // Gallery navigation
  galleryNavigation: {
    'ArrowRight': 'Next photo',
    'ArrowLeft': 'Previous photo', 
    'Enter': 'Open photo fullscreen',
    'Escape': 'Close fullscreen',
    'Space': 'Like/unlike photo (future feature)'
  },
  
  // Payment form navigation
  paymentFlow: [
    'payment-method-selection',
    'amount-display',
    'terms-checkbox',
    'pay-button',
    'back-button'
  ]
}
```

#### Filipino Language Accessibility
```typescript
// Language Support for Accessibility
const LanguageAccessibility = {
  // Alt text in Filipino context
  altText: {
    en: "Photo from {eventName} by {contributorName}",
    fil: "Larawan mula sa {eventName} ni {contributorName}"
  },
  
  // Screen reader instructions
  instructions: {
    en: "Scan QR code with your camera to add photos to the event gallery",
    fil: "I-scan ang QR code gamit ang inyong camera para magdagdag ng mga larawan"
  },
  
  // Error messages
  errors: {
    en: "Photo upload failed. Please check your internet connection and try again.",
    fil: "Hindi nai-upload ang larawan. Pakisuri ang inyong internet connection at subukan muli."
  }
}
```

### Inclusive Design for Filipino Events

#### Multi-Generational Support
- **Large Touch Targets**: 44px minimum for elderly users
- **Simple Language**: Clear, jargon-free instructions
- **Visual Hierarchy**: Clear headings and sections
- **Progress Indicators**: Show upload/payment progress clearly
- **Error Recovery**: Simple, helpful error messages with solutions

#### Cultural Accessibility
- **Familiar Icons**: Use universally understood symbols
- **Payment Methods**: Support for Philippine-specific payment options
- **Event Types**: Culturally relevant event categories
- **Family Context**: Consider multi-person usage at events

#### Technical Accessibility
```typescript
// Semantic HTML Structure
const SemanticStructure = {
  landmark: "main, nav, header, footer, section, article",
  headings: "h1 → h2 → h3 (proper hierarchy)",
  forms: "fieldset, legend, label[for], input[id]",
  buttons: "button (not div with click handlers)",
  images: "img[alt] or role='img' with aria-label"
}

// Skip Links for Screen Readers
const SkipLinks = [
  { href: "#main-content", text: "Skip to main content" },
  { href: "#event-gallery", text: "Skip to photo gallery" },
  { href: "#upload-section", text: "Skip to photo upload" },
  { href: "#video-messages", text: "Skip to video messages" }
]
```

This comprehensive UI design system ensures InstaMoments provides an exceptional, culturally-appropriate experience for Filipino celebrations while maintaining accessibility and usability across all devices and user demographics.