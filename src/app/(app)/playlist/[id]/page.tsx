'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import type { Playlist, Song } from '@/types';

export default function PlaylistPage() {
  const params = useParams();
  const id = params.id as string;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const player = usePlayer();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    const { data: pl } = await supabase
      .from('playlists')
      .select('*, owner:profiles(display_name, avatar_url)')
      .eq('id', id)
      .single();

    if (pl) {
      setPlaylist(pl as Playlist);
      const { data: ps } = await supabase
        .from('playlist_songs')
        .select('*, song:songs(*, artist:artists(*), album:albums(*))')
        .eq('playlist_id', id)
        .order('position');
      setSongs((ps?.map((r: any) => r.song) ?? []) as Song[]);
    }
    setLoading(false);
  };

  const toggleLike = async (songId: string, isLiked: boolean) => {
    if (!user) return;
    if (isLiked) {
      await supabase.from('liked_songs').delete().eq('user_id', user.id).eq('song_id', songId);
    } else {
      await supabase.from('liked_songs').insert({ user_id: user.id, song_id: songId });
    }
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, is_liked: !isLiked } : s));
  };

  const removeSong = async (songId: string) => {
    if (!user || playlist?.owner_id !== user.id) return;
    await supabase.from('playlist_songs').delete().eq('playlist_id', id).eq('song_id', songId);
    setSongs(prev => prev.filter(s => s.id !== songId));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64 }}>😕</div>
        <h2>Playlist not found</h2>
        <Link href="/library"><button className="btn btn-primary" style={{ marginTop: 16 }}>Back to Library</button></Link>
      </div>
    );
  }

  const isOwner = user?.id === playlist.owner_id;
  const coverColors = ['#4c1d95,#3b82f6', '#831843,#ec4899', '#064e3b,#10b981', '#1e3a5f,#3b82f6'];
  const coverGradient = `linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}, #${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')})`;

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--bg-glass)',
        padding: '60px 40px 40px',
        display: 'flex', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {/* Cover */}
        {playlist.cover_url ? (
          <div style={{ width: 240, height: 240, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', flexShrink: 0 }}>
            <img src={playlist.cover_url} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{
            width: 240, height: 240, borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 80, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', flexShrink: 0,
          }}>🎵</div>
        )}

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {playlist.is_collaborative ? '🤝 Collaborative Playlist' : 'Playlist'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            {playlist.name}
          </h1>
          {playlist.description && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 'var(--text-lg)' }}>{playlist.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 'var(--text-base)', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-primary)' }}>{(playlist.owner as any)?.display_name}</span>
            <span>•</span>
            <span>{songs.length} songs</span>
            {playlist.is_public && <span className="badge" style={{ background: 'var(--accent)', color: 'white' }}>Public</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          className="btn"
          style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50px', padding: '16px 40px', fontSize: 'var(--text-lg)', fontWeight: 800, border: 'none' }}
          onClick={() => songs.length && player.playQueue(songs, 0)}
          disabled={songs.length === 0}
          id="playlist-play-btn"
        >
          <PlayIcon size={24} />
          Play
        </button>
        <button
          className="btn"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: '50px', padding: '16px 24px', fontWeight: 700, border: '1px solid var(--border-subtle)' }}
          onClick={() => { if (songs.length) { player.playQueue(songs, Math.floor(Math.random() * songs.length)); } }}
          disabled={songs.length === 0}
        >
          <ShuffleIcon size={20} />
          Shuffle
        </button>

        {isOwner && (
          <>
            <button className="btn btn-ghost" style={{ borderRadius: '50px', padding: '16px 24px', fontWeight: 700 }} onClick={() => setShowShare(true)}>
              <ShareIcon size={20} />
              Share
            </button>
            {playlist.is_collaborative && (
              <button className="btn btn-ghost" style={{ borderRadius: '50px', padding: '16px 24px', fontWeight: 700 }} onClick={() => setShowInvite(true)}>
                <UserPlusIcon size={20} />
                Invite
              </button>
            )}
            <Link href={`/room/create?playlist=${id}`}>
              <button className="btn btn-ghost" style={{ borderRadius: '50px', padding: '16px 24px', fontWeight: 700 }}>
                🎧 Listen Together
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Songs list */}
      <div style={{ padding: '0 40px 100px' }}>
        {songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🎵</div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 12 }}>This playlist is empty</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Find some tracks and add them here!</p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 1fr auto auto', gap: 16, padding: '16px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <span>#</span>
              <span>Title</span>
              <span className="desktop-only">Album</span>
              <span className="desktop-only">♥</span>
              <span>⏱</span>
            </div>

            {songs.map((song, idx) => (
              <div
                key={song.id}
                style={{
                  display: 'grid', gridTemplateColumns: '56px 1fr 1fr auto auto',
                  gap: 16, padding: '12px 16px', alignItems: 'center',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: player.currentSong?.id === song.id ? 'var(--bg-glass-hover)' : 'transparent',
                  transition: 'all 0.2s',
                  boxShadow: player.currentSong?.id === song.id ? 'inset 0 0 0 1px var(--accent)' : 'none',
                }}
                onClick={() => player.play(song, songs)}
                onMouseEnter={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                onMouseLeave={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-muted)', fontSize: 'var(--text-base)', textAlign: 'right', fontWeight: 700 }}>
                  {player.currentSong?.id === song.id && player.isPlaying
                    ? <WaveIcon />
                    : idx + 1
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  <img src={song.cover_url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</div>
                    <Link href={`/artist/${song.artist_id}`} onClick={e => e.stopPropagation()}>
                      <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>{song.artist?.name}</div>
                    </Link>
                  </div>
                </div>
                <div className="truncate desktop-only" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  <Link href={`/album/${song.album_id}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--text-secondary)' }}>
                    {song.album?.title}
                  </Link>
                </div>
                <button
                  className="btn btn-ghost btn-icon-sm desktop-only"
                  onClick={e => { e.stopPropagation(); toggleLike(song.id, !!song.is_liked); }}
                  style={{ color: song.is_liked ? 'var(--accent)' : 'var(--text-muted)' }}
                  aria-label={song.is_liked ? 'Unlike' : 'Like'}
                >
                  <HeartIcon size={20} filled={song.is_liked} />
                </button>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Playlist</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => setShowShare(false)}><CloseIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Share "{playlist.name}" with others:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://buzzbeats.app'}/playlist/${id}`} readOnly style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}`); }}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Collaborators</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => setShowInvite(false)}><CloseIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Share this link to invite people to collaborate:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={`${window.location.origin}/playlist/${id}?invite=true`} readOnly style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}?invite=true`)}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function ShuffleIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
}
function ShareIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
}
function UserPlusIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}
function HeartIcon({ size = 24, filled = false }: { size?: number; filled?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
function CloseIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function WaveIcon() {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16, width: 20 }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="beat-bar" style={{ width: 3 }} />)}
    </div>
  );
}
