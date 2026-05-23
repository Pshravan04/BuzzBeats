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
  const [isHoveredProgress, setIsHoveredProgress] = useState(false);
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);
  const [lastSongId, setLastSongId] = useState<string | null>(null);

  if (!player.currentSong) return null;

  const { currentSong, isPlaying, progress, volume, muted, shuffle, repeat, isLoading } = player;

  if (currentSong && currentSong.id !== lastSongId) {
    setLastSongId(currentSong.id);
    setLocalLiked(currentSong.is_liked ?? false);
  }

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

  const handleThumbsUp = () => {
    setLocalLiked(prev => prev === true ? null : true);
  };

  const handleThumbsDown = () => {
    setLocalLiked(prev => prev === false ? null : false);
  };

  return (
    <div
      className="player-bar"
      role="region"
      aria-label="Music player"
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', gap: 24,
        background: 'transparent',
        zIndex: 100, position: 'relative'
      }}
    >
      {/* Top Edge Progress Bar */}
      <div 
        ref={progressRef} 
        style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, 
          height: isHoveredProgress ? 5 : 3, 
          background: 'rgba(255,255,255,0.12)', 
          cursor: 'pointer',
          transition: 'height 0.1s ease',
          zIndex: 110
        }} 
        onClick={handleProgressClick}
        onMouseEnter={() => setIsHoveredProgress(true)}
        onMouseLeave={() => setIsHoveredProgress(false)}
      >
        <div style={{ width: `${progress * 100}%`, height: '100%', background: '#FF0000', position: 'relative' }}>
          {isHoveredProgress && (
            <div style={{
              position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
              width: 12, height: 12, borderRadius: '50%', background: '#FF0000',
              boxShadow: '0 0 6px rgba(0,0,0,0.5)'
            }} />
          )}
        </div>
      </div>

      {/* Left: Song Info & Thumbs Up/Down */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
        <Link href="/player" style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '2px', overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            <img
              src={currentSong.cover_url || '/images/default-album.jpg'}
              alt={currentSong.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.currentTarget.src = '/images/default-album.jpg'; }}
            />
          </div>
        </Link>

        <div style={{ minWidth: 0, flexShrink: 1, marginRight: 16 }}>
          <Link href="/player" style={{ textDecoration: 'none' }}>
            <div className="truncate" style={{ fontWeight: 600, fontSize: '14px', color: 'white', marginBottom: 2 }}>
              {currentSong.title}
            </div>
          </Link>
          <div className="truncate" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {currentSong.artist?.name ?? 'Unknown Artist'}
          </div>
        </div>

        {/* Rating Thumbs */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={handleThumbsDown}
            style={{ color: localLiked === false ? '#FF0000' : 'var(--text-secondary)', padding: 4 }}
            title="Dislike"
          >
            <ThumbsDownIcon size={18} filled={localLiked === false} />
          </button>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={handleThumbsUp}
            style={{ color: localLiked === true ? '#FF0000' : 'var(--text-secondary)', padding: 4 }}
            title="Like"
          >
            <ThumbsUpIcon size={18} filled={localLiked === true} />
          </button>
        </div>
      </div>

      {/* Center Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 10, justifyContent: 'center', flex: 1 }}>
        <button className="btn btn-ghost btn-icon-sm" onClick={player.prev} style={{ color: 'white' }}>
          <PrevIcon size={20} />
        </button>
        <button
          onClick={player.togglePlay}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'white', border: 'none', color: 'black',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'transform 0.1s', flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'black' }} /> : isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>
        <button className="btn btn-ghost btn-icon-sm" onClick={player.next} style={{ color: 'white' }}>
          <NextIcon size={20} />
        </button>

        {/* Time Progress display */}
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: 8 }}>
          {formatTime(currentTime)} / {formatTime(player.duration)}
        </span>
      </div>

      {/* Right — Queue, Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-icon-sm" onClick={player.toggleShuffle} style={{ color: shuffle ? '#FF0000' : 'var(--text-secondary)' }} title="Shuffle">
          <ShuffleIcon size={16} />
        </button>
        <button className="btn btn-ghost btn-icon-sm" onClick={player.toggleRepeat} style={{ color: repeat !== 'none' ? '#FF0000' : 'var(--text-secondary)', position: 'relative' }} title="Repeat">
          <RepeatIcon size={16} />
          {repeat === 'one' && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#FF0000', borderRadius: '50%', fontSize: 6, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>1</span>}
        </button>
        
        <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--text-secondary)' }} title="Queue">
          <QueueIcon size={16} />
        </button>

        <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--text-secondary)' }} title="Lyrics">
          <LyricsIcon size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 110 }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={player.toggleMute}
            style={{ color: 'var(--text-secondary)', padding: 4 }}
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
            style={{ width: '100%', accentColor: '#FF0000', height: 3 }}
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

function ThumbsUpIcon({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}

function ThumbsDownIcon({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
    </svg>
  );
}
