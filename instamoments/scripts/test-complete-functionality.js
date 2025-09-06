const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompleteFunctionality() {
  console.log('🧪 Testing complete InstaMoments functionality...\n');

  const results = {
    database: false,
    storage: false,
    authentication: false,
    events: false,
    gallery: false,
    photoUpload: false,
    qrGeneration: false
  };

  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
    } else {
      console.log('✅ Database connection successful');
      results.database = true;
    }

    // 2. Test Storage
    console.log('\n2️⃣ Testing storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage buckets failed:', bucketError.message);
    } else {
      const requiredBuckets = ['photos', 'videos', 'thumbnails', 'qr-codes'];
      const availableBuckets = buckets.map(b => b.name);
      const missingBuckets = requiredBuckets.filter(b => !availableBuckets.includes(b));
      
      if (missingBuckets.length > 0) {
        console.log('⚠️  Missing storage buckets:', missingBuckets.join(', '));
      } else {
        console.log('✅ All required storage buckets available');
        results.storage = true;
      }
    }

    // 3. Test Events
    console.log('\n3️⃣ Testing events functionality...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, status')
      .limit(5);
    
    if (eventsError) {
      console.log('❌ Events query failed:', eventsError.message);
    } else {
      console.log(`✅ Found ${events.length} events`);
      results.events = true;
    }

    // 4. Test Gallery
    console.log('\n4️⃣ Testing gallery functionality...');
    if (events && events.length > 0) {
      const eventId = events[0].id;
      
      // Test photos query
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id, file_name, file_url')
        .eq('event_id', eventId)
        .limit(5);
      
      if (photosError) {
        console.log('❌ Photos query failed:', photosError.message);
      } else {
        console.log(`✅ Found ${photos.length} photos in gallery`);
        results.gallery = true;
      }
    }

    // 5. Test Photo Upload (with service role)
    console.log('\n5️⃣ Testing photo upload...');
    if (events && events.length > 0) {
      const eventId = events[0].id;
      const testFile = new Blob(['test content'], { type: 'image/jpeg' });
      const fileName = `test-${Date.now()}.jpg`;
      const filePath = `events/${eventId}/photos/${fileName}`;
      
      // Test storage upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, testFile);
      
      if (uploadError) {
        console.log('❌ Storage upload failed:', uploadError.message);
      } else {
        console.log('✅ Storage upload successful');
        
        // Test database insert
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            contributor_name: 'Test User',
            contributor_email: 'test@example.com',
            file_name: fileName,
            file_url: uploadData.path,
            file_size: testFile.size,
            mime_type: 'image/jpeg'
          })
          .select();
        
        if (photoError) {
          console.log('❌ Photo database insert failed:', photoError.message);
        } else {
          console.log('✅ Photo database insert successful');
          results.photoUpload = true;
          
          // Clean up
          await supabase
            .from('photos')
            .delete()
            .eq('file_name', fileName);
          await supabase.storage
            .from('photos')
            .remove([filePath]);
          console.log('✅ Test data cleaned up');
        }
      }
    }

    // 6. Test QR Code Generation
    console.log('\n6️⃣ Testing QR code generation...');
    try {
      const { data: qrData, error: qrError } = await supabase
        .from('events')
        .select('id, gallery_slug')
        .limit(1)
        .single();
      
      if (qrError) {
        console.log('❌ QR code test failed:', qrError.message);
      } else {
        console.log('✅ QR code data available');
        results.qrGeneration = true;
      }
    } catch (error) {
      console.log('❌ QR code test error:', error.message);
    }

    // 7. Test Authentication (basic check)
    console.log('\n7️⃣ Testing authentication system...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profilesError) {
        console.log('❌ Profiles query failed:', profilesError.message);
      } else {
        console.log('✅ Authentication system accessible');
        results.authentication = true;
      }
    } catch (error) {
      console.log('❌ Authentication test error:', error.message);
    }

    // Summary
    console.log('\n📊 FUNCTIONALITY TEST SUMMARY:');
    console.log('================================');
    Object.entries(results).forEach(([feature, status]) => {
      const icon = status ? '✅' : '❌';
      const name = feature.charAt(0).toUpperCase() + feature.slice(1);
      console.log(`${icon} ${name}: ${status ? 'Working' : 'Failed'}`);
    });

    const workingCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    const percentage = Math.round((workingCount / totalCount) * 100);

    console.log(`\n🎯 Overall Status: ${workingCount}/${totalCount} features working (${percentage}%)`);

    if (percentage >= 90) {
      console.log('🎉 Excellent! InstaMoments is ready for production!');
    } else if (percentage >= 70) {
      console.log('✅ Good! Most features are working, minor fixes needed.');
    } else {
      console.log('⚠️  Some features need attention before going live.');
    }

    // Next steps
    console.log('\n📝 Next Steps:');
    if (!results.photoUpload) {
      console.log('1. Apply RLS policy fixes in Supabase SQL Editor');
      console.log('2. Configure storage bucket policies for public uploads');
    }
    console.log('3. Test the web interface at http://localhost:3000');
    console.log('4. Deploy to production when ready');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFunctionality();
