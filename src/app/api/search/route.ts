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
    let mappedResults: any[] = [];

    if (type === 'SONG' || !type) {
      const { searchSongs } = await import('@/lib/api/jiosaavn');
      const jioResults = await searchSongs(q, 15);
      
      mappedResults = jioResults.map(song => ({
        id: song.id,
        title: song.title,
        artist_id: song.artist_id,
        artist: song.artist,
        album_id: song.album_id,
        album: song.album,
        duration: song.duration,
        audio_url: song.audio_url || `/api/stream?id=${song.id}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist?.name || '')}`,
        cover_url: song.cover_url,
        play_count: song.play_count,
        resultType: 'song'
      }));
    }

    if (type !== 'SONG') {
      const rawResults = await searchYT(q, type);
      const ytMapped = rawResults.map((item: any) => {
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
      mappedResults = [...mappedResults, ...ytMapped];
    }

    return NextResponse.json({ results: mappedResults });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results', results: [] }, { status: 500 });
  }
}
