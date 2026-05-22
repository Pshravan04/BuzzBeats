'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
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
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSongs(data.results || []);
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
    { label: 'Electronic', gradient: 'linear-gradient(90deg, #b76dff 0%, #f751a1 100%)', textColor: 'var(--text-primary)' },
    { label: 'Indie', gradient: 'linear-gradient(to bottom right, #f751a1, #8c0053)', textColor: 'white' },
    { label: 'Lo-Fi', gradient: 'linear-gradient(to bottom right, #0566d9, #004395)', textColor: 'white' },
    { label: 'Hip Hop', gradient: 'linear-gradient(to bottom right, #FF8A00, #FF2E00)', textColor: 'white' },
    { label: 'Ambient', gradient: 'linear-gradient(to bottom right, #00C2FF, #0047FF)', textColor: 'white' },
    { label: 'Rock', gradient: 'linear-gradient(to bottom right, #93000a, #690005)', textColor: 'white' },
    { label: 'Pop Hits', gradient: 'linear-gradient(to bottom right, #ec4899, #be185d)', textColor: 'white' },
    { label: 'Jazz', gradient: 'linear-gradient(to bottom right, #8b5cf6, #5b21b6)', textColor: 'white' },
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {songs.map((song, idx) => (
                    <div
                      key={song.id}
                      onClick={() => player.play(song, songs)}
                      className="song-row"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 64,
                        display: 'flex', alignItems: 'center', cursor: 'pointer', overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        const playBtn = e.currentTarget.querySelector('.play-btn') as HTMLElement;
                        if(playBtn) { playBtn.style.opacity = '1'; playBtn.style.transform = 'scale(1)'; }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        const playBtn = e.currentTarget.querySelector('.play-btn') as HTMLElement;
                        if(playBtn) { playBtn.style.opacity = '0'; playBtn.style.transform = 'scale(0.8)'; }
                      }}
                    >
                      <div style={{ width: 64, height: 64, flexShrink: 0, position: 'relative' }}>
                        <img src={song.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                      </div>
                      
                      <div style={{ minWidth: 0, flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="truncate" style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{song.title}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{song.artist?.name}</div>
                      </div>

                      <div className="play-btn" style={{
                        marginRight: 16, width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'black', opacity: 0, transform: 'scale(0.8)', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', flexShrink: 0
                      }}>
                        <PlayButton size={20} />
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
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Browse Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24 }}>
              {BROWSE_CATEGORIES.map(({ label, gradient, textColor }) => (
                <button
                  key={label}
                  onClick={() => setQuery(label)}
                  style={{
                    background: gradient,
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative', overflow: 'hidden',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: 'none',
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                    const blur = e.currentTarget.querySelector('.blur-glow') as HTMLElement;
                    const play = e.currentTarget.querySelector('.play-btn') as HTMLElement;
                    if(blur) blur.style.transform = 'scale(1.5)';
                    if(play) { play.style.opacity = '1'; play.style.transform = 'translateY(0)'; }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    const blur = e.currentTarget.querySelector('.blur-glow') as HTMLElement;
                    const play = e.currentTarget.querySelector('.play-btn') as HTMLElement;
                    if(blur) blur.style.transform = 'scale(1)';
                    if(play) { play.style.opacity = '0'; play.style.transform = 'translateY(8px)'; }
                  }}
                >
                  <div style={{ fontWeight: 600, color: textColor, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', position: 'relative', zIndex: 2 }}>{label}</div>
                  
                  <div className="play-btn" style={{
                    opacity: 0, transform: 'translateY(8px)', position: 'absolute', bottom: 16, right: 16,
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    padding: 8, borderRadius: 'var(--radius-full)', transition: 'all 0.3s', zIndex: 2
                  }}>
                    <PlayButton size={24} />
                  </div>
                  
                  <div className="blur-glow" style={{
                    position: 'absolute', right: -16, bottom: -16, width: 96, height: 96,
                    background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', filter: 'blur(24px)',
                    transition: 'transform 0.5s', zIndex: 1
                  }}></div>
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
