'use client';

import React, { useState } from 'react';
import { PhotoUpload } from '@/components/features/upload/PhotoUpload';
import { PhotoUploadResponse } from '@/hooks/usePhotoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Upload } from 'lucide-react';
import { TestQueryProvider } from '@/components/providers/TestQueryProvider';

export default function TestPhotoUploadPage() {
  const [uploadResults, setUploadResults] = useState<PhotoUploadResponse[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [testEventId] = useState('test-event-123'); // Mock event ID for testing

  const handleUploadComplete = (uploadedPhotos: PhotoUploadResponse[]) => {
    console.log('Upload completed:', uploadedPhotos);
    setUploadResults((prev) => [...prev, ...uploadedPhotos]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    setUploadErrors((prev) => [...prev, error]);
  };

  const clearResults = () => {
    setUploadResults([]);
    setUploadErrors([]);
  };

  return (
    <TestQueryProvider>
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Photo Upload System Test</h1>
          <p className="text-muted-foreground">
            Test the complete photo upload system including camera integration,
            image processing, validation, and React Query state management.
          </p>
        </div>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Event Details</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Event ID:</strong> {testEventId}
                  </p>
                  <p>
                    <strong>Event Name:</strong> Test Event
                  </p>
                  <p>
                    <strong>Max Photos per User:</strong> 10
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Test Features</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Camera Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Image Compression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>React Query Hooks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Component */}
        <Card>
          <CardHeader>
            <CardTitle>Photo Upload Component</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              eventId={testEventId}
              eventName="Test Event"
              maxPhotosPerUser={10}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>

        {/* Upload Results */}
        {(uploadResults.length > 0 || uploadErrors.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test Results</span>
                <button
                  onClick={clearResults}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear Results
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success Results */}
              {uploadResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Successful Uploads ({uploadResults.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadResults.map((photo, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Success</Badge>
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Status:</strong>{' '}
                            {photo.success ? 'Success' : 'Failed'}
                          </p>
                          <p>
                            <strong>Photo ID:</strong>{' '}
                            {photo.data?.photoId || 'N/A'}
                          </p>
                          <p>
                            <strong>File URL:</strong>{' '}
                            {photo.data?.fileUrl || 'N/A'}
                          </p>
                          <p>
                            <strong>Message:</strong>{' '}
                            {photo.data?.message ||
                              photo.error?.message ||
                              'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Results */}
              {uploadErrors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Upload Errors ({uploadErrors.length})
                  </h4>
                  <div className="space-y-2">
                    {uploadErrors.map((error, index) => (
                      <div
                        key={index}
                        className="border border-red-200 rounded-lg p-3 bg-red-50"
                      >
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">1. Camera Test</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>
                  Click &quot;Take Photo&quot; button to test camera integration
                </li>
                <li>Allow camera permissions when prompted</li>
                <li>Take a photo and verify it appears in the preview</li>
              </ul>

              <h4 className="font-medium">2. File Upload Test</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>
                  Click &quot;Choose Files&quot; to select multiple images
                </li>
                <li>Try dragging and dropping images onto the upload area</li>
                <li>Verify image compression and thumbnail generation</li>
              </ul>

              <h4 className="font-medium">3. Form Validation Test</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>
                  Try uploading without entering a name (should show error)
                </li>
                <li>
                  Enter a very long caption (should be limited to 200 chars)
                </li>
                <li>Test email validation with invalid formats</li>
              </ul>

              <h4 className="font-medium">4. Upload Process Test</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Fill in contributor information and click upload</li>
                <li>Watch the progress indicators during upload</li>
                <li>Verify success/error states are displayed correctly</li>
              </ul>

              <h4 className="font-medium">5. Error Handling Test</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Try uploading very large files (should show size error)</li>
                <li>Try uploading non-image files (should be rejected)</li>
                <li>Test network error handling by disconnecting internet</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Components</h4>
                <Badge variant="default" className="bg-green-500">
                  ✅ Ready
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">API</h4>
                <Badge variant="default" className="bg-green-500">
                  ✅ Ready
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Hooks</h4>
                <Badge variant="default" className="bg-green-500">
                  ✅ Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TestQueryProvider>
  );
}
