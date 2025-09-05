-- InstaMoments Database Schema
-- Complete database setup for the InstaMoments PWA

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TABLES
-- =============================================

-- User Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'guest' CHECK (user_type IN ('host', 'guest', 'planner')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'standard', 'premium', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'past_due')),
  payment_customer_id TEXT, -- PayMongo customer ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'corporate', 'graduation', 'anniversary', 'debut', 'other')),
  event_date DATE,
  location TEXT,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  qr_code_url TEXT NOT NULL,
  gallery_slug TEXT UNIQUE NOT NULL, -- For public gallery access
  
  -- Subscription & Limits
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'standard', 'premium', 'pro')),
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
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Based on storage_days
);

-- Photos Table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
  
  CONSTRAINT photos_file_size_check CHECK (file_size > 0 AND file_size <= 10485760), -- Max 10MB
  CONSTRAINT photos_mime_type_check CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp'))
);

-- Videos Table  
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  CONSTRAINT videos_file_size_check CHECK (file_size > 0 AND file_size <= 52428800), -- Max 50MB
  CONSTRAINT videos_duration_check CHECK (duration_seconds > 0 AND duration_seconds <= 20), -- Max 20 seconds
  CONSTRAINT videos_mime_type_check CHECK (mime_type IN ('video/mp4', 'video/webm', 'video/mov'))
);

-- Event Contributors (for tracking who contributed)
CREATE TABLE event_contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment Details
  amount_cents INTEGER NOT NULL, -- Amount in centavos
  currency TEXT DEFAULT 'PHP',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'paymaya', 'card', 'otc')),
  payment_provider TEXT DEFAULT 'paymongo',
  external_payment_id TEXT NOT NULL, -- PayMongo payment intent ID
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  
  -- Subscription Details  
  tier_purchased TEXT NOT NULL CHECK (tier_purchased IN ('basic', 'standard', 'premium', 'pro')),
  has_video_addon BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT payments_amount_check CHECK (amount_cents > 0)
);

-- Analytics Events (for tracking user behavior)
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('qr_scan', 'photo_upload', 'video_record', 'gallery_view', 'event_created', 'payment_completed')),
  properties JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Events indexes
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_gallery_slug ON events(gallery_slug);
CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_events_expires_at ON events(expires_at);

-- Photos indexes
CREATE INDEX idx_photos_event_id ON photos(event_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at);
CREATE INDEX idx_photos_contributor_id ON photos(contributor_id);
CREATE INDEX idx_photos_is_approved ON photos(is_approved);

-- Videos indexes
CREATE INDEX idx_videos_event_id ON videos(event_id);
CREATE INDEX idx_videos_uploaded_at ON videos(uploaded_at);
CREATE INDEX idx_videos_contributor_id ON videos(contributor_id);
CREATE INDEX idx_videos_processing_status ON videos(processing_status);

-- Contributors indexes
CREATE INDEX idx_contributors_event_id ON event_contributors(event_id);
CREATE INDEX idx_contributors_email ON event_contributors(contributor_email);

-- Payments indexes
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_external_id ON payments(external_payment_id);

-- Analytics indexes
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_event_id ON analytics_events(event_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events Policies
CREATE POLICY "Event hosts can manage their events" ON events
  FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Public events viewable by all" ON events
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Anyone can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Photos Policies
CREATE POLICY "Event photos viewable by all for public events" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.is_public = TRUE
      AND events.status = 'active'
    )
  );

CREATE POLICY "Event hosts can view all photos in their events" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can insert photos to active events" ON photos
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

CREATE POLICY "Event hosts can delete photos" ON photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Videos Policies
CREATE POLICY "Event videos viewable by all for public events" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.is_public = TRUE
      AND events.status = 'active'
    )
  );

CREATE POLICY "Event hosts can view all videos in their events" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can insert videos to active events" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.status = 'active'
      AND events.has_video_addon = TRUE
    )
  );

CREATE POLICY "Event hosts can moderate videos" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Event hosts can delete videos" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = videos.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Event Contributors Policies
CREATE POLICY "Contributors viewable for public events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.is_public = TRUE
    )
  );

CREATE POLICY "Event hosts can view contributors" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert contributor records" ON event_contributors
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "System can update contributor counts" ON event_contributors
  FOR UPDATE USING (TRUE);

-- Payments Policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event hosts can view payments for their events" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = payments.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Analytics Policies
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Event hosts can view analytics for their events" ON analytics_events
  FOR SELECT USING (
    event_id IS NULL OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = analytics_events.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update event metadata when photos/videos are added
CREATE OR REPLACE FUNCTION update_event_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'photos' THEN
        UPDATE events 
        SET total_photos = total_photos + 1,
            updated_at = NOW()
        WHERE id = NEW.event_id;
        
        -- Update contributor stats
        INSERT INTO event_contributors (event_id, contributor_name, contributor_email, photos_count, last_contribution_at)
        VALUES (NEW.event_id, NEW.contributor_name, COALESCE(NEW.contributor_email, ''), 1, NOW())
        ON CONFLICT (event_id, contributor_email)
        DO UPDATE SET 
            photos_count = event_contributors.photos_count + 1,
            last_contribution_at = NOW();
            
    ELSIF TG_TABLE_NAME = 'videos' THEN
        UPDATE events 
        SET total_videos = total_videos + 1,
            updated_at = NOW()
        WHERE id = NEW.event_id;
        
        -- Update contributor stats
        INSERT INTO event_contributors (event_id, contributor_name, contributor_email, videos_count, last_contribution_at)
        VALUES (NEW.event_id, NEW.contributor_name, COALESCE(NEW.contributor_email, ''), 1, NOW())
        ON CONFLICT (event_id, contributor_email)
        DO UPDATE SET 
            videos_count = event_contributors.videos_count + 1,
            last_contribution_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for metadata updates
CREATE TRIGGER update_event_metadata_on_photo_insert
    AFTER INSERT ON photos
    FOR EACH ROW EXECUTE FUNCTION update_event_metadata();

CREATE TRIGGER update_event_metadata_on_video_insert
    AFTER INSERT ON videos
    FOR EACH ROW EXECUTE FUNCTION update_event_metadata();

-- Function to set event expiration
CREATE OR REPLACE FUNCTION set_event_expiration()
RETURNS TRIGGER AS $$
BEGIN
    NEW.expires_at = NEW.created_at + INTERVAL '1 day' * NEW.storage_days;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for event expiration
CREATE TRIGGER set_event_expiration_on_insert
    BEFORE INSERT ON events
    FOR EACH ROW EXECUTE FUNCTION set_event_expiration();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE BUCKETS SETUP
-- =============================================

-- Create storage buckets (these will be created via Supabase dashboard or API)
-- Note: Storage buckets are created via the Supabase dashboard or API calls
-- The following is documentation of what buckets should be created:

/*
Required Storage Buckets:

1. photos
   - Public access
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - Path: events/{event_id}/photos/{file_name}

2. videos  
   - Public access
   - File size limit: 50MB
   - Allowed MIME types: video/mp4, video/webm, video/mov
   - Path: events/{event_id}/videos/{file_name}

3. thumbnails
   - Public access
   - File size limit: 1MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - Path: events/{event_id}/thumbnails/{file_name}

4. qr-codes
   - Public access
   - File size limit: 1MB
   - Allowed MIME types: image/png, image/svg+xml
   - Path: events/{event_id}/qr-codes/{file_name}

Storage Policies (RLS for storage):
- Public read access for all buckets
- Event hosts can upload/delete files in their event folders
- Contributors can upload to active events only
- Automatic cleanup based on event expiration
*/
