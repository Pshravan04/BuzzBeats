import { NextResponse } from 'next/server';
import { searchPlaylists, getPlaylistDetails } from '@/lib/api/jiosaavn';
import { createClient } from '@/lib/supabase/server';
import CryptoJS from 'crypto-js';

export const dynamic = 'force-dynamic';

function formatImageUrl(url: string): string {
  if (!url) return '';
  return url.replace('150x150', '500x500').replace('50x50', '500x500');
}

function decryptUrl(encryptedUrl: string): string {
  try {
    const DES_KEY = '38346591';
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    return url.replace('_96.mp4', '_320.mp4');
  } catch (err) {
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || !url.includes('spotify.com/playlist')) {
      return NextResponse.json({ error: 'Please provide a valid Spotify playlist URL' }, { status: 400 });
    }

    // 1. Fetch playlist title from Spotify OEmbed API
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const oembedRes = await fetch(oembedUrl);
    if (!oembedRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch Spotify playlist info' }, { status: 400 });
    }
    const oembedData = await oembedRes.json();
    const playlistTitle = oembedData.title || 'Imported Playlist';
    const coverUrl = oembedData.thumbnail_url || '/images/default-album.jpg';

    // 2. Search JioSaavn for this playlist name
    const saavnResults = await searchPlaylists(playlistTitle, 5);
    if (!saavnResults || saavnResults.length === 0) {
      return NextResponse.json({ error: 'Could not find a matching playlist to import songs from' }, { status: 404 });
    }

    // Best match is usually the first one
    const bestMatch = saavnResults[0];
    
    // Fetch the playlist details from JioSaavn
    const playlistData = await getPlaylistDetails(bestMatch.listid || bestMatch.id);
    const playlistVideos = playlistData?.list || playlistData?.songs;

    if (!playlistVideos || !Array.isArray(playlistVideos) || playlistVideos.length === 0) {
      return NextResponse.json({ error: 'The matched playlist has no songs' }, { status: 404 });
    }

    // 3. Create the playlist in Supabase
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: newPlaylist, error: playlistErr } = await supabase
      .from('playlists')
      .insert({
        name: playlistTitle,
        owner_id: userData.user.id,
        cover_url: coverUrl,
        song_count: playlistVideos.length
      })
      .select()
      .single();

    if (playlistErr || !newPlaylist) {
      console.error(playlistErr);
      return NextResponse.json({ error: 'Failed to create playlist in database' }, { status: 500 });
    }

    // 4. Map the JioSaavn songs into our DB format
    // For simplicity and speed, we will insert songs concurrently if they don't exist
    const songsToInsert = playlistVideos.map((vid: any) => {
        const cover = formatImageUrl(vid.image);
        return {
          id: vid.id,
          title: vid.song?.replace(/&quot;/g, '"')?.replace(/&#039;/g, "'") || vid.title || 'Unknown Title',
          artist_id: vid.primary_artists_id || vid.id,
          duration: parseInt(vid.duration || '0', 10),
          cover_url: cover || '/images/default-album.jpg',
          audio_url: decryptUrl(vid.encrypted_media_url || ''),
        }
    }).filter((s: any) => s.audio_url);

    // Upsert artists first to satisfy foreign key constraints
    const artistsToInsert = playlistVideos
      .map((vid: any) => {
        const artistId = vid.primary_artists_id || vid.id;
        if (!artistId) return null;
        return {
          id: artistId,
          name: vid.primary_artists || vid.singers || 'Unknown',
        };
      })
      .filter((v: any): v is {id: string, name: string} => Boolean(v))
      .filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => (t.id === v.id)) === i); // Unique artists

    if (artistsToInsert.length > 0) {
      await supabase.from('artists').upsert(artistsToInsert, { onConflict: 'id', ignoreDuplicates: true });
    }

    // Upsert songs
    if (songsToInsert.length > 0) {
      const { error: songsErr } = await supabase.from('songs').upsert(songsToInsert, { onConflict: 'id', ignoreDuplicates: true });
      if (songsErr) {
        console.error('Songs insert error:', songsErr);
      }

      // Link songs to playlist
      const playlistSongs = songsToInsert.map((song: any, idx: number) => ({
        playlist_id: newPlaylist.id,
        song_id: song.id,
        position: idx
      }));

      const { error: plSongsErr } = await supabase.from('playlist_songs').insert(playlistSongs);
      if (plSongsErr) {
        console.error('Playlist songs insert error:', plSongsErr);
      }
    }

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch (err: any) {
    console.error('Import Error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred during import' }, { status: 500 });
  }
}
