'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/search', label: 'Search', icon: SearchIcon },
  { href: '/library', label: 'Library', icon: LibraryIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 24
    }}>
      {/* Logo */}
      <Link href="/" title="BuzzBeats" style={{ marginBottom: 40, transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px var(--accent-glow)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 3a9 9 0 110 18A9 9 0 0112 3zm0 2a7 7 0 100 14A7 7 0 0012 5zm0 2a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z"/>
          </svg>
        </div>
      </Link>

      {/* Main nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                color: active ? 'white' : 'var(--text-secondary)',
                background: active ? 'var(--accent)' : 'transparent',
                boxShadow: active ? '0 4px 14px var(--accent-glow)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={e => {
                if(!active) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'var(--bg-glass-hover)';
                }
              }}
              onMouseLeave={e => {
                if(!active) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={24} color="currentColor" />
            </Link>
          );
        })}
      </div>

      {/* User profile / Settings */}
      {user && (
        <Link href="/settings" title="Settings" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '2px solid var(--border-subtle)',
          transition: 'all 0.2s', overflow: 'hidden'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>
            {user.display_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </Link>
      )}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-only"
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'var(--bg-glass)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {[
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/search', label: 'Search', icon: SearchIcon },
        { href: '/library', label: 'Library', icon: LibraryIcon },
        { href: '/settings', label: 'Settings', icon: SettingsIcon },
      ].map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              color: active ? 'white' : 'var(--text-secondary)',
              padding: '8px 20px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ 
              background: active ? 'var(--accent)' : 'transparent',
              padding: '6px 16px', borderRadius: 'var(--radius-full)',
              boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
              transition: 'all 0.2s'
            }}>
              <Icon size={20} />
            </div>
            {active && <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

// ============================================
// Icon Components
// ============================================

function HomeIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function SearchIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function LibraryIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
}

function SettingsIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}
