import { NextResponse } from 'next/server';
import { getArtistDetails } from '@/lib/api/jiosaavn';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Artist ID parameter is required' }, { status: 400 });
  }

  try {
    const result = await getArtistDetails(id);
    if (!result) {
      return NextResponse.json({
        artist: {
          id,
          name: 'Artist',
          image_url: '/images/default-artist.jpg',
          verified: false,
          follower_count: 0,
        },
        songs: [],
        albums: [],
      });
    }

    return NextResponse.json({
      artist: result.artist,
      songs: result.songs,
      albums: [],
    });
  } catch (error) {
    console.error('Artist API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch artist details' }, { status: 500 });
  }
}
