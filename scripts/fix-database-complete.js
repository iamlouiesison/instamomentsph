const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabaseComplete() {
  console.log('🔧 COMPREHENSIVE DATABASE FIX');
  console.log('================================\n');

  try {
    // 1. Check current database status
    console.log('1️⃣ Checking current database status...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Could not check tables:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('✅ Current tables:', tableNames.join(', '));
    }

    // 2. Test event_contributors table
    console.log('\n2️⃣ Testing event_contributors table...');
    const { data: contributors, error: contributorsError } = await supabase
      .from('event_contributors')
      .select('id')
      .limit(1);

    if (contributorsError) {
      console.log('⚠️  event_contributors table issue:', contributorsError.message);
      console.log('\n📋 SQL TO RUN IN SUPABASE SQL EDITOR:');
      console.log(`
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

-- Enable RLS
ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_contributors_event_id ON event_contributors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_contributors_contributor_email ON event_contributors(contributor_email);
      `);
    } else {
      console.log('✅ event_contributors table is working');
    }

    // 3. Test photos table RLS
    console.log('\n3️⃣ Testing photos table RLS policies...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (eventsError || !events || events.length === 0) {
      console.log('❌ No events found for testing');
      return;
    }

    const eventId = events[0].id;
    console.log('Using event ID for testing:', eventId);

    // Test photo insert with service role (should work)
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        event_id: eventId,
        contributor_name: 'Test User',
        contributor_email: 'test@example.com',
        file_name: 'test-rls.jpg',
        file_url: 'https://example.com/test-rls.jpg',
        file_size: 1000,
        mime_type: 'image/jpeg'
      })
      .select();

    if (photoError) {
      console.log('❌ Photos insert failed:', photoError.message);
      console.log('\n📋 RLS POLICY FIX NEEDED:');
      console.log(`
-- Fix photos table RLS policies
DROP POLICY IF EXISTS "Contributors can insert photos to active events" ON photos;
DROP POLICY IF EXISTS "Anyone can insert photos to active events" ON photos;

CREATE POLICY "Allow photo uploads to active events" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.status = 'active'
    )
  );
      `);
    } else {
      console.log('✅ Photos insert working');
      
      // Clean up test record
      await supabase
        .from('photos')
        .delete()
        .eq('file_name', 'test-rls.jpg');
      console.log('✅ Test record cleaned up');
    }

    // 4. Test storage buckets
    console.log('\n4️⃣ Testing storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage buckets error:', bucketError.message);
    } else {
      const requiredBuckets = ['photos', 'videos', 'thumbnails', 'qr-codes'];
      const availableBuckets = buckets.map(b => b.name);
      const missingBuckets = requiredBuckets.filter(b => !availableBuckets.includes(b));
      
      if (missingBuckets.length > 0) {
        console.log('⚠️  Missing buckets:', missingBuckets.join(', '));
        console.log('\n📋 STORAGE BUCKET FIX:');
        console.log('Run: node scripts/create-storage-buckets.js');
      } else {
        console.log('✅ All storage buckets available');
      }
    }

    // 5. Test storage upload
    console.log('\n5️⃣ Testing storage upload...');
    const testFile = new Blob(['test content'], { type: 'image/jpeg' });
    const fileName = `test-${Date.now()}.jpg`;
    const filePath = `events/${eventId}/photos/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, testFile);
      
    if (uploadError) {
      console.log('❌ Storage upload failed:', uploadError.message);
      console.log('\n📋 STORAGE POLICY FIX NEEDED:');
      console.log(`
Go to Supabase Dashboard > Storage > Buckets and configure:

For 'photos' bucket:
- Policy Name: "Allow public uploads"
- Policy Type: "INSERT"
- Policy Definition: "true"

- Policy Name: "Allow public reads"  
- Policy Type: "SELECT"
- Policy Definition: "true"

For 'thumbnails' bucket:
- Policy Name: "Allow public uploads"
- Policy Type: "INSERT" 
- Policy Definition: "true"

- Policy Name: "Allow public reads"
- Policy Type: "SELECT"
- Policy Definition: "true"
      `);
    } else {
      console.log('✅ Storage upload working');
      
      // Clean up
      await supabase.storage
        .from('photos')
        .remove([filePath]);
      console.log('✅ Storage test cleaned up');
    }

    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    console.log('1. Apply the SQL fixes above in Supabase SQL Editor');
    console.log('2. Configure storage bucket policies in Supabase Dashboard');
    console.log('3. Run: node scripts/test-complete-functionality.js');
    console.log('4. Test photo upload in the web interface');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDatabaseComplete();
