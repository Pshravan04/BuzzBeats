import { Song, Artist, Album } from '@/types';

const ITUNES_API = 'https://itunes.apple.com';

export interface ITunesSong {
  trackId: number;
  trackName: string;
  artistId: number;
  artistName: string;
  collectionId: number;
  collectionName: string;
  previewUrl: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  trackTimeMillis: number;
}

export interface ITunesResponse {
  resultCount: number;
  results: ITunesSong[];
}

export function mapITunesSongToSong(song: ITunesSong): Song {
  const artist: Artist = {
    id: song.artistId?.toString() || 'unknown',
    name: song.artistName || 'Unknown Artist',
    verified: false,
    follower_count: 0,
    genres: [song.primaryGenreName].filter(Boolean),
    image_url: song.artworkUrl100 || ''
  };

  const album: Album = {
    id: song.collectionId?.toString() || 'unknown',
    title: song.collectionName || 'Unknown Album',
    artist_id: artist.id,
    cover_url: song.artworkUrl100?.replace('100x100bb', '600x600bb') || '',
    release_date: song.releaseDate || '',
    genre: song.primaryGenreName || 'Pop',
    song_count: 1
  };

  return {
    id: song.trackId?.toString() || Math.random().toString(),
    title: song.trackName || 'Unknown Title',
    artist_id: artist.id,
    artist: artist,
    album_id: album.id,
    album: album,
    duration: Math.floor((song.trackTimeMillis || 30000) / 1000),
    audio_url: song.previewUrl || '',
    cover_url: album.cover_url,
    play_count: 0
  };
}

export async function searchSongs(query: string, limit = 20): Promise<Song[]> {
  try {
    const res = await fetch(`${ITUNES_API}/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ITunesResponse = await res.json();
    
    if (json.results && Array.isArray(json.results)) {
      return json.results.filter(s => s.previewUrl).map(mapITunesSongToSong);
    }
    return [];
  } catch (error) {
    console.error('Error searching iTunes:', error);
    return [];
  }
}

export async function getTrendingSongs(): Promise<Song[]> {
  try {
    // iTunes doesn't have a direct trending API without RSS parsing, so we search a popular term.
    const res = await fetch(`${ITUNES_API}/search?term=pop+hits&entity=song&limit=20`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ITunesResponse = await res.json();
    
    if (json.results && Array.isArray(json.results)) {
      return json.results.filter(s => s.previewUrl).map(mapITunesSongToSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
}

export async function getSongDetails(id: string): Promise<Song | null> {
  try {
    const res = await fetch(`${ITUNES_API}/lookup?id=${id}&entity=song`);
    if (!res.ok) return null;
    const json: ITunesResponse = await res.json();
    if (json.results && json.results.length > 0) {
      return mapITunesSongToSong(json.results[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching song details:', error);
    return null;
  }
}
