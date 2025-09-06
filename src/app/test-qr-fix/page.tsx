"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  QrCode,
  Download,
  RefreshCw,
} from "lucide-react";

// Test with the new event ID
const TEST_EVENT_ID = "518def38-942c-451d-bb5e-148630bc21e7";

export default function TestQRFixPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    pngTest: boolean | null;
    svgTest: boolean | null;
    displayTest: boolean | null;
  }>({
    pngTest: null,
    svgTest: null,
    displayTest: null,
  });

  // Test PNG QR code generation
  const testPNGQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/qr/${TEST_EVENT_ID}?format=png&size=256&branded=true`,
      );

      if (!response.ok) {
        throw new Error(
          `PNG API returned ${response.status}: ${response.statusText}`,
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);

      setTestResults((prev) => ({ ...prev, pngTest: true, displayTest: true }));
    } catch (err) {
      console.error("PNG QR Code test failed:", err);
      setError(err instanceof Error ? err.message : "PNG test failed");
      setTestResults((prev) => ({
        ...prev,
        pngTest: false,
        displayTest: false,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test SVG QR code generation
  const testSVGQRCode = async () => {
    try {
      const response = await fetch(
        `/api/qr/${TEST_EVENT_ID}?format=svg&size=256&branded=true`,
      );

      if (!response.ok) {
        throw new Error(
          `SVG API returned ${response.status}: ${response.statusText}`,
        );
      }

      const svgText = await response.text();
      console.log("SVG QR Code received:", svgText.substring(0, 100) + "...");

      setTestResults((prev) => ({ ...prev, svgTest: true }));
    } catch (err) {
      console.error("SVG QR Code test failed:", err);
      setError(err instanceof Error ? err.message : "SVG test failed");
      setTestResults((prev) => ({ ...prev, svgTest: false }));
    }
  };

  // Test download functionality
  const testDownload = async () => {
    try {
      const response = await fetch(
        `/api/qr/${TEST_EVENT_ID}?format=png&size=256&branded=true`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${TEST_EVENT_ID}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download test failed:", err);
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  // Run initial tests
  useEffect(() => {
    testPNGQRCode();
    testSVGQRCode();
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
          <h1 className="text-3xl font-bold">QR Code Fix Test</h1>
          <p className="text-muted-foreground">
            Test QR code generation after fixing the data URL issue
          </p>
        </div>

        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle>Test Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Event ID:</span>
              <span className="text-sm font-mono">{TEST_EVENT_ID}</span>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                PNG Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.pngTest === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.pngTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.pngTest === null
                    ? "Testing..."
                    : testResults.pngTest
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
                SVG Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.svgTest === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.svgTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.svgTest === null
                    ? "Testing..."
                    : testResults.svgTest
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
                Display Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {testResults.displayTest === null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : testResults.displayTest ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {testResults.displayTest === null
                    ? "Testing..."
                    : testResults.displayTest
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
              <strong>All tests passed!</strong> QR code generation is working
              correctly after the fix.
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
              <CardTitle>Generated QR Code (Fixed)</CardTitle>
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
                This QR code should link to the event gallery
              </p>
              <Button onClick={testDownload} variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Test Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={testPNGQRCode}
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
                Test PNG Again
              </>
            )}
          </Button>
          <Button
            onClick={testSVGQRCode}
            disabled={isLoading}
            variant="outline"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Test SVG
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
                  Verify the QR code API now returns proper binary image data
                </li>
                <li>
                  Check that the QR code image displays correctly in the browser
                </li>
                <li>Test both PNG and SVG formats</li>
                <li>Verify download functionality works</li>
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
