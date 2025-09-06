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
    // First, let's check if the table already exists
    const { data: existingTables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'videos');

    if (listError) {
      console.log(
        '⚠️  Could not check existing tables, proceeding with creation...'
      );
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Videos table already exists');
      return true;
    }

    // Try to create the table using a different approach
    // We'll use the Supabase dashboard or SQL editor instead
    console.log(
      '📝 Please create the videos table manually in the Supabase dashboard:'
    );
    console.log('');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the following SQL:');
    console.log('');
    console.log('```sql');
    console.log('-- Create videos table');
    console.log('CREATE TABLE IF NOT EXISTS videos (');
    console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
    console.log(
      '  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,'
    );
    console.log(
      '  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,'
    );
    console.log('  file_name TEXT NOT NULL,');
    console.log('  file_url TEXT NOT NULL,');
    console.log('  thumbnail_url TEXT,');
    console.log('  file_size BIGINT NOT NULL,');
    console.log('  duration INTEGER NOT NULL DEFAULT 0,');
    console.log('  mime_type TEXT NOT NULL,');
    console.log('  caption TEXT,');
    console.log('  is_greeting BOOLEAN DEFAULT FALSE,');
    console.log("  status TEXT DEFAULT 'processing',");
    console.log('  created_at TIMESTAMPTZ DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMPTZ DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- Enable RLS');
    console.log('ALTER TABLE videos ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Create RLS policies');
    console.log(
      'CREATE POLICY "Event videos viewable by all for public events" ON videos'
    );
    console.log('  FOR SELECT USING (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM events');
    console.log('      WHERE events.id = videos.event_id');
    console.log('      AND events.is_public = TRUE');
    console.log("      AND events.status = 'active'");
    console.log('    )');
    console.log('  );');
    console.log('');
    console.log(
      'CREATE POLICY "Event hosts can view all videos in their events" ON videos'
    );
    console.log('  FOR SELECT USING (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM events');
    console.log('      WHERE events.id = videos.event_id');
    console.log('      AND events.host_id = auth.uid()');
    console.log('    )');
    console.log('  );');
    console.log('');
    console.log(
      'CREATE POLICY "Contributors can insert videos to active events" ON videos'
    );
    console.log('  FOR INSERT WITH CHECK (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM events');
    console.log('      WHERE events.id = videos.event_id');
    console.log("      AND events.status = 'active'");
    console.log('    )');
    console.log('  );');
    console.log('');
    console.log('-- Create indexes');
    console.log(
      'CREATE INDEX IF NOT EXISTS idx_videos_event_id ON videos(event_id);'
    );
    console.log(
      'CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);'
    );
    console.log(
      'CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);'
    );
    console.log(
      'CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);'
    );
    console.log('');
    console.log('-- Update events table to include video limits');
    console.log(
      'ALTER TABLE events ADD COLUMN IF NOT EXISTS video_limit INTEGER DEFAULT 20;'
    );
    console.log(
      'ALTER TABLE events ADD COLUMN IF NOT EXISTS max_videos_per_user INTEGER DEFAULT 5;'
    );
    console.log('```');
    console.log('');
    console.log('4. After running the SQL, come back and run the test again');

    return false;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up videos table...');

  const success = await createVideosTable();

  if (success) {
    console.log('🎉 Videos table setup completed successfully!');
  } else {
    console.log(
      '📋 Please follow the instructions above to create the videos table manually'
    );
  }
}

main();
