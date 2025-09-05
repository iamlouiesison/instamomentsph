const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createGalleryTestEvent() {
  try {
    console.log('🧪 Creating gallery test event...');

    // Create a test user first
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'gallery-test@instamoments.ph',
      password: 'testpassword123',
      email_confirm: true,
    });

    if (userError && userError.code !== 'email_exists') {
      console.error('❌ Error creating test user:', userError);
      return;
    }

    const userId = userData?.user?.id;
    if (!userId) {
      // Try to get existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      if (users?.data?.[0]) {
        userId = users.data[0].id;
        console.log('✅ Using existing user:', userId);
      } else {
        console.error('❌ Could not get user ID');
        return;
      }
    } else {
      console.log('✅ Created test user:', userId);
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: 'gallery-test@instamoments.ph',
      full_name: 'Gallery Test User',
      user_type: 'host',
      subscription_tier: 'free',
    });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    // Create test event
    const gallerySlug = 'gallery-test-' + Date.now().toString(36);
    const testEvent = {
      name: 'Gallery Test Event',
      description: 'A test event for gallery functionality',
      event_type: 'wedding',
      event_date: new Date().toISOString().split('T')[0],
      location: 'Manila, Philippines',
      host_id: userId,
      gallery_slug: gallerySlug,
      subscription_tier: 'free',
      has_video_addon: true,
      requires_moderation: false,
      allow_downloads: true,
      is_public: true,
      custom_message: 'Welcome to our gallery test! Upload your photos and videos.',
      qr_code_url: '',
      status: 'active',
      max_photos: 100,
      max_photos_per_user: 10,
      storage_days: 30,
    };

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();

    if (eventError) {
      console.error('❌ Error creating test event:', eventError);
      return;
    }

    console.log('✅ Gallery test event created successfully!');
    console.log('📋 Event Details:');
    console.log('   ID:', event.id);
    console.log('   Name:', event.name);
    console.log('   Gallery Slug:', event.gallery_slug);
    console.log('   Status:', event.status);
    console.log('');
    console.log('🔗 Test URLs:');
    console.log('   Gallery URL:', `http://localhost:3000/gallery/${event.gallery_slug}`);
    console.log('   QR Code API:', `http://localhost:3000/api/qr/${event.id}?format=png&size=256&branded=true`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createGalleryTestEvent();

