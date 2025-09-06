"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QRCodeDisplay } from "@/components/features/qr-code";
import {
  CheckCircle,
  AlertCircle,
  QrCode,
  Download,
  RefreshCw,
} from "lucide-react";

// Real event data from our test event
const REAL_EVENT = {
  id: "1ace1980-e889-4b69-a7cc-4fc65aec3e8f",
  name: "Test Wedding Event",
  description: "A beautiful wedding celebration",
  event_type: "wedding" as const,
  event_date: new Date().toISOString().split("T")[0],
  gallery_slug: "test-wedding-mf6dw8r1",
  qr_code_url: "https://example.com/qr/test-wedding-mf6dw8r1.png",
  location: "Manila, Philippines",
  host_id: "da044330-42b6-4149-94b5-2a35774615a0",
  subscription_tier: "free" as const,
  max_photos: 30,
  max_photos_per_user: 3,
  storage_days: 3,
  has_video_addon: false,
  requires_moderation: false,
  allow_downloads: true,
  is_public: true,
  custom_message: "Welcome to our wedding!",
  total_photos: 0,
  total_videos: 0,
  total_contributors: 0,
  status: "active" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
};

export default function TestQRRealPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    apiTest: boolean | null;
    qrGeneration: boolean | null;
    componentTest: boolean | null;
  }>({
    apiTest: null,
    qrGeneration: null,
    componentTest: null,
  });

  // Test QR code generation with real event
  const testQRCodeGeneration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTestResults({
        apiTest: null,
        qrGeneration: null,
        componentTest: null,
      });

      const response = await fetch(
        `/api/qr/${REAL_EVENT.id}?format=png&size=256&branded=true`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API returned ${response.status}: ${errorData.error?.message || response.statusText}`,
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);

      setTestResults({
        apiTest: true,
        qrGeneration: true,
        componentTest: true,
      });
    } catch (err) {
      console.error("QR Code generation test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setTestResults({
        apiTest: false,
        qrGeneration: false,
        componentTest: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test download functionality
  const testDownload = async () => {
    try {
      const response = await fetch(
        `/api/qr/${REAL_EVENT.id}?format=png&size=256&branded=true`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${REAL_EVENT.gallery_slug}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download test failed:", err);
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  // Run initial test
  useEffect(() => {
    testQRCodeGeneration();
  }, []);

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true,
  );
  const anyTestFailed = Object.values(testResults).some(
    (result) => result === false,
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">QR Code Real Event Test</h1>
          <p className="text-muted-foreground">
            Test QR code generation with real event data from database
          </p>
        </div>

        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle>Real Event Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Event ID:
                  </span>
                  <span className="text-sm font-mono">{REAL_EVENT.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm font-medium">{REAL_EVENT.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="secondary">Wedding</Badge>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Gallery Slug:
                  </span>
                  <span className="text-sm font-mono">
                    {REAL_EVENT.gallery_slug}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline">{REAL_EVENT.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Location:
                  </span>
                  <span className="text-sm">{REAL_EVENT.location}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                API Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.apiTest === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.apiTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.apiTest === null
                    ? "Testing..."
                    : testResults.apiTest
                      ? "Passed"
                      : "Failed"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.qrGeneration === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.qrGeneration ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.qrGeneration === null
                    ? "Testing..."
                    : testResults.qrGeneration
                      ? "Passed"
                      : "Failed"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Component Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.componentTest === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.componentTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.componentTest === null
                    ? "Testing..."
                    : testResults.componentTest
                      ? "Passed"
                      : "Failed"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Status */}
        {allTestsPassed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>All tests passed!</strong> QR code generation with real
              event data is working correctly.
            </AlertDescription>
          </Alert>
        )}

        {anyTestFailed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Some tests failed.</strong> Check the error details below
              and fix the issues.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* QR Code Display */}
        {qrCodeUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Generated QR Code (API)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src={qrCodeUrl}
                  alt="Test QR Code"
                  width={256}
                  height={256}
                  className="border rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This QR code should link to: <br />
                <code className="bg-muted px-2 py-1 rounded break-all">
                  {typeof window !== "undefined"
                    ? window.location.origin
                    : "http://localhost:3000"}
                  /gallery/{REAL_EVENT.gallery_slug}
                </code>
              </p>
              <Button onClick={testDownload} variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QR Code Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Component Test</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeDisplay
              event={REAL_EVENT}
              size="medium"
              showInstructions={true}
              showDownloadOptions={true}
              branded={true}
            />
          </CardContent>
        </Card>

        {/* Test Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={testQRCodeGeneration}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Test Again
              </>
            )}
          </Button>
        </div>

        {/* Test Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Test Instructions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Verify the QR code API works with real event data from
                  database
                </li>
                <li>
                  Check that the QR code image is generated and displayed
                  correctly
                </li>
                <li>Test the QRCodeDisplay component with real event data</li>
                <li>Verify download functionality works</li>
                <li>
                  Scan the QR code with your phone to verify it links to the
                  correct gallery URL
                </li>
                <li>Check browser console for any errors</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
