import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Artist ID parameter is required' }, { status: 400 });
  }

  try {
    // We removed ytmusic, and for now we will just return a generic response
    // since JioSaavn artist details are slightly complex to fetch directly without token parsing.
    return NextResponse.json({ 
      artist: {
        id: id,
        name: 'Artist Profile',
        image_url: '/images/default-artist.jpg',
        verified: false,
        follower_count: 0
      },
      songs: [],
      albums: []
    });
  } catch (error) {
    console.error('Artist API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch artist details' }, { status: 500 });
  }
}
