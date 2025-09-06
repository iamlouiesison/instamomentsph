import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@/components/ui/calendar-icon";
import {
  Camera,
  Users,
  Image as ImageIcon,
  Plus,
  QrCode,
  Heart,
  MessageCircle,
} from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          {icon}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading">{title}</h3>
          <p className="mobile-text text-muted-foreground">{description}</p>
        </div>

        {action && (
          <Button onClick={action.onClick} className="mobile-button">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyEventsProps {
  onCreateEvent?: () => void;
  className?: string;
}

export function EmptyEvents({ onCreateEvent, className }: EmptyEventsProps) {
  return (
    <EmptyState
      icon={<CalendarIcon size="xl" variant="muted" />}
      title="No Events Yet"
      description="Create your first event to start collecting memories from your celebrations."
      action={
        onCreateEvent
          ? {
              label: "Create Event",
              onClick: onCreateEvent,
            }
          : undefined
      }
      className={className}
    />
  );
}

interface EmptyPhotosProps {
  onUploadPhoto?: () => void;
  onScanQR?: () => void;
  className?: string;
}

export function EmptyPhotos({
  onUploadPhoto,
  onScanQR,
  className,
}: EmptyPhotosProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <ImageIcon
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading">No Photos Yet</h3>
          <p className="mobile-text text-muted-foreground">
            Start building your photo collection by uploading photos or scanning
            a QR code to join an event.
          </p>
        </div>

        <div className="space-y-3">
          {onUploadPhoto && (
            <Button onClick={onUploadPhoto} className="w-full mobile-button">
              <Plus className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          )}

          {onScanQR && (
            <Button
              variant="outline"
              onClick={onScanQR}
              className="w-full mobile-button"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyGalleryProps {
  eventName?: string;
  onUploadPhoto?: () => void;
  className?: string;
}

export function EmptyGallery({
  eventName,
  onUploadPhoto,
  className,
}: EmptyGalleryProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-golden/20 rounded-full flex items-center justify-center">
          <Camera className="h-8 w-8 text-golden" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading">
            {eventName ? `${eventName} Gallery` : "Event Gallery"}
          </h3>
          <p className="mobile-text text-muted-foreground">
            Be the first to share a photo from this celebration!
          </p>
        </div>

        {onUploadPhoto && (
          <Button onClick={onUploadPhoto} className="mobile-button">
            <Plus className="h-4 w-4 mr-2" />
            Add First Photo
          </Button>
        )}

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How to add photos:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            <li>• Tap the camera button to take a new photo</li>
            <li>• Select photos from your gallery</li>
            <li>• Share the QR code with guests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyGuestsProps {
  onInviteGuests?: () => void;
  className?: string;
}

export function EmptyGuests({ onInviteGuests, className }: EmptyGuestsProps) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No Guests Yet"
      description="Invite your friends and family to join your celebration and share their photos."
      action={
        onInviteGuests
          ? {
              label: "Invite Guests",
              onClick: onInviteGuests,
            }
          : undefined
      }
      className={className}
    />
  );
}

interface EmptySearchProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}

export function EmptySearch({
  searchTerm,
  onClearSearch,
  className,
}: EmptySearchProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <ImageIcon
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading">No Results Found</h3>
          <p className="mobile-text text-muted-foreground">
            {searchTerm
              ? `No photos found for "${searchTerm}"`
              : "No photos match your search criteria"}
          </p>
        </div>

        {onClearSearch && (
          <Button
            variant="outline"
            onClick={onClearSearch}
            className="mobile-button"
          >
            Clear Search
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyNotificationsProps {
  className?: string;
}

export function EmptyNotifications({ className }: EmptyNotificationsProps) {
  return (
    <EmptyState
      icon={<Heart className="h-8 w-8 text-muted-foreground" />}
      title="All Caught Up!"
      description="You have no new notifications. Check back later for updates on your events and photos."
      className={className}
    />
  );
}

interface EmptyCommentsProps {
  onAddComment?: () => void;
  className?: string;
}

export function EmptyComments({ onAddComment, className }: EmptyCommentsProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold mobile-heading">No Comments Yet</h3>
          <p className="mobile-text text-muted-foreground">
            Be the first to share your thoughts about this photo!
          </p>
        </div>

        {onAddComment && (
          <Button onClick={onAddComment} className="mobile-button">
            <MessageCircle className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
