'use client';

import { useState, useEffect } from 'react';
import {
  getSubscriptionLimits,
  canUploadPhoto,
  canUploadVideo,
  canUserUploadPhoto,
  calculateEventExpiration,
  getUpgradeRecommendations,
  type SubscriptionLimits,
  type EventLimits,
} from '@/lib/business-logic/subscription-limits';

interface UseSubscriptionLimitsProps {
  subscriptionTier: string;
  hasVideoAddon?: boolean;
  currentPhotos?: number;
  currentVideos?: number;
  eventCreatedAt?: string | Date;
  customExpiresAt?: string | Date;
}

export function useSubscriptionLimits({
  subscriptionTier,
  hasVideoAddon = false,
  currentPhotos = 0,
  currentVideos = 0,
  eventCreatedAt,
  customExpiresAt,
}: UseSubscriptionLimitsProps) {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [eventLimits, setEventLimits] = useState<EventLimits | null>(null);
  const [upgradeRecommendations, setUpgradeRecommendations] = useState<Array<{
    tier: string;
    reason: string;
    price: number;
  }>>([]);

  useEffect(() => {
    const subscriptionLimits = getSubscriptionLimits(subscriptionTier);
    setLimits(subscriptionLimits);

    if (eventCreatedAt) {
      const expiration = calculateEventExpiration(
        eventCreatedAt,
        subscriptionTier,
        customExpiresAt
      );
      setEventLimits({
        ...expiration,
        totalPhotos: currentPhotos,
        totalVideos: currentVideos,
        totalContributors: 0, // Will be set by caller
      });

      const recommendations = getUpgradeRecommendations(
        subscriptionTier,
        currentPhotos,
        currentVideos,
        expiration.daysRemaining
      );
      setUpgradeRecommendations(recommendations);
    }
  }, [
    subscriptionTier,
    hasVideoAddon,
    currentPhotos,
    currentVideos,
    eventCreatedAt,
    customExpiresAt,
  ]);

  const checkPhotoUpload = () => {
    if (!limits) return { allowed: false, reason: 'Loading...' };
    return canUploadPhoto(subscriptionTier, currentPhotos, hasVideoAddon);
  };

  const checkVideoUpload = () => {
    if (!limits) return { allowed: false, reason: 'Loading...' };
    return canUploadVideo(subscriptionTier, currentVideos, hasVideoAddon);
  };

  const checkUserPhotoUpload = (userPhotoCount: number) => {
    if (!limits) return { allowed: false, reason: 'Loading...' };
    return canUserUploadPhoto(subscriptionTier, userPhotoCount);
  };

  const isEventActive = () => {
    if (!eventCreatedAt) return false;
    return !eventLimits?.isExpired;
  };

  const isEventExpiringSoon = () => {
    return eventLimits?.isExpiringSoon || false;
  };

  const getPhotoUsagePercent = () => {
    if (!limits) return 0;
    return (currentPhotos / limits.maxPhotos) * 100;
  };

  const getVideoUsagePercent = () => {
    if (!limits || !hasVideoAddon) return 0;
    return (currentVideos / limits.maxVideos) * 100;
  };

  const getStorageUsagePercent = () => {
    if (!eventLimits) return 0;
    const totalDays = limits?.storageDays || 0;
    const usedDays = totalDays - eventLimits.daysRemaining;
    return (usedDays / totalDays) * 100;
  };

  return {
    limits,
    eventLimits,
    upgradeRecommendations,
    checkPhotoUpload,
    checkVideoUpload,
    checkUserPhotoUpload,
    isEventActive,
    isEventExpiringSoon,
    getPhotoUsagePercent,
    getVideoUsagePercent,
    getStorageUsagePercent,
  };
}
