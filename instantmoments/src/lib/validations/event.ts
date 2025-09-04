import { z } from 'zod';

// Event types specific to Filipino culture
export const FILIPINO_EVENT_TYPES = {
  wedding: { label: 'Kasal', icon: '💒', description: 'Wedding celebration' },
  birthday: { label: 'Kaarawan', icon: '🎂', description: 'Birthday party' },
  debut: {
    label: '18th Birthday',
    icon: '👑',
    description: 'Coming of age celebration',
  },
  christening: { label: 'Binyag', icon: '👶', description: 'Baptism ceremony' },
  graduation: {
    label: 'Pagtatapos',
    icon: '🎓',
    description: 'Graduation ceremony',
  },
  anniversary: {
    label: 'Anibersaryo',
    icon: '💕',
    description: 'Anniversary celebration',
  },
  corporate: {
    label: 'Company Event',
    icon: '🏢',
    description: 'Business gathering',
  },
  other: { label: 'Iba pa', icon: '🎉', description: 'Other celebration' },
} as const;

// Subscription tiers with Filipino pricing
export const SUBSCRIPTION_TIERS = {
  free: {
    label: 'Libre',
    price: 0,
    maxPhotos: 30,
    maxPhotosPerUser: 3,
    storageDays: 3,
    hasVideoAddon: false,
    features: ['Basic gallery', '3-day storage', 'InstaMoments watermark'],
  },
  basic: {
    label: 'Basic',
    price: 699,
    maxPhotos: 50,
    maxPhotosPerUser: 5,
    storageDays: 7,
    hasVideoAddon: false,
    features: ['50 photos', '7-day storage', 'No watermarks', 'Photo messages'],
  },
  standard: {
    label: 'Standard',
    price: 999,
    maxPhotos: 100,
    maxPhotosPerUser: 5,
    storageDays: 14,
    hasVideoAddon: false,
    features: [
      '100 photos',
      '14-day storage',
      'Email sharing',
      'Social media integration',
      'Custom themes',
    ],
  },
  premium: {
    label: 'Premium',
    price: 1999,
    maxPhotos: 250,
    maxPhotosPerUser: 5,
    storageDays: 30,
    hasVideoAddon: false,
    features: [
      '250 photos',
      '30-day storage',
      'Advanced moderation',
      'Professional layouts',
      'Priority support',
    ],
  },
  pro: {
    label: 'Pro',
    price: 3499,
    maxPhotos: 500,
    maxPhotosPerUser: 5,
    storageDays: 30,
    hasVideoAddon: false,
    features: [
      '500 photos',
      '30-day storage',
      'Custom branding',
      'Advanced analytics',
      'Dedicated support',
    ],
  },
} as const;

// Video addon pricing
export const VIDEO_ADDON_PRICING = {
  free: 0,
  basic: 600,
  standard: 600,
  premium: 1200,
  pro: 2100,
} as const;

// Event creation schema
export const EventCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  eventType: z.enum([
    'wedding',
    'birthday',
    'debut',
    'christening',
    'graduation',
    'anniversary',
    'corporate',
    'other',
  ]),
  eventDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, 'Event date cannot be in the past'),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  subscriptionTier: z
    .enum(['free', 'basic', 'standard', 'premium', 'pro'])
    .default('free'),
  hasVideoAddon: z.boolean().default(false),
  requiresModeration: z.boolean().default(false),
  allowDownloads: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  customMessage: z
    .string()
    .max(300, 'Custom message must be less than 300 characters')
    .optional(),
});

// Event update schema
export const EventUpdateSchema = EventCreateSchema.partial().extend({
  id: z.string().uuid('Invalid event ID'),
});

// Event upgrade schema
export const EventUpgradeSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  newTier: z.enum(['basic', 'standard', 'premium', 'pro']),
  hasVideoAddon: z.boolean().default(false),
  paymentMethod: z.enum(['gcash', 'paymaya', 'card', 'otc']),
});

// Event settings schema
export const EventSettingsSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
  requiresModeration: z.boolean(),
  allowDownloads: z.boolean(),
  isPublic: z.boolean(),
  customMessage: z.string().max(300).optional(),
});

// Gallery slug generation helper
export function generateGallerySlug(
  eventName: string,
  eventDate?: string
): string {
  const baseSlug = eventName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  const dateSuffix = eventDate ? `-${new Date(eventDate).getFullYear()}` : '';
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${baseSlug}${dateSuffix}-${randomSuffix}`;
}

// Calculate total price including video addon
export function calculateEventPrice(
  tier: keyof typeof SUBSCRIPTION_TIERS,
  hasVideoAddon: boolean
): number {
  const basePrice = SUBSCRIPTION_TIERS[tier].price;
  const videoPrice = hasVideoAddon ? VIDEO_ADDON_PRICING[tier] : 0;
  return basePrice + videoPrice;
}

// Type exports
export type EventCreateData = z.infer<typeof EventCreateSchema>;
export type EventUpdateData = z.infer<typeof EventUpdateSchema>;
export type EventUpgradeData = z.infer<typeof EventUpgradeSchema>;
export type EventSettingsData = z.infer<typeof EventSettingsSchema>;

export type EventType = keyof typeof FILIPINO_EVENT_TYPES;
export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type PaymentMethod = 'gcash' | 'paymaya' | 'card' | 'otc';
