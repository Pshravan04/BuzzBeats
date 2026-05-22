'use client';

import React from 'react';
import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import type { Song } from '@/types';

interface HomeClientProps {
  trendingSongs: Song[];
  popularHits: Song[];
  newReleases: Song[];
}

export default function HomeClient({ trendingSongs, popularHits, newReleases }: HomeClientProps) {
  const { user } = useAuth();
  const player = usePlayer();

  return (
    <div style={{ minHeight: '100%', padding: '32px 40px 120px' }}>
      
      {/* Search Header Area */}
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1, maxWidth: 600, position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none'
          }}>
            <SearchIcon size={20} />
          </div>
          <input
            type="text"
            placeholder="Artists, songs, or podcasts"
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: 'none',
              color: 'white',
              fontSize: '17px',
              outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-icon" style={{ color: 'var(--text-muted)' }}>
            <BellIcon size={24} />
          </button>
          <button className="btn btn-ghost btn-icon" style={{ color: 'var(--text-muted)' }}>
            <SettingsIcon size={24} />
          </button>
        </div>
      </div>

      {/* For You Section */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            For You
          </h2>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}>View All Mixes</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {/* Card 1: Daily Drive */}
          <div style={{
            background: 'linear-gradient(135deg, #d946ef, #a855f7)',
            borderRadius: '16px', padding: 24, height: 280,
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.2)'
          }}>
            <div style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>PERSONAL MIX</div>
            <div style={{ position: 'absolute', top: 24, right: 24 }}><DotsIcon size={24} color="rgba(255,255,255,0.6)" /></div>
            
            <div style={{ marginTop: 'auto' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Daily Drive</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, maxWidth: '80%' }}>A personalized blend of news and music updated througho...</p>
            </div>
          </div>

          {/* Card 2: Hyper-Pop Era */}
          <div style={{
            background: 'var(--bg-elevated)', border: 'none',
            borderRadius: '16px', padding: 24, height: 280,
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', cursor: 'pointer'
          }}>
            <div style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>NEW RELEASE</div>
            
            <div style={{ position: 'absolute', inset: 0, top: 40, background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2), transparent 60%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
               {/* Abstract sphere placeholder */}
               <div style={{ width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(168, 85, 247, 0.4)', boxShadow: 'inset 0 0 40px rgba(168, 85, 247, 0.2)' }} />
            </div>

            <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Hyper-Pop Era</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: '90%' }}>The latest glitch-filled anthems from the undergrou...</p>
            </div>
          </div>

          {/* Card 3: Liquid Gold */}
          <div style={{
            background: 'var(--bg-elevated)', border: 'none',
            borderRadius: '16px', padding: 24, height: 280,
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', cursor: 'pointer'
          }}>
            <div style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>WEEKLY</div>
            
            <div style={{ position: 'absolute', inset: 0, top: 0, background: 'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.2), transparent 50%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, top: 0, background: 'radial-gradient(circle at 20% 80%, rgba(234, 179, 8, 0.1), transparent 50%)', zIndex: 0 }} />

            <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Liquid Gold</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: '90%' }}>Smooth transitions and deep bass for your night-time focu...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Stations */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 24px 0' }}>
          Mood Stations
        </h2>
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
          {[
            { label: 'ENERGY', icon: ZapIcon, color: '#a855f7' },
            { label: 'CHILL', icon: MoonIcon, color: '#ec4899' },
            { label: 'WORKOUT', icon: DumbbellIcon, color: '#3b82f6' },
            { label: 'FOCUS', icon: BrainIcon, color: '#8b5cf6' },
            { label: 'ROMANCE', icon: HeartOutlineIcon, color: '#f43f5e' },
            { label: 'PARTY', icon: CameraIcon, color: '#f59e0b' },
          ].map((mood) => (
            <div key={mood.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--bg-elevated)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <mood.icon size={32} color={mood.color} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>{mood.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            Trending Now
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-icon-sm" style={{ background: 'var(--bg-elevated)', borderRadius: '50%' }}><ChevronLeftIcon size={18} /></button>
            <button className="btn btn-ghost btn-icon-sm" style={{ background: 'var(--bg-elevated)', borderRadius: '50%' }}><ChevronRightIcon size={18} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trendingSongs.slice(0, 5).map((song, idx) => (
            <div
              key={song.id}
              style={{
                display: 'grid', gridTemplateColumns: '32px 56px 1fr auto auto auto', gap: 16, alignItems: 'center',
                padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={() => player.play(song, trendingSongs)}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{(idx + 1).toString().padStart(2, '0')}</div>
              <img src={song.cover_url} alt={song.title} style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
              <div style={{ minWidth: 0 }}>
                <div className="truncate" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{song.title}</div>
                <div className="truncate" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{song.artist?.name}</div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginRight: 24 }}>{(Math.random() * 5 + 1).toFixed(1)}M Streams</div>
              <button className="btn btn-ghost btn-icon-sm" onClick={e => { e.stopPropagation(); }}><HeartOutlineIcon size={20} color="var(--text-muted)" /></button>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', width: 40, textAlign: 'right' }}>
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
              <button className="btn btn-ghost btn-icon-sm" onClick={e => { e.stopPropagation(); }}><DotsHorizontalIcon size={20} color="var(--text-muted)" /></button>
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

function SearchIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function BellIcon({ size = 24 }: { size?: number }) {
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
