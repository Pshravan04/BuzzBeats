'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';
import type { Song, Playlist } from '@/types';

export default function LibraryPage() {
  const [tab, setTab] = useState<'playlists' | 'liked' | 'albums' | 'artists'>('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<{ id: string; title: string; cover_url: string; artist_name: string }[]>([]);
  const [artistList, setArtistList] = useState<{ id: string; name: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSpotifyImport, setShowSpotifyImport] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const { user } = useAuth();
  const player = usePlayer();
  const supabase = createClient();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadData();
  }, [user, tab]);

  const loadData = async () => {
    setLoading(true);
    if (tab === 'playlists') {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .eq('owner_id', user!.id)
        .order('updated_at', { ascending: false });
      setPlaylists((data ?? []) as Playlist[]);
    } else if (tab === 'liked') {
      const { data } = await supabase
        .from('liked_songs')
        .select('song:songs(*, artist:artists(*), album:albums(*))')
        .eq('user_id', user!.id)
        .order('liked_at', { ascending: false });
      setLikedSongs((data?.map((d: any) => d.song) ?? []) as Song[]);
    } else if (tab === 'albums') {
      const { data } = await supabase
        .from('liked_songs')
        .select('song:songs(album_id, album:albums(*), artist:artists(*))')
        .eq('user_id', user!.id);
      const seen = new Set<string>();
      const extracted = (data ?? []).map((d: any) => d.song).filter(Boolean);
      const unique = extracted.filter((s: any) => {
        if (!s.album_id || seen.has(s.album_id)) return false;
        seen.add(s.album_id);
        return true;
      });
      setAlbums(unique.map((s: any) => ({
        id: s.album_id,
        title: s.album?.title || 'Unknown Album',
        cover_url: s.album?.cover_url || s.cover_url || '',
        artist_name: s.artist?.name || '',
      })));
    } else if (tab === 'artists') {
      const { data } = await supabase
        .from('liked_songs')
        .select('song:songs(artist_id, artist:artists(*))')
        .eq('user_id', user!.id);
      const seen = new Set<string>();
      const extracted = (data ?? []).map((d: any) => d.song).filter(Boolean);
      const unique = extracted.filter((s: any) => {
        if (!s.artist_id || seen.has(s.artist_id)) return false;
        seen.add(s.artist_id);
        return true;
      });
      setArtistList(unique.map((s: any) => ({
        id: s.artist_id,
        name: s.artist?.name || 'Unknown Artist',
        image_url: s.artist?.image_url || '',
      })));
    }
    setLoading(false);
  };

  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;
    const { data, error } = await supabase
      .from('playlists')
      .insert({ name: newPlaylistName.trim(), owner_id: user.id })
      .select()
      .single();
    if (data && !error) {
      setPlaylists(prev => [data as Playlist, ...prev]);
      setNewPlaylistName('');
      setShowCreate(false);
    }
  };

  const importSpotify = async () => {
    if (!spotifyUrl.trim()) return;
    setImporting(true);
    try {
      const res = await fetch('/api/import/spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: spotifyUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Import failed');
      } else {
        alert('Playlist imported successfully!');
        setSpotifyUrl('');
        setShowSpotifyImport(false);
        loadData(); // refresh playlists
      }
    } catch (err) {
      alert('An error occurred during import.');
    } finally {
      setImporting(false);
    }
  };

  const TABS = [
    { key: 'playlists', label: 'Playlists' },
    { key: 'liked', label: 'Liked Songs' },
    { key: 'albums', label: 'Albums' },
    { key: 'artists', label: 'Artists' },
  ] as const;

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, gap: 16, minHeight: '60vh' }}>
        <div style={{ fontSize: 64 }}>🎵</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Your Library</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Sign in to see your playlists, liked songs, and more.</p>
        <Link href="/login"><button className="btn btn-primary btn-lg">Sign In</button></Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: '100%', paddingBottom: 120 }}>
      {/* Header Area */}
      <div style={{ paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Your Library
          </h1>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-ghost btn-icon" style={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: '50%' }}>
              <SearchIcon size={20} />
            </button>
            <button
              className="btn btn-primary btn-icon"
              style={{ borderRadius: '50%' }}
              onClick={() => setShowCreate(true)}
            >
              <PlusIcon size={24} />
            </button>
          </div>
        </div>

        {/* Import Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(29,185,84,0.2) 0%, rgba(29,185,84,0.05) 100%)',
          borderRadius: '16px', padding: '1px', marginBottom: 32,
          border: '1px solid rgba(29,185,84,0.3)',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderRadius: '15px', padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: '#1db954', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(29,185,84,0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'white' }}>Import your Spotify Playlist</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Paste a link to automatically sync your tracks.</p>
              </div>
            </div>
            <button className="btn" onClick={() => setShowSpotifyImport(true)} style={{ background: '#1db954', color: 'black', fontWeight: 800 }}>
              Import Playlist
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 1, scrollbarWidth: 'none' }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              style={{
                padding: '10px 24px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, transition: 'all 0.2s',
                background: tab === key ? 'white' : 'var(--bg-elevated)',
                color: tab === key ? 'black' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Create Playlist</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => setShowCreate(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="input"
                placeholder="My Awesome Playlist"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createPlaylist} disabled={!newPlaylistName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Spotify Import Modal */}
      {showSpotifyImport && (
        <div className="modal-overlay" onClick={() => !importing && setShowSpotifyImport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Import Spotify Playlist</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => !importing && setShowSpotifyImport(false)} disabled={importing}>
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Paste the URL of your public Spotify playlist (e.g. open.spotify.com/playlist/...)
              </p>
              <input
                type="text"
                className="input"
                placeholder="https://open.spotify.com/playlist/..."
                value={spotifyUrl}
                onChange={e => setSpotifyUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && importSpotify()}
                disabled={importing}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSpotifyImport(false)} disabled={importing}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#1db954', color: 'black' }} onClick={importSpotify} disabled={!spotifyUrl.trim() || importing}>
                {importing ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Playlists Tab */}
            {tab === 'playlists' && (
              <div>
                {playlists.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-elevated)', borderRadius: 16, border: 'none' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎵</div>
                    <h2 style={{ marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 800 }}>No playlists yet</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Create your first playlist to get started.</p>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                      Create Playlist
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
                    {/* Liked Songs quick card */}
                    <div
                      onClick={() => setTab('liked')}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        borderRadius: '16px', padding: 24, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        minHeight: 200, position: 'relative', overflow: 'hidden'
                      }}
                    >
                      <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2, fontSize: 120 }}>💜</div>
                      <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: 4, position: 'relative' }}>Liked Songs</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', position: 'relative' }}>{likedSongs.length} songs</p>
                    </div>

                    {playlists.map(playlist => (
                      <Link key={playlist.id} href={`/playlist/${playlist.id}`} style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            background: 'var(--bg-elevated)', border: 'none',
                            borderRadius: '16px', padding: 16, cursor: 'pointer',
                            transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        >
                          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, background: 'var(--bg-base)', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
                            {playlist.cover_url ? (
                              <img src={playlist.cover_url} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '1px solid #1f182b', borderRadius: 8 }}>🎵</div>
                            )}
                          </div>
                          <div className="truncate" style={{ fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: 4 }}>{playlist.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {playlist.song_count} songs {playlist.is_public && '• Public'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Liked Songs Tab */}
            {tab === 'liked' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>Liked Songs</h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => likedSongs.length && player.playQueue(likedSongs, 0)}
                    style={{ gap: 8 }}
                  >
                    <PlayIcon size={16} /> Play All
                  </button>
                </div>

                {likedSongs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-elevated)', borderRadius: 16, border: 'none' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Songs you like will appear here. Start exploring!</p>
                    <Link href="/search"><button className="btn btn-secondary" style={{ marginTop: 16 }}>Explore</button></Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {likedSongs.map((song, idx) => (
                      <div
                        key={song.id}
                        onClick={() => player.play(song, likedSongs)}
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

                        <button className="btn btn-ghost btn-icon-sm" onClick={e => { e.stopPropagation(); }} style={{ marginRight: 8 }}>
                          <HeartIcon size={20} filled={true} />
                        </button>

                        <div className="play-btn" style={{
                          marginRight: 16, width: 40, height: 40, borderRadius: '50%',
                          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'black', opacity: 0, transform: 'scale(0.8)', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', flexShrink: 0
                        }}>
                          <PlayIcon size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Albums Tab */}
            {tab === 'albums' && (
              <div>
                {albums.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-elevated)', borderRadius: 16, border: 'none' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>You don't have any saved albums yet.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 8 }}>Like songs to build your album collection.</p>
                  </div>
                ) : (
                  <div className="grid-cards">
                    {albums.map(album => (
                      <Link key={album.id} href={`/album/${album.id}`}>
                        <div className="card" style={{ padding: 12 }}>
                          <img src={album.cover_url} alt={album.title} style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                          <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{album.title}</div>
                          <div className="truncate" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>{album.artist_name}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Artists Tab */}
            {tab === 'artists' && (
              <div>
                {artistList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-elevated)', borderRadius: 16, border: 'none' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>You don't have any saved artists yet.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 8 }}>Like songs to follow artists.</p>
                  </div>
                ) : (
                  <div className="grid-cards">
                    {artistList.map(artist => (
                      <Link key={artist.id} href={`/artist/${artist.id}`}>
                        <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                          <img src={artist.image_url} alt={artist.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px' }} onError={e => { e.currentTarget.src = '/images/default-artist.jpg'; }} />
                          <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artist.name}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Icons
function PlusIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CloseIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function PlayIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
function SearchIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function HeartIcon({ size = 24, filled = false }: { size?: number, filled?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>;
}
