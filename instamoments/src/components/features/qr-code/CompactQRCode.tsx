'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/instamoments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Download, Share2, Copy, ExternalLink } from 'lucide-react';
import { FrontendEvent } from '@/lib/utils/event-transformer';
import { toast } from 'sonner';

interface CompactQRCodeProps {
  event: FrontendEvent;
  size?: 'small' | 'medium';
  className?: string;
}

export function CompactQRCode({
  event,
  size = 'small',
  className = '',
}: CompactQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Size configurations
  const sizeConfig = {
    small: { qrSize: 64, containerSize: 'w-16 h-16' },
    medium: { qrSize: 96, containerSize: 'w-24 h-24' },
  };

  const currentSize = sizeConfig[size];

  // Generate QR code URL
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          format: 'png',
          size: currentSize.qrSize.toString(),
          branded: 'true',
        });

        const qrUrl = `/api/qr/${event.id}?${params.toString()}`;
        setQrCodeUrl(qrUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [event.id, currentSize.qrSize]);

  // Copy gallery URL to clipboard
  const handleCopyUrl = async () => {
    try {
      const galleryUrl = `${window.location.origin}/gallery/${event.gallerySlug}`;
      await navigator.clipboard.writeText(galleryUrl);
      toast.success('Gallery URL copied to clipboard');
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Failed to copy URL');
    }
  };

  // Share QR code
  const handleShare = async () => {
    try {
      const galleryUrl = `${window.location.origin}/gallery/${event.gallerySlug}`;

      if (navigator.share) {
        await navigator.share({
          title: `${event.name} - InstaMoments`,
          text: `Join the photo sharing for ${event.name}!`,
          url: galleryUrl,
        });
      } else {
        // Fallback to copying URL
        await handleCopyUrl();
      }
    } catch (err) {
      console.error('Share error:', err);
      // Fallback to copying URL
      await handleCopyUrl();
    }
  };

  // Download QR code
  const handleDownload = async () => {
    try {
      const params = new URLSearchParams({
        format: 'png',
        size: '256',
        branded: 'true',
      });

      const response = await fetch(`/api/qr/${event.id}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${event.gallerySlug}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('QR code downloaded');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download QR code');
    }
  };

  if (error) {
    return (
      <div
        className={`${currentSize.containerSize} flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg ${className}`}
      >
        <QrCode className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={`${currentSize.containerSize} flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${className}`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-1">
              <LoadingSpinner className="w-4 h-4" />
            </div>
          ) : qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt={`QR Code for ${event.name}`}
              width={currentSize.qrSize}
              height={currentSize.qrSize}
              className="rounded-lg"
              priority
            />
          ) : (
            <QrCode className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code - {event.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <LoadingSpinner className="w-8 h-8" />
                  <p className="text-sm text-muted-foreground">
                    Generating QR code...
                  </p>
                </div>
              ) : qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt={`QR Code for ${event.name}`}
                  width={256}
                  height={256}
                  className="rounded-lg"
                  priority
                />
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isLoading}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              disabled={isLoading}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(`/gallery/${event.gallerySlug}`, '_blank')
              }
              disabled={isLoading}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Gallery
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">
              How guests can use this:
            </h4>
            <ol className="space-y-1 text-xs text-muted-foreground">
              <li>1. Open your phone&apos;s camera</li>
              <li>2. Point the camera at this QR code</li>
              <li>3. Tap the link that appears on screen</li>
              <li>4. Upload photos for the event!</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
