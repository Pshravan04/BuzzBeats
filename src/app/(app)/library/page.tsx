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
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
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

  const TABS = [
    { key: 'playlists', label: 'Playlists', icon: '🎵' },
    { key: 'liked', label: 'Liked Songs', icon: '💜' },
    { key: 'albums', label: 'Albums', icon: '💿' },
    { key: 'artists', label: 'Artists', icon: '🎤' },
  ] as const;

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, gap: 16, minHeight: '60vh' }}>
        <div style={{ fontSize: 64 }}>🎵</div>
        <h2>Your Library</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Sign in to see your playlists, liked songs, and more.</p>
        <Link href="/login"><button className="btn btn-primary btn-lg">Sign In</button></Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)' }}>Your Library</h1>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowCreate(true)}
          >
            <PlusIcon size={16} />
            New Playlist
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 1 }}>
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`btn btn-sm ${tab === key ? 'btn-accent' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', marginTop: 16 }} />
      </div>

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Playlist</h3>
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

      {/* Content */}
      <div className="page-container" style={{ paddingTop: 24 }}>
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
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎵</div>
                    <h2 style={{ marginBottom: 8 }}>No playlists yet</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Create your first playlist to get started.</p>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                      Create Playlist
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Liked Songs quick link */}
                    <button
                      onClick={() => setTab('liked')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        background: 'transparent', border: 'none', textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: 'linear-gradient(135deg, #4c1d95, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💜</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Liked Songs</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Playlist</div>
                      </div>
                    </button>

                    {playlists.map(playlist => (
                      <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          {playlist.cover_url ? (
                            <img src={playlist.cover_url} alt={playlist.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: '1px solid var(--border-subtle)' }}>🎵</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="truncate" style={{ fontWeight: 600 }}>{playlist.name}</div>
                            <div style={{ display: 'flex', gap: 8, color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                              <span>Playlist</span>
                              {playlist.is_collaborative && <span style={{ color: 'var(--accent)' }}>• Collaborative</span>}
                              <span>• {playlist.song_count} songs</span>
                            </div>
                          </div>
                          {playlist.is_public ? (
                            <span className="badge">Public</span>
                          ) : (
                            <span className="badge">Private</span>
                          )}
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
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #4c1d95, #ec4899)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 32, marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 20,
                }}>
                  <div style={{ fontSize: 80 }}>💜</div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Playlist</div>
                    <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, marginBottom: 8 }}>Liked Songs</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-sm)' }}>
                      {likedSongs.length} songs
                    </p>
                  </div>
                </div>

                {likedSongs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Songs you like will appear here. Start liking!</p>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => likedSongs.length && player.playQueue(likedSongs, 0)}
                      style={{ marginBottom: 24, gap: 8 }}
                    >
                      <PlayIcon size={20} />
                      Play All
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {likedSongs.map((song, idx) => (
                        <div
                          key={song.id}
                          className="song-row"
                          style={{ display: 'grid', gridTemplateColumns: '24px 48px 1fr auto', gap: 12, padding: '8px 12px', alignItems: 'center', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                          onClick={() => player.play(song, likedSongs)}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'right' }}>{idx + 1}</span>
                          <img src={song.cover_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                          <div>
                            <div className="truncate" style={{ fontWeight: 500 }}>{song.title}</div>
                            <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{song.artist?.name}</div>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlusIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CloseIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function PlayIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
