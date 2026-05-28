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
      const rawSongs = await searchYT(q, 'SONG');
      mappedResults = rawSongs.map((song: any) => ({
        id: song.videoId,
        title: song.name,
        artist_id: song.artists?.[0]?.artistId || null,
        artist: {
          name: song.artists?.[0]?.name || 'Unknown',
        },
        album_id: song.album?.albumId || null,
        album: {
          title: song.album?.name || '',
        },
        duration: song.duration,
        audio_url: `/api/stream?id=${song.videoId}&title=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artists?.[0]?.name || '')}`,
        cover_url: song.thumbnails?.[song.thumbnails.length - 1]?.url || '/images/default-album.jpg',
        play_count: 0,
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
