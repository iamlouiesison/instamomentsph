const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEvent() {
  try {
    console.log('🔍 Checking events in database...');

    // Check all events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      return;
    }

    console.log(`✅ Found ${events.length} events:`);
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. Event:`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Name: ${event.name}`);
      console.log(`   Gallery Slug: ${event.gallery_slug}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Created: ${event.created_at}`);
    });

    // Check specific event
    const { data: specificEvent, error: specificError } = await supabase
      .from('events')
      .select('*')
      .eq('gallery_slug', 'gallery-test-mf71oc3a')
      .single();

    if (specificError) {
      console.log('\n❌ Specific event not found:', specificError.message);
    } else {
      console.log('\n✅ Specific event found:', specificEvent);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkEvent();
