'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Song, PlayerState, PlayerActions } from '@/types';

// ============================================
// Player Context
// ============================================

interface PlayerContextType extends PlayerState, PlayerActions {}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    volume: 0.8,
    muted: false,
    progress: 0,
    duration: 0,
    shuffle: false,
    repeat: 'none',
    isLoading: false,
    isFullPlayerOpen: false,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    // Removed crossOrigin='anonymous' to allow playing redirected GoogleVideo URLs without CORS errors
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        setState(prev => ({
          ...prev,
          progress: audio.currentTime / audio.duration,
          duration: audio.duration,
        }));
      }
    };

    const handleEnded = () => {
      setState(prev => {
        if (prev.repeat === 'one') {
          audio.currentTime = 0;
          audio.play().catch(console.error);
          return { ...prev, progress: 0 };
        }
        // trigger next
        return prev;
      });
      // nextSong handled by effect below
    };

    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));
    const handleLoadedMetadata = () => setState(prev => ({ ...prev, duration: audio.duration }));

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle song end → auto-next
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setState(prev => {
        if (prev.repeat === 'one') return prev;
        const nextIndex = getNextIndex(prev);
        if (nextIndex === -1) return { ...prev, isPlaying: false, progress: 0 };

        const nextSong = prev.queue[nextIndex];
        audio.src = nextSong.audio_url;
        audio.play().catch(console.error);
        updateMediaSession(nextSong);
        return { ...prev, currentSong: nextSong, queueIndex: nextIndex, isPlaying: true, progress: 0 };
      });
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const getNextIndex = (prev: PlayerState): number => {
    if (prev.queue.length === 0) return -1;
    if (prev.shuffle) {
      const available = prev.queue.map((_, i) => i).filter(i => i !== prev.queueIndex);
      if (available.length === 0) return prev.repeat === 'all' ? prev.queueIndex : -1;
      return available[Math.floor(Math.random() * available.length)];
    }
    const next = prev.queueIndex + 1;
    if (next >= prev.queue.length) {
      return prev.repeat === 'all' ? 0 : -1;
    }
    return next;
  };

  const getPrevIndex = (prev: PlayerState): number => {
    if (prev.queue.length === 0) return -1;
    const p = prev.queueIndex - 1;
    if (p < 0) return prev.repeat === 'all' ? prev.queue.length - 1 : 0;
    return p;
  };

  // Media Session API
  const updateMediaSession = (song: Song) => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist?.name ?? 'Unknown Artist',
      album: song.album?.title ?? '',
      artwork: [{ src: song.cover_url, sizes: '512x512', type: 'image/jpeg' }],
    });
  };

  const setupMediaSessionHandlers = useCallback(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => actions.resume());
    navigator.mediaSession.setActionHandler('pause', () => actions.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => actions.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => actions.prev());
    navigator.mediaSession.setActionHandler('seekto', (evt) => {
      if (evt.seekTime != null && audioRef.current) {
        audioRef.current.currentTime = evt.seekTime;
      }
    });
  }, []);

  useEffect(() => {
    setupMediaSessionHandlers();
  }, [setupMediaSessionHandlers]);

  const actions: PlayerActions = {
    play: useCallback((song: Song, queue?: Song[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      const newQueue = queue ?? [song];
      const idx = newQueue.findIndex(s => s.id === song.id);
      const queueIndex = idx === -1 ? 0 : idx;

      audio.src = song.audio_url;
      audio.volume = state.volume;
      audio.muted = state.muted;
      audio.play().catch(console.error);
      updateMediaSession(song);

      setState(prev => ({
        ...prev,
        currentSong: song,
        queue: newQueue,
        queueIndex,
        isPlaying: true,
        progress: 0,
      }));
    }, [state.volume, state.muted]),

    pause: useCallback(() => {
      audioRef.current?.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    }, []),

    resume: useCallback(() => {
      audioRef.current?.play().catch(console.error);
      setState(prev => ({ ...prev, isPlaying: true }));
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    }, []),

    togglePlay: useCallback(() => {
      setState(prev => {
        if (prev.isPlaying) {
          audioRef.current?.pause();
          return { ...prev, isPlaying: false };
        } else {
          audioRef.current?.play().catch(console.error);
          return { ...prev, isPlaying: true };
        }
      });
    }, []),

    next: useCallback(() => {
      setState(prev => {
        const nextIdx = getNextIndex(prev);
        if (nextIdx === -1) return prev;
        const song = prev.queue[nextIdx];
        const audio = audioRef.current;
        if (audio) { audio.src = song.audio_url; audio.play().catch(console.error); }
        updateMediaSession(song);
        return { ...prev, currentSong: song, queueIndex: nextIdx, isPlaying: true, progress: 0 };
      });
    }, []),

    prev: useCallback(() => {
      const audio = audioRef.current;
      // If more than 3 seconds in, restart current song
      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      setState(prev => {
        const prevIdx = getPrevIndex(prev);
        if (prevIdx === -1) return prev;
        const song = prev.queue[prevIdx];
        if (audio) { audio.src = song.audio_url; audio.play().catch(console.error); }
        updateMediaSession(song);
        return { ...prev, currentSong: song, queueIndex: prevIdx, isPlaying: true, progress: 0 };
      });
    }, []),

    seek: useCallback((progress: number) => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;
      audio.currentTime = progress * audio.duration;
      setState(prev => ({ ...prev, progress }));
    }, []),

    setVolume: useCallback((volume: number) => {
      const audio = audioRef.current;
      if (audio) audio.volume = volume;
      setState(prev => ({ ...prev, volume, muted: volume === 0 }));
    }, []),

    toggleMute: useCallback(() => {
      setState(prev => {
        const muted = !prev.muted;
        if (audioRef.current) audioRef.current.muted = muted;
        return { ...prev, muted };
      });
    }, []),

    toggleShuffle: useCallback(() => {
      setState(prev => ({ ...prev, shuffle: !prev.shuffle }));
    }, []),

    toggleRepeat: useCallback(() => {
      setState(prev => {
        const cycle: PlayerState['repeat'][] = ['none', 'all', 'one'];
        const idx = cycle.indexOf(prev.repeat);
        return { ...prev, repeat: cycle[(idx + 1) % cycle.length] };
      });
    }, []),

    addToQueue: useCallback((song: Song) => {
      setState(prev => ({ ...prev, queue: [...prev.queue, song] }));
    }, []),

    removeFromQueue: useCallback((index: number) => {
      setState(prev => {
        const newQueue = prev.queue.filter((_, i) => i !== index);
        const newIndex = index < prev.queueIndex ? prev.queueIndex - 1 : prev.queueIndex;
        return { ...prev, queue: newQueue, queueIndex: Math.min(newIndex, newQueue.length - 1) };
      });
    }, []),

    clearQueue: useCallback(() => {
      setState(prev => ({ ...prev, queue: [], queueIndex: -1 }));
    }, []),

    playQueue: useCallback((songs: Song[], startIndex = 0) => {
      const audio = audioRef.current;
      if (!audio || songs.length === 0) return;
      const song = songs[startIndex];
      audio.src = song.audio_url;
      audio.play().catch(console.error);
      updateMediaSession(song);
      setState(prev => ({
        ...prev,
        currentSong: song,
        queue: songs,
        queueIndex: startIndex,
        isPlaying: true,
        progress: 0,
      }));
    }, []),

    setFullPlayerOpen: useCallback((open: boolean) => {
      setState(prev => ({ ...prev, isFullPlayerOpen: open }));
    }, []),
  };

  // Expose analyser for visualizer
  const getAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return null;
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }
    return analyserRef.current;
  }, []);

  return (
    <PlayerContext.Provider value={{ ...state, ...actions }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export { PlayerContext };
