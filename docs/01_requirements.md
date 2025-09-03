# Project Requirements

## What We're Building

### One-Line Vision
**InstaMoments is a Progressive Web App that creates instant collaborative photo and video galleries for Filipino events through QR code access, enabling real-time memory sharing and personal video greetings for complete event experiences.**

### Project Identity

**Project Name**: **InstaMoments**

**Executive Summary**: InstaMoments is a Progressive Web App designed specifically for Filipino event culture that enables instant collaborative photo and video galleries through QR code scanning. Attendees can immediately contribute photos, add personal messages, and record 20-second video greetings, creating comprehensive real-time event albums that everyone can view and interact with during and after celebrations.

**Project Type**:
- [x] PWA (Progressive Web App)
- [ ] Native Mobile App
- [ ] SaaS Platform
- [ ] E-commerce Platform
- [ ] Content Platform
- [ ] Internal Tool

## Problem & Solution

### The Core Problem
Photo and video sharing at Filipino events is completely broken. Guests forget to share photos after long celebrations end, hosts miss candid moments they weren't present for during busy events, photos are scattered everywhere across Facebook, Viber groups, individual phones, and messaging apps. Video messages get lost in different platforms and group chats, there's no easy central collection method, memories stay fragmented across devices, quality is lost through messaging apps and social media compression, app download friction prevents participation from all attendees, personal video greetings are difficult to organize and collect, and event memories fade because photos and videos never get properly organized or shared.

### Why This Problem Matters Now
The Philippine market has reached a perfect convergence point: mobile-first smartphone adoption is nearly universal with everyone comfortable using camera apps and QR codes (mainstream since COVID contact tracing), Filipino celebration culture involves long events with extensive family participation and photo-obsessed sharing behaviors, digital payment adoption through GCash and digital wallets became mainstream post-COVID, and there's high social media engagement where Filipinos love sharing moments and memories online. Additionally, video message traditions and personal greetings are deeply cultural, and the "pasalip" culture means everyone wants to contribute something special to celebrations.

### Our Solution Approach
InstaMoments uniquely solves this through a PWA approach that eliminates app download friction - users scan QR codes and their camera opens immediately in the browser. We create real-time galleries where people love seeing content appear live during events, implement smart photo limits that create upgrade pressure while controlling expenses, and offer video greeting uniqueness that no competitors provide in this specific QR + PWA + Video combination. Our approach is perfectly optimized for Filipino celebration culture with aggressive technical optimization that maintains quality while controlling storage costs.

### Why We Can Win
We have first-mover advantage in the Philippine market with this specific QR + PWA + Video approach, deep industry connections that provide immediate customer acquisition channels, price points optimized for Philippine market purchasing power, cultural understanding of Filipino celebration and memory-sharing habits, local payment method integration with GCash, PayMaya, and over-the-counter options, Philippines Data Privacy Act compliance that builds trust with local users, and video feature differentiation that provides unique emotional value proposition.

## Target Users

### Primary User Persona
**Maria Santos, Wedding Planner & Event Coordinator, 32, manages 15-20 weddings per year in Metro Manila**

- **Specific Demographics**: Female, 28-40 years old, college educated, manages events professionally or as side business, tech-savvy with social media, earns ₱40,000-80,000 monthly, based in Metro Manila or major Philippine cities
- **Current Pain Points**: Manually collecting photos from 10+ vendors and 100+ guests after events, dealing with low-quality compressed images from messaging apps, spending hours organizing scattered photos across platforms, missing candid moments during busy event coordination, struggling to get video greetings from all important guests
- **Current Solutions & Why They Fail**: Uses Facebook groups (guests don't post), Viber message forwarding (compression issues), manually asking photographers and guests (incomplete collection), Google Photos sharing (guests don't use), traditional video recording (difficult to organize and collect from everyone)
- **Technical Proficiency**: High social media usage, comfortable with QR codes and mobile apps, uses digital payment methods like GCash regularly, familiar with cloud storage and photo sharing
- **Jobs to Be Done**: Capture complete event memories without missing moments, collect photos and videos from all attendees seamlessly, present professional memory packages to clients, reduce post-event administrative work, ensure no important memories are lost
- **Trigger for Seeking Solution**: Frustrated client asking where all the photos are, realizing amazing moments weren't captured, spending entire weekends trying to collect photos from guests, competitors offering better memory services

### Secondary User Groups
**Corporate Event Managers** - Planning company celebrations, team building events, and corporate parties, need professional memory collection without complexity. **Family Event Hosts** - Organizing birthday parties, debuts, anniversaries, and family reunions, want to ensure all relatives contribute photos and videos. **Wedding Couples** - Want to capture every moment of their special day from all guests' perspectives, especially personal video messages from loved ones.

## Core Features (MVP)

### Absolutely Must Work (Ship Blockers)

1. **QR Code Event Creation & Instant Camera Access**:
   - User Story: As an event host, I want to create an event and generate QR codes so that guests can instantly access their camera in the browser and start contributing photos
   - Acceptance Criteria:
     - Event creation form with event name, date, and basic settings
     - Generate printable QR codes that link to event-specific camera interface
     - QR code scanning opens mobile camera immediately in browser without app download
     - Support for both Android and iOS browsers with fallback to file picker
     - Auto-save contributed photos to contributor's device gallery
   - Why Critical: This is the core user experience that differentiates us from competitors - if QR-to-camera doesn't work seamlessly, the entire product fails
   - Success Metric: 90%+ of QR code scans successfully open camera interface within 3 seconds

2. **Real-time Event Gallery with Photo Messages**:
   - User Story: As an event attendee, I want to upload photos with personal messages and see them appear instantly in a shared gallery so that everyone can view and enjoy memories as they're created
   - Acceptance Criteria:
     - Real-time photo uploads with immediate gallery updates for all viewers
     - Photo message/caption functionality for personal notes and context
     - Responsive gallery view that works perfectly on mobile devices
     - Simple attendee registration (name/email) for photo contributors
     - Gallery accessible via same QR code for viewing and contributing
   - Why Critical: Real-time sharing creates engagement and excitement during events - without this, it's just another photo collection tool
   - Success Metric: Photos appear in gallery within 5 seconds of upload, 70%+ of contributors add messages to photos

3. **Video Greetings Recording & Playback**:
   - User Story: As an event attendee, I want to record 20-second video messages for the host so that they have personal greetings and well-wishes from all guests
   - Acceptance Criteria:
     - In-browser video recording with 20-second limit
     - High-quality video compression for storage optimization
     - Video playback within the event gallery
     - Video messages stored securely and accessible to event hosts
     - Works on both mobile and desktop browsers
   - Why Critical: Video greetings are culturally essential in Filipino celebrations and represent our key differentiation from competitors
   - Success Metric: 40%+ of event contributors record video messages, videos load and play within 3 seconds

### Should Work Well (Fast Follows)
- **Photo Moderation Controls**: Host ability to approve photos before they go live in gallery
- **Email Gallery Sharing**: Automatically email gallery links to all contributors post-event
- **Social Media Integration**: Easy sharing to Facebook and Instagram (huge in Philippine market)
- **Custom Event Themes**: Branded galleries with event colors and basic customization
- **Professional Gallery Layouts**: Beautiful presentation modes for viewing completed event albums

### Would Be Nice (Post-Validation)
- **Offline Capability**: PWA works with spotty connections, syncs when stable
- **Print Services Integration**: Order photo books and prints directly from galleries
- **Advanced Analytics**: Event engagement insights for professional planners
- **Venue Partnership Integration**: Built-in InstaMoments for partner venues
- **Extended Video Features**: Video compilation tools and effects

## What We're NOT Building

### Explicit Non-Features (Scope Protection)
- **NOT building**: Complex event planning tools - Because: We're focused on memory capture, not event management
- **NOT building**: Social networking features - Because: We're a utility, not a social platform
- **NOT building**: Advanced photo editing tools - Because: Keeps interface simple and reduces development complexity
- **NOT building**: Multiple event templates or themes at launch - Because: Focus on core functionality over customization
- **NOT building**: Desktop applications - Because: Mobile-first approach matches our target market behavior

### Technical Debt We're Accepting
- Using Supabase Storage instead of building custom CDN infrastructure
- Hardcoding Philippines payment methods instead of making internationally configurable
- Manual content moderation process until scale demands automated systems
- Basic email notifications instead of comprehensive communication system

## User Journeys

### The Critical Path (Must Be Flawless)
```
Scan QR Code → Camera Opens Instantly → Take Photo → Add Message → Upload → Appears in Real-time Gallery → Success
```

### Primary User Flow
```
Event Host Creates Event → Generates QR Codes → Prints/Displays QR Codes at Event → Guests Scan → Contribute Photos/Videos → View Gallery → Post-Event Access → Memory Preservation
```

### Supporting User Paths
**Video Greeting Path**: QR Scan → Record 20-second Message → Upload → Host Reviews → Added to Event Memories
**Gallery Viewing Path**: QR Scan → Browse Photos → View Video Messages → Share Favorites → Download Memories
**Post-Event Path**: Email Link → Access Gallery → Download Photos → Share with Others → Purchase Prints (future)

## Business Model

### Monetization Strategy

#### Pricing Philosophy
Value-based pricing optimized for Philippine market purchasing power, creating natural upgrade pressure through smart feature limitations while ensuring accessibility for all event types. Pricing designed to capture maximum value during peak wedding season (December-February) while maintaining year-round viability.

#### Pricing Tiers

**Free Tier**:
- Included: 30 photos per event (3 photos per user max), 3-day storage, basic photo sharing and gallery, standard gallery view, compressed quality (WebP, 600px max)
- Limitations: InstaMoments watermark, no video greetings, basic features only
- Goal: User acquisition and viral growth during events

**Basic** (₱699/event):
- Target: Small gatherings and intimate celebrations
- Key Value: 50 photos per event (5 photos per user max), 7-day storage, photo messages/captions, no watermarks, basic customer support, standard compression (WebP, 800px max)
- Limitations: No video greetings, basic customization only

**Standard** (₱999/event) - **Most Popular**:
- Target: Wedding receptions, birthday parties, corporate events
- Key Value: 100 photos per event (5 photos per user max), 14-day storage, email gallery sharing, social media integration, priority processing, custom event themes, priority customer support
- Why Most Users Choose This: Perfect balance of features and price for typical Filipino celebrations
- **Video Add-on: +₱600** (Total: ₱1,599) - 20-second video greetings with full functionality

**Premium** (₱1,999/event):
- Target: Large weddings, major corporate celebrations
- Key Value: 250 photos per event (5 photos per user max), 30-day storage, all premium features, advanced moderation controls, professional gallery layouts, photo album export options, dedicated customer support
- **Video Add-on: +₱1,200** (Total: ₱3,199) - Enhanced video features and extended storage

**Pro** (₱3,499/event):
- Target: Wedding planners, major corporate events, multi-day celebrations
- Key Value: 500 photos per event (5 photos per user max), 30-day storage, custom event branding, advanced analytics, dedicated event coordinator assistance, priority processing, high-quality image retention
- **Video Add-on: +₱2,100** (Total: ₱5,599) - Full video suite with compilation tools

### Revenue Model
- Billing: Per-event pricing with package upgrades during event creation
- Payment Methods: GCash (primary), PayMaya, bank transfers, over-the-counter payments, credit/debit cards
- Revenue Streams: Event packages (80%), video add-ons (15%), premium template upgrades (5%)
- Refund Policy: Full refund if event canceled 24 hours before, partial refund for technical issues

## Success Definition

### Binary Success Metric (The One Metric)
Success = **100 paid events completed successfully within 6 months of launch**

This metric encompasses user acquisition, product reliability, payment conversion, and market validation. Each paid event represents multiple satisfied users (host + attendees) and validates both product-market fit and sustainable revenue generation.

### Launch Success Indicators
- **User Acquisition Target**: 500+ unique users across 50 events in first month
- **Activation Rate Target**: 70% of QR code scanners successfully contribute at least one photo
- **Core Feature Usage**: Real-time gallery viewing rate of 80%+ during events
- **Performance Benchmarks**: Camera-to-upload time under 10 seconds, gallery load time under 3 seconds
- **User Feedback Threshold**: Net Promoter Score above 50 from event hosts

### Growth Success Indicators
- **Retention Metric**: 40% of event hosts create a second event within 3 months
- **Growth Rate**: 25% month-over-month increase in event creation
- **Revenue Metrics**: ₱50,000 monthly recurring revenue by month 6, 35% conversion rate from free to paid tiers
- **User Satisfaction (NPS/CSAT)**: NPS above 60, customer satisfaction above 4.5/5 stars
- **Organic Growth Percentage**: 50% of new events come from referrals or word-of-mouth

### Health Metrics (Warning Signs)
- If QR-to-camera success rate drops below 85% → Investigate browser compatibility issues immediately
- If real-time gallery sync takes longer than 8 seconds → Scale infrastructure and optimize uploads
- If video greeting adoption falls below 25% → Review pricing strategy and user experience flow
- If monthly churn rate exceeds 15% → Analyze user feedback and improve retention features

## Product Principles & Constraints

### Design Principles
1. **Mobile-First Filipino Experience**: Every feature must work perfectly on Android devices with slower connections, reflecting the dominant mobile usage in the Philippines and ensuring accessibility across all socioeconomic levels
2. **Cultural Celebration Integration**: Design for extended Filipino celebrations with large families, multiple generations, and emphasis on personal connections and video messages that reflect deep cultural values
3. **Instant Gratification**: Users should see immediate value within 30 seconds of QR code scan, with photos appearing in galleries instantly and video messages recording seamlessly to match the excitement of live events
4. **Inclusive Accessibility**: Works for all ages and technical skill levels commonly found at Filipino family celebrations, from tech-savvy millennials to older family members who may be less comfortable with technology
5. **Quality with Efficiency**: Maintain professional photo and video quality while optimizing for cost-effective storage and bandwidth management necessary for sustainable business operations

### Technical Requirements
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions) with special focus on mobile Chrome for Android
- **Mobile Support**: Responsive web design required, PWA installable, works offline for basic viewing
- **Performance**: Core Web Vitals in "Good" range, camera access within 3 seconds, photo uploads complete within 10 seconds
- **Accessibility**: WCAG 2.1 AA compliance for screen readers, keyboard navigation, and high contrast support
- **Data Privacy**: Philippines Data Privacy Act (DPA 2012) compliant, GDPR-style user rights, secure data handling
- **Uptime Target**: 99.9% availability during peak wedding season (December-February)

### User Experience Requirements
- **Time to First Value**: Users achieve first photo upload within 60 seconds of QR code scan
- **Learning Curve**: Core photo and video features learnable without documentation or instruction
- **Error Recovery**: All errors must have clear recovery paths with helpful messaging in simple language
- **Cross-Generation Usability**: Interface must work for users from teenage cousins to grandparents at family events

## Competitive Landscape

### Why Existing Solutions Fail
- **WedShoots** exists but feels clunky and expensive, focuses only on weddings rather than broader Filipino celebration culture, lacks localization for Philippine market pricing and payment methods
- **TouchPix and similar apps** require expensive app downloads and complex setup that creates friction, especially problematic for older family members and those with limited storage space on their devices
- **International solutions** are not tailored for Filipino celebration culture, don't support local payment methods like GCash, and have pricing structures inappropriate for Philippine market purchasing power
- **Facebook groups and Viber sharing** result in scattered photos across platforms, compression quality loss, incomplete collection as not everyone participates, and no organized way to collect video messages
- **Local competitors** currently have no major players doing this specific QR + PWA + Video approach, creating significant first-mover advantage opportunity

### Our Differentiation Strategy
We win through **Better User Experience** (QR codes eliminate app download friction), **Faster Implementation** (instant camera access vs complex setup), **Culturally Appropriate** (designed for Filipino celebration patterns), and **Unique Integration** (video greetings + photos in single platform). Our approach is specifically **Simpler** than complex wedding platforms while being **Different** through PWA technology and cultural focus.

### Competitive Positioning

| Competitor | Their Focus | Their Weakness | Our Advantage |
|------------|------------|----------------|---------------|
| WedShoots | Wedding-only photo sharing | Complex setup, expensive, not localized | Broader events, QR simplicity, PH-optimized pricing |
| Facebook Groups | Social photo sharing | Scattered organization, quality loss | Real-time galleries, professional quality |
| Traditional Photography | Professional event coverage | Missing guest perspectives, no video messages | Comprehensive guest participation, video greetings |

### Moat Building
- **Short-term**: First-mover advantage in Philippine market with QR+PWA approach, strong cultural understanding and local payment integration
- **Medium-term**: Network effects as satisfied hosts become repeat customers, venue partnerships creating integrated experiences
- **Long-term**: Brand recognition as the standard for Filipino event memory capture, proprietary technology optimizations, exclusive venue partnerships

## Risk Assessment & Mitigation

### Critical Risks

| Risk | Impact | Likelihood | Mitigation Strategy | Early Warning Signs |
|------|--------|------------|-------------------|-------------------|
| Browser camera API limitations break core functionality | High | Medium | Extensive cross-browser testing, fallback to file upload, partnership with browser vendors for optimization | Users reporting camera failures, support tickets about access issues |
| Seasonal revenue concentration (80% in 6 months) | High | High | Build cash reserves during peak seasons, develop corporate event channels for year-round revenue, expand to other SE Asian markets | Revenue dropping sharply after wedding season, limited corporate adoption |
| Storage costs scale faster than revenue | Medium | Medium | Aggressive compression strategies, tiered storage with automatic deletion, smart photo limits that encourage upgrades | Storage costs exceeding 40% of revenue, user behavior patterns showing heavy usage |

### Assumptions We're Making
1. **QR codes will remain familiar to Filipino users post-COVID**: Validate through early user testing and feedback during beta launch
2. **Video messages are culturally important enough to pay for**: Validate through conversion rate analysis of video add-on sales
3. **GCash adoption sufficient for payment processing**: Validate through payment method usage analytics and consider additional options
4. **Mobile internet speeds adequate for photo/video upload**: Validate through performance testing across different Philippine networks and locations

## Project Evolution Path

### MVP → V1 → V2 Progression

**MVP** (Validation Phase):
- Core: QR code event creation, instant photo sharing, basic video messages, simple gallery viewing, GCash payment integration
- Success looks like: 50 successful events in 3 months, 60% user satisfaction, proof that QR-to-camera workflow functions reliably

**V1** (Product-Market Fit):
- Additions: Advanced gallery features, social media sharing, email notifications, basic event analytics, expanded payment options
- Success looks like: 200 events per month, 40% repeat usage, sustainable unit economics, positive word-of-mouth growth

**V2** (Scale):
- Additions: Venue partnerships, advanced video features, print service integration, corporate event packages, Southeast Asian expansion
- Success looks like: 1000+ events per month, profitable growth, market leadership position, expansion opportunities

### Feature Rollout Strategy
- **Data-driven**: Based on user engagement metrics, conversion rate optimization, and feature usage analytics
- **User-driven**: Based on customer feedback surveys, support ticket analysis, and direct user interviews
- **Strategic**: Based on competitive positioning, seasonal opportunities, and partnership development needs

## Open Questions & Decisions

### Questions Needing Answers
1. **What is the optimal photo limit per user to balance cost and user satisfaction?**: Test during beta with different limits and measure both usage patterns and user feedback (Decision needed: Before public launch)
2. **Should we require email registration for all photo contributors or allow anonymous uploads?**: Balance user privacy preferences with host contact management needs (Decision needed: During MVP development)
3. **How much video storage can we afford at each pricing tier while maintaining profitability?**: Analyze video compression options and storage costs vs. pricing structure (Decision needed: Before video feature launch)

### Decisions to Revisit Post-Launch
1. **Freemium vs. trial model**: Currently using freemium, but may reconsider based on conversion rates and user acquisition costs (Trigger: If conversion rate below 20% or CAC exceeds LTV)
2. **Geographic expansion strategy**: Starting Philippines-only, will reconsider expansion to other Southeast Asian markets (Trigger: After reaching 500 events per month consistently)
3. **Video message length limit**: Currently 20 seconds, may adjust based on user behavior and storage costs (Trigger: If storage costs exceed projections or user feedback indicates need for longer messages)