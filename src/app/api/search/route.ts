import { NextResponse } from 'next/server';
import { searchSongs, searchArtists, searchPlaylists } from '@/lib/api/jiosaavn';

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
      const saavnSongs = await searchSongs(q, 20);
      const songResults = saavnSongs.map(song => ({
        ...song,
        resultType: 'song'
      }));
      mappedResults = [...mappedResults, ...songResults];
    }

    if (type === 'ARTIST' || !type) {
      const rawArtists = await searchArtists(q, 10);
      const artistResults = rawArtists.map((item: any) => ({
        id: item.id,
        name: item.name,
        image_url: item.image?.replace('50x50', '500x500') || '/images/default-album.jpg',
        verified: false,
        follower_count: 0,
        genres: [],
        resultType: 'artist'
      }));
      mappedResults = [...mappedResults, ...artistResults];
    }

    if (type === 'PLAYLIST' || !type) {
      const rawPlaylists = await searchPlaylists(q, 10);
      const playlistResults = rawPlaylists.map((item: any) => ({
        id: item.listid,
        name: item.listname,
        cover_url: item.image?.replace('150x150', '500x500') || '/images/default-album.jpg',
        song_count: parseInt(item.count || '0', 10),
        owner: { display_name: [item.firstname, item.lastname].filter(Boolean).join(' ') || 'Unknown' },
        resultType: 'playlist'
      }));
      mappedResults = [...mappedResults, ...playlistResults];
    }

    return NextResponse.json({ results: mappedResults });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results', results: [] }, { status: 500 });
  }
}
