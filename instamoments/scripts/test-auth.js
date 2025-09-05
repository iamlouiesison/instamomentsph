#!/usr/bin/env node

/**
 * Test Authentication Script
 * Tests the authentication flow without requiring the profiles table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🧪 Testing authentication flow...\n');

  try {
    // Test 1: Check if we can access Supabase
    console.log('1️⃣ Testing Supabase connection...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log(`   ⚠️  User check error: ${userError.message}`);
    } else {
      console.log(`   ✅ User check successful (current user: ${user ? 'logged in' : 'not logged in'})`);
    }

    // Test 2: Try to sign up a test user
    console.log('\n2️⃣ Testing user sign up...');
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (signUpError) {
      console.log(`   ❌ Sign up failed: ${signUpError.message}`);
    } else {
      console.log('   ✅ Sign up successful');
      console.log(`   📧 User email: ${testEmail}`);
      console.log(`   🔑 User ID: ${signUpData.user?.id}`);
    }

    // Test 3: Try to sign in with the test user
    console.log('\n3️⃣ Testing user sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log(`   ❌ Sign in failed: ${signInError.message}`);
    } else {
      console.log('   ✅ Sign in successful');
      console.log(`   🔑 Signed in user ID: ${signInData.user?.id}`);
    }

    // Test 4: Check if we can access the profiles table
    console.log('\n4️⃣ Testing profiles table access...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.log(`   ❌ Profiles table access failed: ${profilesError.message}`);
        console.log('   💡 This is expected if the profiles table does not exist');
      } else {
        console.log('   ✅ Profiles table is accessible');
        console.log(`   📊 Found ${profiles.length} profiles`);
      }
    } catch (err) {
      console.log(`   ❌ Profiles table access exception: ${err.message}`);
    }

    // Test 5: Try to create a profile manually
    console.log('\n5️⃣ Testing manual profile creation...');
    if (signInData?.user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signInData.user.id,
            email: signInData.user.email,
            full_name: 'Test User'
          })
          .select()
          .single();
        
        if (profileError) {
          console.log(`   ❌ Profile creation failed: ${profileError.message}`);
        } else {
          console.log('   ✅ Profile created successfully');
          console.log(`   👤 Profile ID: ${profileData.id}`);
        }
      } catch (err) {
        console.log(`   ❌ Profile creation exception: ${err.message}`);
      }
    }

    // Test 6: Sign out
    console.log('\n6️⃣ Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log(`   ❌ Sign out failed: ${signOutError.message}`);
    } else {
      console.log('   ✅ Sign out successful');
    }

    console.log('\n🎉 Authentication testing completed!');
    console.log('💡 Check the results above to identify any issues.');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
testAuth().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
