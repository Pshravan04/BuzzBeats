'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/search', label: 'Search', icon: SearchIcon },
  { href: '/library', label: 'Your Library', icon: LibraryIcon },
  { href: '/playlist', label: 'Create Playlist', icon: PlusIcon },
  { href: '/room/create', label: 'Collab Session', icon: UsersIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation" style={{
      display: 'flex', flexDirection: 'column', paddingTop: 24, paddingBottom: 24,
      background: 'var(--bg-base)', height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <Link href="/" title="BuzzBeats" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'var(--text-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              width: 18,
              height: 18,
              background: 'var(--bg-base)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                <polygon points="6 3 20 12 6 21 6 3"/>
              </svg>
            </div>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, 
            margin: 0, letterSpacing: '-0.03em',
            color: 'white'
          }}>
            BuzzBeats
          </h1>
        </Link>
      </div>

      {/* Main nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, padding: '0 12px' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 16px',
                borderRadius: '8px',
                color: active ? 'white' : 'var(--text-secondary)',
                background: active ? 'var(--bg-elevated)' : 'transparent',
                textDecoration: 'none',
                fontWeight: active ? 700 : 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                if(!active) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
              </div>
              <span style={{ fontSize: '14px' }}>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* User profile / Settings */}
      {user && (
        <div style={{ padding: '0 24px' }}>
          <Link href="/settings" title="Settings" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px', borderRadius: 'var(--radius-full)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            textDecoration: 'none', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'black', fontWeight: 800, fontSize: 14
            }}>
              {user.display_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="truncate" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {user.display_name.split(' ')[0]}
            </div>
          </Link>
        </div>
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
        height: '65px',
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 130,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {[
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/search', label: 'Search', icon: SearchIcon },
        { href: '/room/create', label: 'Collab', icon: UsersIcon },
        { href: '/library', label: 'Library', icon: LibraryIcon },
        { href: '/settings', label: 'Profile', icon: UserIcon },
      ].map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: active ? 'white' : 'var(--text-secondary)',
              padding: '6px 20px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              opacity: active ? 1 : 0.8
            }}
          >
            <Icon size={24} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ============================================
// Icon Components
// ============================================

function HomeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function SearchIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function LibraryIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
}

function PlusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
}

function UsersIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function UserIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
