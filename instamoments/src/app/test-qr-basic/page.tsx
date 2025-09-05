'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  AlertCircle,
  QrCode,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function TestQRBasicPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testText, setTestText] = useState(
    'https://instamoments.ph/gallery/test-event'
  );
  const [testResults, setTestResults] = useState<{
    apiTest: boolean | null;
    qrGeneration: boolean | null;
  }>({
    apiTest: null,
    qrGeneration: null,
  });

  // Test QR code generation
  const testQRCodeGeneration = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTestResults({ apiTest: null, qrGeneration: null });

      const response = await fetch(
        `/api/test-qr?text=${encodeURIComponent(testText)}&format=png&size=256`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API returned ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);

      setTestResults({ apiTest: true, qrGeneration: true });
    } catch (err) {
      console.error('QR Code generation test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTestResults({ apiTest: false, qrGeneration: false });
    } finally {
      setIsLoading(false);
    }
  }, [testText]);

  // Test download functionality
  const testDownload = async () => {
    try {
      const response = await fetch(
        `/api/test-qr?text=${encodeURIComponent(testText)}&format=png&size=256`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-qr-code.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download test failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  // Run initial test
  useEffect(() => {
    testQRCodeGeneration();
  }, [testQRCodeGeneration]);

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
          <h1 className="text-3xl font-bold">QR Code Basic Test</h1>
          <p className="text-muted-foreground">
            Test QR code generation without database dependency
          </p>
        </div>

        {/* Test Input */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testText">QR Code Text/URL:</Label>
              <Input
                id="testText"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text or URL for QR code"
                className="mt-1"
              />
            </div>
            <Button
              onClick={testQRCodeGeneration}
              disabled={isLoading || !testText.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                This QR code contains: <br />
                <code className="bg-muted px-2 py-1 rounded break-all">
                  {testText}
                </code>
              </p>
              <Button onClick={testDownload} variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Test Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Test Instructions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Enter any text or URL in the input field above</li>
                <li>Click &quot;Generate QR Code&quot; to test the API</li>
                <li>Verify the QR code image is generated and displayed</li>
                <li>Test download functionality</li>
                <li>Scan the QR code with your phone to verify it works</li>
                <li>Check browser console for any errors</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
