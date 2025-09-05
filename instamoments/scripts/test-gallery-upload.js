const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGalleryUpload() {
  try {
    console.log('🧪 Testing gallery upload functionality...');

    // Get the test event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('gallery_slug', 'gallery-test-mf71oc3a')
      .single();

    if (eventError || !event) {
      console.error('❌ Event not found:', eventError);
      return;
    }

    console.log('✅ Found test event:', event.name);

    // Test photo upload API
    console.log('\n📸 Testing photo upload API...');
    const photoUploadResponse = await fetch('http://localhost:3000/api/upload/photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: event.id,
        contributorName: 'Test User',
        contributorEmail: 'test@example.com',
        caption: 'Test photo upload',
        // Note: In a real test, you'd need to provide actual file data
        // This is just testing the API endpoint structure
      }),
    });

    if (photoUploadResponse.ok) {
      console.log('✅ Photo upload API endpoint is accessible');
    } else {
      const errorText = await photoUploadResponse.text();
      console.log('⚠️  Photo upload API response:', photoUploadResponse.status, errorText);
    }

    // Test video upload API
    console.log('\n🎥 Testing video upload API...');
    const videoUploadResponse = await fetch('http://localhost:3000/api/upload/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: event.id,
        contributorName: 'Test User',
        contributorEmail: 'test@example.com',
        message: 'Test video upload',
      }),
    });

    if (videoUploadResponse.ok) {
      console.log('✅ Video upload API endpoint is accessible');
    } else {
      const errorText = await videoUploadResponse.text();
      console.log('⚠️  Video upload API response:', videoUploadResponse.status, errorText);
    }

    // Test gallery stats API
    console.log('\n📊 Testing gallery stats API...');
    const statsResponse = await fetch(`http://localhost:3000/api/gallery/${event.gallery_slug}/stats`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Gallery stats API working:', stats);
    } else {
      console.log('⚠️  Gallery stats API response:', statsResponse.status);
    }

    // Test gallery photos API
    console.log('\n🖼️  Testing gallery photos API...');
    const photosResponse = await fetch(`http://localhost:3000/api/gallery/${event.gallery_slug}/photos`);
    
    if (photosResponse.ok) {
      const photos = await photosResponse.json();
      console.log('✅ Gallery photos API working:', photos);
    } else {
      console.log('⚠️  Gallery photos API response:', photosResponse.status);
    }

    console.log('\n🎉 Gallery upload functionality test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Open the gallery page in your browser');
    console.log('2. Test the upload form by entering your name and email');
    console.log('3. Try uploading a test photo or video');
    console.log('4. Test the QR code scanner functionality');
    console.log('5. Verify real-time updates work');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGalleryUpload();

