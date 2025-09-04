import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  guestCount: number;
  photoCount: number;
  eventType: 'birthday' | 'wedding' | 'graduation' | 'fiesta' | 'other';
  imageUrl?: string;
  className?: string;
  onClick?: () => void;
}

const eventTypeConfig = {
  birthday: {
    gradient: 'gradient-golden',
    shadow: 'shadow-golden',
    icon: '🎂',
    label: 'Birthday',
  },
  wedding: {
    gradient: 'gradient-celebration',
    shadow: 'shadow-celebration',
    icon: '💒',
    label: 'Wedding',
  },
  graduation: {
    gradient: 'gradient-coral',
    shadow: 'shadow-coral',
    icon: '🎓',
    label: 'Graduation',
  },
  fiesta: {
    gradient: 'gradient-fiesta',
    shadow: 'shadow-celebration',
    icon: '🎉',
    label: 'Fiesta',
  },
  other: {
    gradient: 'gradient-sunset',
    shadow: 'shadow-golden',
    icon: '🎊',
    label: 'Celebration',
  },
};

export function EventCard({
  title,
  date,
  location,
  guestCount,
  photoCount,
  eventType,
  imageUrl,
  className,
  onClick,
}: EventCardProps) {
  const config = eventTypeConfig[eventType];

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg',
        'border-2 border-transparent hover:border-golden/20',
        config.shadow,
        className
      )}
      onClick={onClick}
    >
      {/* Event Image */}
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={`${title} event image`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs font-medium',
                config.gradient,
                'text-golden-foreground'
              )}
            >
              {config.label}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="mobile-heading text-left line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="mobile-text">{date}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="mobile-text line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{guestCount} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              <span>{photoCount} photos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
