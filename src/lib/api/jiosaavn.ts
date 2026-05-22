import { Song, Artist, Album } from '@/types';
import CryptoJS from 'crypto-js';

const JIOSAAVN_API = 'https://www.jiosaavn.com/api.php';
const DES_KEY = '38346591';

function decryptUrl(encryptedUrl: string): string {
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    // Upgrade 96kbps streams to 320kbps
    return url.replace('_96.mp4', '_320.mp4');
  } catch (err) {
    console.error('Decryption failed:', err);
    return '';
  }
}

function formatImageUrl(url: string): string {
  if (!url) return '';
  return url.replace('150x150', '500x500').replace('50x50', '500x500');
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

export async function searchSongs(rawQuery: string, limit = 20): Promise<Song[]> {
  try {
    // Clean conversational stop words that confuse JioSaavn's literal search engine
    const query = rawQuery.replace(/\b(song|of|by|track|music)\b/ig, '').replace(/\s+/g, ' ').trim();
    
    const searchUrl = `${JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(query)}&n=${limit}&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    
    if (!json.results || !Array.isArray(json.results)) return [];

    const songIds = json.results.map((r: any) => r.id).join(',');
    if (!songIds) return [];

    // Fetch details for all found IDs in one call
    const detailsUrl = `${JIOSAAVN_API}?__call=song.getDetails&pids=${songIds}&_format=json&_marker=0&ctx=web6dot0`;
    const detailRes = await fetch(detailsUrl, { headers: FETCH_HEADERS });
    const detailJson = await detailRes.json();

    const songs: Song[] = [];
    if (detailJson.songs && Array.isArray(detailJson.songs)) {
      for (const track of detailJson.songs) {
        if (!track.encrypted_media_url) continue;

        const coverUrl = formatImageUrl(track.image);
        const artistName = track.primary_artists || track.singers || 'Unknown Artist';
        
        songs.push({
          id: track.id,
          title: track.song?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || 'Unknown Title',
          artist_id: track.primary_artists_id || track.id,
          artist: {
            id: track.primary_artists_id || track.id,
            name: artistName,
            verified: false,
            follower_count: 0,
            genres: [],
            image_url: coverUrl
          },
          album_id: track.albumid,
          album: {
            id: track.albumid,
            title: track.album?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || 'Unknown Album',
            artist_id: track.primary_artists_id || track.id,
            cover_url: coverUrl,
            release_date: track.year || '',
            genre: track.language || '',
            song_count: 1
          },
          duration: parseInt(track.duration, 10) || 0,
          audio_url: decryptUrl(track.encrypted_media_url),
          cover_url: coverUrl,
          play_count: parseInt(track.play_count, 10) || 0
        });
      }
    }
    return songs;
  } catch (error) {
    console.error('Error in JioSaavn search:', error);
    return [];
  }
}

export async function getTrendingSongs(): Promise<Song[]> {
  try {
    // The previous playlist token is dead, so we just search for top hits
    return await searchSongs('top hits', 20);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
}

export async function getSongDetails(id: string): Promise<Song | null> {
  try {
    const detailsUrl = `${JIOSAAVN_API}?__call=song.getDetails&pids=${id}&_format=json&_marker=0&ctx=web6dot0`;
    const detailRes = await fetch(detailsUrl);
    const detailJson = await detailRes.json();
    
    if (detailJson.songs && Array.isArray(detailJson.songs) && detailJson.songs.length > 0) {
      const track = detailJson.songs[0];
      if (!track.encrypted_media_url) return null;

      const coverUrl = formatImageUrl(track.image);
      const artistName = track.primary_artists || track.singers || 'Unknown Artist';
      
      return {
        id: track.id,
        title: track.song?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || 'Unknown Title',
        artist_id: track.primary_artists_id || track.id,
        artist: {
          id: track.primary_artists_id || track.id,
          name: artistName,
          verified: false,
          follower_count: 0,
          genres: [],
          image_url: coverUrl
        },
        album_id: track.albumid,
        album: {
          id: track.albumid,
          title: track.album?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || 'Unknown Album',
          artist_id: track.primary_artists_id || track.id,
          cover_url: coverUrl,
          release_date: track.year || '',
          genre: track.language || '',
          song_count: 1
        },
        duration: parseInt(track.duration, 10) || 0,
        audio_url: decryptUrl(track.encrypted_media_url),
        cover_url: coverUrl,
        play_count: parseInt(track.play_count, 10) || 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching song details:', error);
    return null;
  }
}
