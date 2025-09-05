-- InstaMoments Storage Buckets Setup
-- This script sets up the required storage buckets and policies

-- =============================================
-- STORAGE BUCKETS CREATION
-- =============================================

-- Note: Storage buckets are typically created via the Supabase dashboard
-- or using the Supabase Management API. This file documents the required setup.

-- Required buckets to create via Supabase Dashboard:

/*
1. photos
   - Public: true
   - File size limit: 10485760 (10MB)
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - Path: events/{event_id}/photos/{file_name}

2. videos
   - Public: true  
   - File size limit: 52428800 (50MB)
   - Allowed MIME types: video/mp4, video/webm, video/mov
   - Path: events/{event_id}/videos/{file_name}

3. thumbnails
   - Public: true
   - File size limit: 1048576 (1MB)
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - Path: events/{event_id}/thumbnails/{file_name}

4. qr-codes
   - Public: true
   - File size limit: 1048576 (1MB)
   - Allowed MIME types: image/png, image/svg+xml
   - Path: events/{event_id}/qr-codes/{file_name}
*/

-- =============================================
-- STORAGE POLICIES (RLS for Storage)
-- =============================================

-- Photos bucket policies
CREATE POLICY "Photos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Event hosts can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can update photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'photos' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can delete photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

-- Videos bucket policies
CREATE POLICY "Videos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Event hosts can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can update videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can delete videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

-- Thumbnails bucket policies
CREATE POLICY "Thumbnails are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Event hosts can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can update thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'thumbnails' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can delete thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'thumbnails' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

-- QR Codes bucket policies
CREATE POLICY "QR codes are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'qr-codes');

CREATE POLICY "Event hosts can upload QR codes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'qr-codes' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can update QR codes" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'qr-codes' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Event hosts can delete QR codes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'qr-codes' AND
  auth.uid() IN (
    SELECT host_id FROM events 
    WHERE id::text = (storage.foldername(name))[2]
  )
);

-- =============================================
-- STORAGE CLEANUP FUNCTIONS
-- =============================================

-- Function to clean up expired event files
CREATE OR REPLACE FUNCTION cleanup_expired_event_files()
RETURNS void AS $$
DECLARE
    expired_event RECORD;
BEGIN
    -- Get all expired events
    FOR expired_event IN 
        SELECT id, gallery_slug FROM events 
        WHERE expires_at < NOW() AND status = 'active'
    LOOP
        -- Update event status to expired
        UPDATE events SET status = 'expired' WHERE id = expired_event.id;
        
        -- Note: Actual file deletion from storage would be handled by a separate process
        -- or Supabase Edge Function, as we can't directly delete storage files from SQL
        -- This function just marks events as expired for cleanup processes to handle
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get storage usage for an event
CREATE OR REPLACE FUNCTION get_event_storage_usage(event_uuid UUID)
RETURNS TABLE(
    bucket_name TEXT,
    file_count BIGINT,
    total_size BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'photos' as bucket_name,
        COUNT(*) as file_count,
        COALESCE(SUM(file_size), 0) as total_size
    FROM photos 
    WHERE event_id = event_uuid
    
    UNION ALL
    
    SELECT 
        'videos' as bucket_name,
        COUNT(*) as file_count,
        COALESCE(SUM(file_size), 0) as total_size
    FROM videos 
    WHERE event_id = event_uuid;
END;
$$ LANGUAGE plpgsql;
