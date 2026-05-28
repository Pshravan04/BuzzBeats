import { NextResponse } from 'next/server';
import { searchYT } from '@/lib/api/ytmusic';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

    // 2. Search YouTube Music for this playlist name
    const ytResults = await searchYT(playlistTitle, 'PLAYLIST');
    if (!ytResults || ytResults.length === 0) {
      return NextResponse.json({ error: 'Could not find a matching playlist to import songs from' }, { status: 404 });
    }

    // Best match is usually the first one
    const bestMatch = ytResults[0] as any;
    
    // We need to fetch the playlist songs using ytmusic-api
    const YTMusic = (await import('ytmusic-api')).default;
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    
    const playlistDetails = (await ytmusic.getPlaylist(bestMatch.playlistId)) as any;
    if (!playlistDetails || !playlistDetails.videos || playlistDetails.videos.length === 0) {
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
        song_count: playlistDetails.videos.length
      })
      .select()
      .single();

    if (playlistErr || !newPlaylist) {
      console.error(playlistErr);
      return NextResponse.json({ error: 'Failed to create playlist in database' }, { status: 500 });
    }

    // 4. Map the YouTube songs into our DB format
    // For simplicity and speed, we will insert songs concurrently if they don't exist
    const songsToInsert = playlistDetails.videos.map((vid: any) => ({
      id: vid.videoId,
      title: vid.name,
      artist_id: vid.artists?.[0]?.artistId || null,
      duration: vid.duration || 0,
      cover_url: vid.thumbnails?.[vid.thumbnails.length - 1]?.url || '/images/default-album.jpg',
      audio_url: `/api/stream?id=${vid.videoId}&title=${encodeURIComponent(vid.name)}&artist=${encodeURIComponent(vid.artists?.[0]?.name || '')}`,
    }));

    // Upsert artists first to satisfy foreign key constraints
    const artistsToInsert = playlistDetails.videos
      .map((vid: any) => {
        if (!vid.artists?.[0]?.artistId) return null;
        return {
          id: vid.artists[0].artistId,
          name: vid.artists[0].name || 'Unknown',
        };
      })
      .filter(Boolean)
      .filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => (t.id === v.id)) === i); // Unique artists

    if (artistsToInsert.length > 0) {
      await supabase.from('artists').upsert(artistsToInsert, { onConflict: 'id', ignoreDuplicates: true });
    }

    // Upsert songs
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

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch (err: any) {
    console.error('Import Error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred during import' }, { status: 500 });
  }
}
