'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';
import type { Song } from '@/types';

export default function FullPlayerPage() {
  const player = usePlayer();
  const { currentSong, isPlaying, progress, volume, shuffle, repeat, duration, muted } = player;
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [lyricLines, setLyricLines] = useState<string[]>([]);
  const [activeLyricIdx, setActiveLyricIdx] = useState(0);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSong?.lyrics) {
      setLyricLines(currentSong.lyrics.split('\n').filter(l => l.trim()));
    }
  }, [currentSong?.lyrics]);

  // Simulate lyric sync (rough approximation)
  useEffect(() => {
    if (lyricLines.length > 0 && duration > 0) {
      const idx = Math.floor((progress * lyricLines.length));
      setActiveLyricIdx(Math.min(idx, lyricLines.length - 1));
    }
  }, [progress, lyricLines, duration]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
        <div style={{ fontSize: 80 }}>🎵</div>
        <h2>Nothing playing right now</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Head to the home page to start listening</p>
        <Link href="/"><button className="btn btn-primary">Go to Home</button></Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--gradient-player)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 30%, var(--accent-glow-strong) 0%, transparent 70%)`,
        opacity: isPlaying ? 1 : 0, transition: 'opacity 1s',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px 0', position: 'relative', zIndex: 1 }}>
        <Link href="/">
          <button className="btn btn-ghost btn-icon" aria-label="Go back">
            <ChevronDownIcon size={24} />
          </button>
        </Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Now Playing
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {currentSong.album?.title ?? 'Single'}
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" aria-label="More options">
          <DotsIcon size={24} />
        </button>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 32px 20px', position: 'relative', zIndex: 1,
      }}>
        {/* Vinyl Disc Player */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          {/* Outer ring */}
          <div style={{
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 40%, #1a1a2e 60%, #0a0a0f 80%, #2a2a3e 100%)',
            boxShadow: `0 0 0 2px var(--border-default), 0 0 0 4px rgba(0,0,0,0.5), var(--shadow-xl), ${isPlaying ? '0 0 60px var(--accent-glow-strong)' : ''}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'box-shadow 1s',
          }}
            className={isPlaying ? 'disc-spinning' : 'disc-paused'}
            ref={discRef}
          >
            {/* Vinyl grooves */}
            {[100, 120, 140, 160, 180, 200, 220, 240, 260].map(r => (
              <div key={r} style={{
                position: 'absolute',
                width: r, height: r,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.03)',
              }} />
            ))}

            {/* Album art in center */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              overflow: 'hidden', position: 'relative', zIndex: 1,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}>
              <img
                src={currentSong.cover_url}
                alt={currentSong.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }}
              />
              {/* Center hole */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--bg-base)', boxShadow: '0 0 8px rgba(0,0,0,0.8)',
                zIndex: 2,
              }} />
            </div>

            {/* Tonearm */}
            <div style={{
              position: 'absolute', right: -20, top: -20,
              width: 60, height: 120,
              transformOrigin: '12px 12px',
              transform: `rotate(${isPlaying ? 20 : 5}deg)`,
              transition: 'transform 0.5s ease',
              pointerEvents: 'none',
            }}>
              <div style={{ width: 3, height: 80, background: 'linear-gradient(180deg, var(--text-secondary), var(--border-default))', borderRadius: 2 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', marginLeft: -3.5, marginTop: -5, boxShadow: 'var(--shadow-glow)' }} />
            </div>
          </div>

          {/* Beat Visualizer */}
          {isPlaying && (
            <div style={{
              position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 4, alignItems: 'flex-end', height: 32,
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div
                  key={i}
                  className="beat-bar"
                  style={{ width: 4, background: 'var(--gradient-accent)', borderRadius: 2 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Song Info */}
        <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 8 }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>{currentSong.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Link href={`/artist/${currentSong.artist_id}`}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {currentSong.artist?.name}
              </span>
            </Link>
            {currentSong.artist?.verified && <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>}
          </div>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <button
            className="btn btn-ghost btn-icon"
            aria-label="Like"
            style={{ color: currentSong.is_liked ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <HeartIcon size={24} filled={currentSong.is_liked} />
          </button>
          <Link href={`/lyrics/${currentSong.id}`}>
            <button className="btn btn-ghost btn-icon" aria-label="Lyrics" style={{ color: showLyrics ? 'var(--accent)' : 'var(--text-secondary)' }}>
              <LyricsIcon size={24} />
            </button>
          </Link>
          <button className="btn btn-ghost btn-icon" aria-label="Add to playlist" style={{ color: 'var(--text-secondary)' }}>
            <PlusCircleIcon size={24} />
          </button>
          <button className="btn btn-ghost btn-icon" aria-label="Share" style={{ color: 'var(--text-secondary)' }}>
            <ShareIcon size={24} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 480, marginBottom: 16 }}>
          <div
            className="progress-bar"
            style={{ height: 6 }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              player.seek((e.clientX - rect.left) / rect.width);
            }}
          >
            <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            <span>{formatTime(progress * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={player.toggleShuffle}
            style={{ color: shuffle ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <ShuffleIcon size={22} />
          </button>
          <button className="btn btn-ghost btn-icon-lg" onClick={player.prev} aria-label="Previous">
            <PrevIcon size={28} />
          </button>
          <button
            className="btn btn-primary"
            onClick={player.togglePlay}
            style={{ width: 72, height: 72, borderRadius: '50%', boxShadow: 'var(--shadow-glow-strong)' }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
          </button>
          <button className="btn btn-ghost btn-icon-lg" onClick={player.next} aria-label="Next">
            <NextIcon size={28} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={player.toggleRepeat}
            style={{ color: repeat !== 'none' ? 'var(--accent)' : 'var(--text-secondary)', position: 'relative' }}
          >
            <RepeatIcon size={22} />
            {repeat === 'one' && (
              <span style={{ position: 'absolute', top: -2, right: -2, fontSize: 8, background: 'var(--accent)', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white' }}>1</span>
            )}
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 320 }}>
          <button className="btn btn-ghost btn-icon-sm" onClick={player.toggleMute} style={{ color: 'var(--text-muted)' }}>
            {muted || volume === 0 ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
          </button>
          <input
            type="range" min="0" max="1" step="0.01"
            value={muted ? 0 : volume}
            onChange={e => player.setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)', height: 4 }}
          />
          <VolumeHighIcon size={18} color="var(--text-muted)" />
        </div>

        {/* Quick lyrics preview */}
        {lyricLines.length > 0 && (
          <div style={{
            marginTop: 24, padding: 20,
            background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 480,
            textAlign: 'center', cursor: 'pointer',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lyrics</p>
            {lyricLines.slice(Math.max(0, activeLyricIdx - 1), activeLyricIdx + 3).map((line, i) => (
              <p key={i} style={{
                fontSize: i === 1 ? 'var(--text-lg)' : 'var(--text-sm)',
                color: i === 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: i === 1 ? 700 : 400,
                marginBottom: 4, transition: 'all 0.3s',
              }}>{line || ' '}</p>
            ))}
            <Link href={`/lyrics/${currentSong.id}`}>
              <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', marginTop: 12 }}>See full lyrics →</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function PlayIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
function PauseIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>; }
function PrevIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function NextIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function ShuffleIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>; }
function RepeatIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>; }
function HeartIcon({ size = 24, filled = false }: { size?: number; filled?: boolean }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
function VolumeIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>; }
function VolumeHighIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>; }
function MuteIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>; }
function ChevronDownIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>; }
function DotsIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>; }
function LyricsIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>; }
function PlusCircleIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }
function ShareIcon({ size = 24 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>; }
