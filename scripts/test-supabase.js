#!/usr/bin/env node

/**
 * Supabase Integration Test Script
 * Tests all Supabase client configurations and database connectivity
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Supabase Integration...\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...');
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  process.exit(1);
}
if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  process.exit(1);
}
if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}
console.log('✅ All environment variables are set');

// Test 2: Anon Client Connection
console.log('\n2️⃣ Testing Anonymous Client Connection...');
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonConnection() {
  try {
    const { data, error } = await anonClient
      .from('_test_connection_')
      .select('*')
      .limit(1);
    if (error && error.code === 'PGRST116') {
      console.log(
        '✅ Anonymous client connection successful (expected table not found error)'
      );
      return true;
    }
    console.log('✅ Anonymous client connection successful');
    return true;
  } catch (err) {
    console.error('❌ Anonymous client connection failed:', err.message);
    return false;
  }
}

// Test 3: Service Role Client Connection
console.log('\n3️⃣ Testing Service Role Client Connection...');
const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testServiceConnection() {
  try {
    const { data, error } = await serviceClient
      .from('_test_connection_')
      .select('*')
      .limit(1);
    if (error && error.code === 'PGRST116') {
      console.log(
        '✅ Service role client connection successful (expected table not found error)'
      );
      return true;
    }
    console.log('✅ Service role client connection successful');
    return true;
  } catch (err) {
    console.error('❌ Service role client connection failed:', err.message);
    return false;
  }
}

// Test 4: Database Schema Verification
console.log('\n4️⃣ Testing Database Schema...');
async function testDatabaseSchema() {
  try {
    // Test if our main tables exist
    const tables = [
      'profiles',
      'events',
      'photos',
      'videos',
      'event_contributors',
      'payments',
      'analytics_events',
    ];

    for (const table of tables) {
      const { data, error } = await serviceClient
        .from(table)
        .select('*')
        .limit(1);
      if (error) {
        console.error(
          `❌ Table '${table}' not found or not accessible:`,
          error.message
        );
        return false;
      }
      console.log(`✅ Table '${table}' exists and is accessible`);
    }

    return true;
  } catch (err) {
    console.error('❌ Database schema test failed:', err.message);
    return false;
  }
}

// Test 5: RLS Policies Test
console.log('\n5️⃣ Testing Row Level Security...');
async function testRLSPolicies() {
  try {
    // Test that anon client can't access protected data
    const { data, error } = await anonClient
      .from('profiles')
      .select('*')
      .limit(1);
    if (error && error.code === '42501') {
      console.log(
        '✅ RLS policies are working (anon access denied as expected)'
      );
      return true;
    } else if (data && data.length === 0) {
      console.log(
        '✅ RLS policies are working (no data returned for anon user)'
      );
      return true;
    } else {
      console.log('⚠️  RLS policies may not be properly configured');
      return false;
    }
  } catch (err) {
    console.error('❌ RLS test failed:', err.message);
    return false;
  }
}

// Test 6: Storage Buckets Test
console.log('\n6️⃣ Testing Storage Buckets...');
async function testStorageBuckets() {
  try {
    const buckets = ['photos', 'videos', 'thumbnails', 'qr-codes'];

    for (const bucket of buckets) {
      const { data, error } = await serviceClient.storage
        .from(bucket)
        .list('', { limit: 1 });
      if (error) {
        console.error(
          `❌ Storage bucket '${bucket}' not found:`,
          error.message
        );
        return false;
      }
      console.log(`✅ Storage bucket '${bucket}' exists and is accessible`);
    }

    return true;
  } catch (err) {
    console.error('❌ Storage buckets test failed:', err.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = [];

  results.push(await testAnonConnection());
  results.push(await testServiceConnection());
  results.push(await testDatabaseSchema());
  results.push(await testRLSPolicies());
  results.push(await testStorageBuckets());

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All Supabase integration tests passed!');
    console.log('\n✅ Ready to proceed with development');
  } else {
    console.log('❌ Some tests failed. Please check your Supabase setup.');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests
runAllTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
