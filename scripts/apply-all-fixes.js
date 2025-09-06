const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyAllFixes() {
  console.log('🔧 Applying all fixes to InstaMoments project...\n');

  console.log('📋 MANUAL STEPS REQUIRED:');
  console.log('Please run the following SQL in your Supabase SQL Editor:\n');
  
  console.log('1️⃣ Create event_contributors table:');
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

  console.log('\n2️⃣ Fix photos table RLS policies:');
  console.log(`
-- Fix photos table RLS policies to allow anonymous uploads
DROP POLICY IF EXISTS "Contributors can insert photos to active events" ON photos;

CREATE POLICY "Anyone can insert photos to active events" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id 
      AND events.status = 'active'
    )
  );
  `);

  console.log('\n3️⃣ Configure Storage Bucket Policies:');
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

  console.log('\n4️⃣ Test the fixes:');
  console.log('After applying the above changes, run: node scripts/test-gallery-upload.js');

  // Test current status
  console.log('\n🔍 Current Status Check:');
  
  // Check storage buckets
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.log('❌ Storage buckets error:', bucketError.message);
  } else {
    console.log('✅ Storage buckets available:', buckets.map(b => b.name).join(', '));
  }

  // Check if event_contributors table exists
  const { data: contributors, error: contributorsError } = await supabase
    .from('event_contributors')
    .select('id')
    .limit(1);

  if (contributorsError) {
    console.log('⚠️  event_contributors table:', contributorsError.message);
  } else {
    console.log('✅ event_contributors table is accessible');
  }

  // Test photo insert
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id')
    .limit(1);
    
  if (!eventError && events && events.length > 0) {
    const { data, error } = await supabase
      .from('photos')
      .insert({
        event_id: events[0].id,
        contributor_name: 'Test User',
        contributor_email: 'test@example.com',
        file_name: 'test-fix.jpg',
        file_url: 'https://example.com/test-fix.jpg',
        file_size: 1000,
        mime_type: 'image/jpeg'
      })
      .select();
      
    if (error) {
      console.log('⚠️  Photos insert test:', error.message);
    } else {
      console.log('✅ Photos insert test successful');
      
      // Clean up
      await supabase
        .from('photos')
        .delete()
        .eq('file_name', 'test-fix.jpg');
    }
  }

  console.log('\n🎉 Fix application completed!');
  console.log('Please apply the manual steps above and then test the photo upload functionality.');
}

applyAllFixes();
