const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// The specific broken image URL
const brokenImageUrl =
  'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop&crop=faces';

// Working replacement image
const workingImageUrl =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=faces';

async function fixSpecificBrokenImage() {
  try {
    console.log('🔍 Fixing specific broken image URL...');

    // Get the test event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('gallery_slug', 'gallery-test-mf71oc3a')
      .single();

    if (eventError || !event) {
      console.error('❌ Event not found:', eventError);
      return;
    }

    // Find photos with the broken URL
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, file_url, thumbnail_url')
      .eq('event_id', event.id)
      .or(`file_url.eq.${brokenImageUrl},thumbnail_url.eq.${brokenImageUrl}`);

    if (photosError) {
      console.error('❌ Error fetching photos:', photosError);
      return;
    }

    if (photos.length === 0) {
      console.log('✅ No photos found with the broken URL.');
      return;
    }

    console.log(`Found ${photos.length} photos with broken URL`);

    // Update each photo with the working URL
    let updatedCount = 0;
    for (const photo of photos) {
      const updateData = {};

      if (photo.file_url === brokenImageUrl) {
        updateData.file_url = workingImageUrl;
      }

      if (photo.thumbnail_url === brokenImageUrl) {
        updateData.thumbnail_url = workingImageUrl;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('photos')
          .update(updateData)
          .eq('id', photo.id);

        if (updateError) {
          console.error(`❌ Error updating photo ${photo.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Updated photo ${photo.id}`);
        }
      }
    }

    console.log(
      `✅ Successfully updated ${updatedCount} photos with working image URL.`
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    process.exit(0);
  }
}

fixSpecificBrokenImage();
