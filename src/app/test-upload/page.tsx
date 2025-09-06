"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PhotoUpload, UploadForm } from "@/components/features/upload";
import { PhotoUploadResponse } from "@/hooks/usePhotoUpload";
import { CheckCircle, AlertCircle, Info, Camera, Upload } from "lucide-react";
import { TestQueryProvider } from "@/components/providers/TestQueryProvider";

// Mock event data for testing
const MOCK_EVENT = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Test Wedding Event",
  maxPhotosPerUser: 5,
  requiresModeration: false,
  isPublic: true,
  hasVideoAddon: true,
};

export default function TestUploadPage() {
  const [currentStep, setCurrentStep] = useState<
    "upload" | "form" | "complete"
  >("upload");
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoUploadResponse[]>(
    [],
  );
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotosSelected = (photos: PhotoUploadResponse[]) => {
    setSelectedPhotos(photos);
    setCurrentStep("form");
  };

  const handleUploadComplete = (uploadedPhotos: PhotoUploadResponse[]) => {
    setUploadResults({
      success: uploadedPhotos.length,
      failed: selectedPhotos.length - uploadedPhotos.length,
      errors: [],
    });
    setCurrentStep("complete");
    setIsUploading(false);
  };

  const handleUploadError = (error: string) => {
    setUploadResults((prev) => ({
      ...prev,
      errors: [...prev.errors, error],
    }));
    setIsUploading(false);
  };

  const handleFormSubmit = () => {
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      handleUploadComplete(selectedPhotos);
    }, 2000);
  };

  const handleFormCancel = () => {
    setCurrentStep("upload");
    setSelectedPhotos([]);
  };

  const resetTest = () => {
    setCurrentStep("upload");
    setSelectedPhotos([]);
    setUploadResults({ success: 0, failed: 0, errors: [] });
    setIsUploading(false);
  };

  return (
    <TestQueryProvider>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Photo Upload System Test</h1>
            <p className="text-muted-foreground">
              Test the complete photo upload flow with mobile camera integration
            </p>

            {/* Test Event Info */}
            <Card className="max-w-md mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Test Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Event:</span>
                  <span className="text-sm font-medium">{MOCK_EVENT.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Max Photos:
                  </span>
                  <span className="text-sm font-medium">
                    {MOCK_EVENT.maxPhotosPerUser}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Moderation:
                  </span>
                  <Badge
                    variant={
                      MOCK_EVENT.requiresModeration
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {MOCK_EVENT.requiresModeration
                      ? "Required"
                      : "Auto-approve"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Videos:</span>
                  <Badge
                    variant={MOCK_EVENT.hasVideoAddon ? "default" : "secondary"}
                  >
                    {MOCK_EVENT.hasVideoAddon ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${currentStep === "upload" ? "text-primary" : currentStep === "form" || currentStep === "complete" ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "upload" ? "bg-primary text-primary-foreground" : currentStep === "form" || currentStep === "complete" ? "bg-green-600 text-white" : "bg-muted"}`}
                >
                  {currentStep === "form" || currentStep === "complete" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Select Photos</span>
              </div>

              <div className="w-8 h-px bg-muted"></div>

              <div
                className={`flex items-center space-x-2 ${currentStep === "form" ? "text-primary" : currentStep === "complete" ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "form" ? "bg-primary text-primary-foreground" : currentStep === "complete" ? "bg-green-600 text-white" : "bg-muted"}`}
                >
                  {currentStep === "complete" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Upload Info</span>
              </div>

              <div className="w-8 h-px bg-muted"></div>

              <div
                className={`flex items-center space-x-2 ${currentStep === "complete" ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "complete" ? "bg-green-600 text-white" : "bg-muted"}`}
                >
                  {currentStep === "complete" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm">3</span>
                  )}
                </div>
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Test Instructions:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    Try uploading different image formats (JPEG, PNG, WebP,
                    HEIC)
                  </li>
                  <li>Test camera capture on mobile devices</li>
                  <li>
                    Try uploading files larger than 10MB (should be rejected)
                  </li>
                  <li>Test drag-and-drop functionality</li>
                  <li>Verify image compression and thumbnail generation</li>
                  <li>Test form validation with invalid data</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Upload Component */}
          {currentStep === "upload" && (
            <PhotoUpload
              eventId={MOCK_EVENT.id}
              eventName={MOCK_EVENT.name}
              maxPhotosPerUser={MOCK_EVENT.maxPhotosPerUser}
              onUploadComplete={handlePhotosSelected}
              onUploadError={handleUploadError}
            />
          )}

          {/* Upload Form */}
          {currentStep === "form" && (
            <UploadForm
              eventName={MOCK_EVENT.name}
              maxPhotosPerUser={MOCK_EVENT.maxPhotosPerUser}
              requiresModeration={MOCK_EVENT.requiresModeration}
              isPublic={MOCK_EVENT.isPublic}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSubmitting={isUploading}
              showAdvancedOptions={true}
            />
          )}

          {/* Upload Results */}
          {currentStep === "complete" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Upload Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResults.success}
                    </div>
                    <div className="text-sm text-green-600">
                      Photos Uploaded
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResults.failed}
                    </div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>

                {uploadResults.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Upload Errors:</p>
                        <ul className="list-disc list-inside text-sm">
                          {uploadResults.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button onClick={resetTest} className="flex-1">
                    Test Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Testing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mobile Camera</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Test camera capture functionality on mobile devices. Should
                  work with both front and back cameras.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Image Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatic compression, WebP conversion, and thumbnail
                  generation for optimal performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  File type validation, size limits, rate limiting, and content
                  security checks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drag & Drop</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Drag and drop multiple files for batch upload with progress
                  tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time validation of contributor information and content
                  moderation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive error handling with user-friendly messages and
                  recovery options.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Components Created:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• PhotoUpload.tsx - Main upload component</li>
                    <li>• UploadForm.tsx - Contributor information form</li>
                    <li>• image-processing.ts - Image compression utilities</li>
                    <li>• upload-security.ts - Security validation</li>
                    <li>• upload.ts - Validation schemas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">API Endpoints:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• POST /api/upload/photo - Photo upload endpoint</li>
                    <li>• Rate limiting (10 photos/10 minutes)</li>
                    <li>• File validation and security checks</li>
                    <li>• Supabase storage integration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TestQueryProvider>
  );
}
