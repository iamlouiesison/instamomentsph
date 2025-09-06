"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  CameraOff,
  AlertTriangle,
  Smartphone,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { validateQRCodeContent, extractEventSlugFromQR } from "@/lib/qr-code";
import { useRouter } from "next/navigation";

interface QRScannerProps {
  onScan?: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
  showInstructions?: boolean;
}

export function QRScanner({
  onScan,
  onError,
  className = "",
  showInstructions = true,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const scannerRef = useRef<HTMLDivElement>(null);
  const qrCodeScannerRef = useRef<unknown>(null);
  const router = useRouter();

  // Check if QR code scanning is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Check if html5-qrcode is available
        if (typeof window !== "undefined") {
          await import("html5-qrcode");
          setIsSupported(true);
        }
      } catch (err) {
        console.error("QR code scanning not supported:", err);
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // Stop QR code scanning
  const stopScanning = useCallback(() => {
    try {
      if (qrCodeScannerRef.current) {
        (qrCodeScannerRef.current as { clear: () => void }).clear();
        qrCodeScannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  }, []);

  // Handle scan result
  const handleScanResult = useCallback(
    (result: string) => {
      try {
        // Validate QR code content
        if (!validateQRCodeContent(result)) {
          toast.error(
            "Invalid QR code. Please scan a valid InstaMoments QR code.",
          );
          return;
        }

        // Extract event slug
        const eventSlug = extractEventSlugFromQR(result);
        if (!eventSlug) {
          toast.error(
            "Invalid QR code format. Please scan a valid InstaMoments QR code.",
          );
          return;
        }

        // Stop scanning
        stopScanning();

        // Call onScan callback if provided
        onScan?.(result);

        // Navigate to gallery
        router.push(`/gallery/${eventSlug}`);

        toast.success("QR code scanned successfully!");
      } catch (err) {
        console.error("Error processing scan result:", err);
        toast.error("Failed to process QR code. Please try again.");
      }
    },
    [onScan, stopScanning, router],
  );

  // Start QR code scanning
  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Dynamic import to avoid SSR issues
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      if (!scannerRef.current) {
        throw new Error("Scanner container not found");
      }

      // Clear any existing scanner
      if (qrCodeScannerRef.current) {
        (qrCodeScannerRef.current as { clear: () => void }).clear();
      }

      // Create new scanner
      const scanner = new Html5QrcodeScanner(
        scannerRef.current.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          useBarCodeDetectorIfSupported: true,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        },
        false, // verbose
      );

      qrCodeScannerRef.current = scanner;

      // Start scanning
      await scanner.render(
        (decodedText: string) => {
          handleScanResult(decodedText);
        },
        (errorMessage: string) => {
          // Ignore common scanning errors
          if (
            !errorMessage.includes("No QR code found") &&
            !errorMessage.includes("NotFoundException")
          ) {
            console.log("QR Code scan error:", errorMessage);
          }
        },
      );

      setHasPermission(true);
    } catch (err: unknown) {
      console.error("Error starting QR scanner:", err);

      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.message.includes("Permission denied")
        ) {
          setError(
            "Camera permission denied. Please allow camera access and try again.",
          );
          setHasPermission(false);
        } else if (
          err.name === "NotFoundError" ||
          err.message.includes("No camera found")
        ) {
          setError("No camera found. Please connect a camera and try again.");
          setHasPermission(false);
        } else if (err.message.includes("NotSupportedError")) {
          setError("QR code scanning is not supported on this device.");
          setIsSupported(false);
        } else {
          setError("Failed to start camera. Please try again.");
        }
      } else {
        setError("Failed to start camera. Please try again.");
      }

      setIsScanning(false);
      onError?.(err instanceof Error ? err.message : "Unknown error");
    }
  }, [onError, handleScanResult]);

  // Handle manual URL entry
  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!manualUrl.trim()) {
        toast.error("Please enter a gallery URL");
        return;
      }

      // Validate URL
      if (!validateQRCodeContent(manualUrl)) {
        toast.error(
          "Invalid URL. Please enter a valid InstaMoments gallery URL.",
        );
        return;
      }

      // Extract event slug and navigate
      const eventSlug = extractEventSlugFromQR(manualUrl);
      if (eventSlug) {
        router.push(`/gallery/${eventSlug}`);
        toast.success("Navigating to gallery...");
      } else {
        toast.error("Invalid gallery URL format.");
      }
    },
    [manualUrl, router],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // Request camera permission
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError(
          "Camera permission denied. Please allow camera access in your browser settings.",
        );
        setHasPermission(false);
      } else {
        setError(
          "Failed to access camera. Please check your camera connection.",
        );
        setHasPermission(false);
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan QR codes to access event galleries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              QR code scanning is not supported on this device or browser.
              Please use a modern mobile browser or enter the gallery URL
              manually.
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full"
            >
              Enter Gallery URL Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan the QR code to access the event gallery
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scanner Container */}
        <div className="relative">
          <div
            id="qr-scanner-container"
            ref={scannerRef}
            className="w-full min-h-[300px] bg-muted rounded-lg flex items-center justify-center"
          >
            {!isScanning && (
              <div className="text-center space-y-4">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-muted-foreground mb-2">
                    {hasPermission === false
                      ? "Camera permission required"
                      : "Ready to scan QR codes"}
                  </p>
                  {hasPermission === false ? (
                    <Button onClick={requestPermission}>
                      Grant Camera Permission
                    </Button>
                  ) : (
                    <Button onClick={startScanning}>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stop Scanning Button */}
          {isScanning && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={stopScanning}>
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            </div>
          )}
        </div>

        {/* Manual URL Input */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Enter Gallery URL Manually
          </Button>

          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://instamoments.ph/gallery/event-slug"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
              <Button type="submit" className="w-full" size="sm">
                Go to Gallery
              </Button>
            </form>
          )}
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Paano mag-scan ng QR code:
            </h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                I-click ang &quot;Start Scanning&quot; button
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                Point the camera at the QR code
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                Hintayin na ma-detect ang QR code
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  4
                </span>
                Automatic na mapupunta sa gallery page
              </li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
