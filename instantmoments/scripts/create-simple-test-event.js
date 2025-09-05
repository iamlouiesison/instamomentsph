const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSimpleTestEvent() {
  try {
    console.log('🧪 Creating simple test event for QR code testing...');

    // Create a test event with a hardcoded user ID
    const testEvent = {
      name: 'Test Wedding Event',
      description: 'A test wedding event for QR code testing',
      event_type: 'wedding',
      event_date: new Date().toISOString().split('T')[0],
      location: 'Manila, Philippines',
      host_id: 'da044330-42b6-4149-94b5-2a35774615a0', // Use the user ID we saw earlier
      gallery_slug: 'test-wedding-' + Date.now().toString(36),
      subscription_tier: 'free',
      has_video_addon: false,
      requires_moderation: false,
      allow_downloads: true,
      is_public: true,
      custom_message: 'Welcome to our test event!',
      qr_code_url: '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

    console.log('✅ Test event created successfully!');
    console.log('📋 Event Details:');
    console.log('   ID:', event.id);
    console.log('   Name:', event.name);
    console.log('   Gallery Slug:', event.gallery_slug);
    console.log('   Status:', event.status);
    console.log('');
    console.log('🔗 Test URLs:');
    console.log('   QR Code API:', `http://localhost:3000/api/qr/${event.id}?format=png&size=256&branded=true`);
    console.log('   Gallery URL:', `http://localhost:3000/gallery/${event.gallery_slug}`);
    console.log('   Test Page:', `http://localhost:3000/test-qr-basic`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createSimpleTestEvent();
