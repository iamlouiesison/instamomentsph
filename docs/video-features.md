# Video Recording & Playback Features

This document outlines the video recording and playback system implemented for InstaMoments, enabling users to create and share 20-second greeting videos.

## Overview

The video system provides:

- **Browser-based video recording** with 20-second limit
- **Video compression and thumbnail generation**
- **Video upload API with processing queue**
- **Video playback system with gallery**
- **Video message features and moderation**
- **Cross-browser video compatibility**

## Components

### 1. VideoRecorder (`components/features/video/VideoRecorder.tsx`)

A React component that provides browser-based video recording functionality.

**Features:**

- 20-second countdown timer
- Real-time recording controls (start, stop, pause, resume)
- Camera permission handling
- Thumbnail generation from video frames
- Re-record functionality
- Mobile-optimized interface

**Props:**

```typescript
interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, thumbnailBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number; // default: 20 seconds
  className?: string;
}
```

**Usage:**

```tsx
<VideoRecorder
  onVideoRecorded={(videoBlob, thumbnailBlob) => {
    // Handle recorded video
  }}
  onCancel={() => {
    // Handle cancellation
  }}
  maxDuration={20}
/>
```

### 2. VideoPlayer (`components/features/video/VideoPlayer.tsx`)

A comprehensive video player component with advanced controls.

**Features:**

- Play/pause controls
- Volume control and mute
- Progress bar with seeking
- Fullscreen support
- Download and share options
- Video info overlay
- Auto-play support
- Loading and error states

**Props:**

```typescript
interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  uploadedBy?: string;
  duration?: number;
  isGreeting?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
}
```

### 3. VideoUploadForm (`components/features/upload/VideoUploadForm.tsx`)

A complete upload form supporting both file upload and recording.

**Features:**

- File selection and validation
- Video recording integration
- Upload progress tracking
- Caption and greeting options
- Error handling and validation

**Props:**

```typescript
interface VideoUploadFormProps {
  eventId: string;
  onUploadComplete: (videoId: string) => void;
  onCancel: () => void;
  className?: string;
}
```

### 4. VideoGallery (`components/features/gallery/VideoGallery.tsx`)

A gallery component for displaying and managing videos.

**Features:**

- Grid and list view modes
- Video thumbnails and previews
- Greeting video filtering
- Download and share actions
- Video selection and playback
- Status indicators (processing, completed)

**Props:**

```typescript
interface VideoGalleryProps {
  videos: Video[];
  onDownload?: (video: Video) => void;
  onShare?: (video: Video) => void;
  onDelete?: (videoId: string) => void;
  showGreetingsOnly?: boolean;
  className?: string;
}
```

## API Endpoints

### POST `/api/upload/video`

Uploads a video file with processing and validation.

**Request:**

- `multipart/form-data` with:
  - `video`: Video file (max 50MB, max 20 seconds)
  - `thumbnail`: Thumbnail image (optional)
  - `eventId`: Event ID (UUID)
  - `caption`: Video caption (optional, max 500 chars)
  - `isGreeting`: Boolean flag for greeting videos

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "video-uuid",
    "url": "https://...",
    "thumbnailUrl": "https://...",
    "status": "processing",
    "message": "Video uploaded successfully. Processing..."
  }
}
```

**Rate Limiting:**

- 5 videos per 10 minutes per user
- Returns 429 status when exceeded

### GET `/api/upload/video?videoId={id}`

Checks video processing status.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "video-uuid",
    "status": "completed",
    "file_url": "https://...",
    "thumbnail_url": "https://...",
    "duration": 20,
    "caption": "Video caption",
    "is_greeting": true
  }
}
```

## Video Processing

### Client-Side Processing (`lib/video-processing.ts`)

**Functions:**

- `validateVideo()`: Validates file size, duration, and format
- `compressVideo()`: Compresses video using MediaRecorder API
- `generateVideoThumbnail()`: Creates thumbnails from video frames
- `getVideoMetadata()`: Extracts duration and dimensions
- `isVideoRecordingSupported()`: Checks browser compatibility

**Validation Rules:**

- Max duration: 20 seconds
- Max file size: 50MB
- Supported formats: MP4, WebM, QuickTime
- Required: Video and audio tracks

### Server-Side Processing

**Background Processing:**

- Duration extraction
- Thumbnail generation
- Video optimization
- Status updates

**Storage:**

- Videos stored in Supabase Storage (`event-media` bucket)
- Thumbnails stored as JPEG images
- CDN delivery for fast playback

## Database Schema

### Videos Table

```sql
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  mime_type TEXT NOT NULL,
  caption TEXT,
  is_greeting BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Events Table Updates

```sql
ALTER TABLE events ADD COLUMN video_limit INTEGER DEFAULT 20;
ALTER TABLE events ADD COLUMN max_videos_per_user INTEGER DEFAULT 5;
```

### Row Level Security (RLS)

**Policies:**

- Public events: Anyone can view videos
- Event hosts: Can view all videos in their events
- Contributors: Can upload videos to active events

## Browser Compatibility

### Supported Features

**Video Recording:**

- Chrome 47+ (MediaRecorder API)
- Firefox 25+ (MediaRecorder API)
- Safari 14.1+ (MediaRecorder API)
- Edge 79+ (MediaRecorder API)

**Video Playback:**

- All modern browsers (HTML5 video)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Fallbacks

**Recording Not Supported:**

- File upload form only
- Clear error messaging
- Alternative upload methods

**Playback Issues:**

- Thumbnail fallbacks
- Error handling
- Retry mechanisms

## Testing

### Test Page

Visit `/test-video` to test all video features:

1. **Recorder Tab**: Test video recording
2. **Player Tab**: Test video playback
3. **Upload Tab**: Test upload form
4. **Gallery Tab**: Test video gallery

### Browser Support Check

The test page includes a browser support checker that displays:

- MediaRecorder API support
- getUserMedia support
- Overall video recording capability

## Usage Examples

### Basic Video Recording

```tsx
import { VideoRecorder } from '@/components/features/video';

function MyComponent() {
  const handleVideoRecorded = (videoBlob: Blob, thumbnailBlob: Blob) => {
    // Process recorded video
    console.log('Video recorded:', videoBlob.size, 'bytes');
  };

  return (
    <VideoRecorder
      onVideoRecorded={handleVideoRecorded}
      onCancel={() => console.log('Cancelled')}
      maxDuration={20}
    />
  );
}
```

### Video Gallery Integration

```tsx
import { VideoGallery } from '@/components/features/gallery';

function EventGallery({ eventId }: { eventId: string }) {
  const [videos, setVideos] = useState([]);

  return (
    <VideoGallery
      videos={videos}
      onDownload={(video) => downloadVideo(video)}
      onShare={(video) => shareVideo(video)}
      onDelete={(videoId) => deleteVideo(videoId)}
      showGreetingsOnly={false}
    />
  );
}
```

### Video Upload Form

```tsx
import { VideoUploadForm } from '@/components/features/upload';

function UploadPage({ eventId }: { eventId: string }) {
  const handleUploadComplete = (videoId: string) => {
    console.log('Video uploaded:', videoId);
    // Refresh gallery or redirect
  };

  return (
    <VideoUploadForm
      eventId={eventId}
      onUploadComplete={handleUploadComplete}
      onCancel={() => router.back()}
    />
  );
}
```

## Performance Considerations

### Client-Side

- Video compression before upload
- Thumbnail generation for fast loading
- Lazy loading of video players
- Progressive enhancement

### Server-Side

- Rate limiting to prevent abuse
- Background processing for heavy tasks
- CDN delivery for video files
- Efficient database queries

### Mobile Optimization

- Touch-friendly controls
- Responsive design
- Optimized video formats
- Battery usage considerations

## Security

### Upload Security

- File type validation
- File size limits
- Duration limits
- Rate limiting

### Access Control

- Row Level Security (RLS)
- Event-based permissions
- User authentication
- Content moderation hooks

## Future Enhancements

### Planned Features

- Video compilation tools
- Advanced video editing
- Real-time video streaming
- Video analytics
- AI-powered content moderation
- Video compression optimization

### Technical Improvements

- WebRTC for better recording
- WebAssembly for video processing
- Service Worker for offline support
- Advanced caching strategies

## Troubleshooting

### Common Issues

**Recording Not Working:**

- Check browser permissions
- Verify HTTPS connection
- Test with different browsers
- Check console for errors

**Upload Failures:**

- Verify file size limits
- Check network connection
- Validate file format
- Check rate limiting

**Playback Issues:**

- Verify video URL
- Check browser compatibility
- Test with different videos
- Check network connectivity

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('video-debug', 'true');
```

This will log detailed information about video processing and playback.
