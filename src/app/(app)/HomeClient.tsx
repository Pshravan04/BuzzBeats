'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import type { Song } from '@/types';

interface HomeClientProps {
  trendingSongs: Song[];
  popularHits: Song[];
  newReleases: Song[];
}

const FILTER_CHIPS = ['Energize', 'Workout', 'Relax', 'Focus', 'Commute'];

export default function HomeClient({ trendingSongs, popularHits, newReleases }: HomeClientProps) {
  const { user } = useAuth();
  const player = usePlayer();
  const [activeChip, setActiveChip] = useState<string | null>(null);

  return (
    <div className="page-container" style={{ minHeight: '100%', paddingBottom: 120, position: 'relative' }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="desktop-only" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-icon-sm" style={{ background: 'var(--bg-elevated)', color: 'white', borderRadius: '50%' }}><ChevronLeftIcon size={24} /></button>
          <button className="btn btn-ghost btn-icon-sm" style={{ background: 'var(--bg-elevated)', color: 'white', opacity: 0.5, borderRadius: '50%' }}><ChevronRightIcon size={24} /></button>
        </div>
        <div className="mobile-only">
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Good evening</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
          <Link href="/settings">
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', border: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              {user?.display_name?.[0]?.toUpperCase() ?? 'U'}
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 32,
        scrollbarWidth: 'none', msOverflowStyle: 'none', position: 'relative', zIndex: 1
      }}>
        {FILTER_CHIPS.map(chip => {
          const isActive = activeChip === chip;
          return (
            <button
              key={chip}
              onClick={() => setActiveChip(prev => prev === chip ? null : chip)}
              style={{
                background: isActive ? 'white' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? 'black' : 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* Greetings / Top Mixes (6 card layout) */}
      <section style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 24px 0' }}>
          Good evening
        </h2>
        
        <div className="greeting-grid">
          {['Liked Songs', 'Daily Mix 1', 'Release Radar', 'Discover Weekly', 'On Repeat', 'Top Hits'].map((title, i) => (
            <div key={title} className="song-row" style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 64,
              display: 'flex', alignItems: 'center', cursor: 'pointer', overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative'
            }}>
              <div style={{ width: 64, height: 64, background: `hsl(${i * 60}, 70%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartOutlineIcon size={24} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, marginLeft: 16 }}>{title}</span>
              <div className="play-button" style={{
                position: 'absolute', right: 16, width: 48, height: 48, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'black', opacity: 0, transition: 'opacity 0.2s', boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
              }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                <PlayIcon size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Your Top Mixes */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            Made For You
          </h2>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show all</span>
        </div>
        
        <div className="grid-cards">
          {[
            { label: 'Daily Mix 1', desc: 'Arijit Singh, Shreya Ghoshal and more', color: '#a855f7' },
            { label: 'Discover Weekly', desc: 'New music updated every Friday.', color: '#ec4899' },
            { label: 'Release Radar', desc: 'Catch up on the latest releases.', color: '#3b82f6' },
            { label: 'Your Time Capsule', desc: 'We made you a personalized playlist.', color: '#8b5cf6' },
            { label: 'On Repeat', desc: 'Songs you love right now.', color: '#f43f5e' },
            { label: 'Repeat Rewind', desc: 'Past favorites, brought back.', color: '#f59e0b' },
          ].map((mix) => (
            <div key={mix.label} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 16, position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '100%', aspectRatio: '1/1', background: mix.color, borderRadius: 8, marginBottom: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{mix.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mix.desc}</div>
              
              {/* Play button on hover */}
              <div className="play-button" style={{
                position: 'absolute', top: 120, right: 24, width: 48, height: 48, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'black', opacity: 0, transition: 'all 0.3s', transform: 'translateY(8px)', boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
              }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.transform = 'translateY(8px)'; }}>
                <PlayIcon size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            Trending Now
          </h2>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show all</span>
        </div>

        <div className="grid-cards">
          {trendingSongs.slice(0, 6).map((song) => (
            <div key={song.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 16, position: 'relative', cursor: 'pointer' }} onClick={() => player.play(song, trendingSongs)}>
              <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, marginBottom: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <img src={song.cover_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
              </div>
              <div className="truncate" style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{song.title}</div>
              <div className="truncate" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{song.artist?.name}</div>
              
              <div className="play-button" style={{
                position: 'absolute', top: 120, right: 24, width: 48, height: 48, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'black', opacity: 0, transition: 'all 0.3s', transform: 'translateY(8px)', boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
              }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.transform = 'translateY(8px)'; }}>
                <PlayIcon size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// ============================================
// Icons
// ============================================

function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
function SearchIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}
function SettingsIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
}
function DotsIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>;
}
function DotsHorizontalIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>;
}
function ZapIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
}
function MoonIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
}
function DumbbellIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4l-4.8-4.8"></path><path d="M16.8 12l2.4-2.4-2.4-2.4"></path><path d="M12 16.8l-2.4 2.4-2.4-2.4"></path><path d="M22.8 10.8l-1.2-1.2-2.4 2.4 1.2 1.2c.7.7.7 1.8 0 2.5l-1.2 1.2-4.8-4.8 1.2-1.2c.7-.7 1.8-.7 2.5 0l1.2 1.2 2.4-2.4-1.2-1.2"></path><path d="M1.2 13.2l1.2 1.2 2.4-2.4-1.2-1.2c-.7-.7-.7-1.8 0-2.5l1.2-1.2 4.8 4.8-1.2 1.2c-.7.7-1.8.7-2.5 0L4.8 12 2.4 14.4l1.2 1.2"></path></svg>;
}
function BrainIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
}
function HeartOutlineIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>;
}
function CameraIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
}
function ChevronLeftIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
}
function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
function BellIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}
