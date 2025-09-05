'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/instamoments';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Printer,
  Share2,
  Copy,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { Event } from '@/types/database';
import { FILIPINO_EVENT_TYPES } from '@/lib/validations/event';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  event: Event;
  size?: 'small' | 'medium' | 'large' | 'print';
  showInstructions?: boolean;
  showDownloadOptions?: boolean;
  branded?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  event,
  size = 'medium',
  showInstructions = true,
  showDownloadOptions = true,
  branded = true,
  className = '',
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Size configurations
  const sizeConfig = {
    small: { qrSize: 128, containerSize: 'w-32 h-32' },
    medium: { qrSize: 256, containerSize: 'w-64 h-64' },
    large: { qrSize: 384, containerSize: 'w-96 h-96' },
    print: { qrSize: 512, containerSize: 'w-[512px] h-[512px]' },
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
          branded: branded.toString(),
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
  }, [event.id, currentSize.qrSize, branded]);

  // Download QR code
  const handleDownload = async (format: 'png' | 'svg' | 'print') => {
    try {
      const params = new URLSearchParams({
        format,
        size: format === 'print' ? '512' : currentSize.qrSize.toString(),
        branded: branded.toString(),
      });

      const response = await fetch(`/api/qr/${event.id}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${event.gallery_slug}-${format}.${format === 'svg' ? 'svg' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download QR code');
    }
  };

  // Copy gallery URL to clipboard
  const handleCopyUrl = async () => {
    try {
      const galleryUrl = `${window.location.origin}/gallery/${event.gallery_slug}`;
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
      const galleryUrl = `${window.location.origin}/gallery/${event.gallery_slug}`;

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

  // Print QR code
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${event.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container { 
                max-width: 600px; 
                margin: 0 auto; 
              }
              .qr-code { 
                width: 400px; 
                height: 400px; 
                margin: 20px auto;
                border: 2px solid #000;
              }
              .event-info { 
                margin: 20px 0; 
              }
              .instructions { 
                margin-top: 30px; 
                font-size: 14px; 
                line-height: 1.5;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .qr-code { width: 300px; height: 300px; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="event-info">
                <h1>${event.name}</h1>
                <p>${FILIPINO_EVENT_TYPES[event.event_type]?.label || event.event_type}</p>
                ${event.event_date ? `<p>${new Date(event.event_date).toLocaleDateString('en-PH')}</p>` : ''}
              </div>
              <img src="/api/qr/${event.id}?format=print&size=512&branded=${branded}" 
                   alt="QR Code for ${event.name}" 
                   class="qr-code" />
              <div class="instructions">
                <h3>Paano gamitin ang QR Code:</h3>
                <p>1. Buksan ang camera ng inyong phone</p>
                <p>2. I-point ang camera sa QR code</p>
                <p>3. I-tap ang link na lalabas</p>
                <p>4. Mag-upload ng mga larawan at video!</p>
                <br>
                <p><strong>InstaMoments.ph</strong></p>
              </div>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const eventTypeInfo = FILIPINO_EVENT_TYPES[event.event_type];

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load QR code</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Share this QR code with your guests
            </CardDescription>
          </div>
          {eventTypeInfo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <eventTypeInfo.icon className="w-3 h-3 text-gray-700" />
              {eventTypeInfo.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div
            className={`${currentSize.containerSize} flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg`}
          >
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
                width={currentSize.qrSize}
                height={currentSize.qrSize}
                className="rounded-lg"
                priority
              />
            ) : null}
          </div>
        </div>

        {/* Download Options */}
        {showDownloadOptions && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('png')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('svg')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isLoading}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
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
          </div>
        )}

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Paano gamitin ng mga bisita:
            </h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                Buksan ang camera ng inyong phone
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                I-point ang camera sa QR code na ito
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                I-tap ang link na lalabas sa screen
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  4
                </span>
                Mag-upload ng mga larawan at video para sa event!
              </li>
            </ol>
          </div>
        )}

        {/* Event Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            <strong>{event.name}</strong>
          </p>
          {event.event_date && (
            <p>
              {new Date(event.event_date).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {event.location && <p>{event.location}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
