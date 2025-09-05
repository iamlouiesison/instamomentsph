import QRCode from 'qrcode';
import { Event } from '@/types/database';

// QR Code generation options
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
}

// Default QR code options optimized for mobile scanning
export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  size: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  errorCorrectionLevel: 'M', // Medium error correction for reliability
  type: 'image/png',
  quality: 0.92,
};

// Print-optimized QR code options
export const PRINT_QR_OPTIONS: QRCodeOptions = {
  size: 512,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  errorCorrectionLevel: 'H', // High error correction for print reliability
  type: 'image/png',
  quality: 1.0,
};

// Generate gallery URL for an event
export function generateGalleryUrl(event: Event, baseUrl?: string): string {
  const appUrl =
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/gallery/${event.gallery_slug}`;
}

// Generate QR code as data URL (for immediate display)
export async function generateQRCodeDataUrl(
  text: string,
  options: QRCodeOptions = DEFAULT_QR_OPTIONS
): Promise<string> {
  try {
    const qrOptions = {
      width: options.size || DEFAULT_QR_OPTIONS.size,
      margin: options.margin || DEFAULT_QR_OPTIONS.margin,
      color: options.color || DEFAULT_QR_OPTIONS.color,
      errorCorrectionLevel:
        options.errorCorrectionLevel || DEFAULT_QR_OPTIONS.errorCorrectionLevel,
      type: options.type || DEFAULT_QR_OPTIONS.type,
      quality: options.quality || DEFAULT_QR_OPTIONS.quality,
    };

    return await QRCode.toDataURL(text, qrOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate QR code as SVG string
export async function generateQRCodeSVG(
  text: string,
  options: QRCodeOptions = DEFAULT_QR_OPTIONS
): Promise<string> {
  try {
    const qrOptions = {
      width: options.size || DEFAULT_QR_OPTIONS.size,
      margin: options.margin || DEFAULT_QR_OPTIONS.margin,
      color: {
        dark: options.color?.dark || DEFAULT_QR_OPTIONS.color?.dark,
        light: options.color?.light || DEFAULT_QR_OPTIONS.color?.light,
      },
      errorCorrectionLevel:
        options.errorCorrectionLevel || DEFAULT_QR_OPTIONS.errorCorrectionLevel,
    };

    return await QRCode.toString(text, { type: 'svg', ...qrOptions });
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

// Generate QR code as Buffer (for file operations)
export async function generateQRCodeBuffer(
  text: string,
  options: QRCodeOptions = DEFAULT_QR_OPTIONS
): Promise<Buffer> {
  try {
    const qrOptions = {
      width: options.size || DEFAULT_QR_OPTIONS.size,
      margin: options.margin || DEFAULT_QR_OPTIONS.margin,
      color: options.color || DEFAULT_QR_OPTIONS.color,
      errorCorrectionLevel:
        options.errorCorrectionLevel || DEFAULT_QR_OPTIONS.errorCorrectionLevel,
      type: (options.type || DEFAULT_QR_OPTIONS.type)?.replace('image/', '') as
        | 'png'
        | undefined,
      quality: options.quality || DEFAULT_QR_OPTIONS.quality,
    };

    return await QRCode.toBuffer(text, qrOptions);
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

// Generate QR code for an event
export async function generateEventQRCode(
  event: Event,
  options: QRCodeOptions = DEFAULT_QR_OPTIONS,
  baseUrl?: string
): Promise<string> {
  const galleryUrl = generateGalleryUrl(event, baseUrl);
  return generateQRCodeDataUrl(galleryUrl, options);
}

// Generate print-ready QR code for an event
export async function generateEventQRCodePrint(
  event: Event,
  baseUrl?: string
): Promise<string> {
  const galleryUrl = generateGalleryUrl(event, baseUrl);
  return generateQRCodeDataUrl(galleryUrl, PRINT_QR_OPTIONS);
}

// Validate QR code content
export function validateQRCodeContent(content: string): boolean {
  try {
    // Check if it's a valid URL
    const url = new URL(content);

    // Must be from our domain or localhost for development
    const allowedDomains = [
      process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, ''),
      'localhost:3000',
      'instamoments.ph',
      'www.instamoments.ph',
    ].filter(Boolean);

    const hostname = url.hostname;
    const isAllowedDomain = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      return false;
    }

    // Must be a gallery URL
    return url.pathname.startsWith('/gallery/');
  } catch {
    return false;
  }
}

// Extract event slug from QR code content
export function extractEventSlugFromQR(content: string): string | null {
  try {
    const url = new URL(content);
    const pathParts = url.pathname.split('/');

    if (pathParts[1] === 'gallery' && pathParts[2]) {
      return pathParts[2];
    }

    return null;
  } catch {
    return null;
  }
}

// QR code analytics tracking
export interface QRCodeAnalytics {
  eventId: string;
  scanCount: number;
  lastScannedAt: string | null;
  uniqueScanners: number;
}

// Generate QR code with custom styling for different event types
export function getEventTypeQRColors(
  eventType: Event['event_type']
): QRCodeOptions['color'] {
  const eventColors = {
    wedding: { dark: '#8B5A3C', light: '#FFF8F0' }, // Warm brown
    birthday: { dark: '#E91E63', light: '#FCE4EC' }, // Pink
    debut: { dark: '#9C27B0', light: '#F3E5F5' }, // Purple
    graduation: { dark: '#4CAF50', light: '#E8F5E8' }, // Green
    anniversary: { dark: '#FF5722', light: '#FBE9E7' }, // Orange-red
    corporate: { dark: '#607D8B', light: '#ECEFF1' }, // Blue-grey
    other: { dark: '#2196F3', light: '#E3F2FD' }, // Blue
  };

  return eventColors[eventType] || eventColors.other;
}

// Generate branded QR code for an event
export async function generateBrandedEventQRCode(
  event: Event,
  options: QRCodeOptions = DEFAULT_QR_OPTIONS,
  baseUrl?: string
): Promise<string> {
  const brandedOptions = {
    ...options,
    color: getEventTypeQRColors(event.event_type),
  };

  return generateEventQRCode(event, brandedOptions, baseUrl);
}
