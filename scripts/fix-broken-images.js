const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Working Unsplash wedding photo URLs
const workingImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=1000&fit=crop&crop=faces',
];

async function fixBrokenImages() {
  try {
    console.log('🔧 Fixing broken image URLs...');

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

    // Get all photos for this event
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', event.id)
      .order('uploaded_at', { ascending: true });

    if (photosError) {
      console.error('❌ Error fetching photos:', photosError);
      return;
    }

    console.log(`📸 Found ${photos.length} photos to update`);

    // Update each photo with a working image URL
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const newUrl = workingImages[i % workingImages.length];

      const { error: updateError } = await supabase
        .from('photos')
        .update({
          file_url: newUrl,
          thumbnail_url: newUrl,
        })
        .eq('id', photo.id);

      if (updateError) {
        console.error(`❌ Error updating photo ${photo.id}:`, updateError);
      } else {
        console.log(
          `✅ Updated photo ${i + 1}: ${photo.contributor_name} -> ${newUrl}`
        );
      }
    }

    console.log('🎉 All images have been updated with working URLs!');
  } catch (error) {
    console.error('❌ Error fixing images:', error);
  }
}

fixBrokenImages();
