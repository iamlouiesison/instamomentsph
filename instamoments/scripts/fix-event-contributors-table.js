const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createEventContributorsTable() {
  console.log('🔧 Creating event_contributors table...\n');

  try {
    // First check if table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('event_contributors')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ event_contributors table already exists');
      return;
    }

    console.log('📝 Creating event_contributors table...');
    
    // Create the table using direct SQL execution
    const createTableSQL = `
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
    `;

    // Try to create table by inserting a test record (this will fail if table doesn't exist)
    const { data, error } = await supabase
      .from('event_contributors')
      .insert({
        event_id: '00000000-0000-0000-0000-000000000000',
        contributor_name: 'test',
        contributor_email: 'test@example.com'
      });

    if (error) {
      if (error.message.includes('relation "public.event_contributors" does not exist')) {
        console.log('📋 Please run this SQL in your Supabase SQL Editor:');
        console.log(createTableSQL);
        console.log(`
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
        return;
      }
    } else {
      console.log('✅ event_contributors table created successfully');
      
      // Clean up the test record
      await supabase
        .from('event_contributors')
        .delete()
        .eq('contributor_email', 'test@example.com');
      
      console.log('✅ Test record cleaned up');
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('event_contributors')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Table test failed:', testError.message);
    } else {
      console.log('✅ event_contributors table is accessible');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createEventContributorsTable();
