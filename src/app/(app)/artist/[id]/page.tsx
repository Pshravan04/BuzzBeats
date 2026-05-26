'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';
import type { Artist, Song, Album } from '@/types';

export default function ArtistPage() {
  const params = useParams();
  const id = params.id as string;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();
  const supabase = createClient();

  useEffect(() => {
    loadArtist();
  }, [id]);

  const loadArtist = async () => {
    try {
      const res = await fetch(`/api/artist?id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Failed to load artist');
      
      const data = await res.json();
      setArtist(data.artist);
      setTopSongs(data.songs || []);
      setAlbums(data.albums || []);
    } catch (e) {
      console.error(e);
      setArtist(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64 }}>😕</div>
        <h2>Artist not found</h2>
        <Link href="/search"><button className="btn btn-primary" style={{ marginTop: 16 }}>Search Artists</button></Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        height: '40vh',
        minHeight: 300,
        display: 'flex', alignItems: 'flex-end',
        padding: '32px',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${artist.image_url ?? '/images/default-artist.jpg'})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.4,
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {artist.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 8 }}>
              <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
              Verified Artist
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, marginBottom: 8, lineHeight: 1.1, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            {artist.name}
          </h1>
          <div style={{ color: 'var(--text-secondary)' }}>
            {(artist.follower_count / 1000).toFixed(0)}K monthly listeners
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 24 }}>
        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <button
            className="btn btn-primary"
            onClick={() => topSongs.length && player.playQueue(topSongs, 0)}
            disabled={topSongs.length === 0}
            style={{ width: 56, height: 56, borderRadius: '50%' }}
          >
            <PlayIcon size={24} />
          </button>
          <button className="btn btn-secondary">Follow</button>
        </div>

        {/* Top Songs */}
        {topSongs.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 className="section-title">Popular</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topSongs.map((song, idx) => (
                <div
                  key={song.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 48px 1fr auto',
                    gap: 16, padding: '8px 12px', alignItems: 'center',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: player.currentSong?.id === song.id ? 'var(--accent-glow)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => player.play(song, topSongs)}
                  onMouseEnter={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                  onMouseLeave={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'right' }}>
                    {player.currentSong?.id === song.id && player.isPlaying
                      ? <WaveIcon />
                      : idx + 1
                    }
                  </div>
                  <img src={song.cover_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                  <div className="truncate" style={{ fontWeight: 500, color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                    {(song.play_count / 1000).toFixed(1)}K plays
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 className="section-title">Albums & EPs</h2>
            <div className="grid-cards">
              {albums.map(album => (
                <Link key={album.id} href={`/album/${album.id}`}>
                  <div className="music-card" style={{ padding: 12 }}>
                    <img src={album.cover_url} alt={album.title} className="cover" style={{ borderRadius: 8, width: '100%', aspectRatio: '1', objectFit: 'cover', marginBottom: 8 }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                    <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{album.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>
                      {album.release_date ? new Date(album.release_date).getFullYear() : ''} · {album.genre}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PlayIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function WaveIcon() {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16, width: 20, justifyContent: 'flex-end' }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="beat-bar" style={{ width: 3 }} />)}
    </div>
  );
}
