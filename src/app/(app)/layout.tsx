import type { Metadata } from 'next';
import { Sidebar, MobileNav } from '@/components/layout/Navigation';
import { MiniPlayer, MobileMiniPlayer } from '@/components/player/MiniPlayer';
import { FullPlayerOverlay } from '@/components/player/FullPlayerOverlay';

export const metadata: Metadata = {
  title: {
    default: 'BuzzBeats',
    template: '%s | BuzzBeats',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <div className="sidebar-area desktop-only">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="main-content" id="main-content">
        {children}
      </main>

      {/* Desktop Player Bar */}
      <div className="player-area desktop-only">
        <MiniPlayer />
      </div>

      {/* Mobile Mini Player (above nav) */}
      <MobileMiniPlayer />

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Full Player Overlay (Lyrics View) */}
      <FullPlayerOverlay />
    </div>
  );
}
