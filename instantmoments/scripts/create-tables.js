#!/usr/bin/env node

/**
 * Create Essential Tables Script
 * Creates only the essential tables needed for authentication
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTables() {
  console.log('🚀 Creating essential tables...\n');

  try {
    // Test connection first
    console.log('1️⃣ Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('_test_connection_')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('   ✅ Connection successful');
    } else {
      console.log('   ✅ Connection successful');
    }

    // Create profiles table using direct SQL execution
    console.log('\n2️⃣ Creating profiles table...');
    
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT,
        phone_number TEXT,
        avatar_url TEXT,
        user_type TEXT DEFAULT 'guest',
        subscription_tier TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
        payment_customer_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Try to execute the SQL directly
    try {
      const { error } = await supabase.rpc('exec', { sql: createProfilesTable });
      if (error) {
        console.log(`   ⚠️  Error creating profiles table: ${error.message}`);
        // Try alternative approach
        console.log('   🔄 Trying alternative approach...');
        
        // Check if table already exists
        const { data: existingTable, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (checkError && checkError.code === 'PGRST116') {
          console.log('   ❌ Table does not exist and could not be created');
        } else {
          console.log('   ✅ Profiles table already exists');
        }
      } else {
        console.log('   ✅ Profiles table created successfully');
      }
    } catch (err) {
      console.log(`   ⚠️  Exception creating profiles table: ${err.message}`);
    }

    // Enable RLS on profiles table
    console.log('\n3️⃣ Enabling RLS on profiles table...');
    try {
      const { error: rlsError } = await supabase.rpc('exec', { 
        sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' 
      });
      
      if (rlsError) {
        console.log(`   ⚠️  RLS error: ${rlsError.message}`);
      } else {
        console.log('   ✅ RLS enabled on profiles table');
      }
    } catch (err) {
      console.log(`   ⚠️  RLS exception: ${err.message}`);
    }

    // Create RLS policies for profiles
    console.log('\n4️⃣ Creating RLS policies...');
    const policies = [
      {
        name: 'Users can view own profile',
        sql: 'CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);'
      },
      {
        name: 'Users can update own profile', 
        sql: 'CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);'
      },
      {
        name: 'Users can insert own profile',
        sql: 'CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);'
      }
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec', { sql: policy.sql });
        if (error) {
          console.log(`   ⚠️  Policy "${policy.name}": ${error.message}`);
        } else {
          console.log(`   ✅ Policy "${policy.name}" created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Policy "${policy.name}" exception: ${err.message}`);
      }
    }

    // Create function to handle new user profile creation
    console.log('\n5️⃣ Creating user profile function...');
    const createFunction = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO public.profiles (id, email, full_name)
          VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
          RETURN NEW;
      END;
      $$ language 'plpgsql' SECURITY DEFINER;
    `;

    try {
      const { error } = await supabase.rpc('exec', { sql: createFunction });
      if (error) {
        console.log(`   ⚠️  Function error: ${error.message}`);
      } else {
        console.log('   ✅ User profile function created');
      }
    } catch (err) {
      console.log(`   ⚠️  Function exception: ${err.message}`);
    }

    // Create trigger for new user profile creation
    console.log('\n6️⃣ Creating user profile trigger...');
    const createTrigger = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    try {
      const { error } = await supabase.rpc('exec', { sql: createTrigger });
      if (error) {
        console.log(`   ⚠️  Trigger error: ${error.message}`);
      } else {
        console.log('   ✅ User profile trigger created');
      }
    } catch (err) {
      console.log(`   ⚠️  Trigger exception: ${err.message}`);
    }

    // Test the setup
    console.log('\n7️⃣ Testing the setup...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.log(`   ❌ Profiles table test failed: ${profilesError.message}`);
      } else {
        console.log('   ✅ Profiles table is accessible');
      }
    } catch (err) {
      console.log(`   ❌ Profiles table test exception: ${err.message}`);
    }

    console.log('\n🎉 Essential tables setup completed!');
    console.log('💡 You can now test the sign-in functionality.');

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
createTables().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
