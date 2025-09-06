'use client';

import React, { useState } from 'react';
import { VideoRecorder, VideoPlayer } from '@/components/features/video';
import { VideoUploadForm } from '@/components/features/upload/VideoUploadForm';
import { VideoGallery } from '@/components/features/gallery/VideoGallery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Camera, Upload, Grid } from 'lucide-react';

// Mock video data for testing
const mockVideos = [
  {
    id: '1',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl:
      'https://via.placeholder.com/320x240/4F46E5/FFFFFF?text=Sample+Video+1',
    caption: 'Sample greeting video',
    uploadedBy: 'John Doe',
    duration: 20,
    isGreeting: true,
    createdAt: new Date().toISOString(),
    status: 'completed' as const,
  },
  {
    id: '2',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl:
      'https://via.placeholder.com/320x240/059669/FFFFFF?text=Sample+Video+2',
    caption: 'Another test video',
    uploadedBy: 'Jane Smith',
    duration: 15,
    isGreeting: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'completed' as const,
  },
];

export default function TestVideoPage() {
  const [recordedVideo, setRecordedVideo] = useState<{
    videoBlob: Blob;
    thumbnailBlob: Blob;
  } | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleVideoRecorded = (videoBlob: Blob, thumbnailBlob: Blob) => {
    setRecordedVideo({ videoBlob, thumbnailBlob });
  };

  const handleUploadComplete = (videoId: string) => {
    console.log('Video uploaded:', videoId);
    setShowUploadForm(false);
    // In a real app, you'd refresh the video list or add the new video
  };

  const handleDownload = (video: { id: string }) => {
    console.log('Download video:', video.id);
    // Implement download functionality
  };

  const handleShare = (video: { id: string }) => {
    console.log('Share video:', video.id);
    // Implement share functionality
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Video Recording & Playback Test
        </h1>
        <p className="text-muted-foreground">
          Test the video recording, upload, and playback functionality
        </p>
      </div>

      <Tabs defaultValue="recorder" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recorder" className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Recorder</span>
          </TabsTrigger>
          <TabsTrigger value="player" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Player</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center space-x-2">
            <Grid className="w-4 h-4" />
            <span>Gallery</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recorder" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Video Recorder Test</h2>
            <VideoRecorder
              onVideoRecorded={handleVideoRecorded}
              onCancel={() => console.log('Recording cancelled')}
              maxDuration={20}
            />
          </Card>

          {recordedVideo && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recorded Video Preview
              </h3>
              <VideoPlayer
                videoUrl={URL.createObjectURL(recordedVideo.videoBlob)}
                thumbnailUrl={URL.createObjectURL(recordedVideo.thumbnailBlob)}
                title="Recorded Video"
                caption="This is a test recording"
                autoPlay={false}
                showControls={true}
                onDownload={() => console.log('Download recorded video')}
                onShare={() => console.log('Share recorded video')}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="player" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Video Player Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockVideos.map((video) => (
                <VideoPlayer
                  key={video.id}
                  videoUrl={video.url}
                  thumbnailUrl={video.thumbnailUrl}
                  title={video.caption}
                  caption={video.caption}
                  uploadedBy={video.uploadedBy}
                  duration={video.duration}
                  isGreeting={video.isGreeting}
                  autoPlay={false}
                  showControls={true}
                  onDownload={() => handleDownload(video)}
                  onShare={() => handleShare(video)}
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Video Upload Test</h2>
            {!showUploadForm ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Test the video upload form with file selection and recording
                </p>
                <Button onClick={() => setShowUploadForm(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Open Upload Form
                </Button>
              </div>
            ) : (
              <VideoUploadForm
                eventId="test-event-id"
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowUploadForm(false)}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Video Gallery Test</h2>
            <div className="space-y-6">
              <VideoGallery
                videos={mockVideos}
                onDownload={handleDownload}
                onShare={handleShare}
                showGreetingsOnly={false}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Greetings Only Gallery
            </h3>
            <VideoGallery
              videos={mockVideos}
              onDownload={handleDownload}
              onShare={handleShare}
              showGreetingsOnly={true}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Browser Support Check */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Browser Support</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>MediaRecorder API:</strong>{' '}
            {typeof MediaRecorder !== 'undefined'
              ? '✅ Supported'
              : '❌ Not Supported'}
          </p>
          <p>
            <strong>getUserMedia:</strong>{' '}
            {typeof navigator.mediaDevices?.getUserMedia === 'function'
              ? '✅ Supported'
              : '❌ Not Supported'}
          </p>
          <p>
            <strong>Video Recording:</strong>{' '}
            {typeof MediaRecorder !== 'undefined' &&
            typeof navigator.mediaDevices?.getUserMedia === 'function'
              ? '✅ Available'
              : '❌ Not Available'}
          </p>
        </div>
      </Card>
    </div>
  );
}
