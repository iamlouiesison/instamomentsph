const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingTable() {
  console.log('🚀 Creating missing event_contributors table...\n');

  try {
    // First, let's check if the table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('event_contributors')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ event_contributors table already exists');
      return;
    }

    console.log('📝 Table does not exist, creating it...');
    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log(`
-- Create event_contributors table
CREATE TABLE IF NOT EXISTS event_contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  total_photos INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMPTZ,
  UNIQUE(event_id, contributor_email)
);

-- Enable RLS
ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Event contributors viewable by all for public events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.is_public = TRUE
      AND events.status = 'active'
    )
  );

CREATE POLICY "Event hosts can view contributors in their events" ON event_contributors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert contributors to active events" ON event_contributors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_contributors.event_id 
      AND events.status = 'active'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_contributors_event_id ON event_contributors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_contributors_contributor_email ON event_contributors(contributor_email);
    `);

    console.log('\n💡 After running the SQL above, run this script again to verify the table was created.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMissingTable();
