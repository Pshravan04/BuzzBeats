const API_BASES = [
  'https://jiosaavn-api-privatecvc2.vercel.app',
  'https://saavn.me',
  'https://jiosaavn-api-v3.vercel.app'
];

export interface SaavnImage {
  quality: string;
  url: string;
}

export interface SaavnDownloadUrl {
  quality: string;
  url: string;
}

export interface SaavnSong {
  id: string;
  name?: string;
  title?: string;
  type: string;
  album: {
    id: string;
    name?: string;
    title?: string;
    url: string;
  };
  year: string;
  releaseDate: string | null;
  duration: number;
  label: string;
  primaryArtists: string;
  primaryArtistsId: string;
  explicitContent: number;
  playCount: number;
  language: string;
  hasLyrics: string;
  url: string;
  copyright: string;
  image: SaavnImage[];
  downloadUrl: SaavnDownloadUrl[];
}

export interface SaavnSearchResponse {
  success: boolean;
  data: {
    total?: number;
    start?: number;
    results: SaavnSong[];
  };
}

// Convert SaavnSong to our internal Song type
import { Song, Artist, Album } from '@/types';

export function mapSaavnSongToSong(saavn: SaavnSong): Song {
  // Get best quality image and audio
  const coverUrl = saavn.image?.length > 0 ? saavn.image[saavn.image.length - 1].url : '';
  const audioUrl = saavn.downloadUrl?.length > 0 ? saavn.downloadUrl[saavn.downloadUrl.length - 1].url : '';
  
  // Extract first artist ID if multiple
  const artistId = saavn.primaryArtistsId?.split(',')[0]?.trim() || 'unknown';
  
  const artist: Artist = {
    id: artistId,
    name: saavn.primaryArtists || 'Unknown Artist',
    verified: false,
    follower_count: 0,
    genres: [],
    image_url: coverUrl // Fallback
  };

  const album: Album = {
    id: saavn.album?.id || 'unknown',
    title: saavn.album?.name || saavn.album?.title || 'Unknown Album',
    artist_id: artistId,
    cover_url: coverUrl,
    release_date: saavn.releaseDate || saavn.year || '',
    genre: saavn.language || 'Pop',
    song_count: 1
  };

  return {
    id: saavn.id,
    title: saavn.name || saavn.title || 'Unknown Title',
    artist_id: artistId,
    artist: artist,
    album_id: album.id,
    album: album,
    duration: saavn.duration,
    audio_url: audioUrl,
    cover_url: coverUrl,
    play_count: saavn.playCount || 0
  };
}

async function fetchWithFallback(endpoint: string): Promise<any> {
  let lastError = null;
  for (const base of API_BASES) {
    try {
      // AbortController to prevent hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per request
      const res = await fetch(`${base}${endpoint}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      lastError = err;
      console.warn(`Failed fetching from ${base}${endpoint}:`, err);
      continue; // Try next fallback
    }
  }
  throw lastError || new Error('All API fallbacks failed');
}

export async function searchSongs(query: string, limit = 20): Promise<Song[]> {
  try {
    const json = await fetchWithFallback(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    // Support multiple possible response formats from different API instances
    let results = [];
    if (json.success && json.data?.results) {
      results = json.data.results;
    } else if (json.results) {
      results = json.results;
    } else if (json.data && Array.isArray(json.data)) {
      results = json.data;
    }

    return results.map(mapSaavnSongToSong).filter((s: Song) => s.audio_url); // Only return playable songs
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
}

export async function getTrendingSongs(): Promise<Song[]> {
  try {
    const json = await fetchWithFallback(`/search/songs?query=latest+hits&limit=20`);
    
    let results = [];
    if (json.success && json.data?.results) {
      results = json.data.results;
    } else if (json.results) {
      results = json.results;
    }

    return results.map(mapSaavnSongToSong).filter((s: Song) => s.audio_url);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
}

export async function getSongDetails(id: string): Promise<Song | null> {
  try {
    const json = await fetchWithFallback(`/songs?id=${id}`);
    
    let songData = null;
    if (json.success && json.data && json.data.length > 0) {
      songData = json.data[0];
    } else if (Array.isArray(json) && json.length > 0) {
      songData = json[0];
    }

    if (songData) {
      return mapSaavnSongToSong(songData);
    }
    return null;
  } catch (error) {
    console.error('Error fetching song details:', error);
    return null;
  }
}
