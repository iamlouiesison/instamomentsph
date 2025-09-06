import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

interface QRDisplayProps {
  qrCodeUrl: string;
  eventName: string;
  eventCode: string;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onRefresh?: () => void;
}

export function QRDisplay({
  qrCodeUrl,
  eventName,
  eventCode,
  className,
  onDownload,
  onShare,
  onCopy,
  onRefresh,
}: QRDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      try {
        await onRefresh();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventCode);
      onCopy?.();
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="mobile-heading">Event QR Code</CardTitle>
        <p className="mobile-text text-muted-foreground">
          Share this code with your guests
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-4 bg-white rounded-lg shadow-lg border-2 border-golden/20">
              <Image
                src={qrCodeUrl}
                alt={`QR Code for ${eventName}`}
                width={192}
                height={192}
                className="object-contain"
                sizes="192px"
              />
            </div>
            <Badge className="absolute -top-2 -right-2 bg-golden text-golden-foreground">
              Live
            </Badge>
          </div>
        </div>

        {/* Event Info */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold mobile-text">{eventName}</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Event Code:</span>
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {eventCode}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="mobile-button"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="mobile-button"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="mobile-button"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="mobile-button"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How to use:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Guests scan the QR code to join your event</li>
            <li>• They can upload photos directly to your gallery</li>
            <li>• All photos are automatically organized by event</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
