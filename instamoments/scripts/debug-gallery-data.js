const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugGalleryData() {
  try {
    console.log('🔍 Debugging gallery data...');

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

    console.log('✅ Event found:', {
      id: event.id,
      name: event.name,
      gallery_slug: event.gallery_slug,
      status: event.status,
      total_photos: event.total_photos,
      total_contributors: event.total_contributors
    });

    // Check photos
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', event.id)
      .eq('is_approved', true)
      .order('uploaded_at', { ascending: false });

    if (photosError) {
      console.error('❌ Photos error:', photosError);
    } else {
      console.log(`✅ Found ${photos.length} photos:`);
      photos.slice(0, 3).forEach((photo, i) => {
        console.log(`  ${i + 1}. ${photo.caption} by ${photo.contributor_name}`);
        console.log(`     URL: ${photo.file_url}`);
        console.log(`     Uploaded: ${photo.uploaded_at}`);
      });
    }

    // Check contributors
    const { data: contributors, error: contributorsError } = await supabase
      .from('event_contributors')
      .select('*')
      .eq('event_id', event.id);

    if (contributorsError) {
      console.error('❌ Contributors error:', contributorsError);
    } else {
      console.log(`✅ Found ${contributors.length} contributors:`);
      contributors.slice(0, 3).forEach((contributor, i) => {
        console.log(`  ${i + 1}. ${contributor.contributor_name} (${contributor.photos_count} photos)`);
      });
    }

  } catch (error) {
    console.error('❌ Error debugging gallery:', error);
  }
}

debugGalleryData();

