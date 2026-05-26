'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'SONG' | 'ARTIST' | 'PLAYLIST'>('SONG');
  
  const player = usePlayer();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string, type: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query, activeTab), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeTab, search]);

  const TABS = [
    { key: 'SONG', label: 'Songs' },
    { key: 'ARTIST', label: 'Artists' },
    { key: 'PLAYLIST', label: 'Playlists' }
  ] as const;

  return (
    <div className="page-container" style={{ minHeight: '100%', paddingBottom: 100 }}>
      {/* Search Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '24px 0px 16px',
        background: 'var(--bg-base)',
      }}>
        <div style={{ position: 'relative', maxWidth: 640 }}>
          <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none', display: 'flex' }}>
            <SearchIcon size={20} />
          </span>
          <input
            type="search"
            className="input"
            placeholder="What do you want to play?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="Search music"
            style={{ 
              paddingLeft: 56, fontSize: '16px', height: 48, 
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)',
              border: '1px solid transparent', boxShadow: 'none',
              color: 'var(--text-primary)', transition: 'all 0.2s', width: '100%'
            }}
            onFocus={e => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.border = '1px solid var(--border-color)';
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.border = '1px solid transparent';
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <CloseIcon size={20} />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        {query && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === key ? 'var(--text-primary)' : 'var(--bg-elevated)',
                  color: activeTab === key ? 'var(--bg-base)' : 'var(--text-primary)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="page-container" style={{ paddingTop: 24 }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          </div>
        )}

        {hasSearched && !loading && (
          <>
            {results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 80, marginBottom: 24 }}>🔍</div>
                <h2 style={{ marginBottom: 12, fontSize: 'var(--text-2xl)', fontWeight: 800 }}>No results found for "{query}"</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Check spelling or try a different keyword.</p>
              </div>
            )}

            {results.length > 0 && activeTab === 'SONG' && (
              <section>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {results.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => player.play(song, results)}
                      className="song-row"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 64,
                        display: 'flex', alignItems: 'center', cursor: 'pointer', overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <div style={{ width: 64, height: 64, flexShrink: 0, position: 'relative' }}>
                        <img src={song.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      <div style={{ minWidth: 0, flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="truncate" style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{song.title}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{song.artist?.name}</div>
                      </div>

                      <div style={{
                        marginRight: 16, width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'black', flexShrink: 0
                      }}>
                        <PlayButton size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {results.length > 0 && activeTab === 'ARTIST' && (
              <section>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24 }}>
                  {results.map((artist) => (
                    <Link href={`/artist/${artist.id}`} key={artist.id} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ 
                          width: '100%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', marginBottom: 12,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', background: 'var(--bg-elevated)'
                        }}>
                          <img src={artist.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16, textAlign: 'center', color: 'var(--text-primary)' }}>{artist.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Artist</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.length > 0 && activeTab === 'PLAYLIST' && (
              <section>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                  {results.map((playlist) => (
                    <Link href={`/playlist/${playlist.id}`} key={playlist.id} style={{ textDecoration: 'none' }}>
                      <div style={{ 
                        background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, cursor: 'pointer',
                        transition: 'background 0.2s', height: '100%'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      >
                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', marginBottom: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                          <img src={playlist.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="truncate" style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--text-primary)' }}>{playlist.name}</div>
                        <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>By {playlist.owner?.display_name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {!hasSearched && (
          <div style={{ textAlign: 'center', padding: '100px 20px', opacity: 0.5 }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Start Typing</h2>
            <p style={{ marginTop: 8 }}>Search for your favorite songs, artists, and playlists globally.</p>
          </div>
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
