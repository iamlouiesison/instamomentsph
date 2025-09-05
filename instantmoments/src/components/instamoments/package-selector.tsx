'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, Video } from 'lucide-react';
import {
  SUBSCRIPTION_TIERS,
  VIDEO_ADDON_PRICING,
  calculateEventPrice,
  type SubscriptionTier,
} from '@/lib/validations/event';
import { cn } from '@/lib/utils';

interface PackageSelectorProps {
  selectedTier?: SubscriptionTier;
  hasVideoAddon?: boolean;
  onSelectTier: (tier: SubscriptionTier) => void;
  onToggleVideoAddon: (enabled: boolean) => void;
  className?: string;
}

export const PackageSelector: React.FC<PackageSelectorProps> = ({
  selectedTier,
  hasVideoAddon = false,
  onSelectTier,
  onToggleVideoAddon,
  className,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Package Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const isSelected = selectedTier === key;
          const isPopular = key === 'standard';

          return (
            <Card
              key={key}
              className={cn(
                'relative cursor-pointer transition-all duration-200 hover:shadow-lg',
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50',
                isPopular && 'border-primary/20'
              )}
              onClick={() => onSelectTier(key as SubscriptionTier)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">{tier.label}</CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(tier.price)}
                </div>
                {tier.price === 0 && (
                  <Badge variant="secondary" className="w-fit mx-auto">
                    Free Forever
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• {tier.maxPhotos} photos total</div>
                    <div>• {tier.maxPhotosPerUser} photos per person</div>
                    <div>• {tier.storageDays} days storage</div>
                  </div>
                </div>

                {isSelected && (
                  <Button className="w-full mt-3" size="sm">
                    Selected
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Video Addon */}
      {selectedTier && selectedTier !== 'free' && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-700" />
                  Video Greetings Add-on
                  <Badge variant="outline" className="ml-2">
                    +{formatPrice(VIDEO_ADDON_PRICING[selectedTier])}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Let guests record 20-second video messages for the host
                </p>
              </div>
              <Button
                variant={hasVideoAddon ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToggleVideoAddon(!hasVideoAddon)}
              >
                {hasVideoAddon ? 'Added' : 'Add'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Price */}
      {selectedTier && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Price:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(calculateEventPrice(selectedTier, hasVideoAddon))}
              </span>
            </div>
            {hasVideoAddon && (
              <div className="text-sm text-muted-foreground mt-1">
                Includes video greetings add-on
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
