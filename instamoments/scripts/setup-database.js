#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates the necessary tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log('🚀 Setting up InstaMoments database...\n');

  try {
    // Create profiles table
    console.log('1️⃣ Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL,
          full_name TEXT,
          phone_number TEXT,
          avatar_url TEXT,
          user_type TEXT DEFAULT 'guest' CHECK (user_type IN ('host', 'guest', 'planner')),
          subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'standard', 'premium', 'pro')),
          subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'past_due')),
          payment_customer_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (profilesError) {
      console.log(`   ⚠️  Profiles table: ${profilesError.message}`);
    } else {
      console.log('   ✅ Profiles table created');
    }

    // Enable RLS on profiles
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    });

    // Create profiles policies
    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
      `
    });

    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    });

    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    });

    // Create events table
    console.log('\n2️⃣ Creating events table...');
    const { error: eventsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          event_type TEXT NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'corporate', 'graduation', 'anniversary', 'debut', 'other')),
          event_date DATE,
          location TEXT,
          host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          qr_code_url TEXT NOT NULL,
          gallery_slug TEXT UNIQUE NOT NULL,
          subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'standard', 'premium', 'pro')),
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
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ
        );
      `
    });

    if (eventsError) {
      console.log(`   ⚠️  Events table: ${eventsError.message}`);
    } else {
      console.log('   ✅ Events table created');
    }

    // Enable RLS on events
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE events ENABLE ROW LEVEL SECURITY;'
    });

    // Create events policies
    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Event hosts can manage their events" ON events;
        CREATE POLICY "Event hosts can manage their events" ON events
          FOR ALL USING (auth.uid() = host_id);
      `
    });

    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Public events viewable by all" ON events;
        CREATE POLICY "Public events viewable by all" ON events
          FOR SELECT USING (is_public = TRUE);
      `
    });

    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Anyone can create events" ON events;
        CREATE POLICY "Anyone can create events" ON events
          FOR INSERT WITH CHECK (auth.uid() = host_id);
      `
    });

    // Create photos table
    console.log('\n3️⃣ Creating photos table...');
    const { error: photosError } = await supabase.rpc('exec', {
      sql: `
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
          exif_data JSONB,
          CONSTRAINT photos_file_size_check CHECK (file_size > 0 AND file_size <= 10485760),
          CONSTRAINT photos_mime_type_check CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp'))
        );
      `
    });

    if (photosError) {
      console.log(`   ⚠️  Photos table: ${photosError.message}`);
    } else {
      console.log('   ✅ Photos table created');
    }

    // Enable RLS on photos
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE photos ENABLE ROW LEVEL SECURITY;'
    });

    // Create photos policies
    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Event photos viewable by all for public events" ON photos;
        CREATE POLICY "Event photos viewable by all for public events" ON photos
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM events 
              WHERE events.id = photos.event_id 
              AND events.is_public = TRUE
              AND events.status = 'active'
            )
          );
      `
    });

    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Event hosts can view all photos in their events" ON photos;
        CREATE POLICY "Event hosts can view all photos in their events" ON photos
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM events 
              WHERE events.id = photos.event_id 
              AND events.host_id = auth.uid()
            )
          );
      `
    });

    await supabase.rpc('exec', {
      sql: `
        DROP POLICY IF EXISTS "Contributors can insert photos to active events" ON photos;
        CREATE POLICY "Contributors can insert photos to active events" ON photos
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM events 
              WHERE events.id = photos.event_id 
              AND events.status = 'active'
            )
          );
      `
    });

    // Create function to handle new user profile creation
    console.log('\n4️⃣ Creating user profile function...');
    const { error: functionError } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, full_name)
            VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
            RETURN NEW;
        END;
        $$ language 'plpgsql' SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.log(`   ⚠️  User function: ${functionError.message}`);
    } else {
      console.log('   ✅ User profile function created');
    }

    // Create trigger for new user profile creation
    await supabase.rpc('exec', {
      sql: `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    console.log('\n🎉 Database setup completed!');
    console.log('💡 You can now test the sign-in functionality.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
setupDatabase().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
