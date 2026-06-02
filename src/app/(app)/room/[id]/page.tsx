'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import type { ListeningRoom, RoomPresence, RoomState, Song } from '@/types';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<ListeningRoom | null>(null);
  const [participants, setParticipants] = useState<RoomPresence[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const { user } = useAuth();
  const player = usePlayer();
  const supabase = createClient();

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !roomId || roomId === 'create') return;
    setInviteLink(`${window.location.origin}/room/${roomId}`);
    initRoom();
    return () => { cleanup(); };
  }, [roomId, user]);

  const initRoom = async () => {
    // Join room
    const { data: roomData } = await supabase
      .from('listening_rooms')
      .select('*, host:profiles(*), playlist:playlists(*)')
      .eq('id', roomId)
      .single();

    if (!roomData) { setLoading(false); return; }
    setRoom(roomData as ListeningRoom);
    setIsHost(roomData.host_id === user!.id);

    // Join as participant
    await supabase.from('room_participants').upsert({
      room_id: roomId, user_id: user!.id,
    });

    // Subscribe to room state
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: user!.id } },
    });
    channelRef.current = channel;

    // Presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const presences: RoomPresence[] = Object.values(state).flat().map((p: any) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        online_at: p.online_at,
      }));
      setParticipants(presences);
    });

    // Room state broadcast listener
    channel.on('broadcast', { event: 'room_state' }, ({ payload }) => {
      if (payload.updated_by !== user!.id) {
        const rs = payload as RoomState;
        setRoomState(rs);
        if (rs.song_id && player.currentSong?.id !== rs.song_id) {
          const song = songs.find(s => s.id === rs.song_id);
          if (song) player.play(song, songs);
        }
        const dur = player.duration || 1;
        const currentProgress = rs.position_ms / 1000 / dur;
        if (Math.abs(player.progress - currentProgress) > 0.05) {
          player.seek(currentProgress);
        }
        if (rs.is_playing && !player.isPlaying) player.resume();
        if (!rs.is_playing && player.isPlaying) player.pause();
      }
    });

    // Subscribe presence
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user!.id,
          display_name: user!.display_name,
          avatar_url: user!.avatar_url,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Load playlist songs
    if (roomData.playlist_id) {
      const { data: ps } = await supabase
        .from('playlist_songs')
        .select('*, song:songs(*, artist:artists(*), album:albums(*))')
        .eq('playlist_id', roomData.playlist_id)
        .order('position');
      setSongs((ps?.map((r: any) => r.song) ?? []) as Song[]);
    }

    setLoading(false);
  };

  const broadcastState = useCallback(async () => {
    if (!isHost) return;
    const channel = channelRef.current;
    if (!channel) return;
    await channel.send({
      type: 'broadcast',
      event: 'room_state',
      payload: {
        song_id: player.currentSong?.id ?? null,
        position_ms: Math.floor(player.progress * player.duration * 1000),
        is_playing: player.isPlaying,
        updated_by: user?.id,
        updated_at: Date.now(),
      } as RoomState,
    });
  }, [isHost, player, roomId, user]);

  useEffect(() => {
    if (!isHost) return;
    const interval = setInterval(broadcastState, 2000);
    return () => clearInterval(interval);
  }, [isHost, broadcastState]);

  const cleanup = async () => {
    if (!user) return;
    await supabase.from('room_participants').delete().eq('room_id', roomId).eq('user_id', user.id);
    channelRef.current?.unsubscribe();
    channelRef.current = null;
  };

  if (roomId === 'create') {
    return <CreateRoomView />;
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>;
  }

  if (!room) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
        <h2>Room not found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>This room may have ended or the link is invalid.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Room header */}
      <div style={{
        padding: '24px 32px',
        background: 'var(--gradient-primary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Live Room</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{room.name ?? 'BuzzBeats Room'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Hosted by {(room.host as any)?.display_name ?? 'Unknown'} · {participants.length} listening
            </p>
          </div>

          {/* Participants avatars */}
          <div style={{ display: 'flex' }}>
            {participants.slice(0, 5).map((p, i) => (
              <div key={p.user_id} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--gradient-accent)',
                border: '2px solid var(--bg-surface)',
                marginLeft: i > 0 ? -10 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'white',
                zIndex: participants.length - i,
              }}>
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : p.display_name?.[0]?.toUpperCase()}
              </div>
            ))}
            {participants.length > 5 && (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-glass)',
                border: '2px solid var(--bg-surface)',
                marginLeft: -10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
              }}>+{participants.length - 5}</div>
            )}
          </div>
        </div>

        {/* Invite */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <input className="input" value={inviteLink} readOnly style={{ flex: 1, maxWidth: 400, height: 36, fontSize: 'var(--text-xs)' }} />
          <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(inviteLink); }}>
            Copy Invite Link
          </button>
        </div>
      </div>

      {/* Current song */}
      {player.currentSong && (
        <div style={{
          padding: '20px 32px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <img src={player.currentSong.cover_url} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700 }}>{player.currentSong.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{player.currentSong.artist?.name}</div>
            <div style={{ marginTop: 8, height: 4, background: 'var(--border-default)', borderRadius: 'var(--radius-full)' }}>
              <div style={{ height: '100%', width: `${player.progress * 100}%`, background: 'var(--gradient-accent)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
            </div>
          </div>

          {isHost && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-icon" onClick={player.prev}><PrevIcon size={20} /></button>
              <button className="btn btn-primary btn-icon" onClick={player.togglePlay} style={{ width: 48, height: 48 }}>
                {player.isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
              </button>
              <button className="btn btn-ghost btn-icon" onClick={player.next}><NextIcon size={20} /></button>
            </div>
          )}

          {!isHost && (
            <div className="badge badge-accent">🎧 Synced</div>
          )}
        </div>
      )}

      {/* Queue */}
      <div style={{ flex: 1, padding: '20px 32px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 16 }}>Queue</h2>
        {songs.map((song, idx) => (
          <div
            key={song.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 'var(--radius-md)', cursor: isHost ? 'pointer' : 'default',
              background: player.currentSong?.id === song.id ? 'var(--accent-glow)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onClick={() => isHost && player.play(song, songs)}
            onMouseEnter={e => { if (isHost && player.currentSong?.id !== song.id) e.currentTarget.style.background = 'var(--bg-glass)'; }}
            onMouseLeave={e => { if (player.currentSong?.id !== song.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', width: 20, textAlign: 'right', flexShrink: 0 }}>{idx + 1}</span>
            <img src={song.cover_url} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 500, color: player.currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-primary)' }}>{song.title}</div>
              <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{song.artist?.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateRoomView() {
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const createRoom = async () => {
    if (!user || !roomName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from('listening_rooms')
      .insert({ name: roomName.trim(), host_id: user.id })
      .select()
      .single();
    if (data && !error) {
      window.location.href = `/room/${data.id}`;
    }
    setCreating(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎧</div>
          <h1>Create a Room</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Listen together with friends in real time</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            className="input"
            placeholder="Give your room a name..."
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createRoom()}
          />
          <button className="btn btn-primary btn-lg" onClick={createRoom} disabled={!roomName.trim() || creating}>
            {creating ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
function PauseIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>; }
function PrevIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function NextIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
