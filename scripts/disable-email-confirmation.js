#!/usr/bin/env node

/**
 * Disable Email Confirmation Script
 * Disables email confirmation in Supabase
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

async function disableEmailConfirmation() {
  console.log('🔧 Attempting to disable email confirmation...\n');

  try {
    // Try to disable email confirmation via SQL
    console.log('1️⃣ Trying to disable email confirmation via SQL...');

    const { error } = await supabase.rpc('exec', {
      sql: `
        UPDATE auth.config 
        SET email_confirmation_enabled = false;
      `,
    });

    if (error) {
      console.log(`   ⚠️  SQL approach failed: ${error.message}`);
    } else {
      console.log('   ✅ Email confirmation disabled via SQL');
    }

    // Alternative approach - try to update the auth settings
    console.log('\n2️⃣ Trying alternative approach...');

    try {
      // This might not work with the current Supabase client, but let's try
      const { data, error: updateError } = await supabase
        .from('auth.config')
        .update({ email_confirmation_enabled: false })
        .select();

      if (updateError) {
        console.log(`   ⚠️  Update approach failed: ${updateError.message}`);
      } else {
        console.log('   ✅ Email confirmation disabled via update');
      }
    } catch (err) {
      console.log(`   ⚠️  Update approach exception: ${err.message}`);
    }

    // Test if it worked
    console.log('\n3️⃣ Testing if email confirmation is disabled...');

    const testEmail = `test${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    // Try to sign up a user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      }
    );

    if (signUpError) {
      console.log(`   ❌ Sign up failed: ${signUpError.message}`);
    } else {
      console.log('   ✅ Sign up successful');

      // Try to sign in immediately
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

      if (signInError) {
        console.log(`   ❌ Sign in failed: ${signInError.message}`);
        if (signInError.message.includes('Email not confirmed')) {
          console.log(
            '   💡 Email confirmation is still enabled. Please disable it manually in the Supabase dashboard.'
          );
        }
      } else {
        console.log(
          '   ✅ Sign in successful - email confirmation is disabled!'
        );
      }
    }

    console.log('\n📋 Manual Steps Required:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Authentication → Settings');
    console.log('4. Find "Email confirmation" and turn it OFF');
    console.log('5. Save the changes');
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
disableEmailConfirmation().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
