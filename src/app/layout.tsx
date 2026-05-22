import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PlayerProvider } from '@/context/PlayerContext';

export const metadata: Metadata = {
  title: {
    default: 'BuzzBeats — Music for the Next Generation',
    template: '%s | BuzzBeats',
  },
  description: 'BuzzBeats is the premium music streaming platform for Gen Z. Discover music, create playlists, listen collaboratively, and vibe together.',
  keywords: ['music streaming', 'playlists', 'discover music', 'buzzbeats', 'collaborative listening'],
  authors: [{ name: 'Shravan' }],
  creator: 'Shravan',
  applicationName: 'BuzzBeats',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BuzzBeats',
    startupImage: [
      { url: '/icons/apple-splash-2048-2732.png', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/icons/apple-splash-1170-2532.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
    ],
  },
  openGraph: {
    type: 'website',
    title: 'BuzzBeats — Music for the Next Generation',
    description: 'Premium music streaming for Gen Z. Discover, playlist, collaborate.',
    siteName: 'BuzzBeats',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuzzBeats',
    description: 'Premium music streaming for Gen Z',
    images: ['/icon.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="blue" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <PlayerProvider>
              {children}
            </PlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
