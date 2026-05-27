'use client';

import React, { useEffect, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';

export function FullPlayerOverlay() {
  const player = usePlayer();
  const { currentSong, isFullPlayerOpen, setFullPlayerOpen, isPlaying, progress, isLoading, volume, muted } = player;
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(0);

  // Parse lyrics or show placeholder
  useEffect(() => {
    if (!currentSong) return;
    
    // In a real app we'd fetch synced lyrics. For this demo, we mock it.
    if (currentSong.lyrics) {
      setLyrics(currentSong.lyrics.split('\n').filter(l => l.trim()));
    } else {
      setLyrics([
        "🎶 Instrumental 🎶",
        "(No lyrics available for this track)",
        "Enjoy the music!"
      ]);
    }
  }, [currentSong]);

  // Mock syncing lyrics to progress
  useEffect(() => {
    if (lyrics.length > 0) {
      const line = Math.floor(progress * lyrics.length);
      setActiveLine(Math.min(line, lyrics.length - 1));
    }
  }, [progress, lyrics.length]);

  const shareToInstagram = async () => {
    if (!currentSong) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Listening to ${currentSong.title}`,
          text: `Vibing to ${currentSong.title} by ${currentSong.artist?.name} on BuzzBeats! 🎵`,
          url: `${window.location.origin}/player?song=${currentSong.id}`,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const handleDownload = async () => {
    if (!currentSong) return;
    try {
      alert(`Downloading "${currentSong.title}"... Please wait.`);
      // Fetch the audio stream
      const response = await fetch(currentSong.audio_url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${currentSong.title} - ${currentSong.artist?.name || 'Unknown'}.mp3`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the song. Please try again.');
    }
  };

  if (!isFullPlayerOpen || !currentSong) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      background: '#000',
      color: 'white',
      animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
    }}>
      {/* Blurred background image */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${currentSong.cover_url || '/images/default-album.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(80px) brightness(0.4)',
        transform: 'scale(1.2)',
        zIndex: 0
      }} />

      {/* Top Bar */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 32px'
      }}>
        <button 
          className="btn btn-ghost btn-icon" 
          onClick={() => setFullPlayerOpen(false)}
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%' }}
        >
          <ChevronDownIcon size={24} />
        </button>
        <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
          {currentSong.album?.title || 'Playing from Library'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-icon" onClick={handleDownload} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%' }}>
            <DownloadIcon size={20} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={shareToInstagram} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%' }}>
            <ShareIcon size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area (Split on Desktop, Stacked on Mobile) */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', flexWrap: 'wrap',
        padding: '0 32px 32px',
        gap: 40,
        overflowY: 'auto'
      }}>
        {/* Left/Top: Artwork & Controls */}
        <div style={{
          flex: '1 1 100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          maxWidth: '500px', margin: '0 auto'
        }}>
          <div style={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            marginBottom: 32,
            transition: 'transform 0.3s ease',
            transform: isPlaying ? 'scale(1)' : 'scale(0.95)'
          }}>
            <img 
              src={currentSong.cover_url || '/images/default-album.jpg'} 
              alt={currentSong.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ minWidth: 0, paddingRight: 16 }}>
              <h1 className="truncate" style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {currentSong.title}
              </h1>
              <p className="truncate" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {currentSong.artist?.name || 'Unknown Artist'}
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" style={{ opacity: 0.8 }}>
              <HeartIcon size={28} filled={currentSong.is_liked} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', marginBottom: 32 }}>
            <input 
              type="range" 
              min={0} max={1} step={0.001} 
              value={progress}
              onChange={(e) => player.seek(parseFloat(e.target.value))}
              style={{ width: '100%', height: 6, accentColor: '#fff', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '12px', opacity: 0.6, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              <span>{formatTime(progress * player.duration)}</span>
              <span>-{formatTime(player.duration - (progress * player.duration))}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, width: '100%' }}>
            <button className="btn btn-ghost btn-icon" onClick={player.toggleShuffle} style={{ opacity: player.shuffle ? 1 : 0.5, color: player.shuffle ? '#1DB954' : 'white' }}>
              <ShuffleIcon size={24} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={player.prev} style={{ padding: 8 }}>
              <PrevIcon size={32} />
            </button>
            <button 
              className="btn btn-primary btn-icon" 
              onClick={player.togglePlay}
              style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', color: '#000' }}
            >
              {isLoading ? <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3, borderTopColor: 'black', borderColor: 'rgba(0,0,0,0.1)' }} /> 
                        : isPlaying ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={player.next} style={{ padding: 8 }}>
              <NextIcon size={32} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={player.toggleRepeat} style={{ opacity: player.repeat !== 'none' ? 1 : 0.5, color: player.repeat !== 'none' ? '#1DB954' : 'white', position: 'relative' }}>
              <RepeatIcon size={24} />
              {player.repeat === 'one' && <span style={{ position: 'absolute', top: 0, right: 0, fontSize: 10, fontWeight: 800 }}>1</span>}
            </button>
          </div>
        </div>

        {/* Right/Bottom: Lyrics */}
        <div style={{
          flex: '1 1 100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          maxHeight: '100%',
          overflowY: 'auto',
          paddingRight: 16,
          scrollbarWidth: 'none',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
        }}>
          {lyrics.map((line, idx) => {
            const isActive = idx === activeLine;
            const isPast = idx < activeLine;
            return (
              <p 
                key={idx} 
                style={{
                  fontSize: isActive ? 'clamp(28px, 4vw, 40px)' : 'clamp(24px, 3vw, 32px)',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  margin: '16px 0',
                  transition: 'all 0.4s ease',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                  transform: isActive ? 'scale(1)' : 'scale(0.98)',
                  transformOrigin: 'left center',
                  textShadow: isActive ? '0 4px 16px rgba(0,0,0,0.4)' : 'none'
                }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

// Helpers & Icons
function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ChevronDownIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function PlayIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function PauseIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
}
function PrevIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function NextIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function ShuffleIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
}
function RepeatIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
}
function HeartIcon({ size = 24, filled = false }: { size?: number; filled?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
function ShareIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
}
function DownloadIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
