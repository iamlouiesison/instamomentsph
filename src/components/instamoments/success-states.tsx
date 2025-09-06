import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Upload,
  CreditCard,
  Share2,
  Download,
  Heart,
  MessageCircle,
} from "lucide-react";

interface PhotoUploadSuccessProps {
  fileName?: string;
  onViewPhoto?: () => void;
  onUploadMore?: () => void;
  className?: string;
}

export function PhotoUploadSuccess({
  fileName,
  onViewPhoto,
  onUploadMore,
  className,
}: PhotoUploadSuccessProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto border-green-200 bg-green-50/50",
        className,
      )}
    >
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800">Photo Uploaded!</h3>
          {fileName && (
            <p className="text-sm text-green-700 truncate">{fileName}</p>
          )}
          <p className="text-sm text-green-700">
            Your photo has been successfully added to the event gallery.
          </p>
        </div>

        <div className="flex gap-3">
          {onUploadMore && (
            <Button
              variant="outline"
              onClick={onUploadMore}
              className="flex-1 mobile-button border-green-300 text-green-700 hover:bg-green-100"
            >
              Upload More
            </Button>
          )}
          {onViewPhoto && (
            <Button
              onClick={onViewPhoto}
              className="flex-1 mobile-button bg-green-600 hover:bg-green-700"
            >
              View Photo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentSuccessProps {
  amount?: string;
  paymentMethod?: string;
  onViewReceipt?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function PaymentSuccess({
  amount,
  paymentMethod,
  onViewReceipt,
  onContinue,
  className,
}: PaymentSuccessProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto border-green-200 bg-green-50/50",
        className,
      )}
    >
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading text-green-800">
            Payment Successful!
          </h3>
          {amount && (
            <p className="text-lg font-medium text-green-700">₱{amount}</p>
          )}
          {paymentMethod && (
            <p className="text-sm text-green-700">Paid with {paymentMethod}</p>
          )}
          <p className="text-sm text-green-700">
            Your payment has been processed successfully.
          </p>
        </div>

        <div className="space-y-3">
          {onViewReceipt && (
            <Button
              variant="outline"
              onClick={onViewReceipt}
              className="w-full mobile-button border-green-300 text-green-700 hover:bg-green-100"
            >
              View Receipt
            </Button>
          )}

          {onContinue && (
            <Button
              onClick={onContinue}
              className="w-full mobile-button bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          )}
        </div>

        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-sm text-green-800">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EventCreatedSuccessProps {
  eventName: string;
  eventCode: string;
  onShareEvent?: () => void;
  onViewEvent?: () => void;
  className?: string;
}

export function EventCreatedSuccess({
  eventName,
  eventCode,
  onShareEvent,
  onViewEvent,
  className,
}: EventCreatedSuccessProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto border-green-200 bg-green-50/50",
        className,
      )}
    >
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading text-green-800">
            Event Created!
          </h3>
          <p className="font-medium text-green-700">{eventName}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-green-700">Event Code:</span>
            <Badge className="bg-green-600 text-white font-mono">
              {eventCode}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {onShareEvent && (
            <Button
              onClick={onShareEvent}
              className="w-full mobile-button bg-green-600 hover:bg-green-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Event
            </Button>
          )}

          {onViewEvent && (
            <Button
              variant="outline"
              onClick={onViewEvent}
              className="w-full mobile-button border-green-300 text-green-700 hover:bg-green-100"
            >
              View Event
            </Button>
          )}
        </div>

        <div className="p-4 bg-green-100 rounded-lg">
          <h4 className="font-medium text-sm text-green-800 mb-2">
            Next Steps:
          </h4>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li>• Share the QR code with your guests</li>
            <li>• Start uploading photos to your event</li>
            <li>• Invite guests to join and contribute</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface PhotoLikedSuccessProps {
  onViewPhoto?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function PhotoLikedSuccess({
  onViewPhoto,
  onContinue,
  className,
}: PhotoLikedSuccessProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-sm mx-auto border-green-200 bg-green-50/50",
        className,
      )}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Heart className="h-6 w-6 text-green-600 fill-current" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-green-800">Photo Liked!</h3>
          <p className="text-sm text-green-700">
            Thanks for showing your appreciation!
          </p>
        </div>

        <div className="flex gap-3">
          {onViewPhoto && (
            <Button
              variant="outline"
              onClick={onViewPhoto}
              className="flex-1 mobile-button border-green-300 text-green-700 hover:bg-green-100"
            >
              View Photo
            </Button>
          )}
          {onContinue && (
            <Button
              onClick={onContinue}
              className="flex-1 mobile-button bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CommentAddedSuccessProps {
  onViewComment?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function CommentAddedSuccess({
  onViewComment,
  onContinue,
  className,
}: CommentAddedSuccessProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-sm mx-auto border-green-200 bg-green-50/50",
        className,
      )}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-green-600" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-green-800">Comment Added!</h3>
          <p className="text-sm text-green-700">
            Your comment has been posted successfully.
          </p>
        </div>

        <div className="flex gap-3">
          {onViewComment && (
            <Button
              variant="outline"
              onClick={onViewComment}
              className="flex-1 mobile-button border-green-300 text-green-700 hover:bg-green-100"
            >
              View Comment
            </Button>
          )}
          {onContinue && (
            <Button
              onClick={onContinue}
              className="flex-1 mobile-button bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface DownloadSuccessProps {
  count?: number;
  onViewDownloads?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function DownloadSuccess({
  count,
  onViewDownloads,
  onContinue,
  className,
}: DownloadSuccessProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto border-green-200 bg-green-50/50",
        className,
      )}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Download className="h-6 w-6 text-green-600" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-green-800">Download Complete!</h3>
          {count && (
            <p className="text-sm text-green-700">
              {count} photo{count > 1 ? "s" : ""} downloaded successfully
            </p>
          )}
          <p className="text-sm text-green-700">
            Your photos have been saved to your device.
          </p>
        </div>

        <div className="flex gap-3">
          {onViewDownloads && (
            <Button
              variant="outline"
              onClick={onViewDownloads}
              className="flex-1 mobile-button border-green-300 text-green-700 hover:bg-green-100"
            >
              View Downloads
            </Button>
          )}
          {onContinue && (
            <Button
              onClick={onContinue}
              className="flex-1 mobile-button bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
