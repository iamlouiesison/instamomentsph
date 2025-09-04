import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Loader2, Camera, Upload } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-golden', sizeClasses[size], className)}
    />
  );
}

interface PhotoUploadLoadingProps {
  progress?: number;
  fileName?: string;
  className?: string;
}

export function PhotoUploadLoading({
  progress = 0,
  fileName,
  className,
}: PhotoUploadLoadingProps) {
  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-golden/20 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-golden" />
          </div>
          <h3 className="font-semibold">Uploading Photo</h3>
          {fileName && (
            <p className="text-sm text-muted-foreground truncate">{fileName}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-golden h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <LoadingSpinner size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}

interface GalleryLoadingProps {
  count?: number;
  className?: string;
}

export function GalleryLoading({ count = 6, className }: GalleryLoadingProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="aspect-square w-full rounded-t-lg" />
              <div className="p-2 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface EventCardLoadingProps {
  count?: number;
  className?: string;
}

export function EventCardLoading({
  count = 3,
  className,
}: EventCardLoadingProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>

            <Skeleton className="h-6 w-3/4" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface PaymentLoadingProps {
  className?: string;
}

export function PaymentLoading({ className }: PaymentLoadingProps) {
  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-golden/20 rounded-full flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <h3 className="font-semibold">Processing Payment</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your payment...
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Connecting to payment gateway</span>
            <LoadingSpinner size="sm" />
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Verifying payment details</span>
            <LoadingSpinner size="sm" />
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Processing transaction</span>
            <LoadingSpinner size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CameraLoadingProps {
  className?: string;
}

export function CameraLoading({ className }: CameraLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 p-8',
        className
      )}
    >
      <div className="relative">
        <div className="w-16 h-16 bg-golden/20 rounded-full flex items-center justify-center">
          <Camera className="h-8 w-8 text-golden" />
        </div>
        <div className="absolute inset-0 w-16 h-16 border-2 border-golden border-t-transparent rounded-full animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold">Preparing Camera</h3>
        <p className="text-sm text-muted-foreground">
          Getting ready to capture your moments...
        </p>
      </div>
    </div>
  );
}
