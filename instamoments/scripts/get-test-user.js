const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTestUser() {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('Error:', error.message);
      return;
    }
    
    const testUser = users.find(user => user.email.includes('testuser'));
    if (testUser) {
      console.log('✅ Test User Found:');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 User ID:', testUser.id);
      console.log('📅 Created:', testUser.created_at);
      console.log('');
      console.log('🔐 Use these credentials to sign in:');
      console.log('Email:', testUser.email);
      console.log('Password: password123');
    } else {
      console.log('❌ No test user found');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

getTestUser();
