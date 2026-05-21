'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';
import type { Song, Artist, Album, Playlist } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const player = usePlayer();
  const supabase = createClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSongs([]); setArtists([]); setAlbums([]); setPlaylists([]);
      setHasSearched(false); return;
    }
    setLoading(true);
    setHasSearched(true);
    const pattern = `%${q}%`;

    const [s, a, al, p] = await Promise.all([
      supabase.from('songs').select('*, artist:artists(*), album:albums(*)').ilike('title', pattern).limit(10),
      supabase.from('artists').select('*').ilike('name', pattern).limit(6),
      supabase.from('albums').select('*, artist:artists(*)').ilike('title', pattern).limit(6),
      supabase.from('playlists').select('*, owner:profiles(display_name, avatar_url)').eq('is_public', true).ilike('name', pattern).limit(6),
    ]);

    setSongs((s.data ?? []) as Song[]);
    setArtists((a.data ?? []) as Artist[]);
    setAlbums((al.data ?? []) as Album[]);
    setPlaylists((p.data ?? []) as Playlist[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const BROWSE_CATEGORIES = [
    { label: 'Pop', color: '#EC4899', emoji: '🎤' },
    { label: 'Hip-Hop', color: '#F59E0B', emoji: '🎧' },
    { label: 'Electronic', color: '#3B82F6', emoji: '🎛️' },
    { label: 'R&B', color: '#8B5CF6', emoji: '🎵' },
    { label: 'Indie', color: '#10B981', emoji: '🎸' },
    { label: 'Lo-Fi', color: '#6B7280', emoji: '☕' },
    { label: 'Classical', color: '#F97316', emoji: '🎻' },
    { label: 'Jazz', color: '#EF4444', emoji: '🎺' },
    { label: 'Folk', color: '#84CC16', emoji: '🪕' },
    { label: 'Metal', color: '#374151', emoji: '🤘' },
  ];

  const tabs = ['all', 'songs', 'artists', 'albums', 'playlists'] as const;

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Search Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 'var(--z-sticky)',
        padding: '24px 24px 16px',
        background: 'var(--bg-base)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 16 }}>Search</h1>

        {/* Search input */}
        <div style={{ position: 'relative', maxWidth: 600 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <SearchIcon size={20} />
          </span>
          <input
            type="search"
            className="input input-search"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="Search music"
            id="search-input"
            style={{ paddingLeft: 48, fontSize: 'var(--text-base)', height: 52 }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}
              aria-label="Clear search"
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        {hasSearched && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn btn-sm ${activeTab === tab ? 'btn-accent' : 'btn-secondary'}`}
                style={{ flexShrink: 0 }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="page-container" style={{ paddingTop: 8 }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <>
            {/* No results */}
            {songs.length === 0 && artists.length === 0 && albums.length === 0 && playlists.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h2 style={{ marginBottom: 8 }}>No results for "{query}"</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Check spelling or try different keywords</p>
              </div>
            )}

            {/* Songs */}
            {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 16, fontSize: 'var(--text-xl)', fontWeight: 700 }}>Songs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {songs.map((song, idx) => (
                    <div
                      key={song.id}
                      className="song-row"
                      onClick={() => player.play(song, songs)}
                      style={{ gridTemplateColumns: '40px 1fr auto auto' }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={song.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="truncate" style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{song.title}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{song.artist?.name}</div>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                        {song.album?.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 16, fontSize: 'var(--text-xl)', fontWeight: 700 }}>Artists</h2>
                <div className="grid-cards">
                  {artists.map(artist => (
                    <Link key={artist.id} href={`/artist/${artist.id}`}>
                      <div className="music-card" style={{ padding: 16, textAlign: 'center' }}>
                        <img
                          src={artist.image_url ?? '/images/default-artist.jpg'}
                          alt={artist.name}
                          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
                          onError={(e) => { e.currentTarget.src = '/images/default-artist.jpg'; }}
                        />
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artist.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>Artist</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 16, fontSize: 'var(--text-xl)', fontWeight: 700 }}>Albums</h2>
                <div className="grid-cards">
                  {albums.map(album => (
                    <Link key={album.id} href={`/album/${album.id}`}>
                      <div className="music-card" style={{ padding: 12 }}>
                        <img src={album.cover_url} alt={album.title} className="cover" style={{ borderRadius: 8, width: '100%', aspectRatio: '1', objectFit: 'cover', marginBottom: 8 }} onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                        <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{album.title}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{album.artist?.name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {(activeTab === 'all' || activeTab === 'playlists') && playlists.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 16, fontSize: 'var(--text-xl)', fontWeight: 700 }}>Playlists</h2>
                <div className="grid-cards">
                  {playlists.map(playlist => (
                    <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                      <div className="music-card" style={{ padding: 12 }}>
                        <div style={{ width: '100%', aspectRatio: '1', background: 'var(--gradient-card)', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                          🎵
                        </div>
                        <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{playlist.name}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{playlist.song_count} songs</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Browse Categories (shown when no search) */}
        {!hasSearched && (
          <>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 16 }}>Browse Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {BROWSE_CATEGORIES.map(({ label, color, emoji }) => (
                <button
                  key={label}
                  onClick={() => setQuery(label)}
                  style={{
                    background: color,
                    borderRadius: 'var(--radius-md)',
                    padding: '20px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative', overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: 'var(--text-sm)' }}>{label}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CloseIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
