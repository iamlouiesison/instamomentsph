'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { QRCodeDisplay } from '@/components/features/qr-code';
import {
  CheckCircle,
  AlertCircle,
  Info,
  QrCode,
  Download,
  Printer,
} from 'lucide-react';

// Mock event data for testing
const MOCK_EVENT = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Wedding Event',
  description: 'A beautiful wedding celebration',
  event_type: 'wedding' as const,
  event_date: '2024-12-25',
  gallery_slug: 'test-wedding-2024',
  qr_code_url: 'https://example.com/qr/test-wedding-2024.png',
  location: 'Manila, Philippines',
  host_id: 'test-host-id',
  subscription_tier: 'premium' as const,
  max_photos: 100,
  max_photos_per_user: 3,
  storage_days: 30,
  has_video_addon: true,
  requires_moderation: false,
  allow_downloads: true,
  is_public: true,
  custom_message: 'Welcome to our wedding!',
  total_photos: 0,
  total_videos: 0,
  total_contributors: 0,
  status: 'active' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export default function TestQRPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    apiTest: boolean | null;
    qrGeneration: boolean | null;
    downloadTest: boolean | null;
    printTest: boolean | null;
  }>({
    apiTest: null,
    qrGeneration: null,
    downloadTest: null,
    printTest: null,
  });

  // Test QR code API endpoint
  const testQRCodeAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/qr/${MOCK_EVENT.id}?format=png&size=256&branded=true`
      );

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);

      setTestResults((prev) => ({
        ...prev,
        apiTest: true,
        qrGeneration: true,
      }));
    } catch (err) {
      console.error('QR Code API test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTestResults((prev) => ({
        ...prev,
        apiTest: false,
        qrGeneration: false,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test download functionality
  const testDownload = async () => {
    try {
      const response = await fetch(
        `/api/qr/${MOCK_EVENT.id}?format=png&size=256&branded=true`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-qr-${MOCK_EVENT.gallery_slug}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTestResults((prev) => ({ ...prev, downloadTest: true }));
    } catch (err) {
      console.error('Download test failed:', err);
      setTestResults((prev) => ({ ...prev, downloadTest: false }));
    }
  };

  // Test print functionality
  const testPrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code Test - ${MOCK_EVENT.name}</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                .qr-container { max-width: 600px; margin: 0 auto; }
                .qr-code { width: 400px; height: 400px; margin: 20px auto; border: 2px solid #000; }
                .event-info { margin: 20px 0; }
                .instructions { margin-top: 30px; font-size: 14px; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="event-info">
                  <h1>${MOCK_EVENT.name}</h1>
                  <p>Wedding Event</p>
                  <p>${new Date(MOCK_EVENT.event_date).toLocaleDateString('en-PH')}</p>
                </div>
                <img src="/api/qr/${MOCK_EVENT.id}?format=print&size=512&branded=true" 
                     alt="QR Code for ${MOCK_EVENT.name}" 
                     class="qr-code" />
                <div class="instructions">
                  <h3>Test QR Code</h3>
                  <p>This is a test QR code for InstaMoments</p>
                </div>
              </div>
            </body>
          </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();

        setTestResults((prev) => ({ ...prev, printTest: true }));
      }
    } catch (err) {
      console.error('Print test failed:', err);
      setTestResults((prev) => ({ ...prev, printTest: false }));
    }
  };

  // Run initial test
  useEffect(() => {
    testQRCodeAPI();
  }, []);

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true
  );
  const anyTestFailed = Object.values(testResults).some(
    (result) => result === false
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">QR Code Generation Test</h1>
          <p className="text-muted-foreground">
            Test the QR code generation system and API endpoints
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
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">Wedding</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Slug:</span>
                <span className="text-sm font-mono">
                  {MOCK_EVENT.gallery_slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="text-sm font-medium">
                  {new Date(MOCK_EVENT.event_date).toLocaleDateString('en-PH')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    ? 'Testing...'
                    : testResults.apiTest
                      ? 'Passed'
                      : 'Failed'}
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
                    ? 'Testing...'
                    : testResults.qrGeneration
                      ? 'Passed'
                      : 'Failed'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.downloadTest === null ? (
                  <span className="text-muted-foreground">-</span>
                ) : testResults.downloadTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.downloadTest === null
                    ? 'Not tested'
                    : testResults.downloadTest
                      ? 'Passed'
                      : 'Failed'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Print Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.printTest === null ? (
                  <span className="text-muted-foreground">-</span>
                ) : testResults.printTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.printTest === null
                    ? 'Not tested'
                    : testResults.printTest
                      ? 'Passed'
                      : 'Failed'}
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
              <strong>All tests passed!</strong> QR code generation is working
              correctly.
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
              <CardTitle>Generated QR Code</CardTitle>
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
                <code className="bg-muted px-2 py-1 rounded">
                  {typeof window !== 'undefined'
                    ? window.location.origin
                    : 'http://localhost:3000'}
                  /gallery/{MOCK_EVENT.gallery_slug}
                </code>
              </p>
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
              event={MOCK_EVENT}
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
            onClick={testQRCodeAPI}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test API Again'}
          </Button>
          <Button
            onClick={testDownload}
            disabled={!qrCodeUrl}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Test Download
          </Button>
          <Button onClick={testPrint} disabled={!qrCodeUrl} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Test Print
          </Button>
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
                <li>Check if the QR code API endpoint responds correctly</li>
                <li>Verify QR code image is generated and displayed</li>
                <li>Test download functionality (PNG format)</li>
                <li>Test print functionality (opens print dialog)</li>
                <li>Scan the QR code with your phone to verify it works</li>
                <li>Check browser console for any errors</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">QR Code Library:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• qrcode: ^1.5.4 (Node.js QR code generation)</li>
                  <li>• @types/qrcode: ^1.5.5 (TypeScript definitions)</li>
                  <li>• Multiple output formats: PNG, SVG, Buffer</li>
                  <li>• Customizable colors and error correction</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">API Endpoints:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• GET /api/qr/[eventId] - Generate QR code</li>
                  <li>• POST /api/qr/[eventId] - Track QR scans</li>
                  <li>• Support for branded colors by event type</li>
                  <li>• Print-optimized high-resolution output</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
