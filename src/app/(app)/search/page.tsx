'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { searchSongs } from '@/lib/api/jiosaavn';
import type { Song } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const player = usePlayer();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSongs([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);

    try {
      const results = await searchSongs(q, 30);
      setSongs(results);
    } catch (e) {
      console.error(e);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const BROWSE_CATEGORIES = [
    { label: 'Pop Hits', color: '#ec4899', emoji: '🎤' },
    { label: 'Hip-Hop', color: '#f59e0b', emoji: '🎧' },
    { label: 'Electronic', color: '#3b82f6', emoji: '🎛️' },
    { label: 'R&B', color: '#8b5cf6', emoji: '🎵' },
    { label: 'Indie', color: '#10b981', emoji: '🎸' },
    { label: 'Lo-Fi', color: '#6b7280', emoji: '☕' },
    { label: 'Classical', color: '#f97316', emoji: '🎻' },
    { label: 'Jazz', color: '#ef4444', emoji: '🎺' },
  ];

  return (
    <div style={{ minHeight: '100%', paddingBottom: 100 }}>
      {/* Search Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '32px 40px 24px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 24, fontWeight: 800 }}>Search</h1>

        {/* Search input */}
        <div style={{ position: 'relative', maxWidth: 800 }}>
          <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>
            <SearchIcon size={24} />
          </span>
          <input
            type="search"
            className="input"
            placeholder="Search for any song, anywhere..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="Search music"
            id="search-input"
            style={{ 
              paddingLeft: 64, fontSize: 'var(--text-lg)', height: 64, 
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)',
              border: '2px solid transparent', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer' }}
              aria-label="Clear search"
            >
              <CloseIcon size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 24 }}>
        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <>
            {songs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 80, marginBottom: 24 }}>🔍</div>
                <h2 style={{ marginBottom: 12, fontSize: 'var(--text-2xl)', fontWeight: 800 }}>No tracks found for "{query}"</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Check spelling or try a different song name.</p>
              </div>
            )}

            {songs.length > 0 && (
              <section>
                <h2 style={{ marginBottom: 24, fontSize: 'var(--text-xl)', fontWeight: 800 }}>Top Results</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {songs.map((song, idx) => (
                    <div
                      key={song.id}
                      onClick={() => player.play(song, songs)}
                      style={{ 
                        display: 'grid', gridTemplateColumns: '56px 1fr auto auto', gap: 16,
                        alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: 'transparent'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        <img src={song.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >
                           <PlayButton size={24} />
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="truncate" style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 4 }}>{song.title}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{song.artist?.name}</div>
                      </div>
                      <div className="desktop-only" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', paddingRight: 24 }}>
                        {song.album?.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Browse Categories (shown when no search) */}
        {!hasSearched && (
          <>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>Browse Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {BROWSE_CATEGORIES.map(({ label, color, emoji }) => (
                <button
                  key={label}
                  onClick={() => setQuery(label)}
                  style={{
                    background: `linear-gradient(135deg, ${color}88, ${color})`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px 20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    minHeight: 120,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${color}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: 'var(--text-lg)', letterSpacing: '0.02em' }}>{label}</div>
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
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CloseIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function PlayButton({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
