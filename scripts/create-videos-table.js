const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createVideosTable() {
  console.log('🎬 Creating videos table...');

  try {
    // Create videos table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS videos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
          uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          file_name TEXT NOT NULL,
          file_url TEXT NOT NULL,
          thumbnail_url TEXT,
          file_size BIGINT NOT NULL,
          duration INTEGER NOT NULL DEFAULT 0,
          mime_type TEXT NOT NULL,
          caption TEXT,
          is_greeting BOOLEAN DEFAULT FALSE,
          status TEXT DEFAULT 'processing',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
    });

    if (createError) {
      console.error('❌ Error creating videos table:', createError);
      return false;
    }

    console.log('✅ Videos table created successfully');

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE videos ENABLE ROW LEVEL SECURITY;',
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
      return false;
    }

    console.log('✅ RLS enabled on videos table');

    // Create RLS policies
    const policies = [
      `CREATE POLICY "Event videos viewable by all for public events" ON videos
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM events
            WHERE events.id = videos.event_id
            AND events.is_public = TRUE
            AND events.status = 'active'
          )
        );`,
      `CREATE POLICY "Event hosts can view all videos in their events" ON videos
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM events
            WHERE events.id = videos.event_id
            AND events.host_id = auth.uid()
          )
        );`,
      `CREATE POLICY "Contributors can insert videos to active events" ON videos
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM events
            WHERE events.id = videos.event_id
            AND events.status = 'active'
          )
        );`,
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: policy,
      });

      if (policyError) {
        console.error('❌ Error creating policy:', policyError);
        return false;
      }
    }

    console.log('✅ RLS policies created successfully');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_videos_event_id ON videos(event_id);',
      'CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);',
      'CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);',
    ];

    for (const index of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: index,
      });

      if (indexError) {
        console.error('❌ Error creating index:', indexError);
        return false;
      }
    }

    console.log('✅ Indexes created successfully');

    // Update events table to include video limits
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE events ADD COLUMN IF NOT EXISTS video_limit INTEGER DEFAULT 20;
        ALTER TABLE events ADD COLUMN IF NOT EXISTS max_videos_per_user INTEGER DEFAULT 5;
      `,
    });

    if (updateError) {
      console.error('❌ Error updating events table:', updateError);
      return false;
    }

    console.log('✅ Events table updated with video limits');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating videos table and related structures...');

  const success = await createVideosTable();

  if (success) {
    console.log('🎉 Videos table setup completed successfully!');
  } else {
    console.log('❌ Videos table setup failed');
    process.exit(1);
  }
}

main();
