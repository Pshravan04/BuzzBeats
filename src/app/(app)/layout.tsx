import type { Metadata } from 'next';
import { Sidebar, MobileNav } from '@/components/layout/Navigation';
import { MiniPlayer, MobileMiniPlayer } from '@/components/player/MiniPlayer';

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
      <div className="desktop-only" style={{ gridRow: '1', gridColumn: '1' }}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="main-content" style={{ gridRow: '1', gridColumn: '2' }} id="main-content">
        {children}
      </main>

      {/* Desktop Player Bar */}
      <div className="desktop-only" style={{ gridRow: '2', gridColumn: '1 / -1' }}>
        <MiniPlayer />
      </div>

      {/* Mobile Mini Player (above nav) */}
      <MobileMiniPlayer />

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
