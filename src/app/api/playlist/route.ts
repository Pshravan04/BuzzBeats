import { NextResponse } from 'next/server';
import { getPlaylistDetails } from '@/lib/api/ytmusic';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Playlist ID parameter is required' }, { status: 400 });
  }

  try {
    // Check if it's a UUID (Supabase playlist)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      const { data: pl } = await supabase
        .from('playlists')
        .select('*, owner:profiles(display_name, avatar_url)')
        .eq('id', id)
        .single();
      
      if (!pl) {
        return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
      }
      
      const { data: ps } = await supabase
        .from('playlist_songs')
        .select('*, song:songs(*, artist:artists(*), album:albums(*))')
        .eq('playlist_id', id)
        .order('position');
      
      return NextResponse.json({
        playlist: pl,
        songs: ps?.map(r => r.song) || []
      });
    }

    // Otherwise, fetch from YTMusic
    const ytData = await getPlaylistDetails(id);
    
    // Map songs to unified format
    const songs = ((ytData as any).videos || []).map((song: any) => ({
      id: song.videoId,
      title: song.name,
      artist_id: song.artists?.[0]?.artistId || '',
      artist: { name: song.artists?.[0]?.name || 'Unknown Artist' },
      album_id: song.album?.albumId || '',
      album: song.album ? { title: song.album.name } : undefined,
      duration: song.duration || 0,
      audio_url: `/api/stream?id=${song.videoId}`,
      cover_url: song.thumbnails?.[song.thumbnails.length - 1]?.url || '/images/default-album.jpg',
      play_count: 0
    }));

    return NextResponse.json({ 
      playlist: {
        id: ytData.playlistId,
        name: ytData.name,
        description: '', // ytmusic api doesn't reliably give descriptions
        cover_url: ytData.thumbnails?.[ytData.thumbnails.length - 1]?.url || '/images/default-album.jpg',
        owner_id: '',
        owner: { display_name: 'YT Music' },
        is_public: true,
        is_collaborative: false,
      },
      songs
    });
  } catch (error) {
    console.error('Playlist API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist details' }, { status: 500 });
  }
}
