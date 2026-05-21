'use client';

import React, { useState, useRef, useCallback } from 'react';
import { usePlayer } from '@/context/PlayerContext';

export default function LyricsPage({ params }: { params: { songId: string } }) {
  const player = usePlayer();
  const { currentSong, progress, duration } = player;
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [showShareCard, setShowShareCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const song = currentSong; // In production, fetch by params.songId if different

  if (!song) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎵</div>
        <h2>No song playing</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Start playing a song to see its lyrics</p>
      </div>
    );
  }

  const lyricLines = song.lyrics?.split('\n') ?? [];
  const currentLineIdx = Math.floor(progress * Math.max(lyricLines.length - 1, 1));

  const toggleLineSelect = (idx: number) => {
    setSelectedLines(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx].slice(-4)
    );
  };

  const generateShareCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#0a0a0f');
    grad.addColorStop(0.5, getComputedStyle(document.documentElement).getPropertyValue('--accent-dark').trim() || '#1D4ED8');
    grad.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Noise texture overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 50000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'black';
      ctx.fillRect(Math.random() * 1080, Math.random() * 1920, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Album art circle
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = song.cover_url;
    await new Promise(r => { img.onload = r; img.onerror = r; });
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 300, 180, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 360, 120, 360, 360);
    ctx.restore();

    // Lyric text
    const selectedText = selectedLines.length > 0
      ? selectedLines.map(i => lyricLines[i]).join('\n')
      : lyricLines.slice(0, 4).join('\n');

    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    const lines = selectedText.split('\n');
    const startY = 600;
    lines.forEach((line, i) => {
      ctx.globalAlpha = i === 0 ? 1 : 0.8;
      ctx.fillText(line, 540, startY + i * 100, 900);
    });
    ctx.globalAlpha = 1;

    // Song info
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '42px Inter, Arial, sans-serif';
    ctx.fillText(`${song.title} — ${song.artist?.name}`, 540, 1700, 900);

    // BuzzBeats branding
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillText('🎵 BuzzBeats', 540, 1820);

    // Export
    const dataUrl = canvas.toDataURL('image/png');
    setShowShareCard(true);
    return dataUrl;
  };

  const shareToInstagram = async () => {
    const dataUrl = await generateShareCard();
    if (!dataUrl) return;

    // Web Share API
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'buzzbeats-lyrics.png', { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${song.title} — BuzzBeats` });
    } else {
      // Fallback: download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'buzzbeats-lyrics.png';
      a.click();
    }
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <img src={song.cover_url} alt={song.title} style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.currentTarget.src = '/images/default-album.jpg'; }} />
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{song.title}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{song.artist?.name}</p>
          </div>
        </div>

        {selectedLines.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={shareToInstagram}>
              <InstagramIcon size={16} />
              Share to Instagram
            </button>
            <button className="btn btn-secondary btn-sm" onClick={shareToInstagram}>
              <SnapchatIcon size={16} />
              Share to Snapchat
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLines([])}>
              Clear selection
            </button>
          </div>
        )}

        {selectedLines.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            💡 Tap lines to select them for sharing
          </p>
        )}
      </div>

      {/* Lyrics */}
      <div style={{ padding: 24, maxWidth: 700 }}>
        {lyricLines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <p style={{ color: 'var(--text-secondary)' }}>Lyrics not available for this song.</p>
          </div>
        ) : (
          lyricLines.map((line, idx) => {
            const isActive = idx === currentLineIdx;
            const isSelected = selectedLines.includes(idx);
            const isEmpty = !line.trim();

            return (
              <p
                key={idx}
                onClick={() => !isEmpty && toggleLineSelect(idx)}
                style={{
                  fontSize: isEmpty ? 16 : isActive ? 'var(--text-2xl)' : 'var(--text-lg)',
                  fontWeight: isActive ? 800 : isEmpty ? 400 : 500,
                  color: isActive ? 'var(--text-primary)' : isSelected ? 'var(--accent)' : isEmpty ? 'transparent' : 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: isEmpty ? 16 : 4,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isEmpty ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  background: isSelected ? 'var(--accent-glow)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                  fontFamily: 'var(--font-display)',
                  userSelect: 'none',
                }}
              >
                {line || '\u00A0'}
              </p>
            );
          })
        )}
      </div>

      {/* Hidden canvas for card generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function SnapchatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>
  );
}
