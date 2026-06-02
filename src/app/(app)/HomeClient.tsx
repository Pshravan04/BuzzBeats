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
  playlists: any[];
  artists: any[];
}

const FILTER_CHIPS = ['Energize', 'Workout', 'Relax', 'Focus', 'Commute'];

export default function HomeClient({ trendingSongs, popularHits, newReleases, playlists, artists }: HomeClientProps) {
  const { user } = useAuth();
  const player = usePlayer();
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Good night';

  return (
    <div className="page-container" style={{ minHeight: '100%', paddingBottom: 120, position: 'relative' }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="desktop-only" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-icon-sm" style={{ background: 'var(--bg-elevated)', color: 'white', borderRadius: '50%' }}><ChevronLeftIcon size={24} /></button>
          <button className="btn btn-ghost btn-icon-sm" style={{ background: 'var(--bg-elevated)', color: 'white', opacity: 0.5, borderRadius: '50%' }}><ChevronRightIcon size={24} /></button>
        </div>
        <div className="mobile-only">
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{greeting}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
          <Link href="/settings">
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', border: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 14, overflow: 'hidden' }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.display_name?.[0]?.toUpperCase() ?? 'U'
              )}
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

      {/* Greetings / Recently Played */}
      <section style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 24px 0' }}>
          {greeting}
        </h2>
        
        <div className="greeting-grid">
          {popularHits.slice(0, 6).map((song, i) => (
            <div key={song.id || i} className="song-row" onClick={() => player.play(song, popularHits)} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 64,
              display: 'flex', alignItems: 'center', cursor: 'pointer', overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative'
            }}>
              <div style={{ width: 64, height: 64, background: `hsl(${i * 60}, 70%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={song.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
              </div>
              <span className="truncate" style={{ fontWeight: 700, fontSize: 15, marginLeft: 16, flex: 1, paddingRight: 16 }}>{song.title}</span>
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

      {/* Trending Artists */}
      {artists.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
              Popular Artists
            </h2>
            <Link href="/search" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Show all</Link>
          </div>
          <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {artists.map(artist => (
              <Link key={artist.id} href={`/artist/${artist.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 140 }}>
                <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', marginBottom: 12, background: 'var(--bg-elevated)' }}>
                    <img src={artist.image_url} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-artist.jpg'; }} />
                  </div>
                  <div className="truncate" style={{ fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{artist.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>Artist</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Playlist Suggestions */}
      {playlists.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
              Suggested Playlists
            </h2>
            <Link href="/search" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Show all</Link>
          </div>
          <div className="grid-cards">
            {playlists.map(playlist => (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 16, position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, marginBottom: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                    <img src={playlist.cover_url} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                  </div>
                  <div className="truncate" style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{playlist.name}</div>
                  <div className="truncate" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{playlist.owner?.display_name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {/* New Releases */}
      <section style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            New Releases
          </h2>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show all</span>
        </div>

        <div className="grid-cards">
          {newReleases.slice(0, 6).map((song) => (
            <div key={song.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 16, position: 'relative', cursor: 'pointer' }} onClick={() => player.play(song, newReleases)}>
              <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, marginBottom: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <img src={song.cover_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
              </div>
              <div className="truncate" style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{song.title}</div>
              <div className="truncate" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{song.artist?.name}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// Icons
function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
function ChevronLeftIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
}
function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
