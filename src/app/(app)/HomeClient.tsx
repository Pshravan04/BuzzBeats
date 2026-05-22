'use client';

import React, { useState, useEffect } from 'react';
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
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const featured = trendingSongs.length > 0 ? trendingSongs[0] : null;

  return (
    <div style={{ minHeight: '100%', paddingBottom: 60 }}>
      {/* Hero Section */}
      <div style={{
        padding: '56px 40px 40px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
        }}>
          {[
            { size: 500, top: -150, left: -100, delay: '0s', opacity: 0.15 },
            { size: 400, top: 100, right: -150, delay: '2s', opacity: 0.1 },
          ].map((orb, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: orb.size, height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
              top: orb.top, left: orb.left, right: (orb as any).right, bottom: (orb as any).bottom,
              animation: `float 8s ease-in-out ${orb.delay} infinite`,
              opacity: orb.opacity,
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {greeting}{user ? `, ${user.display_name.split(' ')[0]}` : ''}.
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 'var(--text-lg)' }}>
              Ready to dive into the music? 🎧
            </p>

            <div style={{ display: 'flex', gap: 16 }}>
              <button className="btn btn-primary btn-lg" onClick={() => featured && player.play(featured, trendingSongs)}>
                Play Trending
              </button>
              <Link href="/search" className="btn btn-secondary btn-lg">
                Explore
              </Link>
            </div>
          </div>

          {/* Featured Song Hero Card */}
          {featured && (
            <div
              className="card glass-panel"
              style={{
                flex: '0 1 340px', cursor: 'pointer', padding: 24, borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={() => player.play(featured, trendingSongs)}
            >
              <div style={{ position: 'relative', marginBottom: 16, borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <img
                  src={featured.cover_url}
                  alt={featured.title}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  <div style={{ background: 'var(--accent)', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayButton size={32} />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 800, marginBottom: 8, letterSpacing: '0.1em' }}>
                #1 ON BUZZBEATS
              </div>
              <h2 className="truncate" style={{ fontSize: 'var(--text-xl)', marginBottom: 4, fontWeight: 800 }}>{featured.title}</h2>
              <p className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                {featured.artist?.name}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="page-container">
        {/* Trending Songs */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="section-title">🔥 Trending Right Now</h2>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 24, scrollbarWidth: 'none' }}>
            {trendingSongs.slice(1, 11).map((song, idx) => (
              <SongCard key={song.id} song={song} onClick={() => player.play(song, trendingSongs)} rank={idx + 2} />
            ))}
          </div>
        </section>

        {/* Popular Hits */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="section-title">🌟 Popular Hits</h2>
          <div className="grid-cards">
            {popularHits.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} onClick={() => player.play(song, popularHits)} />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="section-title">🆕 Fresh Drops</h2>
          <div className="grid-cards">
            {newReleases.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} onClick={() => player.play(song, newReleases)} />
            ))}
          </div>
        </section>

        {/* Collaborative Listening CTA */}
        <section style={{ marginBottom: 40 }}>
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)', padding: '40px',
            display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
            background: 'linear-gradient(135deg, rgba(217,70,239,0.1), transparent)'
          }}>
            <div style={{ fontSize: 64 }}>📻</div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 12 }}>Vibe Together.</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: 400 }}>
                Start a collaborative listening room and sync your playback with friends in real-time.
              </p>
            </div>
            <Link href="/room/create">
              <button className="btn btn-primary btn-lg">
                Start a Session
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function SongCard({ song, onClick, rank }: { song: Song; onClick: () => void; rank?: number }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ width: 180, flexShrink: 0, cursor: 'pointer' }}
    >
      <div style={{ position: 'relative', marginBottom: 16, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <img
          src={song.cover_url}
          alt={song.title}
          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
        />
        {rank && rank <= 3 && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'var(--accent)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: 'var(--text-xs)', fontWeight: 800, color: 'white',
          }}>
            #{rank}
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
        >
          <div style={{ background: 'var(--accent)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlayButton size={24} />
          </div>
        </div>
      </div>
      <div className="truncate" style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 4 }}>{song.title}</div>
      <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
        {song.artist?.name}
      </div>
    </div>
  );
}

function PlayButton({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
