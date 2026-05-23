'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', label: 'Discover', icon: HomeIcon },
  { href: '/search', label: 'Search', icon: SearchIcon },
  { href: '/library', label: 'Library', icon: LibraryIcon },
  { href: '/room/create', label: 'Collab', icon: UsersIcon },
  { href: '/player', label: 'Now Playing', icon: PlayCircleIcon },
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
        <Link href="/" title="BuzzBeats" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
            <PlayCircleIcon size={20} />
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, 
            margin: 0, letterSpacing: '-0.02em',
            color: 'white'
          }}>
            BuzzBeats
          </h1>
        </Link>
      </div>

      {/* Main nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, padding: '0 12px' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '10px 12px',
                color: active ? 'white' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => {
                if(!active) e.currentTarget.style.color = 'white';
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
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 14
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
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9) 20%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {[
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/search', label: 'Search', icon: SearchIcon },
        { href: '/library', label: 'Library', icon: LibraryIcon },
        { href: '/player', label: 'Playing', icon: PlayCircleIcon },
      ].map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '8px 20px',
              textDecoration: 'none',
              transition: 'all 0.2s'
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
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="22" y1="12" x2="20" y2="12"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/><line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/><line x1="19.07" y1="19.07" x2="17.66" y2="17.66"/><line x1="6.34" y1="6.34" x2="4.93" y2="4.93"/>
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

function UsersIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function PlayCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  );
}
