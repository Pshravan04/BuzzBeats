'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Song, PlayerState, PlayerActions } from '@/types';

interface PlayerContextType extends PlayerState, PlayerActions {}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const stateRef = useRef<PlayerState>({
    currentSong: null, queue: [], queueIndex: -1, isPlaying: false,
    volume: 0.8, muted: false, progress: 0, duration: 0,
    shuffle: false, repeat: 'none', isLoading: false, isFullPlayerOpen: false,
  });

  const [state, setState] = useState<PlayerState>(stateRef.current);

  const updateState = useCallback((partial: Partial<PlayerState>) => {
    setState(prev => {
      const next = { ...prev, ...partial };
      stateRef.current = next;
      return next;
    });
  }, []);

  const getNextIndex = useCallback((prev: PlayerState): number => {
    if (prev.queue.length === 0) return -1;
    if (prev.shuffle) {
      const available = prev.queue.map((_, i) => i).filter(i => i !== prev.queueIndex);
      if (available.length === 0) return prev.repeat === 'all' ? prev.queueIndex : -1;
      return available[Math.floor(Math.random() * available.length)];
    }
    const next = prev.queueIndex + 1;
    if (next >= prev.queue.length) return prev.repeat === 'all' ? 0 : -1;
    return next;
  }, []);

  const getPrevIndex = useCallback((prev: PlayerState): number => {
    if (prev.queue.length === 0) return -1;
    const p = prev.queueIndex - 1;
    if (p < 0) return prev.repeat === 'all' ? prev.queue.length - 1 : 0;
    return p;
  }, []);

  const updateMediaSession = useCallback((song: Song) => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist?.name ?? 'Unknown Artist',
      album: song.album?.title ?? '',
      artwork: [{ src: song.cover_url, sizes: '512x512', type: 'image/jpeg' }],
    });
  }, []);

  const playSong = useCallback((song: Song, playback = true) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = song.audio_url || `/api/stream?id=${song.id}`;
    if (playback) audio.play().catch(() => {});
    updateMediaSession(song);
  }, [updateMediaSession]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        updateState({ progress: audio.currentTime / audio.duration, duration: audio.duration });
      }
    };

    const handleEnded = () => {
      const s = stateRef.current;
      if (s.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        updateState({ progress: 0 });
        return;
      }
      const nextIdx = getNextIndex(s);
      if (nextIdx === -1) {
        updateState({ isPlaying: false, progress: 0 });
        return;
      }
      const nextSong = s.queue[nextIdx];
      playSong(nextSong);
      updateState({ currentSong: nextSong, queueIndex: nextIdx, isPlaying: true, progress: 0 });
    };

    const handleLoadStart = () => updateState({ isLoading: true });
    const handleCanPlay = () => updateState({ isLoading: false });
    const handleLoadedMetadata = () => updateState({ duration: audio.duration });

    const handleError = () => {
      const currentId = stateRef.current.currentSong?.id;
      if (!currentId) return;
      console.warn('Audio playback failed, retrying via stream API');
      audio.src = `/api/stream?id=${currentId}`;
      audio.load();
      audio.play().catch(() => {
        const s = stateRef.current;
        const nextIdx = getNextIndex(s);
        if (nextIdx === -1) {
          updateState({ isPlaying: false, progress: 0 });
          return;
        }
        const song = s.queue[nextIdx];
        playSong(song);
        updateState({ currentSong: song, queueIndex: nextIdx, isPlaying: true, progress: 0 });
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [getNextIndex, playSong, updateState]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const handlers = {
      play: () => { audioRef.current?.play().catch(() => {}); updateState({ isPlaying: true }); },
      pause: () => { audioRef.current?.pause(); updateState({ isPlaying: false }); },
      nexttrack: () => {
        const s = stateRef.current;
        const nextIdx = getNextIndex(s);
        if (nextIdx === -1) return;
        const song = s.queue[nextIdx];
        playSong(song);
        updateState({ currentSong: song, queueIndex: nextIdx, isPlaying: true, progress: 0 });
      },
      previoustrack: () => {
        const s = stateRef.current;
        const prevIdx = getPrevIndex(s);
        if (prevIdx === -1) return;
        const song = s.queue[prevIdx];
        playSong(song);
        updateState({ currentSong: song, queueIndex: prevIdx, isPlaying: true, progress: 0 });
      },
      seekto: (evt: MediaSessionActionDetails) => {
        if (evt.seekTime != null && audioRef.current) {
          audioRef.current.currentTime = evt.seekTime;
        }
      },
    };
    for (const [action, handler] of Object.entries(handlers)) {
      navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler as MediaSessionActionHandler);
    }
    return () => {
      for (const action of Object.keys(handlers)) {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
      }
    };
  }, [getNextIndex, getPrevIndex, playSong, updateState]);

  const actions: PlayerActions = {
    play: useCallback((song: Song, queue?: Song[]) => {
      const newQueue = queue ?? [song];
      const idx = newQueue.findIndex(s => s.id === song.id);
      const queueIndex = idx === -1 ? 0 : idx;
      const audio = audioRef.current;
      if (audio) {
        audio.volume = stateRef.current.volume;
        audio.muted = stateRef.current.muted;
      }
      playSong(song);
      updateState({ currentSong: song, queue: newQueue, queueIndex, isPlaying: true, progress: 0 });
    }, [playSong, updateState]),

    pause: useCallback(() => {
      audioRef.current?.pause();
      updateState({ isPlaying: false });
    }, [updateState]),

    resume: useCallback(() => {
      audioRef.current?.play().catch(() => {});
      updateState({ isPlaying: true });
    }, [updateState]),

    togglePlay: useCallback(() => {
      const s = stateRef.current;
      if (s.isPlaying) {
        audioRef.current?.pause();
        updateState({ isPlaying: false });
      } else {
        audioRef.current?.play().catch(() => {});
        updateState({ isPlaying: true });
      }
    }, [updateState]),

    next: useCallback(() => {
      const s = stateRef.current;
      const nextIdx = getNextIndex(s);
      if (nextIdx === -1) return;
      const song = s.queue[nextIdx];
      playSong(song);
      updateState({ currentSong: song, queueIndex: nextIdx, isPlaying: true, progress: 0 });
    }, [getNextIndex, playSong, updateState]),

    prev: useCallback(() => {
      const audio = audioRef.current;
      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      const s = stateRef.current;
      const prevIdx = getPrevIndex(s);
      if (prevIdx === -1) return;
      const song = s.queue[prevIdx];
      playSong(song);
      updateState({ currentSong: song, queueIndex: prevIdx, isPlaying: true, progress: 0 });
    }, [getPrevIndex, playSong, updateState]),

    seek: useCallback((progress: number) => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;
      audio.currentTime = progress * audio.duration;
      updateState({ progress });
    }, [updateState]),

    setVolume: useCallback((volume: number) => {
      const audio = audioRef.current;
      if (audio) audio.volume = volume;
      updateState({ volume, muted: volume === 0 });
    }, [updateState]),

    toggleMute: useCallback(() => {
      const muted = !stateRef.current.muted;
      if (audioRef.current) audioRef.current.muted = muted;
      updateState({ muted });
    }, [updateState]),

    toggleShuffle: useCallback(() => {
      updateState({ shuffle: !stateRef.current.shuffle });
    }, [updateState]),

    toggleRepeat: useCallback(() => {
      const cycle: PlayerState['repeat'][] = ['none', 'all', 'one'];
      const idx = cycle.indexOf(stateRef.current.repeat);
      updateState({ repeat: cycle[(idx + 1) % cycle.length] });
    }, [updateState]),

    addToQueue: useCallback((song: Song) => {
      setState(prev => {
        const next = { ...prev, queue: [...prev.queue, song] };
        stateRef.current = next;
        return next;
      });
    }, []),

    removeFromQueue: useCallback((index: number) => {
      setState(prev => {
        const newQueue = prev.queue.filter((_, i) => i !== index);
        const newIndex = index < prev.queueIndex ? prev.queueIndex - 1 : prev.queueIndex;
        const next = { ...prev, queue: newQueue, queueIndex: Math.min(newIndex, newQueue.length - 1) };
        stateRef.current = next;
        return next;
      });
    }, []),

    clearQueue: useCallback(() => {
      updateState({ queue: [], queueIndex: -1 });
    }, [updateState]),

    playQueue: useCallback((songs: Song[], startIndex = 0) => {
      const audio = audioRef.current;
      if (!audio || songs.length === 0) return;
      const song = songs[startIndex];
      playSong(song);
      updateState({ currentSong: song, queue: songs, queueIndex: startIndex, isPlaying: true, progress: 0 });
    }, [playSong, updateState]),

    setFullPlayerOpen: useCallback((open: boolean) => {
      updateState({ isFullPlayerOpen: open });
    }, [updateState]),
  };

  const getAnalyser = useCallback(() => {
    try {
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
    } catch {
      return null;
    }
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
