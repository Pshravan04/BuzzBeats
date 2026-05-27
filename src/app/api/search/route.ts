import { NextResponse } from 'next/server';
import { searchYT } from '@/lib/api/ytmusic';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') as 'SONG' | 'ARTIST' | 'PLAYLIST' | undefined;
  
  if (!q) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const rawResults = await searchYT(q, type);
    
    // Map to unified types
    const mappedResults = rawResults.map((item: any) => {
      if (item.type === 'SONG' || item.type === 'VIDEO') {
        return {
          id: item.videoId,
          title: item.name,
          artist_id: item.artist?.artistId || '',
          artist: { name: item.artist?.name || 'Unknown', verified: false },
          album_id: item.album?.albumId || '',
          album: item.album ? { title: item.album.name, cover_url: item.thumbnails?.[item.thumbnails.length - 1]?.url } : undefined,
          duration: item.duration || 0,
          audio_url: `/api/stream?id=${item.videoId}&title=${encodeURIComponent(item.name)}&artist=${encodeURIComponent(item.artist?.name || '')}`,
          cover_url: item.thumbnails?.[item.thumbnails.length - 1]?.url || '/images/default-album.jpg',
          play_count: 0,
          resultType: 'song'
        };
      }
      if (item.type === 'ARTIST') {
        return {
          id: item.artistId,
          name: item.name,
          image_url: item.thumbnails?.[item.thumbnails.length - 1]?.url || '/images/default-album.jpg',
          verified: false,
          follower_count: 0,
          genres: [],
          resultType: 'artist'
        };
      }
      if (item.type === 'PLAYLIST') {
        return {
          id: item.playlistId,
          name: item.name,
          cover_url: item.thumbnails?.[item.thumbnails.length - 1]?.url || '/images/default-album.jpg',
          song_count: 0,
          owner: { display_name: item.artist?.name || 'Unknown' },
          resultType: 'playlist'
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ results: mappedResults });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results', results: [] }, { status: 500 });
  }
}
