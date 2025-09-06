const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Unique Unsplash wedding photo URLs - all different images
const uniqueImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1000&h=600&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1000&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=1000&fit=crop&crop=faces'
];

const captions = [
  'Beautiful wedding ceremony moment',
  'Cake cutting celebration',
  'First dance as a married couple',
  'Wedding rings exchange',
  'Bride with stunning bouquet',
  'Groom and bride outdoor photo',
  'Reception dance floor fun',
  'Wedding ceremony details',
  'Cake cutting ceremony',
  'Bride and groom portrait',
  'Wedding reception celebration',
  'Dancing with family and friends',
  'Wedding ceremony highlights',
  'Beautiful wedding decorations',
  'Memorable wedding moments'
];

const contributors = [
  'Maria Santos',
  'Roberto Silva',
  'Ana Garcia',
  'Carlos Rodriguez',
  'Isabella Martinez',
  'Miguel Torres',
  'Sofia Lopez',
  'Diego Fernandez',
  'Valentina Cruz',
  'Andres Morales',
  'Camila Vargas',
  'Sebastian Herrera',
  'Natalia Jimenez',
  'Gabriel Ruiz',
  'Daniela Castro'
];

async function updateGalleryWithUniqueImages() {
  try {
    console.log('🔄 Updating gallery with unique images...');

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

    console.log('✅ Event found:', event.name);

    // Delete all existing photos
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('event_id', event.id);

    if (deleteError) {
      console.error('❌ Error deleting existing photos:', deleteError);
      return;
    }

    console.log('🗑️ Deleted existing photos');

    // Insert new unique photos
    const photosToInsert = uniqueImages.map((imageUrl, index) => ({
      event_id: event.id,
      file_url: imageUrl,
      thumbnail_url: imageUrl,
      file_name: `wedding-photo-${index + 1}.jpg`,
      file_size: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
      mime_type: 'image/jpeg',
      caption: captions[index],
      contributor_name: contributors[index],
      uploaded_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
      is_approved: true
    }));

    const { data: photos, error: insertError } = await supabase
      .from('photos')
      .insert(photosToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting photos:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${photos.length} unique photos`);

    // Update event statistics
    const { error: updateError } = await supabase
      .from('events')
      .update({
        total_photos: photos.length,
        total_contributors: new Set(contributors).size,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id);

    if (updateError) {
      console.error('❌ Error updating event stats:', updateError);
      return;
    }

    console.log('📊 Updated event statistics');
    console.log('🎉 Gallery updated with unique images!');
    console.log(`📸 Total photos: ${photos.length}`);
    console.log(`👥 Unique contributors: ${new Set(contributors).size}`);

  } catch (error) {
    console.error('❌ Error updating gallery:', error);
  }
}

updateGalleryWithUniqueImages();
