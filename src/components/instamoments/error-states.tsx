import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Wifi,
  Camera,
  Upload,
  CreditCard,
  RefreshCw,
  X,
} from 'lucide-react';

interface ErrorStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function ErrorState({
  icon,
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card
      className={cn('w-full max-w-md mx-auto border-destructive/20', className)}
    >
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          {icon}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading text-destructive">
            {title}
          </h3>
          <p className="mobile-text text-muted-foreground">{description}</p>
        </div>

        {action && (
          <Button
            variant="destructive"
            onClick={action.onClick}
            className="mobile-button"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <ErrorState
      icon={<Wifi className="h-8 w-8 text-destructive" />}
      title="Connection Error"
      description="Please check your internet connection and try again."
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
      className={className}
    />
  );
}

interface UploadErrorProps {
  fileName?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function UploadError({
  fileName,
  onRetry,
  onCancel,
  className,
}: UploadErrorProps) {
  return (
    <Card
      className={cn('w-full max-w-md mx-auto border-destructive/20', className)}
    >
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-destructive">Upload Failed</h3>
          {fileName && (
            <p className="text-sm text-muted-foreground truncate">{fileName}</p>
          )}
          <p className="text-sm text-muted-foreground">
            There was an error uploading your photo. Please try again.
          </p>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 mobile-button"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          {onRetry && (
            <Button
              variant="destructive"
              onClick={onRetry}
              className="flex-1 mobile-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CameraErrorProps {
  onRetry?: () => void;
  onUseGallery?: () => void;
  className?: string;
}

export function CameraError({
  onRetry,
  onUseGallery,
  className,
}: CameraErrorProps) {
  return (
    <Card
      className={cn('w-full max-w-md mx-auto border-destructive/20', className)}
    >
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <Camera className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading text-destructive">
            Camera Error
          </h3>
          <p className="mobile-text text-muted-foreground">
            Unable to access your camera. Please check permissions or try using
            your photo gallery instead.
          </p>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <Button
              variant="destructive"
              onClick={onRetry}
              className="w-full mobile-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Camera Again
            </Button>
          )}

          {onUseGallery && (
            <Button
              variant="outline"
              onClick={onUseGallery}
              className="w-full mobile-button"
            >
              Use Photo Gallery
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentErrorProps {
  errorMessage?: string;
  onRetry?: () => void;
  onTryDifferentMethod?: () => void;
  className?: string;
}

export function PaymentError({
  errorMessage,
  onRetry,
  onTryDifferentMethod,
  className,
}: PaymentErrorProps) {
  return (
    <Card
      className={cn('w-full max-w-md mx-auto border-destructive/20', className)}
    >
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading text-destructive">
            Payment Failed
          </h3>
          <p className="mobile-text text-muted-foreground">
            {errorMessage ||
              'There was an error processing your payment. Please try again.'}
          </p>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <Button
              variant="destructive"
              onClick={onRetry}
              className="w-full mobile-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {onTryDifferentMethod && (
            <Button
              variant="outline"
              onClick={onTryDifferentMethod}
              className="w-full mobile-button"
            >
              Try Different Payment Method
            </Button>
          )}
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            If the problem persists, please contact support or try a different
            payment method.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

interface GenericErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function GenericError({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onDismiss,
  className,
}: GenericErrorProps) {
  return (
    <Card
      className={cn('w-full max-w-md mx-auto border-destructive/20', className)}
    >
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading text-destructive">
            {title}
          </h3>
          <p className="mobile-text text-muted-foreground">{message}</p>
        </div>

        <div className="flex gap-3">
          {onDismiss && (
            <Button
              variant="outline"
              onClick={onDismiss}
              className="flex-1 mobile-button"
            >
              Dismiss
            </Button>
          )}
          {onRetry && (
            <Button
              variant="destructive"
              onClick={onRetry}
              className="flex-1 mobile-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ValidationErrorProps {
  errors: string[];
  onDismiss?: () => void;
  className?: string;
}

export function ValidationError({
  errors,
  onDismiss,
  className,
}: ValidationErrorProps) {
  return (
    <Alert
      variant="destructive"
      className={cn('w-full max-w-md mx-auto', className)}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="mt-3"
          >
            <X className="h-4 w-4 mr-2" />
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
