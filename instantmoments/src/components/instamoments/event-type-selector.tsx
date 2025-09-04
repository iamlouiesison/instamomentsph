'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FILIPINO_EVENT_TYPES, type EventType } from '@/lib/validations/event';
import { cn } from '@/lib/utils';

interface EventTypeSelectorProps {
  selectedType?: EventType;
  onSelect: (type: EventType) => void;
  className?: string;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  selectedType,
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3',
        className
      )}
    >
      {Object.entries(FILIPINO_EVENT_TYPES).map(([key, eventType]) => {
        const isSelected = selectedType === key;
        return (
          <Card
            key={key}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            )}
            onClick={() => onSelect(key as EventType)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{eventType.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{eventType.label}</h3>
              <p className="text-xs text-muted-foreground leading-tight">
                {eventType.description}
              </p>
              {isSelected && (
                <Badge variant="default" className="mt-2 text-xs">
                  Selected
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
