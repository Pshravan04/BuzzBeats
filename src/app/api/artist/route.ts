import { NextResponse } from 'next/server';
import { getArtistDetails } from '@/lib/api/ytmusic';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Artist ID parameter is required' }, { status: 400 });
  }

  try {
    const artistData = await getArtistDetails(id);
    
    // Map songs to unified format
    const songs = (artistData.topSongs || []).map((song: any) => ({
      id: song.videoId,
      title: song.name,
      artist_id: artistData.artistId,
      artist: { name: artistData.name, verified: false },
      album_id: song.album?.albumId || '',
      album: song.album ? { title: song.album.name } : undefined,
      duration: song.duration || 0,
      audio_url: `/api/stream?id=${song.videoId}`,
      cover_url: song.thumbnails?.[song.thumbnails.length - 1]?.url || artistData.thumbnails?.[0]?.url || '/images/default-album.jpg',
      play_count: 0
    }));

    return NextResponse.json({ 
      artist: {
        id: artistData.artistId,
        name: artistData.name,
        image_url: artistData.thumbnails?.[artistData.thumbnails.length - 1]?.url || '/images/default-artist.jpg',
        verified: false,
        follower_count: parseInt((artistData as any).subscribers?.replace(/[^0-9]/g, '') || '0')
      },
      songs,
      albums: (artistData.topAlbums || []).map((album: any) => ({
        id: album.albumId,
        title: album.name,
        cover_url: album.thumbnails?.[album.thumbnails.length - 1]?.url || '/images/default-album.jpg',
        release_date: album.year ? `${album.year}-01-01` : ''
      }))
    });
  } catch (error) {
    console.error('Artist API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch artist details' }, { status: 500 });
  }
}
