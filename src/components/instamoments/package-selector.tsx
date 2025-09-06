"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Video } from "lucide-react";
import {
  SUBSCRIPTION_TIERS,
  VIDEO_ADDON_PRICING,
  calculateEventPrice,
  type SubscriptionTier,
} from "@/lib/validations/event";
import { cn } from "@/lib/utils";

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
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Package Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const isSelected = selectedTier === key;
          const isPopular = key === "standard";

          return (
            <Card
              key={key}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-xl border-2",
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 border-primary/20 shadow-lg"
                  : "hover:bg-muted/50 border-border hover:border-primary/30",
                isPopular && "border-primary/30",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectTier(key as SubscriptionTier);
              }}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-xl font-bold text-foreground">
                  {tier.label}
                </CardTitle>
                <div className="text-3xl font-bold text-primary mt-2">
                  {formatPrice(tier.price)}
                </div>
                {tier.price === 0 && (
                  <Badge variant="secondary" className="w-fit mx-auto mt-2">
                    Free Forever
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Photos total:</span>
                      <span className="font-medium">{tier.maxPhotos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per person:</span>
                      <span className="font-medium">
                        {tier.maxPhotosPerUser}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-medium">
                        {tier.storageDays} days
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Button type="button" className="w-full mt-4" size="lg">
                    Selected
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Video Addon */}
      {selectedTier && selectedTier !== "free" && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-3 text-foreground">
                  <Video className="w-5 h-5 text-primary" />
                  Video Greetings Add-on
                  <Badge variant="outline" className="ml-2 px-3 py-1">
                    +{formatPrice(VIDEO_ADDON_PRICING[selectedTier])}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Let guests record 20-second video messages for the host
                </p>
              </div>
              <Button
                type="button"
                variant={hasVideoAddon ? "default" : "outline"}
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleVideoAddon(!hasVideoAddon);
                }}
                className="ml-4"
              >
                {hasVideoAddon ? "Added" : "Add"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Price */}
      {selectedTier && (
        <Card className="bg-primary/10 border-2 border-primary/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-foreground">
                Total Price:
              </span>
              <span className="text-3xl font-bold text-primary">
                {formatPrice(calculateEventPrice(selectedTier, hasVideoAddon))}
              </span>
            </div>
            {hasVideoAddon && (
              <div className="text-sm text-muted-foreground mt-2 text-center">
                Includes video greetings add-on
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
