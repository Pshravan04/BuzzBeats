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
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        height: '100%',
        background: 'var(--bg-surface)',
        position: 'relative',
      }}
    >
      {/* Progress bar at top */}
      <div
        ref={progressRef}
        className="progress-bar"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, margin: 0, borderRadius: 0 }}
        onClick={handleProgressClick}
        aria-label="Playback progress"
      >
        <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Song Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <Link href="/player" style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden',
            boxShadow: isPlaying ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
            transition: 'box-shadow var(--transition-slow)',
          }}>
            <img
              src={currentSong.cover_url || '/images/default-album.jpg'}
              alt={currentSong.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
            />
          </div>
          {isPlaying && (
            <div style={{
              position: 'absolute', bottom: -4, right: -4,
              display: 'flex', gap: 2, alignItems: 'flex-end', height: 18,
            }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="beat-bar" style={{ width: 3 }} />
              ))}
            </div>
          )}
        </Link>

        <div style={{ minWidth: 0 }}>
          <Link href="/player">
            <div className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
            >
              {currentSong.title}
            </div>
          </Link>
          <div className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {currentSong.artist?.name ?? 'Unknown Artist'}
          </div>
        </div>

        {/* Like button */}
        <button
          className="btn btn-ghost btn-icon-sm"
          aria-label="Like song"
          style={{ flexShrink: 0, color: currentSong.is_liked ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <HeartIcon size={18} filled={currentSong.is_liked} />
        </button>
      </div>

      {/* Center Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Shuffle */}
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={player.toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
            style={{ color: shuffle ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <ShuffleIcon size={18} />
          </button>

          {/* Prev */}
          <button className="btn btn-ghost btn-icon" onClick={player.prev} aria-label="Previous song">
            <PrevIcon size={20} />
          </button>

          {/* Play/Pause */}
          <button
            className="btn btn-primary btn-icon"
            onClick={player.togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{ width: 44, height: 44 }}
          >
            {isLoading
              ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              : isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />
            }
          </button>

          {/* Next */}
          <button className="btn btn-ghost btn-icon" onClick={player.next} aria-label="Next song">
            <NextIcon size={20} />
          </button>

          {/* Repeat */}
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={player.toggleRepeat}
            aria-label="Toggle repeat"
            aria-pressed={repeat !== 'none'}
            style={{ color: repeat !== 'none' ? 'var(--accent)' : 'var(--text-muted)', position: 'relative' }}
          >
            <RepeatIcon size={18} />
            {repeat === 'one' && (
              <span style={{
                position: 'absolute', top: 0, right: 0, width: 10, height: 10,
                background: 'var(--accent)', borderRadius: '50%', fontSize: 7, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
              }}>1</span>
            )}
          </button>
        </div>

        {/* Time */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(player.duration)}</span>
        </div>
      </div>

      {/* Right — Volume, Queue, Full Player */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        {/* Queue */}
        <button className="btn btn-ghost btn-icon-sm" aria-label="Open queue" style={{ color: 'var(--text-muted)' }}>
          <QueueIcon size={18} />
        </button>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={player.toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            style={{ color: 'var(--text-muted)' }}
          >
            {muted || volume === 0 ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={e => player.setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{
              width: 80, accentColor: 'var(--accent)',
              cursor: 'pointer', height: 4,
            }}
          />
        </div>

        {/* Full player link */}
        <Link href="/player">
          <button className="btn btn-ghost btn-icon-sm" aria-label="Open full player" style={{ color: 'var(--text-muted)' }}>
            <ExpandIcon size={18} />
          </button>
        </Link>
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
        bottom: 'calc(var(--mobile-nav-height) + env(safe-area-inset-bottom))',
        left: 8, right: 8,
        zIndex: 'var(--z-player)',
      }}
    >
      <div className="glass" style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Progress */}
        <div style={{ height: 2, background: 'var(--border-default)' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--gradient-accent)' }} />
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
