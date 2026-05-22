export const API_BASE = 'https://saavn.dev/api';

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
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
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
    total: number;
    start: number;
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
    title: saavn.album?.name || 'Unknown Album',
    artist_id: artistId,
    cover_url: coverUrl,
    release_date: saavn.releaseDate || saavn.year || '',
    genre: saavn.language,
    song_count: 1
  };

  return {
    id: saavn.id,
    title: saavn.name,
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

export async function searchSongs(query: string, limit = 20): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch from JioSaavn');
    const json: SaavnSearchResponse = await res.json();
    
    if (json.success && json.data && json.data.results) {
      return json.data.results.map(mapSaavnSongToSong);
    }
    return [];
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
}

export async function getTrendingSongs(): Promise<Song[]> {
  // We'll fetch a popular playlist to simulate trending (e.g. Top JioTunes or similar)
  // Or just search for a generic popular term. Let's use search for "2024" for now to get latest hits.
  // Actually, saavn.dev has a /modules endpoint for home data, but search is safer.
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=latest+hits&limit=20`);
    if (!res.ok) throw new Error('Failed to fetch trending');
    const json: SaavnSearchResponse = await res.json();
    
    if (json.success && json.data && json.data.results) {
      return json.data.results.map(mapSaavnSongToSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
}

export async function getSongDetails(id: string): Promise<Song | null> {
  try {
    const res = await fetch(`${API_BASE}/songs?id=${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data && json.data.length > 0) {
      return mapSaavnSongToSong(json.data[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching song details:', error);
    return null;
  }
}
