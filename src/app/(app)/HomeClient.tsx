'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import type { Song, Artist, Album } from '@/types';

interface HomeClientProps {
  featuredSongs: Song[];
  trendingArtists: Artist[];
  newReleases: Album[];
}

export default function HomeClient({ featuredSongs, trendingArtists, newReleases }: HomeClientProps) {
  const { user } = useAuth();
  const player = usePlayer();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const featured = featuredSongs[0];

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero Section */}
      <div style={{
        background: 'var(--gradient-hero)',
        padding: '48px 32px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          {[
            { size: 400, top: -100, left: -100, delay: '0s' },
            { size: 300, top: 50, right: -50, delay: '2s' },
            { size: 200, bottom: -50, left: '40%', delay: '1s' },
          ].map((orb, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: orb.size, height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 70%)`,
              top: orb.top, left: orb.left, right: (orb as any).right, bottom: (orb as any).bottom,
              animation: `float 6s ease-in-out ${orb.delay} infinite`,
              opacity: 0.5,
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            {greeting}{user ? `, ${user.display_name.split(' ')[0]}` : ''}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Discover what's buzzing today 🎵
          </p>

          {/* Featured Song */}
          {featured && (
            <div
              className="card-glass"
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: 20, maxWidth: 560, cursor: 'pointer',
              }}
              onClick={() => player.play(featured, featuredSongs)}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={featured.cover_url}
                  alt={featured.title}
                  style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
                />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)',
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                >
                  <PlayButton size={32} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                  ✨ TRENDING NOW
                </div>
                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 4 }} className="truncate">{featured.title}</h2>
                <p className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {featured.artist?.name}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={(e) => { e.stopPropagation(); player.play(featured, featuredSongs); }}
              >
                Play
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="page-container" style={{ paddingTop: 32 }}>

        {/* Quick Play Grid */}
        <section style={{ marginBottom: 40 }} aria-labelledby="quick-play-title">
          <h2 id="quick-play-title" className="section-title">
            Quick Play
            <Link href="/library">See all</Link>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 8,
          }}>
            {[
              { label: 'Liked Songs', icon: '💜', href: '/library?tab=liked', gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
              { label: 'Recently Played', icon: '🕐', href: '/library?tab=recent', gradient: 'linear-gradient(135deg, #1e3a5f, #3b82f6)' },
              { label: 'Top Mixes', icon: '🎧', href: '/library?tab=mixes', gradient: 'linear-gradient(135deg, #831843, #ec4899)' },
              { label: 'Chill Vibes', icon: '🌊', href: '/library?tab=chill', gradient: 'linear-gradient(135deg, #064e3b, #10b981)' },
            ].map(({ label, icon, href, gradient }) => (
              <Link key={label} href={href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                  border: '1px solid var(--border-subtle)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ width: 56, height: 56, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Songs */}
        <section style={{ marginBottom: 40 }} aria-labelledby="trending-title">
          <h2 id="trending-title" className="section-title">
            🔥 Trending Now
            <Link href="/search">Explore</Link>
          </h2>
          <div className="scroll-row">
            {featuredSongs.slice(0, 10).map((song, idx) => (
              <SongCard key={song.id} song={song} onClick={() => player.play(song, featuredSongs)} rank={idx + 1} />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section style={{ marginBottom: 40 }} aria-labelledby="new-releases-title">
          <h2 id="new-releases-title" className="section-title">
            🆕 New Releases
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>Albums & EPs</span>
          </h2>
          <div className="grid-cards">
            {newReleases.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>

        {/* Trending Artists */}
        <section style={{ marginBottom: 40 }} aria-labelledby="artists-title">
          <h2 id="artists-title" className="section-title">
            🌟 Trending Artists
          </h2>
          <div className="scroll-row">
            {trendingArtists.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>

        {/* Collaborative Listening CTA */}
        <section style={{ marginBottom: 40 }}>
          <div style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            display: 'flex', alignItems: 'center', gap: 24,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 48 }}>🎧</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 8 }}>Listen Together</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Create a room and vibe with friends in real-time, no matter where you are.
              </p>
            </div>
            <Link href="/room/create">
              <button className="btn btn-primary btn-lg">
                Create a Room
              </button>
            </Link>
          </div>
        </section>

        {/* Spotify Import CTA */}
        {!user?.spotify_connected && (
          <section style={{ marginBottom: 40 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30,215,96,0.1) 0%, rgba(30,215,96,0.05) 100%)',
              border: '1px solid rgba(30,215,96,0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 36 }}>🎵</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <h3 style={{ marginBottom: 4 }}>Import from Spotify</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Bring your playlists and saved songs over to BuzzBeats.
                </p>
              </div>
              <Link href="/import">
                <button className="btn btn-secondary">
                  Import Playlists
                </button>
              </Link>
            </div>
          </section>
        )}

        {/* Credits footer */}
        <footer style={{ textAlign: 'center', padding: '24px 0 40px', borderTop: '1px solid var(--border-subtle)', marginTop: 8 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            Designed and developed by <strong style={{ color: 'var(--accent)' }}>Shravan</strong> ·
            Brand credits to <strong style={{ color: 'var(--accent)' }}>Gauri</strong> ·{' '}
            <Link href="/settings" style={{ color: 'var(--text-secondary)' }}>Settings</Link>
          </p>
        </footer>
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
      className="music-card"
      onClick={onClick}
      style={{ width: 160, flexShrink: 0, padding: 12 }}
    >
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <img
          src={song.cover_url}
          alt={song.title}
          className="cover"
          onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
        />
        {rank && rank <= 3 && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'var(--gradient-accent)',
            borderRadius: 'var(--radius-xs)',
            padding: '2px 8px',
            fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white',
          }}>
            #{rank}
          </div>
        )}
        <div className="play-overlay">
          <PlayButton size={20} />
        </div>
      </div>
      <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{song.title}</div>
      <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
        {song.artist?.name}
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/album/${album.id}`}>
      <div className="music-card" style={{ padding: 12 }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <img
            src={album.cover_url}
            alt={album.title}
            className="cover"
            onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
          />
          <div className="play-overlay">
            <PlayButton size={20} />
          </div>
        </div>
        <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{album.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {album.artist?.verified && <span style={{ color: 'var(--accent)', fontSize: 10 }}>✓</span>}
          <span className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
            {album.artist?.name}
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>
          {album.genre} · {album.release_date ? new Date(album.release_date).getFullYear() : ''}
        </div>
      </div>
    </Link>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artist/${artist.id}`}>
      <div style={{
        width: 140, flexShrink: 0, textAlign: 'center', cursor: 'pointer',
        padding: '12px 8px',
        borderRadius: 'var(--radius-lg)',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ position: 'relative', margin: '0 auto 10px', width: 100, height: 100 }}>
          <img
            src={artist.image_url ?? '/images/default-artist.jpg'}
            alt={artist.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.src = '/images/default-artist.jpg'; }}
          />
          {artist.verified && (
            <div style={{
              position: 'absolute', bottom: 4, right: 4,
              background: 'var(--accent)',
              borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: 'white',
            }}>✓</div>
          )}
        </div>
        <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artist.name}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
          {(artist.follower_count / 1000).toFixed(0)}K followers
        </div>
      </div>
    </Link>
  );
}

function PlayButton({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
