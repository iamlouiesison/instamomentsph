'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info, QrCode, Download, Printer } from 'lucide-react';
import { generateQRCodeDataUrl, generateQRCodeSVG, generateQRCodeBuffer } from '@/lib/qr-code';

export default function TestQRSimplePage() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    dataUrl: boolean | null;
    svg: boolean | null;
    buffer: boolean | null;
  }>({
    dataUrl: null,
    svg: null,
    buffer: null,
  });

  const testUrl = 'https://instamoments.ph/gallery/test-wedding-2024';

  // Test QR code generation functions
  const testQRCodeGeneration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Test Data URL generation
      try {
        const dataUrl = await generateQRCodeDataUrl(testUrl);
        setQrCodeDataUrl(dataUrl);
        setTestResults(prev => ({ ...prev, dataUrl: true }));
      } catch (err) {
        console.error('Data URL generation failed:', err);
        setTestResults(prev => ({ ...prev, dataUrl: false }));
      }

      // Test SVG generation
      try {
        const svg = await generateQRCodeSVG(testUrl);
        setQrCodeSvg(svg);
        setTestResults(prev => ({ ...prev, svg: true }));
      } catch (err) {
        console.error('SVG generation failed:', err);
        setTestResults(prev => ({ ...prev, svg: false }));
      }

      // Test Buffer generation
      try {
        const buffer = await generateQRCodeBuffer(testUrl);
        console.log('Buffer generated successfully, size:', buffer.length);
        setTestResults(prev => ({ ...prev, buffer: true }));
      } catch (err) {
        console.error('Buffer generation failed:', err);
        setTestResults(prev => ({ ...prev, buffer: false }));
      }

    } catch (err) {
      console.error('QR Code generation test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test download functionality
  const testDownload = async () => {
    try {
      if (!qrCodeDataUrl) {
        throw new Error('No QR code data available');
      }

      const response = await fetch(qrCodeDataUrl);
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

  // Test print functionality
  const testPrint = () => {
    try {
      if (!qrCodeDataUrl) {
        throw new Error('No QR code data available');
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code Test</title>
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
                  <h1>Test QR Code</h1>
                  <p>InstaMoments QR Code Test</p>
                </div>
                <img src="${qrCodeDataUrl}" alt="Test QR Code" class="qr-code" />
                <div class="instructions">
                  <h3>Test QR Code</h3>
                  <p>This is a test QR code for InstaMoments</p>
                  <p>URL: ${testUrl}</p>
                </div>
              </div>
            </body>
          </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err) {
      console.error('Print test failed:', err);
      setError(err instanceof Error ? err.message : 'Print failed');
    }
  };

  // Run initial test
  useEffect(() => {
    testQRCodeGeneration();
  }, []);

  const allTestsPassed = Object.values(testResults).every(result => result === true);
  const anyTestFailed = Object.values(testResults).some(result => result === false);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">QR Code Generation Test (Simple)</h1>
          <p className="text-muted-foreground">
            Test the QR code generation library functions directly
          </p>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Data URL Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.dataUrl === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.dataUrl ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.dataUrl === null ? 'Testing...' : 
                   testResults.dataUrl ? 'Passed' : 'Failed'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                SVG Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.svg === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.svg ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.svg === null ? 'Testing...' : 
                   testResults.svg ? 'Passed' : 'Failed'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Buffer Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.buffer === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.buffer ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.buffer === null ? 'Testing...' : 
                   testResults.buffer ? 'Passed' : 'Failed'}
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
              <strong>All tests passed!</strong> QR code generation library is working correctly.
            </AlertDescription>
          </Alert>
        )}

        {anyTestFailed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Some tests failed.</strong> Check the error details below and fix the issues.
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
        {qrCodeDataUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Generated QR Code (Data URL)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-4">
                <img
                  src={qrCodeDataUrl}
                  alt="Test QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This QR code should link to: <br />
                <code className="bg-muted px-2 py-1 rounded">{testUrl}</code>
              </p>
            </CardContent>
          </Card>
        )}

        {/* SVG Display */}
        {qrCodeSvg && (
          <Card>
            <CardHeader>
              <CardTitle>Generated QR Code (SVG)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div 
                className="flex justify-center mb-4"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />
              <p className="text-sm text-muted-foreground">
                SVG format QR code (scalable vector)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Test Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={testQRCodeGeneration}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Again'}
          </Button>
          <Button
            onClick={testDownload}
            disabled={!qrCodeDataUrl}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Test Download
          </Button>
          <Button
            onClick={testPrint}
            disabled={!qrCodeDataUrl}
            variant="outline"
          >
            <Printer className="h-4 w-4 mr-2" />
            Test Print
          </Button>
        </div>

        {/* Test Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Test Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Check if the QR code library functions work correctly</li>
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
                <h4 className="font-medium mb-2">Test Functions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• generateQRCodeDataUrl() - PNG data URL</li>
                  <li>• generateQRCodeSVG() - SVG string</li>
                  <li>• generateQRCodeBuffer() - Binary buffer</li>
                  <li>• No database dependency for basic testing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
