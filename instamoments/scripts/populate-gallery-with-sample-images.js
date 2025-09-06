const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample images from Unsplash (free to use)
const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&crop=faces',
    caption: 'Beautiful wedding ceremony moment',
    contributor: 'Maria Santos',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop&crop=faces',
    caption: 'Cake cutting ceremony',
    contributor: 'Juan Dela Cruz',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop&crop=faces',
    caption: 'First dance as married couple',
    contributor: 'Ana Rodriguez',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&crop=faces',
    caption: 'Wedding reception decorations',
    contributor: 'Carlos Mendoza',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop&crop=faces',
    caption: 'Bouquet toss moment',
    contributor: 'Sofia Garcia',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop&crop=faces',
    caption: 'Bride and groom portrait',
    contributor: 'Miguel Torres',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=800&fit=crop&crop=faces',
    caption: 'Wedding cake close-up',
    contributor: 'Isabella Cruz',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1000&h=600&fit=crop&crop=faces',
    caption: 'Dancing with family',
    contributor: 'Roberto Silva',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=1200&fit=crop&crop=faces',
    caption: 'Wedding venue setup',
    contributor: 'Carmen Lopez',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=800&fit=crop&crop=faces',
    caption: 'Group photo with guests',
    contributor: 'Diego Martinez',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop&crop=faces',
    caption: 'Wedding rings exchange',
    contributor: 'Patricia Ramos',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=700&h=900&fit=crop&crop=faces',
    caption: 'Wedding reception dinner',
    contributor: 'Fernando Reyes',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=1000&fit=crop&crop=faces',
    caption: 'Wedding party dancing',
    contributor: 'Valentina Morales',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1000&h=800&fit=crop&crop=faces',
    caption: 'Wedding ceremony venue',
    contributor: 'Alejandro Vega',
    type: 'photo',
  },
  {
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=1100&fit=crop&crop=faces',
    caption: 'Wedding toast moment',
    contributor: 'Gabriela Herrera',
    type: 'photo',
  },
];

async function populateGalleryWithSampleImages() {
  try {
    console.log('🖼️  Populating gallery with sample images...');

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

    // Create contributors first
    const contributors = [
      ...new Set(sampleImages.map((img) => img.contributor)),
    ];
    console.log('👥 Creating contributors...');

    for (const contributorName of contributors) {
      const { error: contributorError } = await supabase
        .from('event_contributors')
        .upsert(
          {
            event_id: event.id,
            contributor_name: contributorName,
            contributor_email: `${contributorName.toLowerCase().replace(' ', '.')}@example.com`,
            photos_count: 0,
            videos_count: 0,
            first_upload_at: new Date().toISOString(),
            last_upload_at: new Date().toISOString(),
          },
          {
            onConflict: 'event_id,contributor_email',
          }
        );

      if (contributorError) {
        console.log(
          '⚠️  Contributor already exists or error:',
          contributorName
        );
      } else {
        console.log('✅ Created contributor:', contributorName);
      }
    }

    // Add sample photos
    console.log('📸 Adding sample photos...');

    for (let i = 0; i < sampleImages.length; i++) {
      const image = sampleImages[i];
      const uploadTime = new Date(Date.now() - i * 30 * 60 * 1000); // Spread over time

      const { error: photoError } = await supabase.from('photos').insert({
        event_id: event.id,
        file_url: image.url,
        thumbnail_url: image.url, // Using same URL for thumbnail
        file_name: `wedding-photo-${i + 1}.jpg`,
        file_size: Math.floor(Math.random() * 2000000) + 500000, // Random size between 500KB-2.5MB
        mime_type: 'image/jpeg',
        caption: image.caption,
        contributor_name: image.contributor,
        contributor_email: `${image.contributor.toLowerCase().replace(' ', '.')}@example.com`,
        is_approved: true,
        uploaded_at: uploadTime.toISOString(),
      });

      if (photoError) {
        console.error('❌ Error adding photo:', photoError);
      } else {
        console.log(
          `✅ Added photo ${i + 1}/${sampleImages.length}: ${image.caption}`
        );
      }
    }

    // Update event stats
    console.log('📊 Updating event statistics...');
    const { error: statsError } = await supabase
      .from('events')
      .update({
        total_photos: sampleImages.length,
        total_contributors: contributors.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', event.id);

    if (statsError) {
      console.error('❌ Error updating stats:', statsError);
    } else {
      console.log('✅ Updated event statistics');
    }

    console.log('\n🎉 Gallery populated successfully!');
    console.log(`📸 Added ${sampleImages.length} sample photos`);
    console.log(`👥 Created ${contributors.length} contributors`);
    console.log(
      '\n🌐 Visit: http://localhost:3000/gallery/gallery-test-mf71oc3a'
    );
  } catch (error) {
    console.error('❌ Error populating gallery:', error);
  }
}

populateGalleryWithSampleImages();
