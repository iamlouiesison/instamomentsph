const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPhotoUploadRLS() {
  console.log('🔧 Fixing photo upload RLS policies...\n');

  try {
    // Test current photo insert with service role
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
        file_name: 'test-rls-fix.jpg',
        file_url: 'https://example.com/test-rls-fix.jpg',
        file_size: 1000,
        mime_type: 'image/jpeg'
      })
      .select();
      
    if (error) {
      console.log('❌ Photos insert error:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
    } else {
      console.log('✅ Photos insert successful with service role');
      
      // Clean up test record
      await supabase
        .from('photos')
        .delete()
        .eq('file_name', 'test-rls-fix.jpg');
      console.log('✅ Test record cleaned up');
    }

    // Test storage upload
    console.log('\n🔍 Testing storage upload...');
    const testFile = new Blob(['test content'], { type: 'image/jpeg' });
    const fileName = `test-${Date.now()}.jpg`;
    const filePath = `events/${eventId}/photos/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, testFile);
      
    if (uploadError) {
      console.log('❌ Storage upload error:', uploadError.message);
      console.log('Error code:', uploadError.statusCode);
    } else {
      console.log('✅ Storage upload successful');
      
      // Clean up uploaded file
      await supabase.storage
        .from('photos')
        .remove([filePath]);
      console.log('✅ Storage file cleaned up');
    }

    console.log('\n📋 RLS Policy Fix Required:');
    console.log('The photo upload is failing due to RLS policies. Please run this SQL in Supabase SQL Editor:');
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

-- Also check if you need to update storage bucket policies
-- Go to Storage > photos bucket > Policies and ensure:
-- Policy Name: "Allow public uploads"
-- Policy Type: "INSERT"
-- Policy Definition: "true"
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixPhotoUploadRLS();
