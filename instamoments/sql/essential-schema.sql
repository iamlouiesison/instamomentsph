-- Essential Database Schema for InstaMoments
-- Run this in the Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'guest',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  payment_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  qr_code_url TEXT NOT NULL,
  gallery_slug TEXT UNIQUE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  max_photos INTEGER DEFAULT 30,
  max_photos_per_user INTEGER DEFAULT 3,
  storage_days INTEGER DEFAULT 3,
  has_video_addon BOOLEAN DEFAULT FALSE,
  requires_moderation BOOLEAN DEFAULT FALSE,
  allow_downloads BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  custom_message TEXT,
  total_photos INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  total_contributors INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Event hosts can manage their events" ON events
  FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Public events viewable by all" ON events
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Anyone can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  exif_data JSONB
);

-- Enable RLS on photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for photos
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

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  mime_type TEXT NOT NULL,
  caption TEXT,
  is_greeting BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for videos
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
    )
  );

-- Update events table to include video limits
ALTER TABLE events ADD COLUMN IF NOT EXISTS video_limit INTEGER DEFAULT 20;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_videos_per_user INTEGER DEFAULT 5;

-- Create event_contributors table
CREATE TABLE IF NOT EXISTS event_contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  total_photos INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMPTZ,
  UNIQUE(event_id, contributor_email)
);

-- Enable RLS on event_contributors
ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_contributors
CREATE POLICY "Event contributors viewable by all for public events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.is_public = TRUE
      AND events.status = 'active'
    )
  );

CREATE POLICY "Event hosts can view contributors in their events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert contributors to active events" ON event_contributors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_gallery_slug ON events(gallery_slug);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_videos_event_id ON videos(event_id);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_event_contributors_event_id ON event_contributors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_contributors_contributor_email ON event_contributors(contributor_email);
