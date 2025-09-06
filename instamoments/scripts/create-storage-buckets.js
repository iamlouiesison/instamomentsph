const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBuckets() {
  console.log('🚀 Creating storage buckets...');
  
  const bucketConfigs = [
    { name: 'photos', public: true },
    { name: 'videos', public: true },
    { name: 'thumbnails', public: true },
    { name: 'qr-codes', public: true }
  ];
  
  for (const bucket of bucketConfigs) {
    console.log(`Creating bucket: ${bucket.name}...`);
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public
    });
    
    if (error) {
      console.log(`⚠️  ${bucket.name}: ${error.message}`);
    } else {
      console.log(`✅ ${bucket.name} created successfully`);
    }
  }
  
  console.log('\n🔍 Checking buckets after creation...');
  const { data: allBuckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.log('❌ Error listing buckets:', error.message);
  } else {
    console.log('✅ Available buckets:');
    allBuckets.forEach(bucket => {
      console.log('  -', bucket.name, '(public:', bucket.public, ')');
    });
  }
}

createBuckets();
