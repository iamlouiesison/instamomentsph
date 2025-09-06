// InstaMoments Database Types
// Generated TypeScript types for all database tables and operations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone_number: string | null;
          avatar_url: string | null;
          user_type: 'host' | 'guest' | 'planner';
          subscription_tier: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
          subscription_status: 'active' | 'inactive' | 'past_due';
          payment_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          user_type?: 'host' | 'guest' | 'planner';
          subscription_tier?: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
          subscription_status?: 'active' | 'inactive' | 'past_due';
          payment_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          user_type?: 'host' | 'guest' | 'planner';
          subscription_tier?: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
          subscription_status?: 'active' | 'inactive' | 'past_due';
          payment_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          event_type:
            | 'wedding'
            | 'birthday'
            | 'corporate'
            | 'graduation'
            | 'anniversary'
            | 'debut'
            | 'other';
          event_date: string | null;
          location: string | null;
          host_id: string;
          qr_code_url: string;
          gallery_slug: string;
          subscription_tier: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
          max_photos: number;
          max_photos_per_user: number;
          storage_days: number;
          has_video_addon: boolean;
          requires_moderation: boolean;
          allow_downloads: boolean;
          is_public: boolean;
          custom_message: string | null;
          total_photos: number;
          total_videos: number;
          total_contributors: number;
          status: 'active' | 'expired' | 'archived';
          created_at: string;
          updated_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          event_type:
            | 'wedding'
            | 'birthday'
            | 'corporate'
            | 'graduation'
            | 'anniversary'
            | 'debut'
            | 'other';
          event_date?: string | null;
          location?: string | null;
          host_id: string;
          qr_code_url: string;
          gallery_slug: string;
          subscription_tier?: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
          max_photos?: number;
          max_photos_per_user?: number;
          storage_days?: number;
          has_video_addon?: boolean;
          requires_moderation?: boolean;
          allow_downloads?: boolean;
          is_public?: boolean;
          custom_message?: string | null;
          total_photos?: number;
          total_videos?: number;
          total_contributors?: number;
          status?: 'active' | 'expired' | 'archived';
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          event_type?:
            | 'wedding'
            | 'birthday'
            | 'corporate'
            | 'graduation'
            | 'anniversary'
            | 'debut'
            | 'other';
          event_date?: string | null;
          location?: string | null;
          host_id?: string;
          qr_code_url?: string;
          gallery_slug?: string;
          subscription_tier?: 'free' | 'basic' | 'standard' | 'premium' | 'pro';
          max_photos?: number;
          max_photos_per_user?: number;
          storage_days?: number;
          has_video_addon?: boolean;
          requires_moderation?: boolean;
          allow_downloads?: boolean;
          is_public?: boolean;
          custom_message?: string | null;
          total_photos?: number;
          total_videos?: number;
          total_contributors?: number;
          status?: 'active' | 'expired' | 'archived';
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'events_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          contributor_id: string | null;
          contributor_name: string;
          contributor_email: string | null;
          file_name: string;
          file_url: string;
          thumbnail_url: string | null;
          file_size: number;
          mime_type: string;
          caption: string | null;
          is_approved: boolean;
          uploaded_at: string;
          exif_data: Json | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          contributor_id?: string | null;
          contributor_name: string;
          contributor_email?: string | null;
          file_name: string;
          file_url: string;
          thumbnail_url?: string | null;
          file_size: number;
          mime_type: string;
          caption?: string | null;
          is_approved?: boolean;
          uploaded_at?: string;
          exif_data?: Json | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          contributor_id?: string | null;
          contributor_name?: string;
          contributor_email?: string | null;
          file_name?: string;
          file_url?: string;
          thumbnail_url?: string | null;
          file_size?: number;
          mime_type?: string;
          caption?: string | null;
          is_approved?: boolean;
          uploaded_at?: string;
          exif_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'photos_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'photos_contributor_id_fkey';
            columns: ['contributor_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      videos: {
        Row: {
          id: string;
          event_id: string;
          contributor_id: string | null;
          contributor_name: string;
          contributor_email: string | null;
          file_name: string;
          file_url: string;
          thumbnail_url: string | null;
          file_size: number;
          duration_seconds: number;
          mime_type: string;
          message: string | null;
          is_approved: boolean;
          uploaded_at: string;
          processing_status: 'pending' | 'processing' | 'completed' | 'failed';
        };
        Insert: {
          id?: string;
          event_id: string;
          contributor_id?: string | null;
          contributor_name: string;
          contributor_email?: string | null;
          file_name: string;
          file_url: string;
          thumbnail_url?: string | null;
          file_size: number;
          duration_seconds: number;
          mime_type: string;
          message?: string | null;
          is_approved?: boolean;
          uploaded_at?: string;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
        };
        Update: {
          id?: string;
          event_id?: string;
          contributor_id?: string | null;
          contributor_name?: string;
          contributor_email?: string | null;
          file_name?: string;
          file_url?: string;
          thumbnail_url?: string | null;
          file_size?: number;
          duration_seconds?: number;
          mime_type?: string;
          message?: string | null;
          is_approved?: boolean;
          uploaded_at?: string;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
        };
        Relationships: [
          {
            foreignKeyName: 'videos_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'videos_contributor_id_fkey';
            columns: ['contributor_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      event_contributors: {
        Row: {
          id: string;
          event_id: string;
          contributor_id: string | null;
          contributor_name: string;
          contributor_email: string;
          photos_count: number;
          videos_count: number;
          first_contribution_at: string;
          last_contribution_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          contributor_id?: string | null;
          contributor_name: string;
          contributor_email: string;
          photos_count?: number;
          videos_count?: number;
          first_contribution_at?: string;
          last_contribution_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          contributor_id?: string | null;
          contributor_name?: string;
          contributor_email?: string;
          photos_count?: number;
          videos_count?: number;
          first_contribution_at?: string;
          last_contribution_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_contributors_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_contributors_contributor_id_fkey';
            columns: ['contributor_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          amount_cents: number;
          currency: string;
          payment_method: 'gcash' | 'paymaya' | 'card' | 'otc';
          payment_provider: string;
          external_payment_id: string;
          status: 'pending' | 'paid' | 'failed' | 'refunded';
          paid_at: string | null;
          tier_purchased: 'basic' | 'standard' | 'premium' | 'pro';
          has_video_addon: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          amount_cents: number;
          currency?: string;
          payment_method: 'gcash' | 'paymaya' | 'card' | 'otc';
          payment_provider?: string;
          external_payment_id: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          paid_at?: string | null;
          tier_purchased: 'basic' | 'standard' | 'premium' | 'pro';
          has_video_addon?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          amount_cents?: number;
          currency?: string;
          payment_method?: 'gcash' | 'paymaya' | 'card' | 'otc';
          payment_provider?: string;
          external_payment_id?: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          paid_at?: string | null;
          tier_purchased?: 'basic' | 'standard' | 'premium' | 'pro';
          has_video_addon?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          event_id: string | null;
          user_id: string | null;
          event_type:
            | 'qr_scan'
            | 'photo_upload'
            | 'video_record'
            | 'gallery_view'
            | 'event_created'
            | 'payment_completed';
          properties: Json | null;
          user_agent: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          event_type:
            | 'qr_scan'
            | 'photo_upload'
            | 'video_record'
            | 'gallery_view'
            | 'event_created'
            | 'payment_completed';
          properties?: Json | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          event_type?:
            | 'qr_scan'
            | 'photo_upload'
            | 'video_record'
            | 'gallery_view'
            | 'event_created'
            | 'payment_completed';
          properties?: Json | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analytics_events_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'analytics_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_expired_event_files: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_event_storage_usage: {
        Args: {
          event_uuid: string;
        };
        Returns: {
          bucket_name: string;
          file_count: number;
          total_size: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// =============================================
// CONVENIENCE TYPES
// =============================================

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Photo = Database['public']['Tables']['photos']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];
export type EventContributor =
  Database['public']['Tables']['event_contributors']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type AnalyticsEvent =
  Database['public']['Tables']['analytics_events']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
export type VideoInsert = Database['public']['Tables']['videos']['Insert'];
export type EventContributorInsert =
  Database['public']['Tables']['event_contributors']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type AnalyticsEventInsert =
  Database['public']['Tables']['analytics_events']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type PhotoUpdate = Database['public']['Tables']['photos']['Update'];
export type VideoUpdate = Database['public']['Tables']['videos']['Update'];
export type EventContributorUpdate =
  Database['public']['Tables']['event_contributors']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type AnalyticsEventUpdate =
  Database['public']['Tables']['analytics_events']['Update'];

// =============================================
// ENHANCED TYPES WITH RELATIONSHIPS
// =============================================

// Event with host profile
export type EventWithHost = Event & {
  host: Profile;
};

// Event with media counts
export type EventWithMedia = Event & {
  photos: Photo[];
  videos: Video[];
  contributors: EventContributor[];
};

// Photo with event details
export type PhotoWithEvent = Photo & {
  event: Event;
};

// Video with event details
export type VideoWithEvent = Video & {
  event: Event;
};

// Payment with event and user details
export type PaymentWithDetails = Payment & {
  event: Event;
  user: Profile;
};

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    field?: string;
  };
}

// =============================================
// VALIDATION SCHEMAS (Zod)
// =============================================

import { z } from 'zod';

export const EventCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'Event name too short')
    .max(100, 'Event name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  eventType: z.enum([
    'wedding',
    'birthday',
    'corporate',
    'graduation',
    'anniversary',
    'debut',
    'other',
  ]),
  eventDate: z.string().optional(),
  location: z.string().max(200, 'Location too long').optional(),
  subscriptionTier: z
    .enum(['free', 'basic', 'standard', 'premium', 'pro'])
    .default('free'),
  hasVideoAddon: z.boolean().default(false),
  requiresModeration: z.boolean().default(false),
  customMessage: z.string().max(300).optional(),
});

export const PhotoUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  contributorName: z.string().min(1, 'Name required').max(50, 'Name too long'),
  contributorEmail: z.string().email('Invalid email').optional(),
  caption: z.string().max(200, 'Caption too long').optional(),
  fileSize: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid image type'),
});

export const VideoUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  contributorName: z.string().min(1, 'Name required').max(50, 'Name too long'),
  contributorEmail: z.string().email('Invalid email').optional(),
  message: z.string().max(200, 'Message too long').optional(),
  fileSize: z.number().max(50 * 1024 * 1024, 'Video too large (max 50MB)'),
  durationSeconds: z.number().max(20, 'Video too long (max 20 seconds)'),
  mimeType: z.string().regex(/^video\/(mp4|webm|mov)$/, 'Invalid video type'),
});

export const PaymentCreateSchema = z.object({
  eventId: z.string().uuid(),
  tierPurchased: z.enum(['basic', 'standard', 'premium', 'pro']),
  hasVideoAddon: z.boolean().default(false),
  paymentMethod: z.enum(['gcash', 'paymaya', 'card', 'otc']),
});

export const ProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name required')
    .max(100, 'Name too long')
    .optional(),
  phoneNumber: z.string().max(20, 'Phone number too long').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
  userType: z.enum(['host', 'guest', 'planner']).optional(),
});

// =============================================
// INFERRED TYPES FROM SCHEMAS
// =============================================

export type EventCreateData = z.infer<typeof EventCreateSchema>;
export type PhotoUploadData = z.infer<typeof PhotoUploadSchema>;
export type VideoUploadData = z.infer<typeof VideoUploadSchema>;
export type PaymentCreateData = z.infer<typeof PaymentCreateSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

// =============================================
// STORAGE TYPES
// =============================================

export type StorageBucket = 'photos' | 'videos' | 'thumbnails' | 'qr-codes';

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

// =============================================
// SUBSCRIPTION TIER CONFIGURATION
// =============================================

export interface SubscriptionTierConfig {
  name: string;
  maxPhotos: number;
  maxPhotosPerUser: number;
  storageDays: number;
  hasVideoAddon: boolean;
  priceCents: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTierConfig> = {
  free: {
    name: 'Free',
    maxPhotos: 30,
    maxPhotosPerUser: 3,
    storageDays: 3,
    hasVideoAddon: false,
    priceCents: 0,
    features: ['Basic photo sharing', '3-day storage', 'Public gallery'],
  },
  basic: {
    name: 'Basic',
    maxPhotos: 50,
    maxPhotosPerUser: 5,
    storageDays: 7,
    hasVideoAddon: false,
    priceCents: 69900, // ₱699
    features: ['50 photos', '7-day storage', 'Photo messages', 'No watermarks'],
  },
  standard: {
    name: 'Standard',
    maxPhotos: 100,
    maxPhotosPerUser: 5,
    storageDays: 14,
    hasVideoAddon: false,
    priceCents: 99900, // ₱999
    features: [
      '100 photos',
      '14-day storage',
      'Email sharing',
      'Social media integration',
      'Custom themes',
    ],
  },
  premium: {
    name: 'Premium',
    maxPhotos: 250,
    maxPhotosPerUser: 5,
    storageDays: 30,
    hasVideoAddon: false,
    priceCents: 199900, // ₱1,999
    features: [
      '250 photos',
      '30-day storage',
      'Advanced moderation',
      'Professional layouts',
      'Dedicated support',
    ],
  },
  pro: {
    name: 'Pro',
    maxPhotos: 500,
    maxPhotosPerUser: 5,
    storageDays: 30,
    hasVideoAddon: false,
    priceCents: 349900, // ₱3,499
    features: [
      '500 photos',
      '30-day storage',
      'Custom branding',
      'Advanced analytics',
      'Event coordinator assistance',
    ],
  },
};

export const VIDEO_ADDON_PRICES: Record<string, number> = {
  basic: 60000, // ₱600
  standard: 60000, // ₱600
  premium: 120000, // ₱1,200
  pro: 210000, // ₱2,100
};
