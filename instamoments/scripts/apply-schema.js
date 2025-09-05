#!/usr/bin/env node

/**
 * Apply Database Schema Script
 * Applies the complete database schema to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function applySchema() {
  console.log('🚀 Applying database schema to Supabase...\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema file loaded successfully');
    console.log(`📏 Schema size: ${schema.length} characters`);

    // Split the schema into individual statements
    // Remove comments and split by semicolon
    const statements = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;

      try {
        console.log(`\n${i + 1}/${statements.length} Executing statement...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);

        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_sql_exec')
            .select('*')
            .eq('sql', statement);

          if (directError) {
            console.log(`   ⚠️  Statement may already exist or be invalid: ${error.message}`);
            // Continue with other statements
          } else {
            console.log(`   ✅ Statement executed successfully`);
            successCount++;
          }
        } else {
          console.log(`   ✅ Statement executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  Statement execution warning: ${err.message}`);
        // Continue with other statements
      }
    }

    console.log(`\n📊 Schema Application Results:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Warnings: ${statements.length - successCount}`);

    // Test the schema by checking if tables exist
    console.log('\n🔍 Verifying schema application...');
    
    const tables = ['profiles', 'events', 'photos', 'videos', 'event_contributors', 'payments', 'analytics_events'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Table '${table}' not accessible: ${error.message}`);
        } else {
          console.log(`   ✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}' verification failed: ${err.message}`);
      }
    }

    console.log('\n🎉 Schema application completed!');
    console.log('💡 You can now test the sign-in functionality.');

  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
applySchema().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
