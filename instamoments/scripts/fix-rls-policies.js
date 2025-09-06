const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for photo uploads...\n');

  console.log('📋 Please run this SQL in your Supabase SQL Editor to fix RLS policies:');
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

-- Fix storage bucket policies for photos
-- Go to Storage > photos bucket > Policies and add:
-- Policy Name: "Allow public uploads"
-- Policy Type: "INSERT"
-- Policy Definition: "true"

-- Policy Name: "Allow public reads"  
-- Policy Type: "SELECT"
-- Policy Definition: "true"

-- Fix storage bucket policies for thumbnails
-- Go to Storage > thumbnails bucket > Policies and add:
-- Policy Name: "Allow public uploads"
-- Policy Type: "INSERT" 
-- Policy Definition: "true"

-- Policy Name: "Allow public reads"
-- Policy Type: "SELECT"
-- Policy Definition: "true"
  `);

  // Test current RLS policies
  console.log('\n🔍 Testing current RLS policies...');
  
  // Get a real event ID
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id')
    .limit(1);
    
  if (eventError || !events || events.length === 0) {
    console.log('❌ No events found:', eventError?.message);
    return;
  }
  
  const eventId = events[0].id;
  console.log('Using event ID:', eventId);
  
  // Test photo insert with service role (should work)
  const { data, error } = await supabase
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
    
  if (error) {
    console.log('❌ Photos insert error:', error.message);
  } else {
    console.log('✅ Photos insert successful with service role');
    
    // Clean up test record
    await supabase
      .from('photos')
      .delete()
      .eq('file_name', 'test-rls.jpg');
    console.log('✅ Test record cleaned up');
  }
}

fixRLSPolicies();
