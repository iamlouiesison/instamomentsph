const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestEvent() {
  try {
    console.log('🧪 Creating test event for QR code testing...');

    // First, let's check if we have any users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users.data || users.data.length === 0) {
      console.log('❌ No users found. Creating a test user first...');
      
      // Create a test user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'test@instamoments.ph',
        password: 'testpassword123',
        email_confirm: true,
      });

      if (userError && userError.code !== 'email_exists') {
        console.error('❌ Error creating test user:', userError);
        return;
      }

      if (userError && userError.code === 'email_exists') {
        console.log('ℹ️  Test user already exists, continuing...');
      } else {
        console.log('✅ Test user created:', userData.user.id);
      }

      // Get the user ID (either from created user or existing user)
      let userId = userData?.user?.id;
      if (!userId) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        userId = existingUsers?.data?.[0]?.id;
      }
      
      if (!userId) {
        console.error('❌ Could not get user ID');
        return;
      }
      
      console.log('✅ Using user ID:', userId);

      // Create a profile for the user (ignore if already exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'test@instamoments.ph',
          full_name: 'Test User',
          user_type: 'host',
          subscription_tier: 'free',
        });

      if (profileError && profileError.code !== '23505') {
        console.error('❌ Error creating profile:', profileError);
        return;
      }

      if (profileError && profileError.code === '23505') {
        console.log('ℹ️  Profile already exists, continuing...');
      } else {
        console.log('✅ Test profile created');
      }
    } else {
      console.log('✅ Found existing users, using first user');
    }

    // Get the first user (or the one we just created)
    const { data: usersList, error: usersError2 } = await supabase.auth.admin.listUsers();
    const testUser = usersList.data[0];

    // Create a test event
    const testEvent = {
      name: 'Test Wedding Event',
      description: 'A test wedding event for QR code testing',
      event_type: 'wedding',
      event_date: new Date().toISOString().split('T')[0],
      location: 'Manila, Philippines',
      host_id: testUser.id,
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

createTestEvent();
