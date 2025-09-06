const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPhotoInsert() {
  console.log('🔍 Testing photo insert with real event ID...');
  
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
  
  // Try to insert a test photo record
  const { data, error } = await supabase
    .from('photos')
    .insert({
      event_id: eventId,
      contributor_name: 'Test User',
      contributor_email: 'test@example.com',
      file_name: 'test.jpg',
      file_url: 'https://example.com/test.jpg',
      file_size: 1000,
      mime_type: 'image/jpeg'
    })
    .select();
    
  if (error) {
    console.log('❌ Photos insert error:', error.message);
    console.log('Code:', error.code);
  } else {
    console.log('✅ Photos insert successful');
    
    // Clean up test record
    await supabase
      .from('photos')
      .delete()
      .eq('file_name', 'test.jpg');
    console.log('✅ Test record cleaned up');
  }
}

testPhotoInsert();
