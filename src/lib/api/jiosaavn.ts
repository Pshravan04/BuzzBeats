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
    let cleanedQuery = rawQuery.replace(/\b(song|of|by|track|music)\b/ig, '').replace(/\s+/g, ' ').trim();
    if (!cleanedQuery) cleanedQuery = rawQuery;

    let songIds = '';

    // First try standard search
    const searchUrl = `${JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(cleanedQuery)}&n=${limit}&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    
    if (json.results && Array.isArray(json.results) && json.results.length > 0) {
      songIds = json.results.map((r: any) => r.id).join(',');
    }

    // Fallback to autocomplete if no results found
    if (!songIds) {
      const autoUrl = `${JIOSAAVN_API}?__call=autocomplete.get&query=${encodeURIComponent(cleanedQuery)}&_format=json&_marker=0&ctx=web6dot0`;
      const autoRes = await fetch(autoUrl, { headers: FETCH_HEADERS });
      const autoJson = await autoRes.json();
      
      const topQuery = autoJson?.topquery?.data?.[0];
      if (topQuery && topQuery.title) {
        const retryUrl = `${JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(topQuery.title)}&n=${limit}&p=1&_format=json&_marker=0&ctx=web6dot0`;
        const retryRes = await fetch(retryUrl, { headers: FETCH_HEADERS });
        const retryJson = await retryRes.json();
        if (retryJson.results && Array.isArray(retryJson.results) && retryJson.results.length > 0) {
          songIds = retryJson.results.map((r: any) => r.id).join(',');
        }
      }

      if (!songIds && autoJson.songs && autoJson.songs.data && Array.isArray(autoJson.songs.data)) {
        songIds = autoJson.songs.data.map((r: any) => r.id).join(',');
      }
    }

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
    const detailRes = await fetch(detailsUrl, { headers: FETCH_HEADERS });
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

export async function searchPlaylists(query: string, limit = 20): Promise<any[]> {
  try {
    const searchUrl = `${JIOSAAVN_API}?__call=search.getPlaylistResults&q=${encodeURIComponent(query)}&n=${limit}&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    return json.results || [];
  } catch (error) {
    console.error('Error searching playlists:', error);
    return [];
  }
}

export async function searchArtists(query: string, limit = 20): Promise<any[]> {
  try {
    const searchUrl = `${JIOSAAVN_API}?__call=search.getArtistResults&q=${encodeURIComponent(query)}&n=${limit}&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    return json.results || [];
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
}

export async function getArtistDetails(id: string): Promise<{ artist: any; songs: Song[] } | null> {
  try {
    // Fetch artist songs via artist songs endpoint
    const songsUrl = `${JIOSAAVN_API}?__call=artist.getArtistMoreSongs&artist_id=${id}&n=20&p=1&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(songsUrl, { headers: FETCH_HEADERS });
    const json = await res.json();

    const rawSongs = json.songs || json.list || [];
    if (!Array.isArray(rawSongs) || rawSongs.length === 0) return null;

    const first = rawSongs[0];
    const artistName = first.primary_artists || first.singers || first.artist || [];
    const artistNameStr = Array.isArray(artistName) ? artistName.join(', ') : artistName;

    const songs: Song[] = rawSongs
      .filter((track: any) => track.encrypted_media_url)
      .map((track: any) => {
        const coverUrl = formatImageUrl(track.image);
        return {
          id: track.id,
          title: track.song?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || track.title || 'Unknown Title',
          artist_id: track.primary_artists_id || id,
          artist: {
            id: track.primary_artists_id || id,
            name: artistNameStr || 'Unknown Artist',
            verified: false,
            follower_count: parseInt(track.follower_count || '0', 10),
            genres: (track.genre || '').split(',').filter(Boolean),
            image_url: coverUrl,
          },
          album_id: track.albumid || '',
          album: {
            id: track.albumid || '',
            title: track.album?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || 'Unknown Album',
            artist_id: track.primary_artists_id || id,
            cover_url: coverUrl,
            release_date: track.year || '',
            genre: track.language || '',
            song_count: 1,
          },
          duration: parseInt(track.duration, 10) || 0,
          audio_url: decryptUrl(track.encrypted_media_url),
          cover_url: coverUrl,
          play_count: parseInt(track.play_count || track.popularity || '0', 10) || 0,
        };
      });

    const artist: any = {
      id,
      name: artistNameStr || 'Artist',
      image_url: formatImageUrl(first.image),
      verified: first.verified === '1' || first.verified === true,
      follower_count: parseInt(first.follower_count || '0', 10),
      bio: first.bio || '',
      genres: (first.genre || '').split(',').filter(Boolean),
    };

    return { artist, songs };
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return null;
  }
}

export async function getAlbumDetails(id: string): Promise<{ album: any; songs: Song[] } | null> {
  try {
    const detailsUrl = `${JIOSAAVN_API}?__call=album.getDetails&albumid=${id}&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(detailsUrl, { headers: FETCH_HEADERS });
    const json = await res.json();

    const rawSongs = json.songs || json.list || [];
    if (!Array.isArray(rawSongs) || rawSongs.length === 0) return null;

    const albumData = json.album || json;
    const coverUrl = formatImageUrl(albumData.image || (rawSongs[0]?.image || ''));
    const artistName = albumData.primary_artists || albumData.artist || rawSongs[0]?.primary_artists || 'Unknown Artist';

    const songs: Song[] = rawSongs
      .filter((track: any) => track.encrypted_media_url)
      .map((track: any) => {
        const trackCover = formatImageUrl(track.image) || coverUrl;
        return {
          id: track.id,
          title: track.song?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || track.title || 'Unknown Title',
          artist_id: track.primary_artists_id || albumData.primary_artists_id || id,
          artist: {
            id: track.primary_artists_id || albumData.primary_artists_id || id,
            name: track.primary_artists || track.singers || artistName,
            verified: false,
            follower_count: 0,
            genres: [],
            image_url: trackCover,
          },
          album_id: track.albumid || id,
          album: {
            id: track.albumid || id,
            title: track.album?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || albumData.title || 'Unknown Album',
            artist_id: track.primary_artists_id || albumData.primary_artists_id || id,
            cover_url: trackCover,
            release_date: track.year || albumData.year || '',
            genre: track.language || albumData.language || '',
            song_count: rawSongs.length,
          },
          duration: parseInt(track.duration, 10) || 0,
          audio_url: decryptUrl(track.encrypted_media_url),
          cover_url: trackCover,
          play_count: parseInt(track.play_count || track.popularity || '0', 10) || 0,
        };
      });

    const album: any = {
      id,
      title: albumData.title?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || 'Unknown Album',
      artist_id: albumData.primary_artists_id || '',
      artist: {
        id: albumData.primary_artists_id || '',
        name: artistName,
        image_url: coverUrl,
      },
      cover_url: coverUrl,
      release_date: albumData.year || '',
      genre: albumData.language || '',
      song_count: songs.length,
    };

    return { album, songs };
  } catch (error) {
    console.error('Error fetching album details:', error);
    return null;
  }
}

export async function getPlaylistDetails(id: string): Promise<any> {
  try {
    const detailsUrl = `${JIOSAAVN_API}?__call=playlist.getDetails&listid=${id}&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(detailsUrl, { headers: FETCH_HEADERS });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    return null;
  }
}
