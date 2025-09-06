/**
 * Business logic for subscription tier limits and event expiration handling
 */

export interface SubscriptionLimits {
  maxPhotos: number;
  maxPhotosPerUser: number;
  maxVideos: number;
  storageDays: number;
  hasVideoAddon: boolean;
  price: number; // in centavos
}

export interface EventLimits {
  totalPhotos: number;
  totalVideos: number;
  totalContributors: number;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionLimits> = {
  free: {
    maxPhotos: 30,
    maxPhotosPerUser: 3,
    maxVideos: 0,
    storageDays: 3,
    hasVideoAddon: false,
    price: 0,
  },
  basic: {
    maxPhotos: 50,
    maxPhotosPerUser: 5,
    maxVideos: 0,
    storageDays: 7,
    hasVideoAddon: false,
    price: 69900, // ₱699
  },
  standard: {
    maxPhotos: 100,
    maxPhotosPerUser: 5,
    maxVideos: 20,
    storageDays: 14,
    hasVideoAddon: true,
    price: 99900, // ₱999
  },
  premium: {
    maxPhotos: 250,
    maxPhotosPerUser: 5,
    maxVideos: 50,
    storageDays: 30,
    hasVideoAddon: true,
    price: 199900, // ₱1,999
  },
  pro: {
    maxPhotos: 500,
    maxPhotosPerUser: 5,
    maxVideos: 100,
    storageDays: 30,
    hasVideoAddon: true,
    price: 349900, // ₱3,499
  },
};

export const VIDEO_ADDON_PRICES: Record<string, number> = {
  basic: 0, // Not available
  standard: 60000, // ₱600
  premium: 120000, // ₱1,200
  pro: 210000, // ₱2,100
};

/**
 * Get subscription limits for a given tier
 */
export function getSubscriptionLimits(tier: string): SubscriptionLimits {
  return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
}

/**
 * Check if user can upload more photos
 */
export function canUploadPhoto(
  subscriptionTier: string,
  currentPhotos: number,
): { allowed: boolean; reason?: string } {
  const limits = getSubscriptionLimits(subscriptionTier);

  if (currentPhotos >= limits.maxPhotos) {
    return {
      allowed: false,
      reason: `Photo limit reached (${limits.maxPhotos} photos). Upgrade to upload more.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can upload more videos
 */
export function canUploadVideo(
  subscriptionTier: string,
  currentVideos: number,
  hasVideoAddon: boolean = false,
): { allowed: boolean; reason?: string } {
  const limits = getSubscriptionLimits(subscriptionTier);

  if (!hasVideoAddon) {
    return {
      allowed: false,
      reason: "Video addon not enabled. Upgrade to add video support.",
    };
  }

  if (currentVideos >= limits.maxVideos) {
    return {
      allowed: false,
      reason: `Video limit reached (${limits.maxVideos} videos). Upgrade to upload more.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can upload more photos per user
 */
export function canUserUploadPhoto(
  subscriptionTier: string,
  userPhotoCount: number,
): { allowed: boolean; reason?: string } {
  const limits = getSubscriptionLimits(subscriptionTier);

  if (userPhotoCount >= limits.maxPhotosPerUser) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${limits.maxPhotosPerUser} photos per person.`,
    };
  }

  return { allowed: true };
}

/**
 * Calculate event expiration status
 */
export function calculateEventExpiration(
  createdAt: string | Date,
  subscriptionTier: string,
  customExpiresAt?: string | Date,
): EventLimits {
  const created = new Date(createdAt);
  const now = new Date();
  const limits = getSubscriptionLimits(subscriptionTier);

  // Use custom expiration date if provided, otherwise calculate from creation date
  const expiresAt = customExpiresAt
    ? new Date(customExpiresAt)
    : new Date(created.getTime() + limits.storageDays * 24 * 60 * 60 * 1000);

  const daysRemaining = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const isExpired = expiresAt < now;
  const isExpiringSoon = !isExpired && daysRemaining <= 1;

  return {
    totalPhotos: 0, // Will be set by caller
    totalVideos: 0, // Will be set by caller
    totalContributors: 0, // Will be set by caller
    daysRemaining,
    isExpired,
    isExpiringSoon,
  };
}

/**
 * Check if event is active (not expired)
 */
export function isEventActive(
  createdAt: string | Date,
  subscriptionTier: string,
  customExpiresAt?: string | Date,
): boolean {
  const expiration = calculateEventExpiration(
    createdAt,
    subscriptionTier,
    customExpiresAt,
  );
  return !expiration.isExpired;
}

/**
 * Get upgrade recommendations based on current usage
 */
export function getUpgradeRecommendations(
  subscriptionTier: string,
  currentPhotos: number,
  currentVideos: number,
  daysRemaining: number,
): Array<{ tier: string; reason: string; price: number }> {
  const recommendations: Array<{
    tier: string;
    reason: string;
    price: number;
  }> = [];
  const currentLimits = getSubscriptionLimits(subscriptionTier);

  // Check if approaching photo limit
  const photoUsagePercent = (currentPhotos / currentLimits.maxPhotos) * 100;
  if (photoUsagePercent >= 80) {
    const nextTier = getNextTier(subscriptionTier);
    if (nextTier) {
      const nextLimits = getSubscriptionLimits(nextTier);
      recommendations.push({
        tier: nextTier,
        reason: `You've used ${Math.round(photoUsagePercent)}% of your photo limit. Upgrade to ${nextLimits.maxPhotos} photos.`,
        price: nextLimits.price,
      });
    }
  }

  // Check if approaching video limit
  if (currentLimits.hasVideoAddon && currentLimits.maxVideos > 0) {
    const videoUsagePercent = (currentVideos / currentLimits.maxVideos) * 100;
    if (videoUsagePercent >= 80) {
      const nextTier = getNextTier(subscriptionTier);
      if (nextTier) {
        const nextLimits = getSubscriptionLimits(nextTier);
        recommendations.push({
          tier: nextTier,
          reason: `You've used ${Math.round(videoUsagePercent)}% of your video limit. Upgrade to ${nextLimits.maxVideos} videos.`,
          price: nextLimits.price,
        });
      }
    }
  }

  // Check if approaching storage limit
  if (daysRemaining <= 1) {
    const nextTier = getNextTier(subscriptionTier);
    if (nextTier) {
      const nextLimits = getSubscriptionLimits(nextTier);
      recommendations.push({
        tier: nextTier,
        reason: `Your event expires in ${daysRemaining} day(s). Upgrade for ${nextLimits.storageDays} days storage.`,
        price: nextLimits.price,
      });
    }
  }

  return recommendations;
}

/**
 * Get the next subscription tier
 */
function getNextTier(currentTier: string): string | null {
  const tiers = ["free", "basic", "standard", "premium", "pro"];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

/**
 * Calculate total price including video addon
 */
export function calculateTotalPrice(
  subscriptionTier: string,
  hasVideoAddon: boolean = false,
): number {
  const limits = getSubscriptionLimits(subscriptionTier);
  let total = limits.price;

  if (hasVideoAddon && limits.hasVideoAddon) {
    total += VIDEO_ADDON_PRICES[subscriptionTier] || 0;
  }

  return total;
}

/**
 * Format price in Philippine Pesos
 */
export function formatPrice(priceInCentavos: number): string {
  const pesos = priceInCentavos / 100;
  return `₱${pesos.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

/**
 * Get subscription tier display name
 */
export function getTierDisplayName(tier: string): string {
  const names: Record<string, string> = {
    free: "Free",
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
    pro: "Pro",
  };
  return names[tier] || "Unknown";
}

/**
 * Check if a subscription tier supports video
 */
export function supportsVideo(tier: string): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.hasVideoAddon;
}

/**
 * Get the maximum number of photos for a tier
 */
export function getMaxPhotos(tier: string): number {
  const limits = getSubscriptionLimits(tier);
  return limits.maxPhotos;
}

/**
 * Get the maximum number of videos for a tier
 */
export function getMaxVideos(tier: string): number {
  const limits = getSubscriptionLimits(tier);
  return limits.maxVideos;
}

/**
 * Get storage days for a tier
 */
export function getStorageDays(tier: string): number {
  const limits = getSubscriptionLimits(tier);
  return limits.storageDays;
}
