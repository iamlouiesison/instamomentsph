const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEventContributorsTable() {
  console.log('🚀 Creating event_contributors table...\n');

  try {
    // Create event_contributors table
    const { error: createTableError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    if (createTableError) {
      console.log('⚠️  Error creating table:', createTableError.message);
      // Try direct SQL execution
      const { error: directError } = await supabase
        .from('event_contributors')
        .select('id')
        .limit(1);
      
      if (directError && directError.message.includes('relation "public.event_contributors" does not exist')) {
        console.log('🔄 Table does not exist, creating via SQL editor...');
        console.log('Please run this SQL in your Supabase SQL Editor:');
        console.log(`
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
        return;
      }
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE event_contributors ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('⚠️  RLS error:', rlsError.message);
    } else {
      console.log('✅ RLS enabled on event_contributors table');
    }

    // Create RLS policies
    const policies = [
      `CREATE POLICY "Event contributors viewable by all for public events" ON event_contributors
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_contributors.event_id 
            AND events.is_public = TRUE
            AND events.status = 'active'
          )
        );`,
      `CREATE POLICY "Event hosts can view contributors in their events" ON event_contributors
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_contributors.event_id 
            AND events.host_id = auth.uid()
          )
        );`,
      `CREATE POLICY "Anyone can insert contributors to active events" ON event_contributors
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_contributors.event_id 
            AND events.status = 'active'
          )
        );`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec', { sql: policy });
      if (policyError) {
        console.log('⚠️  Policy error:', policyError.message);
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_event_contributors_event_id ON event_contributors(event_id);',
      'CREATE INDEX IF NOT EXISTS idx_event_contributors_contributor_email ON event_contributors(contributor_email);'
    ];

    for (const index of indexes) {
      const { error: indexError } = await supabase.rpc('exec', { sql: index });
      if (indexError) {
        console.log('⚠️  Index error:', indexError.message);
      }
    }

    // Test the table
    const { data, error: testError } = await supabase
      .from('event_contributors')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Table test failed:', testError.message);
    } else {
      console.log('✅ event_contributors table is accessible');
    }

    console.log('\n🎉 event_contributors table setup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createEventContributorsTable();
