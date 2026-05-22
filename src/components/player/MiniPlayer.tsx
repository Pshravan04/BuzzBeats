'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlayer } from '@/context/PlayerContext';

export function MiniPlayer() {
  const player = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  if (!player.currentSong) return null;

  const { currentSong, isPlaying, progress, volume, muted, shuffle, repeat, isLoading } = player;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    player.seek(Math.max(0, Math.min(1, ratio)));
  };

  const currentTime = progress * player.duration;

  return (
    <div
      className="player-bar"
      role="region"
      aria-label="Music player"
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 140px)', maxWidth: 1200, minWidth: 700,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, height: 72,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(25px) saturate(200%)',
        WebkitBackdropFilter: 'blur(25px) saturate(200%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 100, overflow: 'hidden'
      }}
    >
      {/* Progress bar perfectly hugging bottom */}
      <div
        ref={progressRef}
        style={{ position: 'absolute', bottom: 0, left: 24, right: 24, height: 3, background: 'rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: 4 }}
        onClick={handleProgressClick}
      >
        <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--text-primary)', borderRadius: 4, position: 'relative' }}>
          <div style={{ position: 'absolute', right: -4, top: -2, width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
        </div>
      </div>

      {/* Left: Song Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0, paddingBottom: 4 }}>
        <Link href="/player" style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          }}>
            <img
              src={currentSong.cover_url || '/images/default-album.jpg'}
              alt={currentSong.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
            />
          </div>
        </Link>

        <div style={{ minWidth: 0, flexShrink: 1, maxWidth: 200 }}>
          <Link href="/player" style={{ textDecoration: 'none' }}>
            <div className="truncate" style={{ fontWeight: 700, fontSize: '15px', color: 'white', marginBottom: 2 }}>
              {currentSong.title}
            </div>
          </Link>
          <div className="truncate" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {currentSong.artist?.name ?? 'Unknown Artist'}
          </div>
        </div>

        {/* Like button */}
        <button
          className="btn btn-ghost btn-icon-sm"
          style={{ flexShrink: 0, color: currentSong.is_liked ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <HeartIcon size={20} filled={currentSong.is_liked} />
        </button>
      </div>

      {/* Center Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: '0 0 auto', paddingBottom: 4 }}>
        <button
          className="btn btn-ghost btn-icon-sm"
          onClick={player.toggleShuffle}
          style={{ color: shuffle ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <ShuffleIcon size={18} />
        </button>

        <button className="btn btn-ghost btn-icon-sm" onClick={player.prev} style={{ color: 'white' }}>
          <PrevIcon size={20} />
        </button>

        {/* Big Purple Play Button */}
        <button
          onClick={player.togglePlay}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--bg-elevated)', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          {isLoading
            ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            : isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />
          }
        </button>

        <button className="btn btn-ghost btn-icon-sm" onClick={player.next} style={{ color: 'white' }}>
          <NextIcon size={20} />
        </button>

        <button
          className="btn btn-ghost btn-icon-sm"
          onClick={player.toggleRepeat}
          style={{ color: repeat !== 'none' ? 'var(--accent)' : 'var(--text-muted)', position: 'relative' }}
        >
          <RepeatIcon size={18} />
          {repeat === 'one' && (
            <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', fontSize: 6, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>1</span>
          )}
        </button>
      </div>

      {/* Right — Time, Queue, Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'flex-end', paddingBottom: 4 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {formatTime(currentTime)} / {formatTime(player.duration)}
        </div>

        <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--text-muted)' }}>
          <QueueIcon size={18} />
        </button>

        <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--text-muted)' }}>
          <LyricsIcon size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100 }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={player.toggleMute}
            style={{ color: 'var(--text-muted)' }}
          >
            {muted || volume === 0 ? <MuteIcon size={16} /> : <VolumeIcon size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={e => player.setVolume(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', height: 3 }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Mobile Mini Player (simpler, just above mobile nav)
// ============================================

export function MobileMiniPlayer() {
  const player = usePlayer();
  if (!player.currentSong) return null;

  const { currentSong, isPlaying, progress, isLoading } = player;

  return (
    <div
      className="mobile-only"
      style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom) + 12px)',
        left: 12, right: 12,
        zIndex: 50,
      }}
    >
      <div style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      }}>
        {/* Progress */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.1)' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--text-primary)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
          <img
            src={currentSong.cover_url}
            alt={currentSong.title}
            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{currentSong.title}</div>
            <div className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {currentSong.artist?.name ?? 'Unknown'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn btn-ghost btn-icon-sm" onClick={player.prev} aria-label="Previous">
              <PrevIcon size={20} />
            </button>
            <button
              className="btn btn-primary btn-icon-sm"
              onClick={player.togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{ width: 40, height: 40 }}
            >
              {isLoading
                ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                : isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />
              }
            </button>
            <button className="btn btn-ghost btn-icon-sm" onClick={player.next} aria-label="Next">
              <NextIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Icon components
// ============================================

function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

function PauseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  );
}

function PrevIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function NextIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ShuffleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  );
}

function RepeatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  );
}

function HeartIcon({ size = 24, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function VolumeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
    </svg>
  );
}

function MuteIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  );
}

function QueueIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

function ExpandIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  );
}

function LyricsIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
}
