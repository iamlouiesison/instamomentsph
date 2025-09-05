'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_TYPES, type EventType } from '@/lib/validations/event';
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
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        className
      )}
    >
      {Object.entries(EVENT_TYPES).map(([key, eventType]) => {
        const isSelected = selectedType === key;
        return (
          <Card
            key={key}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
              isSelected
                ? 'ring-2 ring-primary bg-primary/5 border-primary/20 shadow-md'
                : 'hover:bg-muted/50 border-border hover:border-primary/30'
            )}
            onClick={() => onSelect(key as EventType)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-3">{eventType.emoji}</div>
              <h3 className="font-semibold text-base mb-2 text-foreground">
                {eventType.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {eventType.description}
              </p>
              {isSelected && (
                <Badge 
                  variant="default" 
                  className="mt-3 text-xs px-3 py-1"
                >
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
