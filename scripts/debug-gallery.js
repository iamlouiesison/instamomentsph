const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugGallery() {
  try {
    console.log('🔍 Debugging gallery query...');

    const slug = 'gallery-test-mf71oc3a';

    // Test 1: Simple query without join
    console.log('\n1. Testing simple event query...');
    const { data: eventSimple, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('gallery_slug', slug)
      .eq('status', 'active')
      .single();

    if (eventError) {
      console.error('❌ Simple query error:', eventError);
    } else {
      console.log('✅ Simple query success:', eventSimple?.name);
    }

    // Test 2: Query with host join
    console.log('\n2. Testing event query with host join...');
    const { data: eventWithHost, error: hostError } = await supabase
      .from('events')
      .select(
        `
        *,
        host:profiles!events_host_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('gallery_slug', slug)
      .eq('status', 'active')
      .single();

    if (hostError) {
      console.error('❌ Host join query error:', hostError);
    } else {
      console.log('✅ Host join query success:', eventWithHost?.name);
      console.log('   Host:', eventWithHost?.host);
    }

    // Test 3: Check if profiles table exists and has data
    console.log('\n3. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Profiles query error:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name} (${profile.email})`);
      });
    }

    // Test 4: Check specific host profile
    if (eventSimple?.host_id) {
      console.log('\n4. Checking specific host profile...');
      const { data: hostProfile, error: hostProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', eventSimple.host_id)
        .single();

      if (hostProfileError) {
        console.error('❌ Host profile error:', hostProfileError);
      } else {
        console.log('✅ Host profile found:', hostProfile);
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugGallery();
