'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import type { Album, Song } from '@/types';

export default function AlbumPage() {
  const params = useParams();
  const id = params.id as string;
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const loadAlbum = async () => {
    const { data: albumData } = await supabase
      .from('albums')
      .select('*, artist:artists(*)')
      .eq('id', id)
      .single();

    if (albumData) {
      setAlbum(albumData as Album);
      const { data: songsData } = await supabase
        .from('songs')
        .select('*, artist:artists(*), album:albums(*)')
        .eq('album_id', id)
        .order('track_number');
      setSongs((songsData ?? []) as Song[]);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!album) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64 }}>😕</div>
        <h2>Album not found</h2>
        <Link href="/library"><button className="btn btn-primary" style={{ marginTop: 16 }}>Back to Library</button></Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--gradient-primary)',
        padding: '40px 32px 32px',
        display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap',
      }}>
        {/* Cover */}
        <img
          src={album.cover_url}
          alt={album.title}
          style={{ width: 200, height: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover', boxShadow: 'var(--shadow-xl)', flexShrink: 0 }}
          onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
        />

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Album
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>
            {album.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            <img
              src={album.artist?.image_url ?? '/images/default-artist.jpg'}
              alt={album.artist?.name}
              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/images/default-artist.jpg'; }}
            />
            <Link href={`/artist/${album.artist_id}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {album.artist?.name}
            </Link>
            <span>•</span>
            <span>{album.release_date ? new Date(album.release_date).getFullYear() : ''}</span>
            <span>•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => songs.length && player.playQueue(songs, 0)}
          disabled={songs.length === 0}
        >
          <PlayIcon size={22} />
          Play
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => { if (songs.length) { player.playQueue(songs, Math.floor(Math.random() * songs.length)); } }}
          disabled={songs.length === 0}
        >
          <ShuffleIcon size={18} />
          Shuffle
        </button>
      </div>

      {/* Songs list */}
      <div style={{ padding: '16px 32px' }}>
        {songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
            <p style={{ color: 'var(--text-secondary)' }}>No songs found in this album.</p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto auto', gap: 16, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ textAlign: 'right' }}>#</span>
              <span>Title</span>
              <span className="desktop-only">♥</span>
              <span>⏱</span>
            </div>

            {songs.map((song, idx) => (
              <div
                key={song.id}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr auto auto',
                  gap: 16, padding: '10px 12px', alignItems: 'center',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: player.currentSong?.id === song.id ? 'var(--accent-glow)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onClick={() => player.play(song, songs)}
                onMouseEnter={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                onMouseLeave={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'right' }}>
                  {player.currentSong?.id === song.id && player.isPlaying
                    ? <WaveIcon />
                    : idx + 1
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 500, color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</div>
                  <Link href={`/artist/${song.artist_id}`} onClick={e => e.stopPropagation()}>
                    <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{song.artist?.name}</div>
                  </Link>
                </div>
                <button
                  className="btn btn-ghost btn-icon-sm desktop-only"
                  onClick={e => { e.stopPropagation(); toggleLike(song.id, !!song.is_liked); }}
                  style={{ color: song.is_liked ? 'var(--accent)' : 'var(--text-muted)' }}
                  aria-label={song.is_liked ? 'Unlike' : 'Like'}
                >
                  <HeartIcon size={18} filled={song.is_liked} />
                </button>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function PlayIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function ShuffleIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
}
function HeartIcon({ size = 24, filled = false }: { size?: number; filled?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
function WaveIcon() {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16, width: 20, justifyContent: 'flex-end' }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="beat-bar" style={{ width: 3 }} />)}
    </div>
  );
}
