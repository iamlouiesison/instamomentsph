import type { Metadata } from 'next';
import { ABeeZee, Lora, Fira_Code } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const abeeZee = ABeeZee({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: '400',
});

const lora = Lora({
  variable: '--font-serif',
  subsets: ['latin'],
});

const firaCode = Fira_Code({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InstaMoments - QR Code Photo Sharing for Filipino Celebrations | Weddings, Birthdays, Debuts',
  description:
    'Create instant photo galleries for Filipino celebrations. No app downloads needed! Guests scan QR code and share photos instantly. Perfect for weddings, birthdays, debuts, graduations. GCash payments accepted.',
  keywords: [
    'Filipino celebrations',
    'wedding photos',
    'birthday party',
    'debut photos',
    'graduation ceremony',
    'QR code sharing',
    'photo gallery',
    'Philippines events',
    'GCash payment',
    'family celebrations',
    'event photography',
    'real-time sharing',
    'video greetings',
    'Metro Manila',
    'Cebu events',
    'Davao celebrations'
  ],
  authors: [{ name: 'InstaMoments Team' }],
  creator: 'InstaMoments',
  publisher: 'InstaMoments',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://instamoments.ph'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'InstaMoments - QR Code Photo Sharing for Filipino Celebrations',
    description: 'Create instant photo galleries for Filipino celebrations. No app downloads needed! Perfect for weddings, birthdays, debuts, graduations.',
    url: 'https://instamoments.ph',
    siteName: 'InstaMoments',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'InstaMoments - Filipino Celebration Photo Sharing',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InstaMoments - QR Code Photo Sharing for Filipino Celebrations',
    description: 'Create instant photo galleries for Filipino celebrations. No app downloads needed!',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${abeeZee.variable} ${lora.variable} ${firaCode.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
