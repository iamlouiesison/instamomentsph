import type { Metadata } from 'next';
import { ABeeZee, Lora, Fira_Code } from 'next/font/google';
import './globals.css';

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
  title: 'InstaMoments - Filipino Celebration Photos',
  description:
    'Capture and share your Filipino celebration moments with InstaMoments',
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
        {children}
      </body>
    </html>
  );
}
